# DBMS Level 3 Mini Project: Final Report Structure & 50-Marks Evaluation Rubric

**Course:** Database Management Systems Experiential Learning (Level 3)  
**Project Title:** Cybersecurity Incident Correlation & Response Intelligence System  
**Document Purpose:** Master Checklist & Rubric Mapping for Final Report and Presentation Submission

---

## 1. Official Report Structure Checklist

The final report must comprise the following 8 core sections:

- [ ] **Section 1: Title Page**
  - Course Title: *Database Management Systems (Level 3 Experiential Learning)*
  - Course Code: *(To be confirmed by instructor)*
  - Project Title: *Cybersecurity Incident Correlation & Response Intelligence System*
  - Student 1: SRN & Name
  - Student 2: SRN & Name
- [ ] **Section 2: Abstract**
  - Concise summary of the problem, motivation, dual-paradigm architecture (PostgreSQL + pgvector), core features, and outcomes.
- [ ] **Section 3: Tech Stack**
  - Relational Database: PostgreSQL 15+
  - Vector Database / Extension: `pgvector`
  - Embedding Model: Hugging Face `all-MiniLM-L6-v2` (384 dimensions)
  - Backend / API Layer: Next.js API Route Handlers / Python
  - Frontend: Next.js 14+ (React, Tailwind CSS, TypeScript)
  - Security / Auth: Password hashing (bcrypt), JWT, Role-Based Access Control (Admin, Security Analyst)
- [ ] **Section 4: SQL - Database Commands**
  - DDL (CREATE, ALTER, DROP, PK, FK, CHECK constraints, Indexes, Views)
  - DML (INSERT, UPDATE, DELETE, SELECT)
  - Advanced SQL (Stored Function, Trigger, Transactions with ACID properties)
  - Complex queries (Nested, Correlated, Recursive/CTE, Multi-table JOINs, Aggregates)
- [ ] **Section 5: NoSQL / Vector Database Commands**
  - `CREATE EXTENSION vector;`
  - Vector table definition (`embedding vector(384)`)
  - HNSW index creation (`USING hnsw (embedding vector_cosine_ops)`)
  - Vector insertion and Top-$K$ semantic similarity queries (`ORDER BY embedding <=> query_vector LIMIT K`)
- [ ] **Section 6: Next.js Project Tree Structure**
  - Complete hierarchical folder structure (`app/`, `components/`, `lib/`, `database/`, etc.)
- [ ] **Section 7: Application Code & Demo Screenshots**
  - Login page (Admin & Analyst roles)
  - Security Operations Center (SOC) dashboard & KPI cards
  - Incident triage table & search filters
  - Semantic vector search interface
  - Incident details, forensic investigation log, and containment actions
- [ ] **Section 8: Evaluation Rubrics - Completion Status**
  - Completed evaluation rubric self-assessment table with proof of implementation.

---

## 2. University Evaluation Rubrics Breakdown (Total: 50 Marks)

| # | Evaluation Component | Max Marks | Implementation in this Project | Status | Artifact / File Reference |
|---|----------------------|:---------:|--------------------------------|:------:|---------------------------|
| 1 | **ER Diagram** | **2** | Chen ER model adhering to *Elmasri & Navathe* standards: 6 strong entities, 5 weak entities, identifying relationships, underlined PKs, dashed partial keys, composite, multivalued, derived attributes, and role names. | **Completed (100%)** | [`docs/database_design/01_CHEN_ER_DIAGRAM.png`](file:///D:/DBMS%20Mini%20Project/docs/database_design/01_CHEN_ER_DIAGRAM.png) |
| 2 | **Relational Schema** | **3** | Relational mapping adhering to textbook Fig 9.2: 11 normalized tables (3NF/BCNF) with underlined PKs and routed foreign key arrows pointing to referenced PKs. | **Completed (100%)** | [`docs/database_design/02_RELATIONAL_SCHEMA_DIAGRAM.png`](file:///D:/DBMS%20Mini%20Project/docs/database_design/02_RELATIONAL_SCHEMA_DIAGRAM.png) |
| 3 | **SQL Database Implementation (DDL with Constraints)** | **4** | Executed in PostgreSQL 15 & MySQL 8.0: 11 tables, PKs, FKs (`RESTRICT`, `CASCADE`, `SET NULL`), CHECK constraints (email regex, risk bounds, temporal order), ALTER and DROP demonstrations. | **Completed (100%)** | [`database/schema.sql`](file:///D:/DBMS%20Mini%20Project/database/schema.sql) |
| 4 | **NoSQL / Vector Database Creation** | **4** | PostgreSQL with native `pgvector` extension installed, vector datatype `vector(384)`, and HNSW cosine index (`idx_incident_embeddings_hnsw`). | **Completed (100%)** | Verified on PostgreSQL 15 |
| 5 | **Technology Justification** | **1** | Written justification for dual-paradigm architecture: ACID relational guarantees for audit trails and assets combined with in-database vector similarity search for unstructured threat narratives. | **Completed (100%)** | [`docs/01_ER_DIAGRAM_AND_CONCEPTUAL_DESIGN.md`](file:///D:/DBMS%20Mini%20Project/docs/database_design/01_ER_DIAGRAM_AND_CONCEPTUAL_DESIGN.md) |
| 6 | **DML Operations** | **4** | Meaningful CRUD operations: `INSERT`, `UPDATE`, `DELETE`, and `SELECT` across incidents, investigations, containment actions, and status updates. | **Pending (Phase 3)** | Upcoming in `database/queries/` |
| 7 | **Nested / Correlated / Recursive / JOIN Queries** | **4** | 12 complex analytical queries: multi-table JOINs, subqueries comparing analysts against department averages, GROUP BY with HAVING, and recursive hierarchy. | **Pending (Phase 3)** | Upcoming in `database/queries/` |
| 8 | **Advanced SQL Concepts** | **6** | Stored Function (`calculate_incident_risk`), Database Trigger (automatic logging to `incident_status_history`), Common Table Expressions (CTE), and ACID Transactions (`BEGIN/COMMIT/ROLLBACK`). | **Pending (Phase 3)** | Upcoming in `database/functions/` & `database/triggers/` |
| 9 | **NoSQL / Vector Feature & CRUD** | **7** | Embedding generation via Hugging Face `all-MiniLM-L6-v2`, inserting 384-dim dense vectors, and Top-$K$ semantic similarity retrieval using `<=>` (cosine distance). | **Verified (Initial Test)** | `seed_pg_with_embeddings.py` |
| 10 | **Next.js Web Interface** | **3** | Functional frontend built with Next.js (React, Tailwind CSS) featuring dashboard KPIs, incident tables, forms, and search bars. | **Pending (Phase 5)** | Upcoming in `app/` |
| 11 | **Backend / API & Database Integration** | **2** | Next.js API route handlers connected to PostgreSQL via connection pooling (`pg`), parameterized queries, and environment variables (`.env`). | **Pending (Phase 5)** | Upcoming in `app/api/` |
| 12 | **Authentication & Role-Based Access Control (RBAC)** | **4** | Password hashing with bcrypt, JWT session tokens, and strict role authorization for at least 2 roles: **Administrator** and **Security Analyst**. | **Pending (Phase 5)** | Upcoming in `lib/auth/` |
| 13 | **Documentation & Git / GitHub** | **2** | Complete project report, structured repository, README with setup instructions, and meaningful commits from both team members. | **In Progress** | `README.md` & `docs/` |
| 14 | **Originality, Individual Contribution & Viva** | **4** | Original cybersecurity threat dataset, custom multi-factor risk scoring formula, active demonstration of database commands, and viva preparation. | **In Progress** | Demonstration rehearsals |
| **TOTAL** | | **50** | | | |

---

## 3. Team Information Placeholder (To be filled before report export)

```text
Course Title: Database Management Systems
Course Code:  UE24CS351A
Project Title: Cybersecurity Incident Correlation & Response Intelligence System
Faculty Guide: Vinay Joshi , Assistant Professor

Team Member 1:
- Name: SHANTINATH BALIGAR
- SRN:  PES1UG24CS691

Team Member 2:
- Name: SIDDU SANGANNA SHIRASAGI
- SRN:  PES1UG25CS846
```

