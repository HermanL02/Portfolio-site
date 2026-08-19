---
title: "20 × 5 = 100: how an HTTP/2 stream cap silently stalled our message queue"
description: "Our hotel inventory cache ran four hours behind the supplier. We blamed the vendor, the database, the cluster and our own code. The answer was an arithmetic accident inside a single gRPC connection, written down in exactly one place and enforced in none."
date: "2026-08-08"
tags: ["Pub/Sub", "gRPC", "HTTP/2", "Node.js", "Debugging", "GCP"]
---

**TL;DR** — a `nodejs-pubsub` backlog climbed for hours with the ack rate near zero, no errors, no restarts, and the CPU asleep. Twenty subscriptions holding five `streamingPull` streams each came to 100 concurrent streams, which is exactly what one `PubSub` client's single HTTP/2 connection allows. `acknowledge` and `modifyAckDeadline` are unary RPCs and need a stream of their own; they never got one, blocked for 60 seconds, and failed with `DEADLINE_EXCEEDED`, which `@google-cloud/pubsub` swallows by design. The fix was `streamingOptions: { maxStreams: 1 }`, plus more than one `PubSub` client once you pass about twenty subscriptions. Backlog went 1,820 to 0 in twenty minutes.

---

On 26 July 2026 an alert fired that I initially read as a pricing bug.

StaySuitely sells hotel inventory across channels. A supplier called DerbySoft pushes us ARI (availability, rates and inventory) and we cache it in `derbysoft.derbysoftDailyRates`. Before a booking is confirmed we run a LiveCheck against the supplier to make sure the price we quoted is still the price they'll honour. That night, LiveCheck kept failing with `no_match`: our number and their number disagreed.

The obvious explanation was that our price-sync allowlist had gone stale. It hadn't; the allowlist was fine. The cache was the stale thing, running anywhere from 30 minutes to four hours behind the supplier, so we were quoting prices from a world that no longer existed.

That's a Pub/Sub backlog. So I went and looked at Pub/Sub, and this is where it got strange.

## Nothing was wrong

The `derbysoft-ari` subscription had a backlog of about 1,800 messages and an oldest-unacked age climbing past four hours. Fine, something must be broken. Except everything I measured said otherwise.

- **Pod restarts?** Zero across the 80 minutes I watched it happen. No OOM kills.
- **Missing indexes?** `IXSCAN`, `keysExamined: 1`, 36–62 ms server-side. Both collections fully indexed.
- **CPU?** 0.06 of 4 cores. The pods were asleep.
- **Mongo pool contention from the scrapers?** Pools are per-database. ARI and the scrapers don't share one.
- **Atlas capacity?** ~0.6 ops/sec against an M10. I floated this and got correctly pushed back on.
- **Message volume?** Not unusual.
- **Redelivery amplification?** Real, but only 1.3×. The 5.6× I first computed was wrong: you can't divide deliveries by `topic/send_message_operation_count`, because publishes are batched.
- **`enableMessageOrdering: true` with no ordering keys?** A genuine config oddity, but SDK 4.11 doesn't serialise by key on the subscriber side. Not it.
- **libuv threadpool starvation?** I ran 64 concurrent `pbkdf2` calls to try to starve it. Mongo ping latency went from 45 ms to 45 ms.

No errors, no exceptions, no nacks, no CPU, no slow queries: a pipeline that had stopped moving, and an application that was completely relaxed about it.

I also made it worse before I made it better. Reasoning that we were over-buffering, I dropped subscriber flow control from `maxMessages: 500` to `50`. The ack rate fell from 6.6/min to 0.6/min and the backlog grew from 583 to 900. That 500 is load-tuned, and I reverted it.

## The library is hiding the errors from you

The reason none of that showed up sits in the client library, and it generalises well past Pub/Sub.

`@google-cloud/pubsub` swallows ack failures deliberately, and says so. In `Subscriber.ack()`:

```js
resultPromise.catch(() => {});
```

In `MessageQueue._flush()` the send failure is caught with a comment explaining that it *"should never surface an error to the user level."* What happens instead is that the failure goes out on a `'debug'` event. That event is documented on the `Subscription` class, but it shows up in none of the getting-started samples; the canonical `listenForMessages.js` registers a single listener for `'message'`, and not even one for `'error'`.

So a subscription whose every acknowledgement is failing looks completely healthy. There is no error event, no thrown exception, no nack, no log line, just an ack rate sitting near zero while messages redeliver forever.

I attached the listener:

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

230 of them in six minutes, spread across six subscriptions:

| Subscription | Failures |
|---|---|
| `derbysoft-ari` | 102 |
| `hostex-reservation-synced-derbysoft` | 33 |
| `hostex-reservation-synced-order-lifecycle` | 32 |
| `hostex-reservation-synced-mews` | 29 |
| `hostex-reservation-synced-wait-accept` | 27 |
| `hostex-webhook-events-reservation-sync` | 7 |

Six unrelated subscriptions, owned by different teams' worth of code, failing the same way at the same time. Whatever this was, it sat underneath all of them, which ruled out DerbySoft and ruled out ARI along with it.

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

That's ordinary, sensible advice: don't build a new client per consumer. But follow the chain. One `PubSub` client gives you one gRPC channel, and one gRPC channel gives you one HTTP/2 connection.

HTTP/2 multiplexes many logical streams over that single connection, and the server advertises a ceiling via `SETTINGS_MAX_CONCURRENT_STREAMS`. Google's default is 100.

Meanwhile, each subscription the SDK opens holds a number of long-lived `streamingPull` streams, defaulting to five per subscription.

This service runs 20 consumers.

```
20 subscriptions × 5 streams = 100 streams
HTTP/2 concurrent stream limit = 100
```

Exactly at the cap.

Every one of those 100 streams is long-lived by design, since `streamingPull` holds the stream open to receive messages. The connection was 100% saturated by its own inbound pulls, with nothing left over.

The catch is that `acknowledge` and `modifyAckDeadline` are unary RPCs. They need a stream too. They couldn't get one, so they queued, and blocked, and eventually hit the 60-second gRPC deadline and failed.

Which produces exactly the symptoms I'd been staring at:

- `modifyAckDeadline` failing means leases can't be extended. Every message rides out its original ack deadline, expires, and redelivers. Forever.
- `acknowledge` failing means the ack rate floors at approximately zero, so nothing ever leaves the subscription.
- Both are swallowed by the SDK, so the whole failure mode is invisible.

The service wasn't slow. It was doing the work, pulling messages, running handlers, computing correct results, and then silently failing to tell Pub/Sub about any of it, over a connection it had strangled with its own subscriptions.

### 100 is a tidier story than the truth

Landing on exactly 100 makes a good headline and it's slightly dishonest. Nineteen subscriptions is 95 streams, and 95 is already over a cliff: acks compete for the five streams left over, most of them lose, and the pipeline degrades intermittently. That reads as flakiness, and flakiness gets a retry and a shrug instead of an investigation.

Hitting a round 20 was luck. It broke completely, and completely broken is the only version of this bug that anyone finds.

### One thing I never explained: publishing kept working

`publish` is a unary RPC too. In v4 the `PublisherClient` and `SubscriberClient` are constructed from the same `PubSub` instance with the same gRPC channel arguments, so as far as I can tell they were eligible to sit on that same strangled connection, and yet publishing never stalled.

My best guess is batching. A batch of messages is one RPC, we publish far less than we consume, and publish concurrency probably stayed low enough to catch a stream in the gaps between stream churn. I never proved it, and I'd rather leave the loose end visible than pretend the model is complete. If you're going to attack anything in this write-up, attack that.

## It's documented. That didn't help at all.

The constraint is written down, verbatim, in the `Subscription` class reference:

> By default each `PubSub` instance can handle 100 open streams, with default options this translates to less than 20 Subscriptions per PubSub instance. If you wish to create more Subscriptions than that, you can either create multiple PubSub instances or lower the `options.streamingOptions.maxStreams` value on each Subscription object.

That is my entire incident, in three sentences, published years before I had it. The same doc block also tells you to attach the `'debug'` handler, and a few lines further down it suggests lowering `maxStreams` if you're seeing excessive redeliveries. Cause, diagnostic and fix are all sitting in the same paragraph.

None of it is anywhere I was going to look. Not the quickstart, not the sample everyone copies, and not any error message, warning, startup log or metric. Nothing counts your streams, nothing compares that count to 100, and nothing says a word when you cross the line or when you're at 95 and losing acks.

The number 20 exists in the docs and nowhere in the runtime, and the runtime is where I was standing. Written down and never enforced means you meet a constraint for the first time during the incident.

## Prior art: seven years of the same bug

I am not the first person here. This failure has a paper trail going back to 2018.

[nodejs-pubsub#1705](https://github.com/googleapis/google-cloud-node/issues/7636) (April 2023, now tracked as `google-cloud-node#7636`) is titled *"Cannot listen to more than 20 subscriptions?"* The reporter spent two days on trial and error, then fixed it with `maxStreams: 3`. Their follow-up comment is the sharpest line in the thread:

> I just found this, and changing the `maxStreams` to `3` have fixed it for me. However I will leave this open as the error that was reported back then is no longer being surfaced - making it hard to figure out!

A maintainer's conclusion, a year later: 20 subscribers in one client isn't unsupported, you're just running into gRPC's stream limit, "shared within one client (`PubSub` object)", and you might try breaking it into several clients. The issue is still open, and someone reported the same symptoms again in September 2025.

[#550](https://github.com/googleapis/nodejs-pubsub/issues/550) (March 2019) is 23 subscriptions in a single process throwing `Failed to "acknowledge" for 6 message(s). Reason: 4 DEADLINE_EXCEEDED`, while pods holding one or two subscriptions were perfectly fine. Their monitoring showed `num_undelivered_messages` climbing while `pull_ack_message_operation_count` stayed flat at zero, meaning acks weren't landing at all. Same signature, seven years earlier.

[#568](https://github.com/googleapis/nodejs-pubsub/issues/568) (April 2019) reports the same `DEADLINE_EXCEEDED` on both `acknowledge` and `modifyAckDeadline`, arriving in bursts.

[#240](https://github.com/googleapis/nodejs-pubsub/issues/240) (September 2018) is where the root cause actually starts. Up to v0.18.0, acks travelled back up the `streamingPull` connection itself, on the stream you already had. v0.19.0 moved them onto standalone unary `Acknowledge` RPCs, and the reporter watched "StreamingPull Acknowledge Requests" vanish from their dashboard while `DEADLINE_EXCEEDED` appeared. The reporter in #550 later confirmed that their 23 subscriptions had worked fine on 0.18.0.

That change is the whole mechanism. Once acks need a stream of their own, a connection saturated by `streamingPull` starves them, and saturating it is the library's own default behaviour at twenty subscriptions.

There's an uncomfortable trend in that timeline. In 2018 this threw an error you could see and crash on; today it's caught, wrapped, and re-emitted on a channel nobody listens to. The bug has got harder to diagnose over the years, not easier.

## The fix is one line

```ts
this.subscription = this.pubsub.subscription(this.subscriptionName, {
  flowControl: this.flowControlOptions,
  ackDeadline: this.ackDeadlineSeconds,
  streamingOptions: { maxStreams: 1 },
});
```

One stream per subscription. 20 streams instead of 100, leaving 80 free for unary RPCs.

Nothing is lost by doing this. A single `streamingPull` stream sustains thousands of messages per second, and this workload peaks around 300 per minute. The default of 5 was buying us nothing and costing us everything.

### What one line doesn't fix

`maxStreams: 1` buys headroom without changing the shape of anything. It's a 5× multiplier on how many subscriptions fit, and the next twenty consumers will spend it.

The structural answer is more channels: multiple `PubSub` instances, or splitting the deployment so that fewer subscriptions live in one process. That's what the docs say and what the maintainer says in #7636.

If you take that route in Node, verify that you actually got separate connections. `grpc-js` resolves subchannels through a process-global pool unless you opt out (`grpc.use_local_subchannel_pool` defaults to off), and its own comment is explicit that "subchannels with the exact same parameters will be reused". A subchannel is one HTTP/2 connection, so two `new PubSub({ projectId })` objects built identically are eligible to land on the same one, and therefore on the same 100-stream ceiling you were trying to escape. If you need certainty, give them differing channel arguments or set `'grpc.use_local_subchannel_pool': 1`.

This is a difference between client libraries, so "rewrite it in Go" isn't the lesson either:

- Java's `Subscriber` hands its channel provider a pool sized to `parallelPullCount` and pins each stream to a channel with `setChannelAffinity(i)`. The default parallel pull count is 1, so twenty subscribers means twenty subscribers' worth of channels.
- Go's `pubsub.NewClient` dials with `option.WithGRPCConnectionPool(min(GOMAXPROCS, 4))`, described in the source comment as "create multiple connections to increase throughput".
- Node gives you one channel and lets you pile everything onto it.

## The cutover

It was instant, in the way that only a real root cause ever is:

```
20:43   backlog 1820   oldest 239 min
21:03   backlog 1852   oldest 259 min
21:13   backlog 1376   oldest 263 min   <- deploying
21:23   backlog    0   oldest   0 min
```

And it stayed at zero for the next 21 hours.

`DEADLINE_EXCEEDED` went from 230-per-six-minutes to zero while processing 1,433 messages in the same window, so that zero is a real load measurement and not silence from an idle service. The settled ack rate was 100% (468 acked of 468 sent) against an 11% baseline. Sent collapsed too, because there were no more redeliveries to inflate it.

## Why the ack deadline experiments misled me

Before finding this, I'd A/B tested the client ack deadline, which had been left unset:

| `ackDeadline` | acked | sent | ack rate |
|---|---|---|---|
| unset (~10 s) | 1,195 | 10,673 | 11% |
| **300 s** | 2,656 | 9,782 | **27%** |
| 600 s | 315 | 9,749 | 3% |

Unset was bad for its own reason. The SDK's adaptive default pins near 10 seconds because its histogram only records *successful* acks, and ours were failing, so it never learned to grow: a self-reinforcing loop.

But look at 600 s. Longer was dramatically worse, which makes no sense until you know about the stream exhaustion. With `modifyAckDeadline` blocked, the initial lease is all you ever get, so doubling it doesn't buy a retry. It just holds a doomed flow-control slot twice as long, and a slot only frees on ack or nack.

(That 600 s row is thin, 315 acks in the window, so read it for direction and not magnitude. The direction held for as long as I watched it.)

That inversion was the clue I should have chased sooner. A knob that gets worse when you turn it in the "safe" direction usually means your model of the system is wrong.

## How to catch this before it bites you

Count your streams at startup and refuse to be surprised. The runtime won't do this for you, so do it yourself, wherever you register consumers:

```ts
const DEFAULT_MAX_STREAMS = 5;
const HTTP2_STREAM_LIMIT = 100;

const budget = subscriptions.reduce(
  (n, s) => n + (s.streamingOptions?.maxStreams ?? DEFAULT_MAX_STREAMS),
  0,
);

if (budget > 60) {
  logger.error(
    `gRPC stream budget ${budget}/${HTTP2_STREAM_LIMIT} on one PubSub client — ` +
      `lower maxStreams or split across PubSub instances`,
  );
}
```

The threshold sits at 60, not 100, so the warning arrives while you still have room, well before acks start losing races.

Attach the `'debug'` listener in every service today. It costs one line, and it's the difference between a queue that is stuck for no visible reason and a screenful of `Failed to "ack" ... DEADLINE_EXCEEDED`.

Then move your alerting onto ack rate. `subscription/num_undelivered_messages` and `oldest_unacked_message_age` both count leased-but-unacked messages, so lease length pollutes them: a longer `ackDeadline` inflates both on a perfectly healthy system, and a stuck system looks much like a busy one. Build the alert on `subscription/ack_message_count` against `subscription/sent_message_count`, which measures work actually leaving the system.

And run the same multiplication over every other multiplexed client you own, whether that's Spanner, Bigtable, Firestore or your own gRPC services. The arithmetic isn't specific to Pub/Sub.

## Three things I'd carry to any queue

**A shared gRPC channel is a budget,** and nothing in the runtime will tell you the balance. Any library that multiplexes over one connection has a stream ceiling. Multiply your per-client concurrency by your number of clients and compare it to 100 before it becomes an incident. The number was in the docs the whole time, stated once, in a class reference, enforced nowhere.

**"No errors" is not "no failures."** It means nothing at all until you've checked whether your client library catches its own. Pub/Sub does it deliberately and documents the intent in a code comment. Go and read how your critical libraries handle their own failures, and note that `ackWithResponse()` is *not* a workaround here: without exactly-once delivery enabled it short-circuits to `ack()` and returns `Success` unconditionally.

**Pick the metric that can't lie to you.** `num_undelivered_messages` and `oldest_unacked_message_age` both count leased-but-unacked messages, so a longer lease inflates both even when the system is perfectly healthy. I burned hours reading those two graphs. Ack rate is the honest one, because it measures work leaving the system.

---

The whole thing came down to one number being 100 and another number being 100. But the reason it took two days rather than two hours wasn't the arithmetic. It was that every instrument on the dashboard read normal while the pipeline sat completely still. The bug I actually needed to fix first was the missing `'debug'` listener, and everything after that was just multiplication.
