---
title: Identifying Bounded Contexts
description: Practical strategies from Vaughn Vernon for finding Bounded Context boundaries — subdomains, life cycle stages, Event Storming, organisational lines and overloaded terms.
tags: [ddd, bounded-context, strategic-design, event-storming]
updated: 2026-09-19
section: Strategic Design
order: 1
---

With the addition of Vaughn Vernon's *Domain-Driven Design Distilled* and *Implementing Domain-Driven Design*, we gain a few more practical strategies for identifying Bounded Contexts. While Eric Evans established foundational signals like team organization and language splinters, Vernon offers several additional perspectives:

## Aligning with Subdomains (Problem Space vs. Solution Space)

Vernon emphasizes identifying Bounded Contexts by first analyzing your business's "problem space". You do this by breaking the entire business domain down into logical **Subdomains** (Core, Supporting, and Generic). Once you have mapped out these Subdomains, they guide your "solution space" (the software implementation). In an ideal DDD scenario, **you should strive to align one Bounded Context one-to-one (1:1) with a single Subdomain**.

## Tracking an Object's Life Cycle Stages

If a core business concept goes through drastically different phases where different people care about completely different properties, each stage might warrant its own Bounded Context. For example, in a publishing company, a "Book" goes through conceptualization, editing, page layout, marketing, and shipping. Trying to build a single "Book" model to handle all of these stages would cause massive confusion. Instead, you should create separate Bounded Contexts for each major life cycle stage, where the "Book" means exactly what that specific team requires it to mean.

> [!BOOK] Implementing Domain-Driven Design
> Here's another example with a common name used in multiple Bounded Contexts, but this time within the same Domain. Consider the modeling challenges of a publishing organization that must deal with the various stages of the life cycle of books. Roughly speaking, publishers deal with similar stages as a book progresses through these different Contexts:
>
> - Conceptualizing and proposing a book
> - Contracting with authors
> - Managing the book's authorship and editorial process
> - Designing the book layout, including illustrations
> - Translating the book into other languages
> - Producing the physical print and/or electronic editions
> - Marketing the book
> - Selling the book to resellers and/or directly to consumers
> - Shipping a physical book to resellers and consumers
>
> Throughout each of these stages, is there one single way to properly model a Book? Absolutely not. At each of these stages the Book has different definitions. It is not until contract that the Book has a tentative title, which might change during editing. During the authorship and editorial phases, the Book has a collection of drafts with comments and corrections, along with a final draft. Graphic designers create page layouts. Production uses the layouts to create press images, "blue lines," and finally plates. Marketing doesn't need most of the editorial or production artifacts, perhaps just cover art and high-level descriptions. For shipping, the Book might carry only an identity, inventory location, availability count, a size, and a weight.
>
> What would happen if you tried to design a central model for Books that facilitated all the stages in its life cycle? There would be a high degree of confusion, disagreement, and contention, and little deliverable software. Even if a correct common model could be delivered from time to time, it would likely meet the needs of all clients only occasionally and far too briefly. To counter that kind of undesirable churn and burn, such a publisher modeling with DDD would use separate Bounded Contexts for each of the life cycle stages.
>
> In every one of the multiple Bounded Contexts, there is a type of Book. The various Book objects would share an identity across all or most of the Contexts, perhaps first established at the conceptualization stage. However, the model of a Book in each Context would be different from all others. That's fine, and in fact the way it should be. When the team of a given Bounded Context speaks about a Book, it means exactly what they require for their Context. The organization embraces the natural need for differences. This is not to say that such positive outcomes are trivial to achieve. Nonetheless, using explicit Bounded Contexts, software gets delivered regularly with incremental improvements that address the specific needs of the business.

The same concept, modelled three ways in C#:

```csharp
// ---------------------------------------------------------
// CONTEXT 1: CONCEPTUALIZATION & PROPOSALS
// Focuses on the idea, target audience, and business viability.
// ---------------------------------------------------------
namespace Publishing.Conceptualization
{
    public class Book
    {
        // Identity is internal to the proposal phase
        public Guid ProposalId { get; private set; }
        public string WorkingTitle { get; private set; }
        public string TargetAudience { get; private set; }
        public bool IsApprovedForPublishing { get; private set; }

        public Book(string workingTitle, string targetAudience)
        {
            ProposalId = Guid.NewGuid();
            WorkingTitle = workingTitle;
            TargetAudience = targetAudience;
            IsApprovedForPublishing = false;
        }

        public void ApproveProposal() 
        {
            IsApprovedForPublishing = true;
        }
    }
}

// ---------------------------------------------------------
// CONTEXT 2: AUTHORSHIP & EDITING
// Focuses on the actual content, word counts, and draft status.
// ---------------------------------------------------------
namespace Publishing.Editing
{
    public class Book
    {
        // Identity is tracked by the manuscript
        public Guid ManuscriptId { get; private set; }
        public string Title { get; private set; }
        public string AuthorName { get; private set; }
        public string ContentText { get; private set; }
        public string EditingStatus { get; private set; }

        public Book(Guid manuscriptId, string title, string authorName)
        {
            ManuscriptId = manuscriptId;
            Title = title;
            AuthorName = authorName;
            EditingStatus = "First Draft";
        }

        public void SubmitEdits(string editedContent)
        {
            ContentText = editedContent;
            EditingStatus = "Copy Edited";
        }
    }
}

// ---------------------------------------------------------
// CONTEXT 3: SHIPPING & LOGISTICS
// Focuses entirely on physical dimensions, weight, and inventory.
// (Notice it doesn't care about the author or the target audience!)
// ---------------------------------------------------------
namespace Publishing.Shipping
{
    public class Book
    {
        // Identity is now the universally recognized ISBN
        public string ISBN { get; private set; }
        public double WeightInKg { get; private set; }
        public int QuantityOnHand { get; private set; }
        public string WarehouseAisle { get; private set; }

        public Book(string isbn, double weightInKg, string warehouseAisle)
        {
            ISBN = isbn;
            WeightInKg = weightInKg;
            WarehouseAisle = warehouseAisle;
        }

        public void ReduceInventory(int shippedQuantity)
        {
            if (QuantityOnHand >= shippedQuantity)
                QuantityOnHand -= shippedQuantity;
            else
                throw new InvalidOperationException("Insufficient stock to ship.");
        }
    }
}
```

## Using Event Storming

You can actively discover Bounded Context boundaries by conducting an **Event Storming** session (see [Event Storming](/domain-driven-design/event-storming/)). As you map out business events on a timeline using sticky notes, boundaries will naturally emerge on the modeling surface. You will likely notice a natural boundary when the flow of events crosses departmental divisions, when business people start arguing over the definition of a term, or when a concept clearly steps outside the Core Domain you are focusing on.

## Departmental and Work Group Divisions

Boundaries frequently align with the physical or organizational divisions of the business itself. If your business is divided into distinct departments (e.g., Underwriting, Claims, and Inspections), you will typically find at least one domain expert per business function. These departmental lines are strong indicators of where a Bounded Context boundary should exist.

## Discovering Overloaded Terms (Multiple Meanings)

While we previously discussed "splinters" and confusion, Vernon provides a more direct rule of thumb: **admit that different languages exist and function accordingly**. If you find a single term that has multiple distinct meanings depending on who you ask, you have found multiple Bounded Contexts.

- For example, if "Policy" means different things to Underwriting, Claims, and Inspections, you should not try to create one massive "Policy" object. Instead, you have three separate Bounded Contexts, each with its own "Policy".
- Similarly, the word "Flight" means different things to a mechanic, a pilot, and a ticketing agent; each of these perspectives belongs in its own Bounded Context.

## References

- Vaughn Vernon, *Domain-Driven Design Distilled* (Addison-Wesley, 2016).
- Vaughn Vernon, *Implementing Domain-Driven Design* (Addison-Wesley, 2013).
