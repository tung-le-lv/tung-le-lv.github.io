---
title: Domain Event
tags: [ddd, domain-events, tactical-design, eventual-consistency, event-sourcing, cqrs, java]
updated: 2026-11-20
section: Tactical Design
order: 2
---

Early object models were built from nouns: customers, products, orders. But a business is mostly things happening. A policy is issued, a backlog item is committed to a sprint, a payment clears, an order ships. Domain experts talk about those moments all the time, and the follow-up work usually hangs off them: *when* the order ships, send the invoice.

A **Domain Event** makes such a moment part of the model. Evans's original book didn't have them; he added them later, and Vernon's *Implementing Domain-Driven Design* gives them a full chapter. They sit alongside [Entities](/domain-driven-design/entity/) and [Value Objects](/domain-driven-design/value-object/) as a building block, and they are how one [Aggregate](/domain-driven-design/aggregate-pattern/) tells the rest of the system that something changed without reaching into it.

## What a Domain Event is

A Domain Event records something that happened in the domain that domain experts care about. Because it describes the past, it has three properties:

- **A past-tense name in the Ubiquitous Language.** `ProductCreated`, `BacklogItemCommitted`, `PolicyIssued`, `CalendarEntryScheduled`. If the experts wouldn't say it, it isn't a good name.
- **It is immutable.** History can't be edited. To undo something, you don't change or delete the old event, you raise a new one that reverses it, such as `BacklogItemUncommitted`.
- **It is a fact, not a request.** A command asks for something and can be rejected. An event reports something that was already accepted and done, so a subscriber can't refuse it. It can only decide how to react.

That last point is where most of the confusion comes from, so it's worth putting the three message types side by side:

| | Domain Event | Command | Integration event |
| --- | --- | --- | --- |
| **Intent** | Record that something happened | Ask for something to happen | Tell other contexts that something happened |
| **Name** | Past tense: `BacklogItemCommitted` | Imperative: `CommitBacklogItem` | Past tense: `BacklogItemCommitted`, often versioned and published |
| **Handled by** | Any number of subscribers, none of which can reject it | One Aggregate, which may reject it | Other Bounded Contexts, through their anticorruption layer |
| **Scope** | Inside the Bounded Context | Inside the Bounded Context | Across Bounded Contexts |
| **Changes?** | Never | Never once sent | Never |

### How to spot one

Listen for these phrases from domain experts:

- "**When** a backlog item is committed, ..."
- "**If that happens**, ..."
- "**Let me know if** ..." or "**Notify me when** ..."

Each one points to an event and to something that should react to it. [Event Storming](/domain-driven-design/event-storming/) does this on purpose: the workshop starts by writing every event on an orange sticky note, before anyone talks about data.

## What goes in an event

An event has to tell its subscribers what happened without making them call back to find out. In practice, that means:

1. **When it happened.** Vernon gives every event an `occurredOn()` through a small `DomainEvent` interface.
2. **Which Aggregate it happened to.** The identity of the Aggregate Root, such as `BacklogItemId`, plus a `TenantId` in a multi-tenant system.
3. **The facts from the command that caused it.** For a commit, the sprint the item went into. For a new product, its name and description.

```java
public interface DomainEvent {
    Instant occurredOn();
}

public record BacklogItemCommitted(
        TenantId tenantId,
        BacklogItemId backlogItemId,
        SprintId committedToSprintId,
        Instant occurredOn) implements DomainEvent {

    public BacklogItemCommitted(TenantId tenantId, BacklogItemId backlogItemId, SprintId committedToSprintId) {
        this(tenantId, backlogItemId, committedToSprintId, Instant.now());
    }
}
```

A Java `record` is a good fit: every field is final, the constructor sets them all, and there are no setters to misuse.

### Thin or enriched?

How much to put in the payload is a trade-off between the publisher and its subscribers:

| | Thin event | Enriched event |
| --- | --- | --- |
| **Carries** | Identities only, such as `TenantId` and `PolicyId` | The identities plus the details subscribers need, such as names, addresses and totals |
| **Subscribers** | Must query the publisher's API for the rest | Can act on the event alone |
| **Upside** | Small, and exposes little data | Subscribers stay autonomous and keep working when the publisher is down |
| **Downside** | Coupling and latency on every query-back | Larger events, more data exposed, and a payload that can hide what actually happened |

A useful middle ground is to include enough stable values to serve most subscribers, roughly eight out of ten, and let the rare one query back. Don't dump the whole Aggregate into every event. If you do, every subscriber depends on its internal shape.

## Why events matter

### One Aggregate per transaction

An [Aggregate's](/domain-driven-design/aggregate-pattern/) rule is to change only one Aggregate instance per transaction. Changing two at once leads to lock contention, optimistic-concurrency failures and Aggregates that grow until they cover half the model.

Events are how you follow the rule when a change to one Aggregate must lead to a change in another:

1. Aggregate *A* runs the command, enforces its own invariants and raises an event, all in its own transaction.
2. A subscriber receives the event and changes Aggregate *B* in a separate transaction.

The two Aggregates are now **eventually consistent** instead of immediately consistent. For most business rules that cross Aggregates, a delay of a few hundred milliseconds or a few seconds is fine, and the experts will often tell you the real tolerance is much longer.

### No distributed transactions, no nightly batch

Across databases or services, the alternative to events is a two-phase commit, which trades away availability and scalability. Events plus durable messaging get you to the same end state without holding locks across systems.

Events also replace a lot of batch jobs. A nightly job that recalculates summaries or cleans up stale rows has to scan large tables under large locks. If the same work is done as each event happens, it becomes many small updates spread through the day.

### Bounded Contexts that don't wait on each other

When one context calls another synchronously, the caller is only available while the callee is. If the callee publishes events instead, the downstream contexts consume them when they can, translate them through an anticorruption layer into their own model, and keep working even when the publisher is down.

## Publishing events

Here is the whole journey of one event, from the command that causes it to the subscribers that react:

```archify
domain-event-flow
A product owner sends the CommitBacklogItem command to an application service, which calls commitTo on the BacklogItem Aggregate Root. The Aggregate saves its new state and the stored event in one database transaction. An event forwarder reads unpublished events from the database and publishes them to a message broker with at-least-once delivery. The broker delivers the event to three subscribers: the Sprint Aggregate, which updates in its own transaction, a read-model projection, and another Bounded Context outside the boundary, which receives it through an anticorruption layer.
```

### Inside the Bounded Context

Vernon's lightweight publisher lets an Aggregate raise an event without knowing who listens. Subscribers register on the current thread for the length of one request:

```java
public interface DomainEventSubscriber<T extends DomainEvent> {
    Class<T> subscribedToEventType();
    void handleEvent(T event);
}

public final class DomainEventPublisher {
    private static final ThreadLocal<List<DomainEventSubscriber<?>>> subscribers =
            ThreadLocal.withInitial(ArrayList::new);

    public static void reset() { subscribers.get().clear(); }

    public static void subscribe(DomainEventSubscriber<?> subscriber) {
        subscribers.get().add(subscriber);
    }

    @SuppressWarnings("unchecked")
    public static <T extends DomainEvent> void publish(T event) {
        for (DomainEventSubscriber<?> subscriber : List.copyOf(subscribers.get())) {
            if (subscriber.subscribedToEventType().isAssignableFrom(event.getClass())) {
                ((DomainEventSubscriber<T>) subscriber).handleEvent(event);
            }
        }
    }
}
```

The Aggregate publishes from its command method, and the application service decides who hears it. Its main subscriber appends every event to the event store, inside the same transaction as the Aggregate's own change:

```java
// BacklogItem
public void commitTo(Sprint sprint) {
    if (status == BacklogItemStatus.DONE)
        throw new DomainException("A finished backlog item can't be committed to a sprint.");
    this.sprintId = sprint.id();
    this.status = BacklogItemStatus.COMMITTED;
    DomainEventPublisher.publish(new BacklogItemCommitted(tenantId, id, sprintId));
}

// BacklogItemApplicationService
@Transactional
public void commitBacklogItem(CommitBacklogItemCommand command) {
    DomainEventPublisher.reset();
    DomainEventPublisher.subscribe(eventStore::append);   // same transaction as the change below

    BacklogItem item = backlogItems.backlogItemOfId(command.tenantId(), command.backlogItemId());
    Sprint sprint = sprints.sprintOfId(command.tenantId(), command.sprintId());
    item.commitTo(sprint);
    backlogItems.save(item);
}
```

`eventStore::append` stands for a small subscriber class that accepts every `DomainEvent` type.

> [!WARNING] In-process doesn't mean same transaction for everything
>
> An in-process subscriber runs inside the publisher's transaction. If it loads and changes a second Aggregate, you have broken the one-Aggregate rule by the back door. Local subscribers should only record the event, in the event store or an outbox, and let the second Aggregate change asynchronously.

Some teams prefer not to use a static publisher. Instead, the Aggregate keeps a list of the events it raised, and the application service or repository reads that list after saving and appends the events. The [Aggregate article](/domain-driven-design/aggregate-pattern/) shows this style. Either way, the event must be stored in the same transaction as the state change.

### Out of the Bounded Context: the event store

Writing to the database and then sending to a broker are two separate systems, and no local transaction covers both. If the process dies in between, the event is lost. The fix is the same as the [Transactional Outbox](/event-driven-architecture/transaction-messaging-outbox/):

1. **Store the event with the change.** The Aggregate's new state and a serialised copy of the event are written in the same database transaction.
2. **Forward it later.** A background forwarder reads stored events that haven't been published yet and sends them to the broker, such as RabbitMQ or Kafka.
3. **Track progress.** A `PublishedMessageTracker` keeps, for each exchange, the id of the last event that was published, so the forwarder knows where to resume after a restart.

```sql
CREATE TABLE stored_event (
    event_id     BIGINT        NOT NULL AUTO_INCREMENT,
    type_name    VARCHAR(250)  NOT NULL,
    occurred_on  TIMESTAMP     NOT NULL,
    event_body   TEXT          NOT NULL,   -- the event, serialised as JSON
    PRIMARY KEY (event_id)
);

CREATE TABLE published_message_tracker (
    exchange_name            VARCHAR(100) NOT NULL,
    most_recent_published_id BIGINT       NOT NULL,
    PRIMARY KEY (exchange_name)
);
```

The `event_id` sequence also gives every event a global order, which subscribers can use later.

### Without a broker: a notification log

If you don't want messaging middleware, you can let other contexts poll for events over HTTP. Vernon groups stored events into fixed-size **notification logs**, for example twenty events each. The current log, at a URL such as `/notifications`, holds the newest events and is still filling up. Each full log is archived and never changes again, so it can be cached forever. Links (`rel=previous`, `rel=next`) let a subscriber walk back to the last log it read and catch up from there.

## Consuming events

Whatever carries the events, assume **at-least-once delivery**. The forwarder can crash after sending but before recording that it sent, so some events will arrive twice. Over a network, some will also arrive out of order. Subscribers have to cope with both.

**Idempotent receivers.** Handling the same event twice must leave the same state as handling it once. Some operations are naturally idempotent, such as "set status to committed". Others are not, such as "add one to the count". For those, record the ids of processed events in the same transaction as the work and skip ids you have already seen. [Message Idempotency](/event-driven-architecture/message-idempotency/) covers this Inbox pattern in detail.

**Ordering.** When the order matters, the event carries something to compare: a sequence number or its `occurredOn` time. Vernon's collaboration context keeps a small change tracker on each member for this. (The `eventId()` below is the `event_id` of the stored row, which the publisher sends with each event.) Suppose `UserAssignedToRole` (10:00) and `UserUnassignedFromRole` (10:05) arrive the wrong way round:

```java
// Collaboration context: reacts to events published by Identity and Access
public void when(UserAssignedToRole event) {
    if (!processedEvents.markIfNew(event.eventId())) return;    // a duplicate: already handled
    Member member = members.memberOf(event.tenantId(), event.username());
    member.becomeModerator(event.occurredOn());
    members.save(member);
}

// Member
public void becomeModerator(Instant asOf) {
    if (changeTracker.isOlderThanLastChange(asOf)) return;      // a later change was already applied
    this.moderator = true;
    this.changeTracker = changeTracker.changedAt(asOf);
}
```

The 10:05 unassignment is applied first and moves the tracker to 10:05. When the 10:00 assignment arrives, it is older than the last change, so it is ignored, and the member correctly ends up without the role.

## Event sourcing

So far, events are announcements about state that is stored the usual way, as rows that are overwritten. **Event sourcing** goes further: the events *are* the state. An Aggregate is stored as the append-only stream of every event that happened to it, and Vernon calls the combination **A+ES**.

Loading an Aggregate means replaying its stream:

1. Read the stream for the Aggregate's identity.
2. Create an empty instance.
3. Apply each event in order to rebuild the current state.

```java
public final class BacklogItem {
    private TenantId tenantId;
    private BacklogItemId id;
    private SprintId sprintId;
    private BacklogItemStatus status;
    private final List<DomainEvent> changes = new ArrayList<>();   // new events, not yet appended

    public static BacklogItem from(List<DomainEvent> stream) {
        BacklogItem item = new BacklogItem();
        stream.forEach(item::apply);                     // replay only: no rules are checked
        return item;
    }

    public void commitTo(SprintId sprintId) {
        if (status == BacklogItemStatus.DONE)
            throw new DomainException("A finished backlog item can't be committed to a sprint.");
        record(new BacklogItemCommitted(tenantId, id, sprintId));
    }

    private void record(DomainEvent event) {
        apply(event);
        changes.add(event);
    }

    private void apply(DomainEvent event) {
        switch (event) {
            case BacklogItemPlanned e   -> { tenantId = e.tenantId(); id = e.backlogItemId(); status = BacklogItemStatus.PLANNED; }
            case BacklogItemCommitted e -> { sprintId = e.committedToSprintId(); status = BacklogItemStatus.COMMITTED; }
            default -> throw new IllegalStateException("Unknown event " + event.getClass().getSimpleName());
        }
    }
}
```

The command method checks the rule and records an event. Only `apply` changes state, and it is used both for new events and for replay, so the two paths can't drift apart.

**Snapshots.** A long-lived Aggregate can have thousands of events. To keep loading fast, a background task periodically saves a snapshot of its state at a given version, for example every 100 events. Loading then starts from the latest snapshot and replays only the events after it.

**CQRS.** A store full of event streams is good at "give me everything about this Aggregate" and bad at "list every committed item in this sprint". So event sourcing almost always comes with [CQRS](/event-driven-architecture/cqrs/). The command side handles commands, enforces invariants and appends events. The query side subscribes to those events and builds read models shaped for each query, in SQL, a search index or a document store.

The [Aggregate article](/domain-driven-design/aggregate-pattern/) covers event sourcing's optimistic concurrency check and its trade-offs.

## Checklist

- Is the name past tense, in words the domain experts use?
- Is the event immutable, with every field set in the constructor?
- Does it carry `occurredOn`, the Aggregate's identity and, if needed, the tenant?
- Does it carry what most subscribers need, without dumping the whole Aggregate?
- Does each transaction change one Aggregate, with events carrying the change to the others?
- Is the event stored in the same transaction as the state change, before anything is published?
- Can every subscriber handle the same event twice, and events that arrive out of order?
- If you use event sourcing, do you have snapshots for long streams and read models for queries?

## References

- Eric Evans, [*Domain-Driven Design Reference* — Domain Language](https://www.domainlanguage.com/ddd/reference/) (2015) — Domain Events.
- Vaughn Vernon, *Implementing Domain-Driven Design* (Addison-Wesley, 2013) — Chapter 4, Architecture; Chapter 8, Domain Events; Chapter 13, Integrating Bounded Contexts; Appendix A, Aggregates and Event Sourcing: A+ES.
- Vaughn Vernon, *Domain-Driven Design Distilled* (Addison-Wesley, 2016) — Chapter 6, Tactical Design with Domain Events; Chapter 7, Acceleration and Management Tools.
- Alberto Brandolini, *Introducing EventStorming* (Leanpub).
- Martin Fowler, [Domain Event — martinfowler.com](https://martinfowler.com/eaaDev/DomainEvent.html)
- Martin Fowler, [Event Sourcing — martinfowler.com](https://martinfowler.com/eaaDev/EventSourcing.html)
- Chris Richardson, [Pattern: Domain event — microservices.io](https://microservices.io/patterns/data/domain-event.html)
