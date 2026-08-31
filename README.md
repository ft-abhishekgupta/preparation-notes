# Preparation Notes

All-in-one notes for software engineering job interviews — coding, core computer
science, design and engineering practice. Written in Markdown so they can be read
directly on GitHub, in any editor, or exported to HTML with
[Markdown Preview Enhanced](https://shd101wyy.github.io/markdown-preview-enhanced/)
(crossnote).

Start with the [Roadmap](Roadmap.md) for the full topic checklist.

## Table of Contents

### 1. [Coding](01-Coding/README.md)

| Topic | What it covers |
| ----- | -------------- |
| [Complexity Analysis](01-Coding/ComplexityAnalysis/ComplexityAnalysis.md) | Big O, best/average/worst case, time and space complexity |
| [Arrays and Strings](01-Coding/ArraysAndStrings/ArraysAndStrings.md) | Traversal, two pointers, sliding window, prefix sums |
| [Hashing](01-Coding/Hashing/Hashing.md) | Hash tables, sets, frequency maps |
| [Linked Lists](01-Coding/LinkedLists/LinkedLists.md) | Singly, doubly and circular lists |
| [Stacks and Queues](01-Coding/StacksAndQueues/StacksAndQueues.md) | LIFO, FIFO, deques, monotonic structures |
| [Trees and Graphs](01-Coding/TreesAndGraphs/TreesAndGraphs.md) | Binary trees, BST, AVL, heaps, traversals, graph algorithms |
| [Searching and Sorting](01-Coding/SearchingAndSorting/SearchingAndSorting.md) | Binary search and the classic sorting algorithms |
| [Dynamic Programming](01-Coding/DynamicProgramming/DynamicProgramming.md) | Memoisation, tabulation, classic DP patterns |
| [Greedy and Backtracking](01-Coding/GreedyAndBacktracking/GreedyAndBacktracking.md) | Greedy choice, exhaustive search with pruning |
| [Advanced Patterns](01-Coding/AdvancedPatterns/AdvancedPatterns.md) | Tries, union find, bit manipulation, intervals |
| [Problems](01-Coding/Problems/Problems.md) | Worked interview problems |
| [C# Cheat Sheet](01-Coding/CSharp/CSharp.md) | Language reference for coding rounds |

### 2. [Computer Networks](02-ComputerNetworks/README.md)

OSI model, IP addressing and routing, TCP/UDP, DNS, HTTP, network devices and
network security.

### 3. [Databases](03-Databases/README.md)

| Topic | What it covers |
| ----- | -------------- |
| [Database Fundamentals](03-Databases/README.md) | DBMS, relational model, keys, normalization, transactions, ACID, indexing, NoSQL |
| [SQL](03-Databases/SQL/SQL.md) | DDL/DML/DCL/TCL, querying, joins, subqueries, functions, views and indexes |

### 4. [Low Level Design](04-LowLevelDesign/README.md)

| Topic | What it covers |
| ----- | -------------- |
| [Object Oriented Programming](04-LowLevelDesign/OOPs/OOPs.md) | Classes, objects, the four pillars, composition |
| [SOLID Principles](04-LowLevelDesign/SOLID/SOLID.md) | SRP, OCP, LSP, ISP, DIP and dependency injection |
| [Design Patterns](04-LowLevelDesign/DesignPatterns/DesignPatterns.md) | Creational, structural and behavioral patterns with examples |
| [UML Diagrams](04-LowLevelDesign/UML/UML.md) | Use case, class, sequence and activity diagrams |
| [LLD Problems](04-LowLevelDesign/Problems/Problems.md) | Worked machine coding / design problems |

### 5. [High Level Design](05-HighLevelDesign/README.md)

| Topic | What it covers |
| ----- | -------------- |
| [System Design Interview](05-HighLevelDesign/SystemDesign/SystemDesign.md) | Delivery framework, requirements, core entities, APIs, deep dives |
| [Concepts](05-HighLevelDesign/Concepts/Concepts.md) | CAP theorem, consistency, availability, scaling, logging, error handling |
| [Building Blocks](05-HighLevelDesign/BuildingBlocks/BuildingBlocks.md) | Proxies, load balancers, controllers, repositories, middleware |
| [API Design](05-HighLevelDesign/ApiDesign/README.md) | Paradigms and lifecycle, plus [REST](05-HighLevelDesign/ApiDesign/REST/REST.md), [GraphQL](05-HighLevelDesign/ApiDesign/GraphQL/GraphQL.md), [gRPC](05-HighLevelDesign/ApiDesign/gRPC/gRPC.md), [Auth](05-HighLevelDesign/ApiDesign/Auth/Auth.md) |
| [Caching](05-HighLevelDesign/Caching/Caching.md) | Cache types, policies, invalidation, eviction, CDNs |
| [Database Scaling](05-HighLevelDesign/DatabaseScaling/DatabaseScaling.md) | Sharding, consistent hashing, replication, performance optimization |
| [Asynchronous Systems](05-HighLevelDesign/AsyncSystems/AsyncSystems.md) | Background tasks, task queues, brokers |

### 6. [Software Engineering](06-SoftwareEngineering/README.md)

| Topic | What it covers |
| ----- | -------------- |
| [Git](06-SoftwareEngineering/Git/Git.md) | Version control, branching, merge vs rebase, remotes, undo and recovery |

### 7. [Behavioral](07-Behavioral/README.md)

STAR stories, project deep dives and the non-technical rounds.

## Repository Layout

```
preparation-notes/
├── README.md                  # this index
├── Roadmap.md                 # topic checklist
├── index.html                 # GitHub Pages landing page
├── 01-Coding/                 # DSA, complexity, language cheat sheet, problems
├── 02-ComputerNetworks/
├── 03-Databases/              # DBMS fundamentals + SQL
├── 04-LowLevelDesign/         # OOP, SOLID, design patterns, UML, problems
├── 05-HighLevelDesign/        # system design, building blocks, API design
├── 06-SoftwareEngineering/    # Git and engineering practice
├── 07-Behavioral/
└── tools/                     # HTML export script (see "Exporting to HTML")
```

Conventions:

- Every section folder has a `README.md` that acts as its index.
- Every topic lives in its own folder as `Topic/Topic.md`, with its images
  (`image.png`, `image-1.png`, …) beside it so relative paths keep working.
- Each note has exactly one `#` heading; sub-sections use `##` and below.

## Adding a new note

1. Create `NN-Section/Topic/Topic.md` and keep the images in the same folder.
2. Link it from the section `README.md` and from the table of contents above.
3. Run the export script (below) to regenerate the HTML and refresh `index.html`.
4. Commit and push to `main`; the site redeploys automatically.

## Exporting to HTML

Every `*.md` file has a sibling `*.html` file rendered with
[Markdown Preview Enhanced](https://shd101wyy.github.io/markdown-preview-enhanced/)
(crossnote). Regenerate all of them — overwriting whatever is there — with:

```powershell
./tools/export-html.ps1          # Windows
```

```bash
./tools/export-html.sh           # macOS / Linux
```

Both wrappers install the toolchain into `tools/node_modules` on first run (Node.js
is the only prerequisite) and then call `tools/export-html.cjs`, which:

1. exports every Markdown file in the repository to a sibling `.html` file, and
2. rebuilds the note catalogue inside `index.html` from the files on disk —
   titles come from each note's `#` heading and descriptions from its first
   paragraph, so no manual list has to be maintained.

Useful flags (accepted by the wrappers and by `node tools/export-html.cjs`):

| Flag | Effect |
| ---- | ------ |
| `-Filter <text>` / `--filter <text>` | Only export notes whose path contains `<text>`. |
| `-SkipIndex` / `--skip-index` | Export the HTML but leave `index.html` alone. |
| `-IndexOnly` / `--index-only` | Only rebuild `index.html`. |

> The generated block in `index.html` sits between the `/* BEGIN GENERATED NOTES */`
> and `/* END GENERATED NOTES */` markers — edit the surrounding page freely, but
> not that block.

## Live site

<https://ft-abhishekgupta.github.io/preparation-notes/>

- `index.html` is the landing page that links to every section.
- `.nojekyll` disables Jekyll processing so files and folders are served as-is.
- `.github/workflows/deploy-pages.yml` publishes the repository root to GitHub Pages
  on every push to `main` (and on manual *Run workflow*).
- **Settings → Pages → Source** must be **GitHub Actions** (already configured). The
  workflow's `GITHUB_TOKEN` cannot create the Pages site itself, so this one-time
  setting has to be made in the repository settings.

## Local preview

```bash
python -m http.server 8000
# then open http://localhost:8000/
```
