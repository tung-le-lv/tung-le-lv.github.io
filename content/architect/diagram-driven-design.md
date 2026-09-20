---
title: Diagram Driven Design
description: Why architects should draw diagrams as sketches for human comprehension — and why being unable to draw a good diagram of a system is a warning sign about the system itself.
tags: [diagrams, architecture-communication]
updated: 2026-02-13
section: Diagram Design Elevator / Diagram Driven Design
order: 1
---

## Diagrams as Models for Comprehension

Rather than using diagrams to generate code or provide a complete specification, architects should use them as **sketches to aid human comprehension**. A good diagram helps convey complex interrelationships—such as multi-cloud strategies—that simple prose or "Presentation Zen" style stock photos cannot.

## Cheating is Harder in Pictures

It is easy to "cheat" or hide messy thinking in paragraphs of text; it is much harder to do so in a diagram. If an architecture is convoluted and lacks order, it will be impossible to draw an intuitive, balanced picture of it.

## Key Techniques for Diagram-Driven Design

- **Establish a Visual Vocabulary:** Every box and line must have a defined meaning within a specific **viewpoint** (e.g., data flow vs. build dependencies).
- **Limit Levels of Abstraction:** Prose often mixes implementation details with high-level strategy. Diagrams force the author to **stick to one level of abstraction at a time**, revealing logical gaps if too many "abstraction jumps" are attempted.
- **Reduce to the Essence:** Diagrams should omit irrelevant details to focus on what is noteworthy, avoiding "billboard-sized" database posters that convey reality without providing **emphasis**.
- **Find Balance and Harmony:** A well-designed system often results in a visually balanced diagram. If a module is an "entangled mess," sketching it often reveals that the code should be refactored to match a clearer **system metaphor**.
- **Indicate Uncertainty:** Architects can use the visual style of a diagram to communicate its maturity—for example, using **hand-drawn sketches** to invite discussion on an early idea versus using blueprint-style graphics for a final decision.

## The Ultimate Test

If you are unable to draw a good diagram of a system (provided you have the necessary skill), it is often a sign that the **actual system structure is flawed**. Diagramming thus acts as a forcing function for better architectural design.

## References

- Gregor Hohpe, *The Software Architect Elevator* (O'Reilly Media, 2020).
