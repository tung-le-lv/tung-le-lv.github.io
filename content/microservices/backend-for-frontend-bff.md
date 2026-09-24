---
title: Backend for Frontend (BFF)
description: Give each type of client its own API gateway — the benefits of the pattern, and why a BFF is about operations, trust boundaries and team autonomy, not just response shape.
tags: [bff, api-gateway, graphql, serverless]
updated: 2025-03-24
section: Patterns
order: 1
---

> [!TIP] Pattern: Backends for frontends
> Implement a separate API gateway for each type of client.

## Benefits

- Clearly defining responsibilities for each team (Mobile, WebApp).
- API modules are isolated from one another, the overall system becomes more reliable, one misbehaving API is far less likely to affect the others.
- The separation improves observability, as each API module runs as an independent process, making it easier to monitor, troubleshoot, and collect metrics.
- Independent scalability, allowing each BFF service to scale according to its own workload rather than scaling the entire API layer.
- Each API gateway is smaller and simpler, application startup times are reduced, resulting in faster deployments and improved operational efficiency.

![Backends for frontends: the mobile, browser and public API clients each get their own API gateway, owned by that client's team, and all three sit on a common layer owned by the API gateway team.](/assets/img/bff-benefits.png)

## BFF with GraphQL

![BFF with GraphQL: separate GraphQL endpoints for Internal Dashboards, Web App and Mobile behind an API gateway, each querying different microservices.](/assets/img/bff-graphql.png)

> [!NOTE] Note
> Even if using GraphQL fusion, BFF needs separated fusion gateways for each type of client.

BFF is not only about how many fields you return to clients, but also:

- **Different operations.** The internal dashboard needs admin/analytics operations that must **not exist** in the mobile or web schema. With separate BFFs, the mobile graph literally doesn't contain those types and mutations, so a public client can't even discover them. That's security by schema isolation.
- **Different trust and auth boundaries.** Internal dashboards are a different *audience* with different authentication, authorization, rate limits, and threat model than the public customer apps. Splitting keeps the internal attack surface off the public endpoints entirely.
- **Different client-specific orchestration.** BFF isn't just a passthrough; it composes across services. Web might do richer aggregation/composition/extension than the Mobile one.
- **Team autonomy and independent evolution.** Each client team owns its BFF and can evolve/deploy it without coordinating on one shared schema.

## References

- *Serverless Architectures on AWS, Second Edition*.
- Chris Richardson, *Microservices Patterns: With Examples in Java* (Manning, 2018).
