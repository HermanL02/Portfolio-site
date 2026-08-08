---
title: "20 × 5 = 100: how an HTTP/2 stream cap silently stalled our message queue"
description: "Our hotel inventory cache ran four hours behind the supplier. We blamed the vendor, the database, the cluster and our own code. The answer was an arithmetic accident inside a single gRPC connection — and a client library that hid it on purpose."
date: "2026-08-08"
tags: ["Pub/Sub", "gRPC", "HTTP/2", "Node.js", "Debugging", "GCP"]
---

On 26 July 2026 an alert fired that I initially read as a pricing bug.

StaySuitely sells hotel inventory across channels. A supplier called DerbySoft pushes us ARI — availability, rates and inventory — and we cache it in `derbysoft.derbysoftDailyRates`. Before a booking is confirmed we run a LiveCheck against the supplier to make sure the price we quoted is still the price they'll honour. That night, LiveCheck kept failing with `no_match`: our number and their number disagreed.

The obvious explanation was that our price-sync allowlist had gone stale. It hadn't. The allowlist was fine. The **cache** was stale — running anywhere from 30 minutes to four hours behind the supplier. We were quoting prices from a world that no longer existed.

That's a Pub/Sub backlog. So I went and looked at Pub/Sub, and this is where it got strange.

## Nothing was wrong

The `derbysoft-ari` subscription had a backlog of about 1,800 messages and an oldest-unacked age climbing past four hours. Fine — something must be broken. Except everything I measured said otherwise.

- **Pod restarts?** Zero across the 80 minutes I watched it happen. No OOM kills.
- **Missing indexes?** `IXSCAN`, `keysExamined: 1`, 36–62 ms server-side. Both collections fully indexed.
- **CPU?** 0.06 of 4 cores. The pods were asleep.
- **Mongo pool contention from the scrapers?** Pools are per-database. ARI and the scrapers don't share one.
- **Atlas capacity?** ~0.6 ops/sec against an M10. I floated this and got correctly pushed back on.
- **Message volume?** Not unusual.
- **Redelivery amplification?** Real, but only 1.3×, not the 5.6× I first computed. (Dividing deliveries by `topic/send_message_operation_count` is wrong — publishes are batched.)
- **`enableMessageOrdering: true` with no ordering keys?** A genuine config oddity, but SDK 4.11 doesn't serialise by key on the subscriber side. Not it.
- **libuv threadpool starvation?** I ran 64 concurrent `pbkdf2` calls to try to starve it. Mongo ping latency went from 45 ms to 45 ms.

No errors. No exceptions. No nacks. No CPU. No slow queries. A pipeline that had simply stopped moving, and an application that was completely relaxed about it.

I also made it worse before I made it better. Reasoning that we were over-buffering, I dropped subscriber flow control from `maxMessages: 500` to `50`. The ack rate fell from 6.6/min to 0.6/min and the backlog grew from 583 to 900. That 500 is load-tuned, and I reverted it.

## The library is hiding the errors from you

Here's the part worth taking away even if you never touch Pub/Sub.

`@google-cloud/pubsub` **swallows ack failures on purpose.** Not as a bug — as a documented design intent. In `Subscriber.ack()`:

```js
resultPromise.catch(() => {});
```

And in `MessageQueue._flush()`, the send failure is caught with a comment explaining that it *"should never surface an error to the user level."* Instead it's re-emitted on a `'debug'` event that nobody subscribes to, because nothing in the getting-started docs tells you to.

The consequence: a subscription whose every single acknowledgement is failing looks **completely healthy**. No error event. No thrown exception. No nack. No log line. Just an ack rate quietly sitting near zero while messages redeliver forever.

So I attached the listener:

```ts
this.subscription.on('debug', (msg) => {
  this.logger.warn(`pubsub debug: ${msg.message ?? msg.error?.message}`);
});
```

And the screen filled up.

```
Failed to "ack" for 1 message(s). Reason: 4 DEADLINE_EXCEEDED:
Deadline exceeded after 60.000s, remote_addr=74.125.132.95:443
```

**230 of them in six minutes.** Not on one subscription — on six:

| Subscription | Failures |
|---|---|
| `derbysoft-ari` | 102 |
| `hostex-reservation-synced-derbysoft` | 33 |
| `hostex-reservation-synced-order-lifecycle` | 32 |
| `hostex-reservation-synced-mews` | 29 |
| `hostex-reservation-synced-wait-accept` | 27 |
| `hostex-webhook-events-reservation-sync` | 7 |

Six unrelated subscriptions, owned by different teams' worth of code, failing the same way at the same time. It was never a DerbySoft problem. It was never even an ARI problem. It was something *underneath* all of them.

## The arithmetic

Our Pub/Sub client is a singleton:

```ts
let client: PubSub | null = null;

export function getPubSubClient(): PubSub {
  if (!client) {
    client = new PubSub({ projectId });
  }
  return client;
}
```

That's ordinary, sensible advice — don't build a new client per consumer. But follow the chain:

**One `PubSub` client → one gRPC channel → one HTTP/2 connection.**

HTTP/2 multiplexes many logical streams over that single connection, and the server advertises a ceiling via `SETTINGS_MAX_CONCURRENT_STREAMS`. Google's default is **100**.

Meanwhile, each subscription the SDK opens holds a number of long-lived `streamingPull` streams. The default is **5 per subscription**.

This service runs **20 consumers**.

```
20 subscriptions × 5 streams = 100 streams
HTTP/2 concurrent stream limit = 100
```

Exactly at the cap. Not near it — *on* it.

Every one of those 100 streams is long-lived by design; `streamingPull` holds the stream open to receive messages. So the connection was 100% saturated by its own inbound pulls, and there was no stream left for anything else.

The catch is that `acknowledge` and `modifyAckDeadline` are **unary RPCs**. They need a stream too. They couldn't get one. They queued, and blocked, and eventually hit the 60-second gRPC deadline and failed.

Which produces exactly the symptoms I'd been staring at:

- **`modifyAckDeadline` failing** means leases can't be extended. Every message rides out its original ack deadline, expires, and redelivers. Forever.
- **`acknowledge` failing** means the ack rate floors at approximately zero, so nothing ever leaves the subscription.
- **Both are swallowed by the SDK**, so the whole failure mode is invisible.

The service wasn't slow. It was doing the work — pulling messages, running handlers, computing correct results — and then failing to tell Pub/Sub about any of it, silently, on a connection it had strangled with its own subscriptions.

## The fix is one line

```ts
this.subscription = this.pubsub.subscription(this.subscriptionName, {
  flowControl: this.flowControlOptions,
  ackDeadline: this.ackDeadlineSeconds,
  streamingOptions: { maxStreams: 1 },
});
```

One stream per subscription. 20 streams instead of 100, leaving 80 free for unary RPCs.

Nothing is lost by doing this. A single `streamingPull` stream sustains thousands of messages per second. This workload peaks around **300 per minute**. The default of 5 was buying us nothing and costing us everything.

## The cutover

It was instant, in the way that only a real root cause ever is:

```
20:43   backlog 1820   oldest 239 min
21:03   backlog 1852   oldest 259 min
21:13   backlog 1376   oldest 263 min   <- deploying
21:23   backlog    0   oldest   0 min
```

And it stayed at zero for the next 21 hours.

`DEADLINE_EXCEEDED` went from 230-per-six-minutes to **zero** — while processing 1,433 messages in the same window, so that's a real load measurement, not silence from an idle service. The settled ack rate was **100%** (468 acked of 468 sent) against an 11% baseline. Sent collapsed too, because there were no more redeliveries to inflate it.

## Why the ack deadline experiments misled me

Before finding this, I'd A/B tested the client ack deadline, which had been left unset:

| `ackDeadline` | acked | sent | ack rate |
|---|---|---|---|
| unset (~10 s) | 1,195 | 10,673 | 11% |
| **300 s** | 2,656 | 9,782 | **27%** |
| 600 s | 315 | 9,749 | 3% |

Unset was bad for its own reason: the SDK's adaptive default pins near 10 seconds because its histogram only records *successful* acks — and ours were failing, so it never learned to grow. A self-reinforcing loop.

But look at 600 s. **Longer was dramatically worse**, which makes no sense until you know about the stream exhaustion. With `modifyAckDeadline` blocked, the initial lease is all you ever get. Doubling it doesn't buy you a retry — it just holds a doomed flow-control slot twice as long, and a slot only frees on ack or nack.

That inversion was the clue I should have chased sooner. A knob that gets worse when you turn it in the "safe" direction usually means your model of the system is wrong.

## Three things I'd carry to any queue

**A shared gRPC channel is a budget, and you are spending it without being told.** Any library that multiplexes over one connection — Pub/Sub, Spanner, Bigtable, your own gRPC services — has a stream ceiling. Multiply your per-client concurrency by your number of clients and compare it to 100 *before* it becomes an incident. Our number was exactly 100, which is the kind of coincidence that looks like sabotage.

**"No errors" is not "no failures."** It means nothing at all until you've checked whether your client library catches its own. Pub/Sub does it deliberately and documents the intent in a code comment. Go and read how your critical libraries handle their own failures — and note that `ackWithResponse()` is *not* a workaround here: without exactly-once delivery enabled it short-circuits to `ack()` and returns `Success` unconditionally.

**Pick the metric that can't lie to you.** `num_undelivered_messages` and `oldest_unacked_message_age` both count leased-but-unacked messages, so a longer lease inflates both even when the system is perfectly healthy. I burned hours reading those two graphs. **Ack rate** is the honest metric: it's the only one that measures work actually leaving the system.

---

The whole thing came down to one number being 100 and another number being 100. But the reason it took two days rather than two hours wasn't the arithmetic — it was that every instrument on the dashboard read normal while the pipeline sat completely still. The bug I actually needed to fix first was the missing `'debug'` listener. Everything after that was just multiplication.
