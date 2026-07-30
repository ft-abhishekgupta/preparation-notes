# SQL Interview Notes

SQL (Structured Query Language) is a standard programming language used to manage and manipulate relational databases.

## Table of Contents

- [SQL Overview and Architecture](#sql-overview-and-architecture)
- [Database Management](#database-management)
- [Data Types](#data-types)
- [SQL Command Categories](#sql-command-categories)
- [Querying and Filtering](#querying-and-filtering)
- [SQL Functions](#sql-functions)
- [Grouping and Aggregation](#grouping-and-aggregation)
- [Joins](#joins)
- [Subqueries and Set Operations](#subqueries-and-set-operations)
- [Database Objects and Indexes](#database-objects-and-indexes)

---

## SQL Overview and Architecture

```mermaid
flowchart LR
U[Client / User] --> I[SQL Interface]
I --> S[Database Server]
S --> D[(Database)]
D --> S
S --> R[Result]
```

## Database Management

| Operation | Command           | Purpose                                      | Syntax                           | Example                       |
| --------- | ----------------- | -------------------------------------------- | -------------------------------- | ----------------------------- |
| Create    | `CREATE DATABASE` | Creates a new database.                      | `CREATE DATABASE database_name;` | `CREATE DATABASE college_db;` |
| Use       | `USE`             | Selects the database for subsequent queries. | `USE database_name;`             | `USE college_db;`             |
| Show      | `SHOW DATABASES`  | Lists available databases.                   | `SHOW DATABASES;`                | `SHOW DATABASES;`             |
| Delete    | `DROP DATABASE`   | Permanently deletes a database and its data. | `DROP DATABASE database_name;`   | `DROP DATABASE college_db;`   |

> **Warning:** `DROP DATABASE` permanently removes the database. `USE` and `SHOW DATABASES` are supported by MySQL; equivalent commands vary across database systems.

## Data Types

| Category               | Common Data Types                                                              |
| ---------------------- | ------------------------------------------------------------------------------ |
| **Numeric**            | `SMALLINT`, `INT`, `BIGINT`, `DECIMAL(p, s)`, `NUMERIC(p, s)`, `FLOAT`, `REAL` |
| **Character/String**   | `CHAR(n)`, `VARCHAR(n)`, `TEXT`                                                |
| **Date and Time**      | `DATE`, `TIME`, `DATETIME`, `TIMESTAMP`, `INTERVAL`                            |
| **Boolean**            | `BOOLEAN`, `BIT`                                                               |
| **Binary**             | `BINARY(n)`, `VARBINARY(n)`, `BLOB`                                            |
| **Structured/Special** | `JSON`, `XML`, `UUID`, `ARRAY`, `ENUM`                                         |

> **Note:** Available data types and their exact names, sizes, and ranges vary between database systems.
> Also, **Precision (`p`)** : total number of digits, **Scale (`s`)** : number of digits after the decimal point.

---

## SQL Command Categories

| Type    | Full Form                    | Purpose                                                                                      | Common Commands                                      |
| ------- | ---------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **DDL** | Data Definition Language     | Defines and modifies the structure of database objects such as tables, schemas, and indexes. | `CREATE`, `ALTER`, `DROP`, `TRUNCATE`, `RENAME`      |
| **DML** | Data Manipulation Language   | Adds, modifies, and removes data stored in database tables.                                  | `INSERT`, `UPDATE`, `DELETE`, `MERGE`                |
| **DQL** | Data Query Language          | Retrieves data from one or more database tables.                                             | `SELECT`                                             |
| **DCL** | Data Control Language        | Controls user access and permissions within the database.                                    | `GRANT`, `REVOKE`                                    |
| **TCL** | Transaction Control Language | Manages transactions and controls whether data changes are saved or undone.                  | `COMMIT`, `ROLLBACK`, `SAVEPOINT`, `SET TRANSACTION` |

### Data Definition Language (DDL)

| Command    | Syntax                                                  | Example                                                     |
| ---------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| `CREATE`   | `CREATE TABLE table_name (column_name data_type, ...);` | `CREATE TABLE students (student_id INT, name VARCHAR(50));` |
| `ALTER`    | `ALTER TABLE table_name ADD column_name data_type;`     | `ALTER TABLE students ADD email VARCHAR(100);`              |
| `DROP`     | `DROP TABLE table_name;`                                | `DROP TABLE students;`                                      |
| `TRUNCATE` | `TRUNCATE TABLE table_name;`                            | `TRUNCATE TABLE students;`                                  |
| `RENAME`   | `ALTER TABLE old_name RENAME TO new_name;`              | `ALTER TABLE students RENAME TO learners;`                  |

### Table Constraints and Defaults

Constraints are rules defined in DDL statements to enforce valid data and relationships.

| Constraint    | Purpose                                                        | Example                                                             |
| ------------- | -------------------------------------------------------------- | ------------------------------------------------------------------- |
| `PRIMARY KEY` | Uniquely identifies each row; implies `UNIQUE` and `NOT NULL`. | `student_id INT PRIMARY KEY`                                        |
| `FOREIGN KEY` | Links a column to a primary or unique key in another table.    | `FOREIGN KEY (department_id) REFERENCES departments(department_id)` |
| `NOT NULL`    | Prevents null values.                                          | `name VARCHAR(50) NOT NULL`                                         |
| `UNIQUE`      | Prevents duplicate values.                                     | `email VARCHAR(100) UNIQUE`                                         |
| `CHECK`       | Allows only values satisfying a condition.                     | `age INT CHECK (age >= 18)`                                         |
| `DEFAULT`     | Supplies a default value when none is provided.                | `status VARCHAR(20) DEFAULT 'Active'`                               |

#### Primary Key vs Unique

| Aspect             | `PRIMARY KEY`                       | `UNIQUE`                            |
| ------------------ | ----------------------------------- | ----------------------------------- |
| Purpose            | Main row identifier                 | Prevents duplicate values           |
| Per table          | One primary key, possibly composite | Multiple unique constraints allowed |
| `NULL`             | Not allowed                         | Null handling varies by database    |
| Foreign-key target | Yes                                 | Usually yes                         |

#### Foreign Keys and Cascading Actions

```sql
CREATE TABLE departments (
department_id INT PRIMARY KEY,
department_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE students (
student_id INT PRIMARY KEY,
name VARCHAR(50) NOT NULL,
department_id INT,
status VARCHAR(20) DEFAULT 'Active',
CONSTRAINT fk_student_department
FOREIGN KEY (department_id) REFERENCES departments(department_id)
ON UPDATE CASCADE
ON DELETE SET NULL
);
```

| Referential Action       | Effect                                                             |
| ------------------------ | ------------------------------------------------------------------ |
| `CASCADE`                | Updates or deletes matching child rows automatically.              |
| `SET NULL`               | Sets the child foreign key to `NULL`; the column must allow nulls. |
| `SET DEFAULT`            | Sets the child foreign key to its default value, where supported.  |
| `RESTRICT` / `NO ACTION` | Rejects the parent update or delete when child rows exist.         |

> **Note:** Constraints define data rules; clauses such as `WHERE`, `GROUP BY`, and `ORDER BY` control a statement. `ON DELETE CASCADE` automatically removes child rows, so use it only when those rows have no independent value.

### Data Manipulation Language (DML)

| Command  | Syntax                                                                               | Example                                                                          |
| -------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| `INSERT` | `INSERT INTO table_name (column1, column2) VALUES (value1, value2);`                 | `INSERT INTO students (student_id, name) VALUES (1, 'Aman');`                    |
| `UPDATE` | `UPDATE table_name SET column = value WHERE condition;`                              | `UPDATE students SET name = 'Anita' WHERE student_id = 1;`                       |
| `DELETE` | `DELETE FROM table_name WHERE condition;`                                            | `DELETE FROM students WHERE student_id = 1;`                                     |
| `MERGE`  | `MERGE INTO target USING source ON condition WHEN MATCHED ... WHEN NOT MATCHED ...;` | `MERGE INTO students s USING new_students n ON s.student_id = n.student_id ...;` |

#### Delete vs Truncate vs Drop

| Aspect            | `DELETE`                       | `TRUNCATE`          | `DROP`                  |
| ----------------- | ------------------------------ | ------------------- | ----------------------- |
| Removes           | Selected or all rows           | All rows            | Entire database object  |
| `WHERE` support   | Yes                            | No                  | No                      |
| Structure remains | Yes                            | Yes                 | No                      |
| Command type      | DML                            | DDL                 | DDL                     |
| Typical speed     | Slower for all rows            | Faster for all rows | Fast object removal     |
| Identity reset    | Usually no                     | Database dependent  | Object no longer exists |
| Rollback          | Usually possible before commit | Database dependent  | Database dependent      |

> **Important:** Rollback, logging, identity reset, and trigger behavior vary by database. Do not rely on the simplified claim that DDL can never be rolled back.

#### Insert Forms

| Form            | Syntax                                                    | Example                                                                                             |
| --------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Single row      | `INSERT INTO table (columns) VALUES (values);`            | `INSERT INTO students (student_id, name) VALUES (1, 'Aman');`                                       |
| Multiple rows   | `INSERT INTO table (columns) VALUES (...), (...);`        | `INSERT INTO students (student_id, name) VALUES (2, 'Anita'), (3, 'Ravi');`                         |
| From a query    | `INSERT INTO table (columns) SELECT columns FROM source;` | `INSERT INTO alumni (student_id, name) SELECT student_id, name FROM students;`                      |
| Omitted columns | `INSERT INTO table (columns) VALUES (values);`            | `INSERT INTO students (student_id, name) VALUES (4, 'Neha');` implicitly uses the default `status`. |

### Data Control Language (DCL)

| Command  | Syntax                                            | Example                                   |
| -------- | ------------------------------------------------- | ----------------------------------------- |
| `GRANT`  | `GRANT privilege ON object_name TO user_name;`    | `GRANT SELECT ON students TO analyst;`    |
| `REVOKE` | `REVOKE privilege ON object_name FROM user_name;` | `REVOKE SELECT ON students FROM analyst;` |

> **Security:** Use parameterized queries or prepared statements for user input. Never build SQL by concatenating untrusted values.

### Transaction Control Language (TCL)

| Command           | Syntax                              | Example                                                            |
| ----------------- | ----------------------------------- | ------------------------------------------------------------------ |
| `COMMIT`          | `COMMIT;`                           | `UPDATE students SET name = 'Anita' WHERE student_id = 1; COMMIT;` |
| `ROLLBACK`        | `ROLLBACK;`                         | `DELETE FROM students WHERE student_id = 1; ROLLBACK;`             |
| `SAVEPOINT`       | `SAVEPOINT savepoint_name;`         | `SAVEPOINT before_update;`                                         |
| `SET TRANSACTION` | `SET TRANSACTION transaction_mode;` | `SET TRANSACTION READ ONLY;`                                       |

```sql
START TRANSACTION;
UPDATE accounts SET balance = balance - 500 WHERE account_id = 1;
UPDATE accounts SET balance = balance + 500 WHERE account_id = 2;
COMMIT;
```

> **Note:** Exact command syntax and supported options may vary between database systems.

---

## Querying and Filtering

| Keyword/Clause | Purpose                                                          | Syntax                                                      | Example                                                   |
| -------------- | ---------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------- |
| `SELECT`       | Retrieves data from a table.                                     | `SELECT column1, column2 FROM table_name;`                  | `SELECT student_id, name FROM students;`                  |
| `WHERE`        | Filters rows based on a condition.                               | `SELECT columns FROM table_name WHERE condition;`           | `SELECT * FROM students WHERE age >= 18;`                 |
| `DISTINCT`     | Removes duplicate values from the result.                        | `SELECT DISTINCT column FROM table_name;`                   | `SELECT DISTINCT city FROM students;`                     |
| `ORDER BY`     | Sorts results in ascending (`ASC`) or descending (`DESC`) order. | `SELECT columns FROM table_name ORDER BY column ASC\|DESC;` | `SELECT * FROM students ORDER BY name ASC;`               |
| `LIMIT`        | Restricts the number of returned rows.                           | `SELECT columns FROM table_name LIMIT count;`               | `SELECT * FROM students LIMIT 5;`                         |
| `OFFSET`       | Skips a number of rows before returning results.                 | `LIMIT count OFFSET count`                                  | `SELECT * FROM students LIMIT 5 OFFSET 10;`               |
| `TOP`          | Restricts returned rows in SQL Server.                           | `SELECT TOP count columns FROM table_name;`                 | `SELECT TOP 5 * FROM students;`                           |
| `BETWEEN`      | Filters values within an inclusive range.                        | `WHERE column BETWEEN value1 AND value2`                    | `SELECT * FROM students WHERE age BETWEEN 18 AND 25;`     |
| `IN`           | Matches any value in a specified list.                           | `WHERE column IN (value1, value2, ...)`                     | `SELECT * FROM students WHERE city IN ('Delhi', 'Pune');` |
| `LIKE`         | Matches text against a pattern using wildcards.                  | `WHERE column LIKE pattern`                                 | `SELECT * FROM students WHERE name LIKE 'A%';`            |
| `IS NULL`      | Finds missing values.                                            | `WHERE column IS NULL`                                      | `SELECT * FROM students WHERE department_id IS NULL;`     |

### Comparisons and Null Handling

| Concept            | Correct Usage                   | Key Point                                      |
| ------------------ | ------------------------------- | ---------------------------------------------- |
| Comparison         | `=`, `<>`, `>`, `<`, `>=`, `<=` | Compares non-null values.                      |
| Null check         | `IS NULL`, `IS NOT NULL`        | Never use `= NULL` or `<> NULL`.               |
| Replacement        | `COALESCE(value, fallback)`     | Returns the first non-null value.              |
| Three-valued logic | `TRUE`, `FALSE`, `UNKNOWN`      | Comparisons with `NULL` evaluate to `UNKNOWN`. |

### Conditional Logic and Type Conversion

| Feature | Syntax                                          | Example                                                                                   |
| ------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `CASE`  | `CASE WHEN condition THEN value ELSE value END` | `SELECT name, CASE WHEN marks >= 40 THEN 'Pass' ELSE 'Fail' END AS result FROM students;` |
| `CAST`  | `CAST(value AS data_type)`                      | `SELECT CAST(marks AS DECIMAL(5, 2)) FROM students;`                                      |

> **Note:** `CONVERT` syntax is vendor-specific; `CAST` is the portable SQL form.

### Aliases

Aliases are query-scoped names for columns or tables; they do not change the schema.

| Type         | Syntax            | Example                                      |
| ------------ | ----------------- | -------------------------------------------- |
| Column alias | `column AS alias` | `SELECT name AS student_name FROM students;` |
| Table alias  | `table AS alias`  | `SELECT s.name FROM students AS s;`          |

### Logical and Arithmetic Operators

| Category   | Operators               | Purpose                         | Example                                          |
| ---------- | ----------------------- | ------------------------------- | ------------------------------------------------ |
| Logical    | `AND`, `OR`, `NOT`      | Combines or negates conditions. | `WHERE age >= 18 AND status = 'Active'`          |
| Arithmetic | `+`, `-`, `*`, `/`, `%` | Performs numeric calculations.  | `SELECT marks + 5 AS bonus_marks FROM students;` |

> **Note:** Use parentheses to make mixed expressions explicit. The remainder operator is `%` in many databases; Oracle uses `MOD`. MySQL/PostgreSQL use `LIMIT`, while SQL Server uses `TOP`. In `LIKE`, `%` matches any number of characters and `_` matches one.

## SQL Functions

String and date functions are scalar functions, separated here for quick reference.

### Aggregate Functions

| Function | Purpose                                   | Syntax                       | Example                            |
| -------- | ----------------------------------------- | ---------------------------- | ---------------------------------- |
| `COUNT`  | Counts rows or non-null values.           | `COUNT(*)` / `COUNT(column)` | `SELECT COUNT(*) FROM students;`   |
| `SUM`    | Calculates the total of numeric values.   | `SUM(column)`                | `SELECT SUM(marks) FROM students;` |
| `AVG`    | Calculates the average of numeric values. | `AVG(column)`                | `SELECT AVG(marks) FROM students;` |
| `MIN`    | Returns the smallest value.               | `MIN(column)`                | `SELECT MIN(marks) FROM students;` |
| `MAX`    | Returns the largest value.                | `MAX(column)`                | `SELECT MAX(marks) FROM students;` |

> **Aggregate and NULL behavior:** `COUNT(*)` counts rows; `COUNT(column)` counts non-null values. `SUM`, `AVG`, `MIN`, and `MAX` ignore `NULL` values.

### Scalar Functions

| Function   | Purpose                                                  | Syntax                          | Example                                                  |
| ---------- | -------------------------------------------------------- | ------------------------------- | -------------------------------------------------------- |
| `ABS`      | Returns the absolute value of a number.                  | `ABS(number)`                   | `SELECT ABS(-25);`                                       |
| `ROUND`    | Rounds a number to a specified number of decimal places. | `ROUND(number, decimals)`       | `SELECT ROUND(85.476, 2);`                               |
| `CEILING`  | Rounds a number up to the nearest integer.               | `CEILING(number)`               | `SELECT CEILING(8.2);`                                   |
| `FLOOR`    | Rounds a number down to the nearest integer.             | `FLOOR(number)`                 | `SELECT FLOOR(8.9);`                                     |
| `COALESCE` | Returns the first non-null value in a list.              | `COALESCE(value1, value2, ...)` | `SELECT COALESCE(phone, 'Not available') FROM students;` |

### String Functions

| Function    | Purpose                                       | Syntax                                | Example                                                    |
| ----------- | --------------------------------------------- | ------------------------------------- | ---------------------------------------------------------- |
| `CONCAT`    | Joins two or more strings.                    | `CONCAT(string1, string2, ...)`       | `SELECT CONCAT(first_name, ' ', last_name) FROM students;` |
| `UPPER`     | Converts text to uppercase.                   | `UPPER(string)`                       | `SELECT UPPER(name) FROM students;`                        |
| `LOWER`     | Converts text to lowercase.                   | `LOWER(string)`                       | `SELECT LOWER(name) FROM students;`                        |
| `LENGTH`    | Returns the number of characters in a string. | `LENGTH(string)`                      | `SELECT LENGTH(name) FROM students;`                       |
| `SUBSTRING` | Extracts part of a string.                    | `SUBSTRING(string, start, length)`    | `SELECT SUBSTRING(name, 1, 3) FROM students;`              |
| `TRIM`      | Removes leading and trailing spaces.          | `TRIM(string)`                        | `SELECT TRIM(name) FROM students;`                         |
| `REPLACE`   | Replaces occurrences of text within a string. | `REPLACE(string, old_text, new_text)` | `SELECT REPLACE(name, 'Aman', 'Amit') FROM students;`      |

> **Note:** Function names and syntax may vary between database systems. For example, SQL Server commonly uses `LEN` instead of `LENGTH`.

### Date and Time Functions

| Function            | Purpose                            | Example                                                   |
| ------------------- | ---------------------------------- | --------------------------------------------------------- |
| `CURRENT_DATE`      | Returns the current date.          | `SELECT CURRENT_DATE;`                                    |
| `CURRENT_TIMESTAMP` | Returns the current date and time. | `SELECT CURRENT_TIMESTAMP;`                               |
| `EXTRACT`           | Extracts a date part.              | `SELECT EXTRACT(YEAR FROM admission_date) FROM students;` |

> Date arithmetic is vendor-specific; common forms include `DATEADD`, `DATEDIFF`, and interval expressions.

## Grouping and Aggregation

> **SQL Query Structure:** `SELECT columns FROM table_name WHERE row_condition GROUP BY group_columns HAVING group_condition ORDER BY sort_columns LIMIT count OFFSET count;`

### Logical Query Processing Order

```mermaid
flowchart LR
F[1. FROM / JOIN] --> W[2. WHERE]
W --> G[3. GROUP BY]
G --> H[4. HAVING]
H --> S[5. SELECT]
S --> D[6. DISTINCT]
D --> O[7. ORDER BY]
O --> L[8. LIMIT / OFFSET]
```

| Difference           | `WHERE`                            | `GROUP BY`                                 | `HAVING`                        |
| -------------------- | ---------------------------------- | ------------------------------------------ | ------------------------------- |
| Purpose              | Filters rows by a condition.       | Creates groups for aggregate calculations. | Filters groups by a condition.  |
| Processing stage     | Before grouping.                   | After `WHERE` and before `HAVING`.         | After grouping.                 |
| Operates on          | Individual rows.                   | Columns used to form groups.               | Grouped or aggregate results.   |
| Aggregate conditions | Cannot directly filter aggregates. | Organizes rows for aggregate functions.    | Can directly filter aggregates. |
| Common statements    | `SELECT`, `UPDATE`, and `DELETE`.  | Aggregate `SELECT` queries.                | Aggregate `SELECT` queries.     |
| Example              | `WHERE salary > 50000`             | `GROUP BY department_id`                   | `HAVING COUNT(*) >= 2`          |

### Distinct vs Group By

| Aspect     | `DISTINCT`                            | `GROUP BY`                                           |
| ---------- | ------------------------------------- | ---------------------------------------------------- |
| Purpose    | Removes duplicate result rows.        | Forms groups, usually for aggregation.               |
| Aggregates | Not required.                         | Commonly used with aggregate functions.              |
| Example    | `SELECT DISTINCT city FROM students;` | `SELECT city, COUNT(*) FROM students GROUP BY city;` |

### Grouping Syntax

```sql
SELECT group_column, aggregate_function(column)
FROM table_name
WHERE row_condition
GROUP BY group_column
HAVING aggregate_condition;
```

### Grouping Example

```sql
SELECT department_id, COUNT(*) AS employee_count
FROM employees
GROUP BY department_id
HAVING COUNT(*) >= 2;
```

**Output:**

| department_id | employee_count |
| ------------- | -------------- |
| 1             | 2              |

> **Note:** Many database systems allow `HAVING` without `GROUP BY`, treating the result as a single group.

## Joins

SQL joins combine rows from two or more tables using a related column.

![alt text](image-1.png)

### Join Syntax

```sql
SELECT columns
FROM table1 AS t1
[INNER | LEFT | RIGHT | FULL OUTER | CROSS] JOIN table2 AS t2
[ON t1.column = t2.column];
```

Brackets show alternatives and optional parts; they are not literal SQL. `CROSS JOIN` omits `ON`. A self join uses the same table with different aliases.

### Sample Join Tables

#### Employees

| employee_id | employee_name | department_id | manager_id |
| ----------- | ------------- | ------------- | ---------- |
| 1           | Aman          | 1             | `NULL`     |
| 2           | Anita         | 1             | 1          |
| 3           | Ravi          | 2             | 1          |
| 4           | Neha          | `NULL`        | 2          |

#### Departments

| department_id | department_name |
| ------------- | --------------- |
| 1             | Engineering     |
| 2             | HR              |
| 3             | Sales           |

### Join Examples and Outputs

Output pairs are shown as `(employee, department)`, except for the self join, which shows `(employee, manager)`.

| Join         | Example Query                                                                                                                    | Output                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `INNER`      | `SELECT e.employee_name, d.department_name FROM employees e INNER JOIN departments d ON e.department_id = d.department_id;`      | `(Aman, Engineering)`, `(Anita, Engineering)`, `(Ravi, HR)`      |
| `LEFT`       | `SELECT e.employee_name, d.department_name FROM employees e LEFT JOIN departments d ON e.department_id = d.department_id;`       | Inner rows + `(Neha, NULL)`                                      |
| `RIGHT`      | `SELECT e.employee_name, d.department_name FROM employees e RIGHT JOIN departments d ON e.department_id = d.department_id;`      | Inner rows + `(NULL, Sales)`                                     |
| `FULL OUTER` | `SELECT e.employee_name, d.department_name FROM employees e FULL OUTER JOIN departments d ON e.department_id = d.department_id;` | Inner rows + `(Neha, NULL)`, `(NULL, Sales)`                     |
| `CROSS`      | `SELECT e.employee_name, d.department_name FROM employees e CROSS JOIN departments d;`                                           | Every employee paired with every department: 12 rows (4 x 3)     |
| `SELF`       | `SELECT e.employee_name, m.employee_name FROM employees e LEFT JOIN employees m ON e.manager_id = m.employee_id;`                | `(Aman, NULL)`, `(Anita, Aman)`, `(Ravi, Aman)`, `(Neha, Anita)` |

> **Note:** `ON` matches rows; `WHERE` filters the result. MySQL does not directly support `FULL OUTER JOIN`. Output order requires `ORDER BY`.

---

## Subqueries and Set Operations

### Subqueries

A subquery is a query nested inside another SQL statement.

| Type             | Returns                                                                    | Common Operators                | Example                                                                                                                                              |
| ---------------- | -------------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Single-row**   | One row or value.                                                          | `=`, `>`, `<`, `>=`, `<=`, `<>` | `SELECT employee_name FROM employees WHERE department_id = (SELECT department_id FROM departments WHERE department_name = 'HR');`                    |
| **Multiple-row** | Multiple rows or values.                                                   | `IN`, `ANY`, `ALL`              | `SELECT employee_name FROM employees WHERE department_id IN (SELECT department_id FROM departments WHERE department_name IN ('Engineering', 'HR'));` |
| **Correlated**   | Depends on the current row of the outer query and runs once per outer row. | `EXISTS`, `NOT EXISTS`          | `SELECT e.employee_name FROM employees e WHERE EXISTS (SELECT 1 FROM departments d WHERE d.department_id = e.department_id);`                        |

#### Exists vs In

| `EXISTS`                                                       | `IN`                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------------ |
| Tests whether a matching row exists.                           | Tests whether a value is in a result set or list.            |
| Often useful for correlated checks and large subquery results. | Clear for small lists and simple single-column subqueries.   |
| `NOT EXISTS` handles nulls predictably.                        | `NOT IN` can return no rows if its subquery contains `NULL`. |

#### Subquery Syntax

```sql
SELECT columns
FROM table_name
WHERE column operator (SELECT column FROM table_name WHERE condition);
```

> **Note:** A single-row subquery must not return more than one row when used with a single-value comparison operator.

### Set Operations

Set operations combine the results of two or more compatible `SELECT` queries.

| Operator           | Result                                       | Duplicates | Example                                                                                                                                           |
| ------------------ | -------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UNION`            | Rows present in either result.               | Removed    | `SELECT employee_name FROM employees WHERE department_id = 1 UNION SELECT employee_name FROM employees WHERE department_id = 2;`                  |
| `UNION ALL`        | Rows present in either result.               | Preserved  | `SELECT employee_name FROM employees WHERE department_id = 1 UNION ALL SELECT employee_name FROM employees WHERE department_id = 2;`              |
| `INTERSECT`        | Rows common to both results.                 | Removed    | `SELECT employee_name FROM employees WHERE department_id IS NOT NULL INTERSECT SELECT employee_name FROM employees WHERE manager_id IS NOT NULL;` |
| `EXCEPT` / `MINUS` | Rows in the first result but not the second. | Removed    | `SELECT employee_name FROM employees EXCEPT SELECT employee_name FROM employees WHERE department_id IS NULL;`                                     |

#### Set Operation Syntax

```sql
SELECT column1, column2 FROM table1
SET_OPERATOR
SELECT column1, column2 FROM table2;
```

> **Note:** Each query must return the same number of columns in the same order with compatible data types. SQL Server and PostgreSQL use `EXCEPT`; Oracle uses `MINUS`. Put `ORDER BY` at the end to sort the combined result.

| Set Operations                                 | Joins                                                          |
| ---------------------------------------------- | -------------------------------------------------------------- |
| Combine result sets vertically by adding rows. | Combine tables horizontally by adding columns.                 |
| Require compatible column counts and types.    | Require a relationship or join condition, except `CROSS JOIN`. |

---

## Database Objects and Indexes

### Views and Routines

```sql
CREATE VIEW active_students AS
SELECT student_id, name FROM students WHERE status = 'Active';
```

| Object            | Description                                                             |
| ----------------- | ----------------------------------------------------------------------- |
| View              | Stored query; normally stores no result data.                           |
| Materialized view | Stores query results and must be refreshed; support varies.             |
| Stored procedure  | Reusable database routine that can perform multiple operations.         |
| Function          | Routine that returns a value or table and can often be used in queries. |
| Trigger           | Runs automatically after or before a database event.                    |

### Indexes

```sql
CREATE INDEX idx_students_department ON students (department_id);
CREATE UNIQUE INDEX idx_students_email ON students (email);
```

| Type          | Use                                                                 |
| ------------- | ------------------------------------------------------------------- |
| Single-column | Speeds filtering or joining on one column.                          |
| Composite     | Indexes multiple columns; column order matters.                     |
| Unique        | Enforces uniqueness and speeds lookup.                              |
| Clustered     | Controls physical row order where supported; usually one per table. |
| Nonclustered  | Separate lookup structure; multiple are usually allowed.            |

> **Trade-off:** Indexes improve reads but consume storage and slow `INSERT`, `UPDATE`, and `DELETE`. In a composite index, leading-column order matters. Verify index use with `EXPLAIN` or the database execution plan.
