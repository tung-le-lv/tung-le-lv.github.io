---
title: Event Driven Architecture
description: What event-driven architecture is, the three event patterns behind it, messaging models and channel types, its benefits and challenges, and a cheatsheet of the core patterns.
tags: [eda, event-sourcing, messaging, pub-sub, kafka]
updated: 2026-09-19
order: 1
---

## Definition

Event-Driven Architecture (EDA) is a software design pattern where system components communicate through **events** instead of direct calls. In EDA, services react to events as they occur, making the system more **loosely coupled, scalable, and asynchronous**.

You are event-driven if you are using at least one of these patterns: Event sourcing, Event notifications, Event-carried state transfer.

1. **Event Notification** (Fire-and-Forget)
   - The producer just signals that something happened.
   - Example: A notification service listens for `UserRegistered` and sends a welcome email.
2. **Event-Carried State Transfer**
   - Events contain data that consumers need.
   - Example: `OrderCreated` includes order details, so consumers don't have to query another service.
3. **Event Sourcing**
   - Events are stored as the **source of truth** instead of traditional databases. It persists the system's state through a series of events. Applying all the events in a stream produces the system's current state.
   - Example: An order's state is reconstructed by replaying past events.

> [!INFO] Pub/sub vs. event streaming
> An event-driven architecture can use a publish-subscribe model or an event stream model.
>
> - **Pub/sub:** The publish-subscribe messaging infrastructure tracks subscriptions. When an event is published, it sends the event to each subscriber. An event can't be replayed after it's received, and new subscribers don't see the event. E.g. SNS - SQS.
> - **Event streaming:** Events are written to a log. Events are strictly ordered within a partition and are durable. Clients don't subscribe to the stream. Instead, a client can read from any part of the stream. The client is responsible for advancing their position in the stream. That means a client can join at any time and can replay events. E.g. Kafka

> [!INFO] Messaging models at a glance
> - **Point-to-point** (SQS): one producer → one queue → one consumer. Think of it like a direct letter.
> - **Publish-subscribe** (SNS-SQS): one producer → SNS topic → multiple SQS queues (fan-out). Think of it like a broadcast.
> - **Event streaming** (Kafka): one producer → durable log → multiple consumers read at their own pace with replayability. Think of it like a recorded broadcast.

## Types of Message

There are several different kinds of messages:

- **Document**—A generic message that contains only data. The receiver decides how to interpret it. The reply to a command is an example of a document message.
- **Command**—A message that's the equivalent of an RPC request. It specifies the operation to invoke and its parameters.
- **Event**—A message indicating that something notable has occurred in the sender. An event is often a domain event, which represents a state change of a domain object such as an Order, or a Customer.

## Types of Channel

There are two kinds of channels: point-to-point and [publish-subscribe](http://www.enterpriseintegrationpatterns.com/PublishSubscribeChannel.html):

- A **point-to-point** channel delivers a message to exactly one of the consumers that is reading from the channel. Services use point-to-point channels for the one-to-one interaction styles. For example, a command message is often sent over a point-to-point channel.
- A **publish-subscribe** channel delivers each message to all of the attached consumers. Services use publish-subscribe channels for the one-to-many interaction styles described earlier. For example, an event message is usually sent over a publish-subscribe channel.

## Benefits

- **Loose Coupling** – Services interact via events, reducing dependencies.
- **Scalability** – Systems can scale independently based on event volume.
- **Resilience** – Failures in one service don't affect the whole system.

## Challenges

- **Complex Debugging** – Harder to trace event flows across services.
- **Event Duplication** – Requires **idempotency** handling.
- **Message Ordering** – Needs careful partitioning (e.g., Kafka partitions).
- **Data Consistency** – Eventual consistency can cause delays in updates.

## Patterns Overview

![A cheatsheet on event-driven architectural patterns: competing consumer, consume and project, event sourcing, async task execution, transactional outbox, event aggregation and saga.](/assets/img/eda-patterns-cheatsheet.jpeg)

## References

- [Event-driven architecture style — Azure Architecture Center, Microsoft Learn](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven)
- Chris Richardson, *Microservices Patterns: With Examples in Java* (Manning, 2018).
- [Publish-Subscribe Channel — Enterprise Integration Patterns](http://www.enterpriseintegrationpatterns.com/PublishSubscribeChannel.html)
