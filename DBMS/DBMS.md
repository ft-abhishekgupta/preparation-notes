# DBMS

**Database** : A database is an **organized** collection of digital data stored in a structured format that allows easy access, management, and updates.

DBMS

| Property    | Meaning                                                      |
| ----------- | ------------------------------------------------------------ |
| Atomicity   | All transaction operations succeed or all are undone.        |
| Consistency | Constraints remain valid before and after the transaction.   |
| Isolation   | Concurrent transactions behave as if sufficiently separated. |
| Durability  | Committed changes survive failures.                          |

### Isolation Levels

| Level            | Dirty Reads | Non-repeatable Reads | Phantom Reads      |
| ---------------- | ----------- | -------------------- | ------------------ |
| Read Uncommitted | Possible    | Possible             | Possible           |
| Read Committed   | Prevented   | Possible             | Possible           |
| Repeatable Read  | Prevented   | Prevented            | Database dependent |
| Serializable     | Prevented   | Prevented            | Prevented          |

```mermaid
flowchart LR
RU[Read Uncommitted] -->|increasing isolation| RC[Read Committed]
RC --> RR[Repeatable Read]
RR --> S[Serializable]
```

> **Note:** Higher isolation reduces anomalies but can reduce concurrency. Defaults and exact behavior vary by database and MVCC implementation.

## Database Design and Normalization

| Form | Requirement                                                |
| ---- | ---------------------------------------------------------- |
| 1NF  | Atomic values; no repeating groups.                        |
| 2NF  | 1NF plus no partial dependency on part of a composite key. |
| 3NF  | 2NF plus no transitive dependency on a non-key column.     |
| BCNF | Every determinant is a candidate key.                      |

Normalization reduces duplicate data and insertion, update, and deletion anomalies. **Denormalization** intentionally duplicates data to improve read performance, trading simpler reads for more storage and update complexity.

### Common Key Types

| Key           | Meaning                                           |
| ------------- | ------------------------------------------------- |
| Super key     | Any column set that uniquely identifies a row.    |
| Candidate key | Minimal super key.                                |
| Primary key   | Chosen candidate key.                             |
| Alternate key | Candidate key not chosen as primary.              |
| Composite key | Key made of multiple columns.                     |
| Surrogate key | Artificial key such as an identity value or UUID. |
