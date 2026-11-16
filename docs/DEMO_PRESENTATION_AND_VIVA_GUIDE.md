# Cybersecurity Incident Correlation & Response Intelligence System
## Complete Faculty Demo Presentation & Viva Voce Guide
**Course:** DBMS Experiential Learning – Level 3 (50 Marks)  
**Target Audience:** Faculty Evaluator / External Examiner  

---

### Part 1: The 30-Second Project Introduction (Elevator Pitch)
When your teacher says: *"Tell me about your project."*

> **Say this confidently:**
> *"Good morning/afternoon, Professor. Our project is a **Cybersecurity Incident Correlation and Response Intelligence System**.*
> 
> *Modern Security Operations Centers (SOCs) are flooded with thousands of security alerts daily, making manual correlation impossible. To solve this, our system implements a **dual-paradigm database architecture**:*
> 1. *A **PostgreSQL 15 Relational RDBMS** enforcing strict 3NF schema, ACID transactions, check constraints, stored risk-scoring functions, and audit triggers.*
> 2. *An integrated **NoSQL/Vector Database** powered by PostgreSQL's `pgvector` extension and dense 384-dimensional embeddings from sentence transformers (`all-MiniLM-L6-v2`) to semantically correlate unstructured incident narratives in sub-second time using HNSW graph indexing.*
> 
> *The entire system is connected to a production-grade **Next.js web application** with dual-role Role-Based Access Control (RBAC) for Administrators and Security Analysts."*

---

### Part 2: Step-by-Step Live Demo Script (Follow this order)

#### Step 1: Authentication & Dual-Role RBAC (Rubric: 4 Marks)
* **URL:** `http://localhost:3000/login`
* **Action:**
  1. Show the clean login card.
  2. Point out that the system enforces Role-Based Access Control (RBAC) backed by bcrypt-hashed credentials and JWT tokens.
  3. Click the **Administrator** quick-fill button (`admin` / `admin`) and click **Sign In**.
* **What to say:**
  > *"First, we demonstrate our dual-role RBAC implementation. We have two distinct database roles: `Administrator` and `Security Analyst`. Each user record stores a bcrypt-salted hash. When an admin logs in, a JWT payload securely carries their role identifier to authorize access to administrative reporting hierarchy and audit logs."*

---

#### Step 2: The Security Operations Dashboard (Rubric: Views & DML - 4 Marks)
* **URL:** `http://localhost:3000/dashboard`
* **Action:**
  1. Point to the top metric cards (Active Incidents, Critical Threats, Total Assets, Open Response Actions).
  2. Point to the **High Priority Incidents** queue table.
* **What to say:**
  > *"Upon logging in, the dashboard aggregates real-time SOC metrics. This priority queue is powered directly by a PostgreSQL Database View: `v_high_priority_incidents`. Instead of hitting multiple base tables with repeated joins, the view encapsulates the join between `incidents`, `assets`, and `users`, filtering for unresolved incidents with risk scores above 7.0."*

---

#### Step 3: Log a New Incident & Stored Risk Function (Rubric: Stored Function - 6 Marks)
* **URL:** `http://localhost:3000/incidents/new`
* **Action:**
  1. Fill in a sample incident:
     - **Title:** `Ransomware LockBit 3.0 Infiltration Detected`
     - **Asset:** Select `Enterprise PostgreSQL Cluster` (Critical asset)
     - **Severity:** `Critical`
     - **Priority:** `Critical`
     - **Incident Category:** `Malware`
     - **Threat Actor:** `LockBit Supporter`
     - **Impact Description:** `Multiple network shares encrypted; shadow copies deleted.`
  2. Notice how the mathematical formula dynamically updates the **Computed Risk Score**:
     $$\text{Risk Score} = 0.4 \times \text{Severity} + 0.35 \times \text{Criticality} + 0.25 \times \text{Category Factor}$$
  3. Click **Submit Incident**.
* **What to say:**
  > *"When an analyst logs an incident, the system calls our PL/pgSQL Stored Function: `calculate_incident_risk(severity, asset_id, category)`. Rather than relying on frontend business logic, the database server itself mathematically derives the weighted risk score using asset criticality from the assets table, ensuring absolute mathematical integrity."*

---

#### Step 4: Incident Lifecycle & Automatic Audit Trigger (Rubric: Triggers - 6 Marks)
* **URL:** Click on the newly created incident or open `http://localhost:3000/incidents/1`
* **Action:**
  1. Show the incident details card.
  2. Scroll down to the **Audit History** tab.
  3. Show how the status change automatically produced an audit row with timestamp and user attribution.
* **What to say:**
  > *"Here we demonstrate our PostgreSQL Trigger: `trg_incident_status_audit`. Whenever the status column of an incident is updated, an `AFTER UPDATE` trigger intercepts the transition, compares `OLD.status` with `NEW.status`, and automatically inserts an immutable row into the `audit_logs` table. This guarantees a non-repudiable audit trail for compliance without requiring frontend code to manually log changes."*

---

#### Step 5: Semantic Vector Similarity Search (Rubric: Vector DB & CRUD - 7 Marks)
* **URL:** `http://localhost:3000/search`
* **Action:**
  1. Type a natural language query that doesn't share exact keywords with the database:
     - Search query: `database exfiltration and unauthorized dump`
  2. Click **Run Semantic Search**.
  3. Show how it immediately finds incident #1 (`Database Exfiltration via SQL Injection`) with a similarity score of **94%+** and a small cosine distance ($< 0.15$).
  4. Try a second query: `credential theft on domain controller` (returns Golden Ticket / Kerberos incidents).
* **What to say:**
  > *"This is our NoSQL / Vector Database integration. Keyword SQL search (`LIKE '%keyword%'`) completely fails when attacker tactics use synonyms or paraphrased descriptions. We generate dense 384-dimensional vector embeddings using the `all-MiniLM-L6-v2` transformer model and store them in PostgreSQL using the `pgvector` extension.*
  > 
  > *We indexed the vectors using an **HNSW (Hierarchical Navigable Small World)** graph index with cosine distance (`<=>`). When an analyst queries unstructured text, the system converts it to a vector in real time and performs an exact nearest-neighbor cosine similarity calculation in sub-second latency."*

---

#### Step 6: Analytical Caseload & Complex SQL Queries (Rubric: Nested & Join Queries - 4 Marks)
* **URL:** `http://localhost:3000/reports`
* **Action:**
  1. Show the **Analyst Caseload Distribution** table (Query Q09).
  2. Show the **Average Turnaround Time by Severity** (Query Q04).
* **What to say:**
  > *"In our analytics module, we demonstrate advanced multi-table SQL joins and correlated aggregate subqueries. For example, Query Q09 calculates the active caseload per analyst using `LEFT OUTER JOIN`, `GROUP BY`, and a `CASE` statement to bucket analysts into Overloaded, Normal, or Available capacity bands.*
  > 
  > *Query Q04 calculates the mean time to resolution (MTTR) by severity level using date-interval arithmetic (`AGE(resolved_at, created_at)`)."*

---

#### Step 7: Recursive CTE Organizational Reporting Hierarchy (Rubric: Recursive CTE - 6 Marks)
* **URL:** `http://localhost:3000/admin`
* **Action:**
  1. Show the interactive tree showing Sarah Connor (CISO, Level 1) branching down to Alex Rivera (SOC Lead, Level 2) and down to Tier-1 Analysts (Level 3).
* **What to say:**
  > *"In the Admin Portal, we demonstrate a **Recursive Common Table Expression (CTE)** (Query Q14). The `users` table contains an adjacency list self-referencing foreign key `reports_to`. The recursive CTE defines an anchor member starting at top management (`reports_to IS NULL`) and recursively unions subordinate employees while incrementing the hierarchy depth level, dynamically rendering the entire organizational tree."*

---

### Part 3: Top 10 Faculty Viva Voce Questions & Model Answers

#### Q1: "Why did you use PostgreSQL with pgvector instead of a standalone vector database like Pinecone, Chroma, or Milvus?"
> **Answer:**
> *"Using a standalone vector database introduces the **dual-database sync problem**: incident relational metadata lives in one DB while vectors live in another. This breaks ACID transactions, causes data divergence during rollbacks, and prevents unified SQL queries.*
> *With `pgvector`, our relational data and vector embeddings live in the same ACID-compliant engine. We can run **Hybrid Search** in a single SQL statement that combines cosine vector distance with relational `WHERE` clauses (e.g., `WHERE status = 'Open' AND severity = 'Critical' AND embedding <=> query_vector < 0.3`)."*

---

#### Q2: "What is the difference between Cosine Distance and Cosine Similarity?"
> **Answer:**
> *"`Cosine Similarity` ranges from -1 to 1, where 1 means identical angle/direction. `Cosine Distance` is defined as `1 - Cosine Similarity`. In `pgvector`, the `<=>` operator computes cosine distance (ranging from 0 for identical vectors to 2 for opposite vectors). We calculate similarity percentage in our UI using:  
> $$\text{Similarity \%} = (1 - \text{Cosine Distance}) \times 100$$"*

---

#### Q3: "What index did you use for the vector column, and how does it work?"
> **Answer:**
> *"We deployed an **HNSW (Hierarchical Navigable Small World)** index with `vector_cosine_ops`. HNSW builds a multi-layer geometric graph of vector points. Search operates like skip-lists: it navigates upper sparse layers for rapid long-distance hops, then drills down to lower dense layers for fine-grained nearest neighbor selection. This achieves $O(\log N)$ query complexity compared to $O(N)$ sequential scan."*

---

#### Q4: "Show me where you enforced ACID transactions."
> **Answer:**
> *"In `database/transactions/03_incident_assignment_transaction.sql` and our Python test `test_transactions.py`. When an incident is assigned to an analyst:*
> 1. *It locks the incident row (`SELECT ... FOR UPDATE`).*
> 2. *Checks if the analyst exists and is active.*
> 3. *Updates the `assigned_to` and `status` in `incidents`.*
> 4. *Inserts a record in `incident_investigations`.*
> 5. *Writes an entry to `audit_logs`.*
> *If any step fails or violates a constraint, a complete `ROLLBACK` occurs, preventing orphaned investigations or partial state mutations."*

---

#### Q5: "Explain your Stored Function for Risk Calculation."
> **Answer:**
> *"The function `calculate_incident_risk(p_severity, p_asset_id, p_category)` is written in `PL/pgSQL`. It fetches the target asset's criticality weight from the `assets` table, normalizes the severity score from 1.0 to 10.0, assigns a category threat multiplier, and returns a composite float score using the formula:*
> $$\text{Risk} = (0.40 \times \text{Severity}) + (0.35 \times \text{Criticality}) + (0.25 \times \text{Category})$$
> *This guarantees server-side validation and consistent risk values across all client interfaces."*

---

#### Q6: "Explain your Database Trigger."
> **Answer:**
> *"The trigger `trg_incident_status_audit` is bound to the `incidents` table. It executes `AFTER UPDATE OF status ON incidents FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)`. It calls `log_incident_status_transition()` which inserts an audit record with `OLD.status`, `NEW.status`, `incident_id`, and `CURRENT_TIMESTAMP` into `audit_logs`."*

---

#### Q7: "How is your Relational Schema normalized?"
> **Answer:**
> *"Our relational schema strictly satisfies **Third Normal Form (3NF)**:*
> * **1NF:** *Every column contains atomic values, with primary keys on every table.*
> * **2NF:** *All non-key attributes are fully functionally dependent on the entire primary key (no partial dependencies).*
> * **3NF:** *No transitive dependencies exist. For example, asset criticality belongs in the `assets` table rather than redundant in `incidents`, and role definitions are separated into the `roles` table with foreign key references.*
> *Our Chen ER diagram contains 11 entities with clear 1:N and N:M cardinality constraints."*

---

#### Q8: "What constraints did you implement in DDL?"
> **Answer:**
> *"We implemented all five SQL constraint types across our 11 tables:*
> 1. `PRIMARY KEY`: *Surrogate integer identities on all 11 tables.*
> 2. `FOREIGN KEY`: *Enforcing referential integrity with `ON DELETE RESTRICT` and `CASCADE`.*
> 3. `NOT NULL`: *On critical business columns like timestamps, titles, and IDs.*
> 4. `UNIQUE`: *On `users.email`, `users.username`, and `roles.role_name`.*
> 5. `CHECK Constraints`: *RegEx pattern match on `email`, allowed values on `severity`, `priority`, `status`, and positive numbers on `risk_score`.*"

---

#### Q9: "What are your two roles and how does RBAC work?"
> **Answer:**
> *"Our two roles are `Administrator` (Sarah Connor, `admin`) and `Security Analyst` (Alex Rivera, `analyst`). In Next.js middleware and API routes, incoming requests carry an authorization token. The server validates the user's role before exposing administrative actions (like the recursive CTE hierarchy tree and audit logs at `/api/admin/hierarchy`), while standard analysts are restricted to triage, response actions, and semantic search."*

---

#### Q10: "Can you run your automated test suite right now to prove everything works?"
> **Answer:**
> *"Yes, Professor. We have automated Python test scripts covering every component:"*
> - `python test_dml_operations.py` *(Passes INSERT, SELECT, UPDATE, DELETE)*
> - `python test_stored_functions.py` *(Passes risk score calculation)*
> - `python test_trigger.py` *(Passes automatic audit logging)*
> - `python test_transactions.py` *(Passes commit and forced rollback)*
> - `python test_complex_queries.py` *(Passes all 14 analytical queries Q01–Q14)*
> - `python test_vector_crud.py` *(Passes Vector CRUD and Hybrid Search)*

---

### Part 4: File & Script Quick Reference Cheatsheet

| Rubric Component | Marks | Key File / Location | How to Demonstrate |
| :--- | :---: | :--- | :--- |
| **ER Diagram** | 2 | `docs/database_design/01_CHEN_ER_DIAGRAM.png` | Open image in 8K resolution |
| **Relational Schema** | 3 | `docs/database_design/02_RELATIONAL_SCHEMA_DIAGRAM.png` | Show tables, PKs, FKs, constraints |
| **DDL Implementation** | 4 | `database/ddl/01_create_tables.sql` | Show table DDL + CHECK constraints |
| **Vector DB Creation** | 4 | `database/vector/vector_service.py` | Show `CREATE EXTENSION vector` + HNSW index |
| **Technology Justification** | 1 | `docs/FINAL_DBMS_MINI_PROJECT_REPORT.docx` (Sec 3) | Explain pgvector vs Pinecone dual-DB issue |
| **DML Operations** | 4 | `database/queries/04_dml_operations.sql` | Run `python test_dml_operations.py` |
| **Complex Queries (Joins, CTEs)** | 4 | `database/queries/05_complex_analytical_queries.sql` | Run `python test_complex_queries.py` |
| **Advanced SQL (Func, Triggers)** | 6 | `database/functions/`, `database/triggers/` | Run `test_stored_functions.py`, `test_trigger.py` |
| **Vector CRUD & Search** | 7 | `database/vector/vector_service.py` | Run Semantic Search on `/search` |
| **Next.js Interface** | 3 | `http://localhost:3000` | Walk through minimal B&W UI |
| **Backend API Integration** | 2 | `app/api/` (13 API route handlers) | Show `lib/db/index.js` connection pool |
| **Authentication & RBAC** | 4 | `app/api/auth/login/route.js`, `lib/auth/` | Demonstrate `admin` vs `analyst` logins |
| **Documentation & Git** | 2 | `docs/FINAL_DBMS_MINI_PROJECT_REPORT.docx` | Show 2.1 MB Word report + clean git log |
| **Viva & Modification** | 4 | Follow Part 3 of this guide | Confident answers from Q1–Q10 |
