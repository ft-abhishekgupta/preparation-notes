# System Design Notes

1. Concepts
2. API Design
3. Database
4. Caching and Scaling
5. Authentication and Authorization
6. Networking
7. Security
8. DevOps

## Build Single Server Setup

First build a single server setup that serves to small set of users.

- Start Small
- Request Flow
- Clients

## Computer Architecture

Computers understand only binary data.

- Bits : 0s and 1s
- Bytes : 8 bits
- KB | MB | GB | TB

### Storage

| Storage Type | Description                                                           | Speed                    | Cost           | Purpose                             |
| ------------ | --------------------------------------------------------------------- | ------------------------ | -------------- | ----------------------------------- |
| Cache        | Small, fast memory, close to CPU L1, L2, L3                           | Very Fast - Access in ns | Very Expensive | Stores for frequently accessed data |
| RAM          | Volatile memory used for temporary storage while programs are running | Fast - 10 GB/s           | Expensive      | Stores running program and its data |
| SSD          | Non-volatile storage used for long-term storage of data               | Fast - 1 GB/s            | Moderate       | OS, Applications, Files             |
| HDD          | Non-volatile storage used for long-term storage of data               | Slow - 100 MB/s          | Cheap          | Stores user files                   |

CPU - Central Processing Unit, the brain of the computer that executes instructions
Compiler - Translates high-level code into machine code that the CPU can execute
Motherboard - Connects all components of the computer, including CPU, RAM, storage, and peripherals

## Production Architecture

![alt text](image.png){height=500px}

- CICD : Continuous Integration and Continuous Deployment, a set of practices that enable teams to deliver code changes more frequently and reliably
- Load Balancer : Distributes incoming network traffic across multiple servers to ensure high availability and reliability
- Database : A structured collection of data that can be easily accessed, managed, and updated
- Logging and Monitoring : The process of collecting, analyzing, and visualizing data from applications and infrastructure to ensure they are running smoothly and to identify issues before they become critical
- Alerting : The process of notifying relevant stakeholders when an issue is detected in the system, often through email, SMS, or other messaging platforms

![alt text](image-2.png){height=500px}

- Staging Environment : A replica of the production environment used for testing and quality assurance before deploying changes to production

## Good Design Practices

![alt text](image-3.png){height=500px}

- Scalability : The ability of a system to handle increased load by adding resources, such as servers or storage
- Maintainability : The ease with which a system can be modified to fix bugs, add features, or improve performance
- Efficiency : The ability of a system to perform its functions with minimal resource usage, such as CPU, memory, and storage
- Reliability : The ability of a system to perform its functions correctly and consistently over time, even in the presence of failures or unexpected conditions

### Dealing with Data

1. Moving Data
2. Storing Data
3. Transforming Data

![alt text](image-4.png){height=500px}

## CAP Theorem / Brewer's Theorem

![alt text](image-5.png){height=500px}
CAP Theorem states that a distributed data store can only provide two out of the following three guarantees simultaneously:

- Consistency : Every node in the system sees the same data at the same time
- Availability : System is always operational and responsive to requests, even in the presence of failures
- Partition Tolerance : The system continues to operate despite degraded network partitions or communication failures between nodes

### Availability

99.9% Uptime = 8.76 hours of downtime per year
99.999% Uptime = 5.26 minutes of downtime per year

- SLO : Service Level Objective : A target level of service that a system is expected to meet, often defined in terms of availability, response time, or other performance metrics
- SLA : Service Level Agreement : A formal agreement between a service provider and a customer that defines the level of service expected, including uptime guarantees, response times, and other performance metrics

- Reliability : System works consistently
- Fault Tolerance : System continues to operate even when some components fail
- Redundancy : Duplication of critical components or functions of a system to increase reliability and availability

### Speed

- Throughput : Amount of data processed in a given amount of time
  - Server Throughput : Number of requests a server can handle per second, RPS
  - DB Throughput : Number of queries a database can handle per second, QPS
  - Data Throughput : Amount of data transferred over a network in a given amount of time, often measured in bits per second (bps) or bytes per second (Bps)
- Latency : The time it takes for a system to respond to a request, often measured in milliseconds (ms)

## Networks Basics

IP Address : A unique identifier assigned to each device connected to a network that uses the Internet Protocol for communication

- IPv4 : Internet Protocol version 4, the fourth version of the Internet Protocol that uses 32-bit addresses and supports approximately 4.3 billion unique addresses
- IPv6 : Internet Protocol version 6, the sixth version of the Internet Protocol that uses 128-bit addresses and supports approximately 340 undecillion unique addresses

Internet Protocol: A set of rules that govern how data is transmitted over the internet, including addressing, routing, and error handling

Application Layer : The top layer of the OSI model that provides services to applications, such as HTTP, FTP, and SMTP

Transport Layer : The layer of the OSI model that provides end-to-end communication between applications, including TCP and UDP

| TCP                                      | UDP                           |
| ---------------------------------------- | ----------------------------- |
| Connection-oriented                      | Connectionless                |
| 3 Way Handshake                          | No Handshake                  |
| Reliable and ordered                     | Unreliable and unordered      |
| Flow and congestion control              | No flow or congestion control |
| Slower                                   | Faster                        |
| Banking, Emails, Payments, File Transfer | Gaming, Streaming, VoIP       |

![alt text](image-29.png)

### DNS - Domain Name System

Translates human-readable domain names (e.g., <www.example.com>) into IP addresses

A Record: Maps a domain name to an IPv4 address
AAAA Record: Maps a domain name to an IPv6 address

#### Networking Infrastructure

- Public and Private IPs
- Static and Dynamic IPs
- LAN
- Firewalls
- Ports

### Network Protocols

![alt text](image-22.png)
![alt text](image-23.png)

### Application Layer Protocols

![alt text](image-6.png){height=500px}

- HTTP : Hypertext Transfer Protocol, the foundation of data communication on the World Wide Web
  - TCP/IP, Stateless, Request/Response, 1 request per connection
  - Headers, Status Codes, Cookies, Caching, Methods (GET, POST, PUT, DELETE, PATCH)
- WebSocket : A protocol that provides full-duplex communication channels over a single TCP connection, allowing for real-time data transfer between a client and server. Chats, Real-time notifications, Online gaming, Collaborative editing
- Email Protocols : SMTP, IMAP, POP3
  - SMTP : Simple Mail Transfer Protocol, used for sending email messages between servers
  - IMAP : Internet Message Access Protocol, used for retrieving email messages from a mail server while keeping them on the server
  - POP3 : Post Office Protocol version 3, used for retrieving email messages from a mail server and downloading them to a local device, typically deleting them from the server afterward
- File Transfer Protocols : FTP, SFTP, SCP
  - FTP : File Transfer Protocol, used for transferring files between a client and server over a TCP/IP network
  - SFTP : Secure File Transfer Protocol, a secure version of FTP that uses SSH for encryption and authentication
  - SSH : Secure Shell, a cryptographic network protocol used for secure communication between a client and server, often used for remote login and command execution
- Realtime Communication Protocols : SIP, RTP
  - WebRTC : Web Real-Time Communication, a set of APIs and protocols that enable real-time audio, video, and data communication between web browsers and mobile applications without the need for plugins or additional software
  - MQTT : Message Queuing Telemetry Transport, a lightweight messaging protocol designed for low-bandwidth, high-latency, or unreliable networks, often used in IoT applications
  - AMQP : Advanced Message Queuing Protocol, an open standard for message-oriented middleware that enables reliable and secure communication between distributed systems, often used in enterprise applications
- RPC : Remote Procedure Call, a protocol that allows a program to execute a procedure or function on a remote server as if it were local, often used in distributed systems and microservices architectures

#### HTTP

![alt text](image-24.png)

#### Web Sockets

![alt text](image-25.png)

#### AMQP

![alt text](image-26.png)

#### gRPC

Usually between servers. Proto Buffers used
![alt text](image-27.png)

## API Design

![alt text](image-16.png){height=500px}

Design Principles for API Design

- Consistency - Consistent naming conventions, request/response formats, and error handling across the API
- Simplicity - Clear and concise documentation, easy-to-understand endpoints, and minimal complexity in request/response structures
- Security - Authentication, Authorization, Validation, Rate Limiting, CORS, Encryption, Input Validation, Error Handling
- Performance - Caching, Pagination, Compression, Asynchronous Processing, Load Balancing, Monitoring and Logging

![alt text](image-28.png)

### API Paradigms

![alt text](image-7.png){height=300px}
![alt text](image-17.png){height=500px}
![alt text](image-18.png){height=500px}
![alt text](image-19.png){height=300px}

## Restful API Design

- Resource Modeling: Business Domains are converted to Rest Resources
- Filtering, Sorting and Pagination.

## GraphQL API Design

GraphQL is a query language for APIs and a runtime for executing those queries by allowing clients to request exactly the data they need. It provides a more flexible and efficient alternative to RESTful APIs.
Created by Facebook
![alt text](image-30.png)

### Schema Design and Types and Queries

![alt text](image-31.png)
![alt text](image-32.png)
![alt text](image-33.png)

Error Handling in GraphQL - Always return 200 OK, and include errors in the response body. This allows clients to receive partial data along with error information, enabling them to handle errors gracefully without losing access to the available data.
![alt text](image-34.png)

Best Practices for GraphQL API Design
![alt text](image-35.png)

### Design Approaches

![alt text](image-20.png)
API Lifecycle
![alt text](image-21.png)

### Backward Compatibility and Versioning

![alt text](image-8.png)

## Protecting APIs

1. Rate Limiting
2. Cors
3. SQL and NoSQL Injection
4. Firewalls
5. VPNs
6. CSRF
7. XSS

Rate Limiting : A technique used to control the amount of incoming requests to an API within a specified time frame, often implemented to prevent abuse, ensure fair usage, and maintain system stability
CORS : Cross-Origin Resource Sharing, a security feature implemented by web browsers that allows or restricts web applications running on one domain from making requests to resources on a different domain, based on the server's specified policies
SQL Injection : A type of security vulnerability that occurs when an attacker is able to manipulate a web application's SQL queries by injecting malicious input, potentially allowing unauthorized access to the database or execution of arbitrary SQL commands
Firewalls : Network security devices or software that monitor and control incoming and outgoing network traffic based on predetermined security rules, often used to protect APIs and other resources from unauthorized access or attacks
VPNs : Virtual Private Networks, secure connections that allow users to access a private network over the internet, often used to protect sensitive data and maintain privacy when accessing APIs or other resources
CSRF : Cross-Site Request Forgery, a type of security vulnerability that occurs when an attacker tricks a user into performing actions on a web application without their knowledge or consent, potentially leading to unauthorized access or data manipulation
XSS : Cross-Site Scripting, a type of security vulnerability that occurs when an attacker is able to inject malicious scripts into a web application, potentially allowing them to steal sensitive information, manipulate content, or perform actions on behalf of the user

### Caching

Storing frequently accessed data in a temporary storage area to reduce latency and improve performance
![alt text](image-9.png)

Write Around Caching : A technique used to bypass or override the caching mechanism for specific requests, often implemented to ensure that the most up-to-date data is retrieved from the server, even if a cached version exists
Write Through Caching : A caching strategy where data is written to both the cache and the underlying data store simultaneously, ensuring that the cache always contains the most recent version of the data
Write Back Caching : A caching strategy where data is initially written only to the cache, and the underlying data store is updated asynchronously at a later time, improving write performance but potentially introducing data inconsistency if the cache is not properly managed
Eviction Policies : Strategies used to determine which items should be removed from the cache when it reaches its capacity, including Least Recently Used (LRU), First In First Out (FIFO), and Least Frequently Used (LFU)

ADVANTAGE - Reduce Latency, Improve Performance, Reduce Load on Origin Server, Improve Availability, Scalability, Security

### CDNs

Content Delivery Networks : A geographically distributed network of servers that work together to deliver web content, such as images, videos, and other static assets, to users based on their geographic location, improving performance and reducing latency

- Pull Based CDNs : A CDN architecture where the edge servers retrieve content from the origin server only when it is requested by a user, caching it for subsequent requests
- Push Based CDNs : A CDN architecture where the origin server proactively pushes content to the edge servers, ensuring that the content is available for immediate delivery to users without waiting for a request

ADVANTAGE - Reduce Latency, Improve Performance, Reduce Load on Origin Server, Improve Availability, Scalability, Security

Useful when

- Serving static assets like images, videos, and stylesheets
- Reducing latency for users located far from the origin server
- Reducing the load on the origin server by offloading traffic to edge servers

Origin Server used

- Serving dynamic content that cannot be cached, such as personalized user data or frequently changing information
- Handling requests that require server-side processing, such as form submissions or database queries
- Handling complex logic

## Proxy Servers

![alt text](image-10.png)

- Forward Proxy : A server that acts as an intermediary between a client and the internet, forwarding client requests to the appropriate destination server and returning the server's response back to the client
- Reverse Proxy : A server that acts as an intermediary between the internet and one or more backend
- Open Proxy : A proxy server that is accessible to any user on the internet, often used for anonymity, bypassing restrictions, or caching content
- Transparent Proxy : A proxy server that intercepts and forwards client requests without modifying them or requiring any configuration on the client side, often used for content filtering, caching, or monitoring
- Anonymous Proxy : A proxy server that hides the client's IP address from the destination server, providing a level of anonymity for the client while still forwarding requests and responses
- Distorting Proxy : A proxy server that modifies the client's request or the server's response in some way, often used for content filtering, caching, or load balancing
- High Anonymity Proxy : A proxy server that provides a high level of anonymity by not revealing the client's IP address or any identifying information to the destination server, often used for privacy, security, or bypassing restrictions

![alt text](image-11.png)
![alt text](image-12.png)

### Load Balancers

Used to distribute incoming network traffic across multiple servers to ensure high availability, reliability, and performance of applications and services

#### ALGORITHMS

- Round Robin : A load balancing algorithm that distributes incoming requests evenly across a group of servers in a sequential manner, cycling through the list of servers and assigning each new request to the next server in line
- Least Connections : A load balancing algorithm that directs incoming requests to the server with the fewest active connections, helping to ensure that no single server becomes overloaded while others remain underutilized
- IP Hash : A load balancing algorithm that uses the client's IP address to determine which server should handle the request, ensuring that requests from the same client are consistently directed to the same server, which can be useful for session persistence or caching
- Weighted Round Robin : A load balancing algorithm that distributes incoming requests across a group of servers based on assigned weights, allowing more powerful or capable servers to handle a larger share of the traffic while still maintaining a balanced distribution
- Weighted Least Connections : A load balancing algorithm that combines the principles of least connections and weighted distribution, directing incoming requests to the server with the fewest active connections while also considering the assigned weights of each server, allowing for a more efficient allocation of resources based on server capacity
- Consistent Hashing : A load balancing algorithm that uses a hash function to map incoming requests to a fixed number of servers, ensuring that requests are consistently directed to the same server even as the number of servers changes, which can help maintain cache locality and reduce the impact of server additions or removals
- Geo-Location Based Load Balancing : A load balancing strategy that directs incoming requests to the server or data center that is geographically closest to the client, reducing latency and improving performance by minimizing the distance data must travel across the network

FUNCTIONS

- Health Checks : A mechanism used by load balancers to monitor the health and availability of backend servers, typically by sending periodic requests to the servers and evaluating their responses to determine if they are functioning correctly and able to handle incoming traffic

Hardware Load Balancer : A physical device that performs load balancing functions, often providing high performance, reliability, and advanced features for managing network traffic across multiple servers. Examples include F5 BIG-IP, Citrix ADC, and A10 Networks Thunder Series.
Software Load Balancer : A software-based solution that performs load balancing functions, often running on standard server hardware or virtual machines, providing flexibility and scalability for managing network traffic across multiple servers. Examples include Nginx, HAProxy, and Traefik.
Cloud Load Balancer : A load balancing service provided by cloud providers, offering scalable and managed load balancing capabilities for applications hosted in the cloud. Examples include AWS Elastic Load Balancing (ELB), Google Cloud Load Balancing, and Azure Load Balancer. Examples include AWS Elastic Load Balancing (ELB), Google Cloud Load Balancing, and Azure Load Balancer.

#### SPOF - Single Point of Failure

Any component that could cause the entire system to fail if it fails, leading to downtime and potential loss of service for users.

##### Prevent SPOF - Single Point of Failure

- Redundant Load Balancers : Deploying multiple load balancers in an active-active or active-passive configuration to ensure that if one load balancer fails, the others can continue to handle incoming traffic without disruption
- Health Checks and Failover : Implementing health checks to monitor the status of load balancers and backend servers, allowing for automatic failover to healthy instances in the event of a failure
- Autoscaling and self-healing : Leveraging cloud-based autoscaling and self-healing capabilities to automatically add or remove load balancer instances based on traffic demand and to recover from failures without manual intervention
- DNS failover : Configuring DNS failover to redirect traffic to alternative load balancer instances or data centers in the event of a failure, ensuring continued availability and minimizing downtime for users

## Scaling

| Vertical Scaling                                                                       | Horizontal Scaling                                                                                           |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Increases the capacity of a single server by adding more resources (CPU, RAM, storage) | Increases the capacity of a system by adding more servers or instances to distribute the load                |
| Limited by the maximum capacity of a single server                                     | Can scale indefinitely by adding more servers or instances                                                   |
| Can be simpler to implement and manage, as it involves upgrading a single server       | Requires more complex architecture and management, as it involves coordinating multiple servers or instances |

## Database Essentials

| Relational Database                                                   | Non-Relational Database                                                                       |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Structured data, tables, rows, columns                                | Unstructured or semi-structured data, key-value pairs, documents, graphs                      |
| Schema-based, predefined schema                                       | Schema-less, flexible schema                                                                  |
| Uses SQL (Structured Query Language) for querying and managing data   | Uses various query languages, such as JSON-based queries, graph queries, or key-value lookups |
| ACID properties (Atomicity, Consistency, Isolation, Durability)       | BASE properties (Basically Available, Soft state, Eventually consistent)                      |
| Supports complex queries, joins, and transactions, strong consistency | Optimized for horizontal scaling, high availability, and distributed data                     |
| Examples: MySQL, PostgreSQL, Oracle, SQL Server                       | Examples: MongoDB, Cassandra, Redis, DynamoDB                                                 |
| Use when structured data and strong consistency are required          | Use when flexible schema, high scalability, and distributed data are needed                   |

### ACID Properties

- **Atomicity** : Ensures that all operations within a transaction are completed successfully; if not, the transaction is aborted and the database is left unchanged.
- **Consistency** : Ensures that a transaction brings the database from one valid state to another, maintaining database invariants.
- **Isolation** : Ensures that concurrent execution of transactions leaves the database in the same state as if the transactions were executed sequentially.
- **Durability** : Ensures that once a transaction has been committed, it will remain so, even in the event of a system failure.

In-Memory Databases : Databases that primarily rely on main memory for data storage, providing faster data access and processing compared to disk-based databases. Examples include Redis, Memcached, and SAP HANA.

### No SQL Databases

![alt text](image-15.png)

- Document Store : A type of NoSQL database that stores data in the form of documents, typically using formats like JSON or BSON, allowing for flexible and hierarchical data structures. Examples include MongoDB and CouchDB.
- Wide Column Store : A type of NoSQL database that organizes data into tables with rows and dynamic columns, allowing for efficient storage and retrieval of large volumes of structured data. Examples include Apache Cassandra and HBase.
- Key-Value Store : A type of NoSQL database that stores data as a collection of key-value pairs, allowing for fast and efficient retrieval of values based on their associated keys. Examples include Redis, Amazon DynamoDB, and Riak.
- Graph Database : A type of NoSQL database that uses graph structures with nodes, edges, and properties to represent and store data, enabling efficient querying and analysis of complex relationships. Examples include Neo4j and Amazon Neptune.

### Database Scaling

![alt text](image-13.png)

#### Database Sharding

Sharding is a database architecture pattern that involves partitioning a large database into smaller, more manageable
Stratges

- Range Based Sharding : Divides data into shards based on a specific range of values, such as alphabetical ranges or numerical ranges, allowing for efficient querying and retrieval of data within those ranges.
- Hash Based Sharding : Distributes data across shards based on a hash function applied to a specific attribute, such as a user ID or email address, ensuring an even distribution of data and reducing the risk of hotspots.
- Directory Based Sharding : Uses a central directory or lookup table to map data to specific shards, allowing for flexible and dynamic sharding based on application requirements and data access patterns.
- Geographic Sharding : Partitions data based on geographic location, storing data in shards that correspond to specific regions or countries, improving performance and reducing latency for users in those areas.

#### Database Replication

Replication is the process of copying and maintaining database objects, such as tables or entire databases, across multiple database servers.

Master-Slave Replication : A replication model where one database server (the master) handles write operations and propagates changes to one or more read-only replica servers (the slaves), allowing for improved read performance and fault tolerance.
Master-Master Replication : A replication model where multiple database servers (masters) can handle both read and write operations, synchronizing changes between them to ensure data consistency and availability across the system.

## Database Performance Optimization

![alt text](image-14.png)

# Authentication and Authorization

![alt text](image-36.png)

## Basic

Client sends username and password as Base64 encoded string in the Authorization header. Server decodes and verifies credentials.
Disadvantage

- Base64 encoding not secure, can be easily decoded
- Credentials sent with every request, increasing risk of interception
- Not used in modern applications due to security concerns

## Digest

Uses md5 hashing to create a unique hash of the username, password, and other request data. Server verifies the hash to authenticate the user.
Disadvantage

- More secure than Basic, but still vulnerable to certain attacks
- Requires additional processing on both client and server sides, which can impact performance

## API Key

Server generates a unique key for each client, which is sent with every request in the Authorization header or as a query parameter. Server verifies the key to authenticate the user.
Disadvantage

- API keys can be easily shared or leaked, leading to unauthorized access
- No built-in mechanism for user identity or permissions, requiring additional implementation for access control

## Session-Based Authentication

Server creates a session for the user upon successful login, storing session data on the server and sending a session ID to the client as a cookie. The client includes the session ID in subsequent requests for authentication.

- Usually redis used to store session data
  ![alt text](image-37.png)
  Disadvantage
- Stateful, requires server-side storage and management of session data

---

# Token-Based Authentication

## JWT Based - JSON Web Token

Short Lived Tokens with information about user and permissions. Server verifies the token to authenticate the user.

- Stateless, no server-side storage required
- Scalable
  ![alt text](image-38.png)
  ![alt text](image-39.png)

## Access Token and Refresh Token

![alt text](image-40.png)

# OAuth 2.0 and OpenID Connect

![alt text](image-41.png)
![alt text](image-42.png)

# SSO - Single Sign-On

User Experience not an authentication protocol. It is a user authentication process that permits a user to enter one name and password in order to access multiple applications. The process authenticates the user for all the applications they have been given rights to and eliminates further prompts when they switch applications during a particular session.
![alt text](image-43.png)

![alt text](image-44.png)

# Authorization

![alt text](image-45.png)

1. Rolebased Access Control - RBAC
2. Attribute Based Access Control - ABAC
3. Access Control Lists - ACL

- Internally these uses OAuth2 and Token Based Authentication.
  ![alt text](image-46.png)
  ![alt text](image-47.png)
  ![alt text](image-48.png)
  ![alt text](image-49.png)

## O Auth 2.0

![alt text](image-50.png)
![alt text](image-51.png)
