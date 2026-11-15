---
title: Value Object
description: "Small, immutable objects that measure or describe something and are equal when their values are equal. Why they should be your default, how to build one, and how to store one without turning it into an Entity."
tags: [ddd, value-object, tactical-design, immutability, entity, java]
updated: 2026-11-15
section: Tactical Design
order: 0
---

Most of us learned to model data from database tables, where every row gets a primary key. So every concept ends up as an object with an `id`, a lifecycle and a set of setters, including things that never needed any of that. Evans calls the result a model where everything is an Entity, and it gets heavy fast: lots of identity to track, lots of mutable state shared between objects, and lots of places for a bug to hide.

Value Objects are the way out. Most of the things in a domain model aren't things at all. They are amounts, dates, names, addresses, colours, ranges. Model those as small immutable values and the Entities left over get much simpler.

## Entity or value?

Ask one question: does the business care *which one* this is, or only *what it is*?

Evans uses a box of markers. A child drawing a picture cares about the colour and the tip of the marker. Swap the red one for another red one from a new box and nobody notices. The marker has no identity that matters, only a value. A customer, an order or a bank account is different. Those have to be followed through changes, so they are [Entities](/domain-driven-design/entity/).

| | Entity | Value Object |
| --- | --- | --- |
| Defined by | Its identity | Its attributes |
| Equal when | Same identity | All attributes equal |
| Changes by | Running an operation on it | Being replaced with a new value |
| Lifecycle | Created, changed, stored, deleted | None of its own; lives inside its owner |

The answer depends on the Bounded Context. An address on a parcel label is a value. The same address in a postal service's route planning is an Entity. When in doubt, try a Value Object first. You can always promote it later, and you usually won't need to.

## What makes something a value

Vernon lists six characteristics. You don't need all six to be perfect, but if a concept has most of them, it's a value.

1. **It measures, quantifies or describes something.** A person's age, height and name aren't things in the domain. They describe a person.
2. **It is immutable.** Once constructed, it never changes.
3. **It is a conceptual whole.** Related attributes travel together. `50,000,000` alone means nothing, and neither does `USD`. Together they're an amount of money. Ward Cunningham called this the *Whole Value* pattern.
4. **It is replaced, not modified.** When a customer moves, they get a new address. You don't edit the old one.
5. **It is compared by value.** Two values of the same type with the same attributes are equal, and interchangeable.
6. **Its behaviour has no side effects.** Its methods compute and return something new, and never change the object they are called on.

Here is all of that in one small class:

```java
public record Money(BigDecimal amount, Currency currency) {

    public Money {
        Objects.requireNonNull(amount, "amount is required");
        Objects.requireNonNull(currency, "currency is required");
        if (amount.scale() > currency.getDefaultFractionDigits())
            throw new IllegalArgumentException("Too many decimal places for " + currency);
    }

    public Money plus(Money other) {
        requireSameCurrency(other);
        return new Money(amount.add(other.amount), currency);
    }

    public Money times(int quantity) {
        return new Money(amount.multiply(BigDecimal.valueOf(quantity)), currency);
    }

    public boolean isGreaterThan(Money other) {
        requireSameCurrency(other);
        return amount.compareTo(other.amount) > 0;
    }

    private void requireSameCurrency(Money other) {
        if (!currency.equals(other.currency))
            throw new IllegalArgumentException("Can't combine " + currency + " and " + other.currency);
    }
}
```

A Java `record` gives you final fields, `equals` and `hashCode` over all attributes, and no setters, which covers most of the list without any extra code. In older Java, or in C#, you write those yourself (C# has `record` too). One trap with `BigDecimal`: `new BigDecimal("10.0").equals(new BigDecimal("10.00"))` is false. The scale check in the constructor keeps that from biting you through `equals`.

The constructor is also where validation belongs. If a `Money` can't exist with a null currency, no code anywhere else has to check for one.

## Why immutability matters

This is the characteristic people most often skip, so it's worth seeing what goes wrong without it:

![Two panels. With a mutable Address shared by two customers, customer A calls setStreet and customer B's address changes too, although nothing in B's code changed. With an immutable Address, customer A is given a new Address object for 9 Oak Avenue, while customer B keeps the old 12 Elm Street object, which nothing can change.](/assets/img/value-object-shared-mutation.png)

The bug on the left is miserable to track down, because the code that broke B never mentions B. With immutable values you can share one instance everywhere, hand it to another thread, cache it, or return it from a getter, and never make a defensive copy.

Changing a value on an Entity looks like this:

```java
// No: reaches into the value and edits it
customer.address().setStreet("9 Oak Avenue");

// Yes: the Entity replaces the whole value
customer.relocateTo(new Address("9 Oak Avenue", "Springfield", "12345"));
```

## Pull primitives into values

The most common smell is an Entity full of loose primitives that only make sense together:

```java
// Before: six fields, and nothing says which ones belong together
public class Customer {
    private String street;
    private String city;
    private String postalCode;
    private BigDecimal creditLimitAmount;
    private String creditLimitCurrency;
}

// After: two concepts from the domain, each one validated once
public class Customer {
    private Address address;
    private Money creditLimit;
}
```

The second version is shorter, but the real win is where the rules go. Postal code formats and currency arithmetic now live in `Address` and `Money`, where they can be tested on their own, instead of being spread across every service that touches a customer.

Identifiers are a good place to start. A `CustomerId` and an `OrderId` that are both `String` can be swapped by accident, and the compiler will let you. Make them values and it won't.

## Give values real behaviour

A value isn't just a bundle of fields. Evans's chapter on supple design shows a few habits that make them much more useful.

**Closed operations.** `Money.plus(Money)` returns `Money`. When an operation's arguments and result are all the same type, you can chain operations without learning anything new: `price.times(quantity).plus(shipping)`. Evans's loan-syndication example does the same with a `SharePie` value: `actualShares.minus(agreedShares)` answers a real business question in one line.

**Side-effect-free functions.** In Evans's paint example, mixing two paints changes a `Paint` Entity, but the colour maths lives in a `PigmentColor` value whose `mixedWith(other)` returns a new colour. The hard part becomes a pure function you can test with a few asserts and no setup.

**Specifications.** A business rule that answers yes or no can be a small value too:

```java
public record DelinquentInvoiceSpecification(LocalDate today, int graceDays) {
    public boolean isSatisfiedBy(Invoice invoice) {
        return !invoice.isPaid() && invoice.dueDate().plusDays(graceDays).isBefore(today);
    }
}
```

## Values between Bounded Contexts

Values also help keep contexts apart. In Vernon's SaaSOvation example, the identity and access context owns `User` and `Role` Aggregates, with plenty of state and rules. The collaboration context only needs to know who moderated a forum. Its anticorruption layer asks the upstream context and builds a `Moderator` value holding an identity, a name and an email address.

The collaboration context doesn't track that user over time and doesn't care what else happens to them upstream. If the details change, it builds a new value next time. That's much less to keep in sync than a local copy of a foreign Entity.

Fixed sets of options, like a phone type or a backlog item status, are values as well. Vernon calls them **standard types**, and in Java an `enum` is usually all you need.

## Storing values

This is where "everything is an Entity" usually sneaks back in. The database wants a primary key, so the value gets one, then a repository, and before long it's an Entity in all but name.

Don't let storage decide the model. In order of preference:

- **One value: store it in its owner's row.** In JPA that's `@Embeddable` on the value and `@Embedded` on the field, so `Money` becomes two columns on the `orders` table. No join, no key.
- **A collection of values: keep it with the owner too.** Serialise it into one column (JSON works well), or use `@ElementCollection`, which puts it in a separate table without giving the values an identity.
- **If the ORM really needs a key,** hide it. Vernon puts it in a base class, `IdentifiedValueObject`, with a private surrogate `id` that only the ORM sees. The class still behaves as a value: it is immutable, it is compared by value, and nothing in the domain uses that `id`.
- **Document databases** make most of this go away, since the whole Aggregate is saved as one document.

Before turning a value into an Entity, ask whether the business needs it or only the schema does. If it's only the schema, keep the value and solve the problem in the persistence layer.

## Checklist

- Is the name a word the domain experts use?
- Are all the fields final, with no setters, and are any collections it holds unmodifiable?
- Does the constructor take every attribute and reject invalid combinations?
- Are `equals` and `hashCode` based on all attributes?
- Do its methods return new values rather than change the current one?
- Does the owning Entity replace the whole value when it changes?
- Is any database key hidden from the domain?

## References

- Eric Evans, *Domain-Driven Design: Tackling Complexity in the Heart of Software* (Addison-Wesley, 2003) — Chapter 5, A Model Expressed in Software; Chapter 10, Supple Design.
- Vaughn Vernon, *Implementing Domain-Driven Design* (Addison-Wesley, 2013) — Chapter 6, Value Objects.
- Vlad Khononov, *Learning Domain-Driven Design* (O'Reilly, 2021) — Chapter 6, Tackling Complex Business Logic.
- Ward Cunningham, [The CHECKS Pattern Language of Information Integrity — Whole Value](https://c2.com/ppr/checks.html) (1994).
- Martin Fowler, [Value Object — martinfowler.com](https://martinfowler.com/bliki/ValueObject.html)
