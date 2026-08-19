# LinkedIn post — draft

Plain text post linking to the blog. Not rendered by the site; kept here so
the post and the write-up stay in sync.

Paste everything between the rules. ~2,300 characters, inside LinkedIn's
3,000 limit. The hook lands in the first three lines, above the "see more"
fold.

---

Our hotel inventory cache was running 4 hours behind the supplier.

We were quoting guests prices from a world that no longer existed.

I blamed DerbySoft. Then MongoDB. Then the Atlas cluster. Then my own flow-control settings — where I made it measurably worse, and had to revert.

Every metric said the system was healthy:

• 0 pod restarts
• CPU at 0.06 of 4 cores
• Every query hitting an index in under 62ms
• No errors. No exceptions. No nacks.

A pipeline completely frozen, and an application entirely relaxed about it.

Here's why I couldn't see it: @google-cloud/pubsub swallows acknowledgement failures on purpose. Subscriber.ack() literally does `resultPromise.catch(() => {})`, and the queue flush catches the rest with a comment saying it "should never surface an error to the user level." A subscription whose every single ack is failing looks perfectly healthy.

So I attached the 'debug' listener — documented on the Subscription class, and present in none of the samples anyone copies.

230 DEADLINE_EXCEEDED errors in 6 minutes. Across SIX different subscriptions.

Then the arithmetic fell out:

One singleton PubSub client → one gRPC channel → one HTTP/2 connection.
HTTP/2 caps concurrent streams at 100.
The SDK opens 5 streaming pulls per subscription.
We run 20 consumers.

20 × 5 = 100.

Exactly at the cap. The connection was fully saturated by its own message pulls — so `acknowledge` and `modifyAckDeadline`, unary RPCs that also need a stream, could never get one. They blocked until the 60-second gRPC deadline and failed. Invisibly.

The fix was one line: maxStreams: 1.

Backlog: 1,820 → 0 in twenty minutes, and flat for the next 21 hours. Ack rate: 11% → 100%.

The part that stayed with me: this is documented. The Subscription class reference says a PubSub instance handles 100 open streams — "less than 20 Subscriptions per PubSub instance." It's been reported since 2018, and the 2023 issue titled "Cannot listen to more than 20 subscriptions?" is still open.

Three things I'd carry to any queue:

1. A shared gRPC channel is a finite budget, and nothing in the runtime tells you the balance. Multiply your per-client streams by your client count before it becomes an incident.

2. "No errors" is not "no failures" until you've read how your critical libraries handle their own.

3. num_undelivered_messages counts leased-but-unacked messages, so it inflates even when things are fine. Ack rate is the metric that can't lie to you.

Full write-up, including the eight dead ends and the prior art going back to 2018: https://www.hermanyiqunliang.com/blog/pubsub-maxstreams-http2-stall

#DistributedSystems #NodeJS #GCP #SRE #Debugging #Engineering

---
