# High Level Design (HLD)

High level design describes the overall architecture of a system: its components, how they interact, and the trade-offs that make it scalable, available and reliable.

## Contents

| # | Topic | Notes |
| - | ----- | ----- |
| 1 | [System Design Interview](SystemDesign/SystemDesign.md) | Delivery framework, requirements, core entities, APIs, deep dives |
| 2 | [Concepts](Concepts/Concepts.md) | CAP theorem, consistency, availability, scaling, logging, error handling |
| 3 | [Building Blocks](BuildingBlocks/BuildingBlocks.md) | Proxies, load balancers, controllers, repositories, middleware |
| 4 | [API Design](ApiDesign/README.md) | REST, GraphQL, gRPC, authentication and authorization |
| 5 | [Caching](Caching/Caching.md) | Cache types, policies, invalidation, eviction, CDNs, deep dives |
| 6 | [Database Scaling](DatabaseScaling/DatabaseScaling.md) | Sharding, consistent hashing, replication, performance optimization |
| 7 | [Asynchronous Systems](AsyncSystems/AsyncSystems.md) | Background tasks, task queues, brokers |

## Syllabus

| #     | Heading                           | What to cover                                                                                          |
| ----- | --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **1** | **System Design Fundamentals**    | Scalability, availability, reliability, latency, throughput, CAP, consistency, SLAs/SLOs               |
| **2** | **Networking & Communication**    | HTTP/HTTPS, TCP/UDP, DNS, REST, gRPC, WebSockets, load balancing                                       |
| **3** | **Data Storage**                  | SQL, NoSQL, indexing, transactions, replication, sharding, partitioning                                |
| **4** | **Caching & Performance**         | Cache strategies, Redis, CDN, cache invalidation, rate limiting, performance optimization              |
| **5** | **Distributed Systems**           | Consistency, replication, leader/follower, consensus concepts, distributed transactions, idempotency   |
| **6** | **Messaging & Async Systems**     | Queues, pub/sub, Kafka, event-driven architecture, retries, ordering, dead-letter queues               |
| **7** | **System Design Building Blocks** | API Gateway, Load Balancer, Service Discovery, Object Storage, Search, Scheduler, Workers              |
| **8** | **Design Problems & Patterns**    | URL Shortener, Rate Limiter, Notification System, Chat, Feed, File Storage, Payment, Uber-like systems |
