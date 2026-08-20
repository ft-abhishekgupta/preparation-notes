# LLD Problems

## Library Management System

Design a library management system to handle the operations of a library.

### System Requirements

- Anyone can search books by title, author, subject category, publish date.
- Book will have a unique ID
- Each book and member will have a unique barcode, which can be scanned to get the details of the book or member
- Book can have multiple copies, members can borrow any copy of the book (book item)
- System can check who took a particular book item
- System can check which books are borrowed by a particular member
- Max 5 books can be borrowed by a member at a time
- Max for 10 days can be borrowed by a member at a time
- System can collect fines for late return of books
- Members can reserve a book that is not available in the library
- System can notify members when a reserved book is available
- System can notify members when a borrowed book is due for return

### Step 1: Ask Doubts and Clarifications

> Ask
>
> - Should librarian be responsible for CRUD on books and membership - YES
> - Should librarian do actual issue/return operation after member scans it - YES

### Step 2: Identify important domain concepts

- Books can have multiple copies
  - Book should represent logical book
  - BookItem should represent physical book

### Step 3: Extract Nouns

- Book, BookId, Barcode, BookItem, Member, Loan, Fine, Reservation, Notification, Catalog, Author, Category, etc

### Step 4: Identify important use cases

- Search
- Borrow
- Notify
- Reserve

### Use Case Diagram

```
Library Management System
│
├── Actors
│   ├── Member
│   ├── Librarian
│   └── Scheduler / Background Job
│
├── Member
│   ├── Search Books
│   ├── Reserve Book
│   ├── View Borrowed Books
│   └── Pay / Clear Fine
│
├── Librarian
│   ├── Search Books
│   ├── Scan Member Barcode
│   ├── Scan Book Barcode
│   ├── Issue Book
│   ├── Return Book
│   ├── Find Book Item Borrower
│   ├── View Member Borrowed Books
│   ├── Collect Fine
│   ├── Manage Books
│   ├── Manage Book Copies
│   └── Manage Members
│
└── Scheduler / Background Job
    └── Notify Member - Book Due
```

### Class Diagram
