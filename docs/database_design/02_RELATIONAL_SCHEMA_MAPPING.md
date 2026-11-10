# Phase 1 (Part B): Conversion of ER Diagram into Relational Schema
## Project: Cybersecurity Incident Correlation & Response Intelligence System
**Course:** DBMS Experiential Learning – Level 3 (PES University)  
**Authors / Team:** 2 Members  
**Primary Database:** PostgreSQL (Relational SQL)  
**Vector Extension / Secondary Paradigm:** PostgreSQL with `pgvector`  

---

## 1. Executive Summary

This document presents the **formal conversion of the Conceptual Chen ER Model into a Logical Relational Schema**, strictly fulfilling:
- **Section 4 of the DBMS Level 3 Project Requirements** (*"convert it into a relational schema identifying entities/tables, attributes, primary keys, foreign keys, relationships, and appropriate constraints"*).
- **Sections 10, 11, 12, 13, and 23 of the Developer Handbook**.

The conversion strictly follows the standard **7-Step ER-to-Relational Mapping Algorithm** (Elmasri & Navathe / Korth). Every relation is normalized to **Boyce-Codd Normal Form (BCNF / 3NF)** with complete entity integrity, referential integrity, domain constraints, and cascade policies.

---

## 2. The 7-Step ER-to-Relational Mapping Algorithm

### Step 1: Mapping of Regular (Strong) Entity Sets
For each strong entity $E$ in the ER diagram, create a relation $R$ containing all simple attributes of $E$. Choose one of the key attributes of $E$ as the Primary Key for $R$.

1. **`ROLES` Entity**  
   $\rightarrow$ Create relation **`roles`**  
   Primary Key: **`role_id`**  
   Attributes: `role_name` (Candidate Key / UNIQUE).
   
2. **`USERS` Entity**  
   $\rightarrow$ Create relation **`users`**  
   Primary Key: **`user_id`**  
   Attributes: `full_name`, `email` (Candidate Key / UNIQUE), `password_hash`, `is_active`, `created_at`.  
   *(Foreign key `role_id` mapped in Step 4).*

3. **`ASSETS` Entity**  
   $\rightarrow$ Create relation **`assets`**  
   Primary Key: **`asset_id`**  
   Attributes: `asset_name`, `asset_type`, `criticality`, `ip_address`, `department`, `is_active`, `created_at`.

4. **`INCIDENT_TYPES` Entity**  
   $\rightarrow$ Create relation **`incident_types`**  
   Primary Key: **`incident_type_id`**  
   Attributes: `type_name` (Candidate Key / UNIQUE), `description`.

5. **`INCIDENTS` Entity (Central Strong Operational Hub)**  
   $\rightarrow$ Create relation **`incidents`**  
   Primary Key: **`incident_id`**  
   Attributes: `title`, `description`, `severity`, `status`, `priority`, `risk_score`, `reported_at`, `updated_at`, `resolved_at`.  
   *(Foreign keys mapped in Step 4).*

---

### Step 2: Mapping of Weak (Dependent) Entity Sets
For each weak entity $W$ with owner entity $E$, create a relation $R$. Include all simple attributes of $W$. Include as a **Foreign Key** in $R$ the primary key attribute(s) of the owner relation $E$. The primary key of $R$ is formed by the combination of the partial key of $W$ and the primary key of $E$ (or an atomic surrogate PK referencing $E$ with an identification dependency constraint).

1. **`INVESTIGATIONS`** (Weak entity owned by `INCIDENTS` via identifying relationship `HAS_INVESTIGATION`):  
   $\rightarrow$ Create relation **`investigations`**  
   Foreign Key: `incident_id` REFERENCES `incidents(incident_id)` ON DELETE CASCADE.  
   Primary Key: `investigation_id` (Surrogate integer key uniquely identifying investigation records per incident).  
   Attributes: `findings`, `started_at`, `completed_at`. *(Foreign key `analyst_id` mapped in Step 4).*

2. **`RESPONSE_ACTIONS`** (Weak entity owned by `INCIDENTS` via identifying relationship `HAS_RESPONSE`):  
   $\rightarrow$ Create relation **`response_actions`**  
   Foreign Key: `incident_id` REFERENCES `incidents(incident_id)` ON DELETE CASCADE.  
   Primary Key: `response_id`.  
   Attributes: `action_type`, `description`, `action_status`, `performed_at`. *(Foreign key `performed_by` mapped in Step 4).*

3. **`INCIDENT_STATUS_HISTORY`** (Weak entity owned by `INCIDENTS` via identifying relationship `TRACKS_STATUS`):  
   $\rightarrow$ Create relation **`incident_status_history`**  
   Foreign Key: `incident_id` REFERENCES `incidents(incident_id)` ON DELETE CASCADE.  
   Primary Key: `history_id`.  
   Attributes: `old_status`, `new_status`, `changed_at`, `remarks`. *(Foreign key `changed_by` mapped in Step 4).*

4. **`RISK_ASSESSMENTS`** (Weak entity owned by `INCIDENTS` via identifying relationship `ASSESSES_RISK`):  
   $\rightarrow$ Create relation **`risk_assessments`**  
   Foreign Key: `incident_id` REFERENCES `incidents(incident_id)` ON DELETE CASCADE.  
   Primary Key: `risk_id`.  
   Attributes: `severity_score`, `asset_score`, `impact_score`, `risk_score`, `risk_level`, `calculated_at`. *(Foreign key `calculated_by` mapped in Step 4).*

5. **`INCIDENT_EMBEDDINGS`** (Weak entity owned by `INCIDENTS` via identifying relationship `VECTORIZES`):  
   $\rightarrow$ Create relation **`incident_embeddings`**  
   Foreign Key: `incident_id` REFERENCES `incidents(incident_id)` ON DELETE CASCADE.  
   Primary Key: `embedding_id`.  
   Attributes: `embedding` (VECTOR(384)), `model_name`, `created_at`.

---

### Step 3: Mapping of 1:1 Binary Relationship Types
*Not applicable in this schema. All operational relationships are 1:N or n-ary audit associations.*

---

### Step 4: Mapping of 1:N Binary Relationship Types
For each regular binary 1:N relationship $R$ between entity $S$ (1-side) and entity $T$ (N-side), identify $T$ as the relation on the N-side. Include the primary key of $S$ as a **Foreign Key** in $T$.

1. **`DEFINES` (`roles` [1] $\rightarrow$ `users` [N])**:  
   Foreign Key: `users.role_id` $\rightarrow$ `roles(role_id)` [NOT NULL, ON DELETE RESTRICT].
   
2. **`REPORTS` (`users` [1] $\rightarrow$ `incidents` [N])**:  
   Role: Reporter.  
   Foreign Key: `incidents.reported_by` $\rightarrow$ `users(user_id)` [NOT NULL, ON DELETE RESTRICT].

3. **`ASSIGNED_TO` (`users` [1] $\rightarrow$ `incidents` [N])**:  
   Role: Assigned Analyst.  
   Foreign Key: `incidents.assigned_to` $\rightarrow$ `users(user_id)` [NULLABLE, ON DELETE SET NULL].

4. **`AFFECTS` (`assets` [1] $\rightarrow$ `incidents` [N])**:  
   Foreign Key: `incidents.asset_id` $\rightarrow$ `assets(asset_id)` [NOT NULL, ON DELETE RESTRICT].

5. **`CLASSIFIES` (`incident_types` [1] $\rightarrow$ `incidents` [N])**:  
   Foreign Key: `incidents.incident_type_id` $\rightarrow$ `incident_types(incident_type_id)` [NOT NULL, ON DELETE RESTRICT].

6. **`CONDUCTS` (`users` [1] $\rightarrow$ `investigations` [N])**:  
   Foreign Key: `investigations.analyst_id` $\rightarrow$ `users(user_id)` [NOT NULL, ON DELETE RESTRICT].

7. **`PERFORMS` (`users` [1] $\rightarrow$ `response_actions` [N])**:  
   Foreign Key: `response_actions.performed_by` $\rightarrow$ `users(user_id)` [NOT NULL, ON DELETE RESTRICT].

8. **`LOGS_STATUS_CHANGE` (`users` [1] $\rightarrow$ `incident_status_history` [N])**:  
   Foreign Key: `incident_status_history.changed_by` $\rightarrow$ `users(user_id)` [NULLABLE, ON DELETE SET NULL].

9. **`EVALUATES_RISK` (`users` [1] $\rightarrow$ `risk_assessments` [N])**:  
   Foreign Key: `risk_assessments.calculated_by` $\rightarrow$ `users(user_id)` [NULLABLE, ON DELETE SET NULL].

---

### Step 5: Mapping of M:N Binary Relationship Types
In conceptual design, many-to-many relationships (e.g. Incidents handled by multiple Analysts, or Incidents undergoing multiple Actions) are **decomposed into associative entities** with rich attributes (`investigations`, `response_actions`, `incident_status_history`). Each associative relation has foreign keys referencing the participating entities, satisfying 1NF without multi-valued structures.

---

### Step 6: Mapping of Multi-Valued Attributes
Multi-valued attributes (such as incident historical status transitions, multiple response steps, and repeated risk recalculations) are mapped to individual dependent tables (`incident_status_history`, `response_actions`, `risk_assessments`) linked through `incident_id`.

---

### Step 7: Mapping of N-ary Relationship Types (Audit Trail)
The relationship between users, incidents, and administrative actions is represented by the **`audit_logs`** relation:
* Primary Key: `audit_id`
* Foreign Keys:  
  * `user_id` $\rightarrow$ `users(user_id)` [NULLABLE, ON DELETE SET NULL]
  * `incident_id` $\rightarrow$ `incidents(incident_id)` [NULLABLE, ON DELETE SET NULL]
* Attributes: `action`, `description`, `created_at`.

---

## 3. Formal Relational Schema (Textbook Notation)

Primary keys are **bold and underlined** (<u>**pk**</u>); foreign keys are in *italics* with arrows pointing to the referenced parent relation:

1. **`roles`** (<u>**role_id**</u>, role_name)
   * Candidate Key: `role_name`

2. **`users`** (<u>**user_id**</u>, *role_id*, full_name, email, password_hash, is_active, created_at)
   * Foreign Key: `role_id` $\rightarrow$ `roles(role_id)`
   * Candidate Key: `email`

3. **`assets`** (<u>**asset_id**</u>, asset_name, asset_type, criticality, ip_address, department, is_active, created_at)

4. **`incident_types`** (<u>**incident_type_id**</u>, type_name, description)
   * Candidate Key: `type_name`

5. **`incidents`** (<u>**incident_id**</u>, *incident_type_id*, *reported_by*, *assigned_to*, *asset_id*, title, description, severity, status, priority, risk_score, reported_at, updated_at, resolved_at)
   * Foreign Key: `incident_type_id` $\rightarrow$ `incident_types(incident_type_id)`
   * Foreign Key: `reported_by` $\rightarrow$ `users(user_id)`
   * Foreign Key: `assigned_to` $\rightarrow$ `users(user_id)`
   * Foreign Key: `asset_id` $\rightarrow$ `assets(asset_id)`

6. **`investigations`** (<u>**investigation_id**</u>, *incident_id*, *analyst_id*, findings, started_at, completed_at)
   * Foreign Key: `incident_id` $\rightarrow$ `incidents(incident_id)` [ON DELETE CASCADE]
   * Foreign Key: `analyst_id` $\rightarrow$ `users(user_id)` [ON DELETE RESTRICT]

7. **`response_actions`** (<u>**response_id**</u>, *incident_id*, *performed_by*, action_type, description, action_status, performed_at)
   * Foreign Key: `incident_id` $\rightarrow$ `incidents(incident_id)` [ON DELETE CASCADE]
   * Foreign Key: `performed_by` $\rightarrow$ `users(user_id)` [ON DELETE RESTRICT]

8. **`incident_status_history`** (<u>**history_id**</u>, *incident_id*, old_status, new_status, *changed_by*, changed_at, remarks)
   * Foreign Key: `incident_id` $\rightarrow$ `incidents(incident_id)` [ON DELETE CASCADE]
   * Foreign Key: `changed_by` $\rightarrow$ `users(user_id)` [ON DELETE SET NULL]

9. **`risk_assessments`** (<u>**risk_id**</u>, *incident_id*, severity_score, asset_score, impact_score, risk_score, risk_level, *calculated_by*, calculated_at)
   * Foreign Key: `incident_id` $\rightarrow$ `incidents(incident_id)` [ON DELETE CASCADE]
   * Foreign Key: `calculated_by` $\rightarrow$ `users(user_id)` [ON DELETE SET NULL]

10. **`audit_logs`** (<u>**audit_id**</u>, *user_id*, *incident_id*, action, description, created_at)
    * Foreign Key: `user_id` $\rightarrow$ `users(user_id)` [ON DELETE SET NULL]
    * Foreign Key: `incident_id` $\rightarrow$ `incidents(incident_id)` [ON DELETE SET NULL]

11. **`incident_embeddings`** (<u>**embedding_id**</u>, *incident_id*, embedding, model_name, created_at)
    * Foreign Key: `incident_id` $\rightarrow$ `incidents(incident_id)` [ON DELETE CASCADE]

---

## 4. Comprehensive Data Dictionary & Field Specifications

### 4.1 Table: `roles`
| Attribute | Data Type | Key | Nullable | Default | Constraints & Permitted Values | Description |
|---|---|---|---|---|---|---|
| `role_id` | `SERIAL` (INT) | **PK** | NOT NULL | Auto | Primary Key | Unique system role identifier |
| `role_name` | `VARCHAR(50)` | **UK** | NOT NULL | None | UNIQUE, CHECK (`role_name` IN ('Administrator', 'Security Analyst')) | Name of administrative role |

---

### 4.2 Table: `users`
| Attribute | Data Type | Key | Nullable | Default | Constraints & Permitted Values | Description |
|---|---|---|---|---|---|---|
| `user_id` | `SERIAL` (INT) | **PK** | NOT NULL | Auto | Primary Key | Unique user identity |
| `role_id` | `INT` | **FK** | NOT NULL | None | REFERENCES `roles(role_id)` ON DELETE RESTRICT | Assigned access control role |
| `full_name` | `VARCHAR(100)` | - | NOT NULL | None | LENGTH(full_name) >= 2 | Operator / analyst legal name |
| `email` | `VARCHAR(150)` | **UK** | NOT NULL | None | UNIQUE, format `^.+@.+\..+$` | Unique login email credential |
| `password_hash` | `VARCHAR(255)` | - | NOT NULL | None | Secure bcrypt/Argon2 string | Hashed authorization secret |
| `is_active` | `BOOLEAN` | - | NOT NULL | `TRUE` | Boolean flag | Account enablement state |
| `created_at` | `TIMESTAMPTZ` | - | NOT NULL | `CURRENT_TIMESTAMP` | System timestamp | Account registration timestamp |

---

### 4.3 Table: `assets`
| Attribute | Data Type | Key | Nullable | Default | Constraints & Permitted Values | Description |
|---|---|---|---|---|---|---|
| `asset_id` | `SERIAL` (INT) | **PK** | NOT NULL | Auto | Primary Key | Monitored asset identifier |
| `asset_name` | `VARCHAR(100)` | - | NOT NULL | None | Unique per department | Hostname / inventory identifier |
| `asset_type` | `VARCHAR(50)` | - | NOT NULL | None | CHECK (`asset_type` IN ('Server', 'Database', 'Workstation', 'Cloud Resource', 'Firewall')) | Hardware/software taxonomy |
| `criticality` | `VARCHAR(20)` | - | NOT NULL | None | CHECK (`criticality` IN ('Critical', 'High', 'Medium', 'Low')) | Business impact level |
| `ip_address` | `VARCHAR(45)` | - | NULL | NULL | Valid IPv4 / IPv6 syntax | Network network address |
| `department` | `VARCHAR(100)` | - | NOT NULL | None | Text | Operating department owner |
| `is_active` | `BOOLEAN` | - | NOT NULL | `TRUE` | Boolean flag | Decommissioning status |
| `created_at` | `TIMESTAMPTZ` | - | NOT NULL | `CURRENT_TIMESTAMP` | System timestamp | Asset registration timestamp |

---

### 4.4 Table: `incident_types`
| Attribute | Data Type | Key | Nullable | Default | Constraints & Permitted Values | Description |
|---|---|---|---|---|---|---|
| `incident_type_id` | `SERIAL` (INT) | **PK** | NOT NULL | Auto | Primary Key | Attack category identifier |
| `type_name` | `VARCHAR(50)` | **UK** | NOT NULL | None | UNIQUE, e.g., 'Phishing', 'Malware', 'Brute Force', 'Unauthorized Access', 'Data Leakage', 'Suspicious Activity' | Attack classification label |
| `description` | `TEXT` | - | NULL | NULL | Free text | Incident classification definition |

---

### 4.5 Table: `incidents` (Core Operational Entity)
| Attribute | Data Type | Key | Nullable | Default | Constraints & Permitted Values | Description |
|---|---|---|---|---|---|---|
| `incident_id` | `SERIAL` (INT) | **PK** | NOT NULL | Auto | Primary Key | Primary incident incident identifier |
| `incident_type_id` | `INT` | **FK** | NOT NULL | None | REFERENCES `incident_types(incident_type_id)` | Threat classification reference |
| `reported_by` | `INT` | **FK** | NOT NULL | None | REFERENCES `users(user_id)` ON DELETE RESTRICT | User reporting the anomaly |
| `assigned_to` | `INT` | **FK** | NULL | NULL | REFERENCES `users(user_id)` ON DELETE SET NULL | Assigned lead security analyst |
| `asset_id` | `INT` | **FK** | NOT NULL | None | REFERENCES `assets(asset_id)` ON DELETE RESTRICT | Affected IT/cloud infrastructure |
| `title` | `VARCHAR(200)` | - | NOT NULL | None | LENGTH >= 5 | Brief summary headline |
| `description` | `TEXT` | - | NOT NULL | None | Detailed narrative | Threat vectors and evidence |
| `severity` | `VARCHAR(20)` | - | NOT NULL | None | CHECK (`severity` IN ('Critical', 'High', 'Medium', 'Low')) | Initial severity grading |
| `status` | `VARCHAR(25)` | - | NOT NULL | `'New'` | CHECK (`status` IN ('New', 'Investigating', 'Contained', 'Resolved', 'False Positive')) | Operational lifecycle status |
| `priority` | `VARCHAR(20)` | - | NOT NULL | `'Medium'` | CHECK (`priority` IN ('Critical', 'High', 'Medium', 'Low')) | Response prioritization |
| `risk_score` | `NUMERIC(5,2)` | - | NOT NULL | `0.00` | CHECK (`risk_score` >= 0.00 AND `risk_score` <= 100.00) | Quantitative risk score [0..100] |
| `reported_at` | `TIMESTAMPTZ` | - | NOT NULL | `CURRENT_TIMESTAMP` | ISO timestamp | Detection/creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | - | NOT NULL | `CURRENT_TIMESTAMP` | ISO timestamp | Last modification timestamp |
| `resolved_at` | `TIMESTAMPTZ` | - | NULL | NULL | `resolved_at >= reported_at` | Closure / containment timestamp |

---

### 4.6 Table: `investigations`
| Attribute | Data Type | Key | Nullable | Default | Constraints & Permitted Values | Description |
|---|---|---|---|---|---|---|
| `investigation_id`| `SERIAL` (INT) | **PK** | NOT NULL | Auto | Primary Key | Investigation note identifier |
| `incident_id` | `INT` | **FK** | NOT NULL | None | REFERENCES `incidents(incident_id)` ON DELETE CASCADE | Target incident reference |
| `analyst_id` | `INT` | **FK** | NOT NULL | None | REFERENCES `users(user_id)` ON DELETE RESTRICT | Investigating analyst |
| `findings` | `TEXT` | - | NOT NULL | None | Min length >= 10 | Forensic analysis findings |
| `started_at` | `TIMESTAMPTZ` | - | NOT NULL | `CURRENT_TIMESTAMP` | ISO timestamp | Work initiation timestamp |
| `completed_at` | `TIMESTAMPTZ` | - | NULL | NULL | `completed_at >= started_at` | Investigation sign-off time |

---

### 4.7 Table: `response_actions`
| Attribute | Data Type | Key | Nullable | Default | Constraints & Permitted Values | Description |
|---|---|---|---|---|---|---|
| `response_id` | `SERIAL` (INT) | **PK** | NOT NULL | Auto | Primary Key | Remediation action identifier |
| `incident_id` | `INT` | **FK** | NOT NULL | None | REFERENCES `incidents(incident_id)` ON DELETE CASCADE | Remediated incident reference |
| `performed_by` | `INT` | **FK** | NOT NULL | None | REFERENCES `users(user_id)` ON DELETE RESTRICT | User executing response step |
| `action_type` | `VARCHAR(50)` | - | NOT NULL | None | e.g. 'Isolation', 'Credential Reset', 'Block IP', 'Patch Deployment', 'Forensic Acquisition' | Type of response action |
| `description` | `TEXT` | - | NOT NULL | None | Text | Operational technical details |
| `action_status` | `VARCHAR(25)` | - | NOT NULL | `'Pending'` | CHECK (`action_status` IN ('Pending', 'In Progress', 'Completed', 'Failed')) | Execution progress |
| `performed_at` | `TIMESTAMPTZ` | - | NOT NULL | `CURRENT_TIMESTAMP` | ISO timestamp | Execution timestamp |

---

### 4.8 Table: `incident_status_history`
| Attribute | Data Type | Key | Nullable | Default | Constraints & Permitted Values | Description |
|---|---|---|---|---|---|---|
| `history_id` | `SERIAL` (INT) | **PK** | NOT NULL | Auto | Primary Key | State transition record ID |
| `incident_id` | `INT` | **FK** | NOT NULL | None | REFERENCES `incidents(incident_id)` ON DELETE CASCADE | Associated incident ID |
| `old_status` | `VARCHAR(25)` | - | NULL | NULL | Old status value | Pre-transition lifecycle state |
| `new_status` | `VARCHAR(25)` | - | NOT NULL | None | CHECK (`new_status` IN ('New', 'Investigating', 'Contained', 'Resolved', 'False Positive')) | Post-transition lifecycle state |
| `changed_by` | `INT` | **FK** | NULL | NULL | REFERENCES `users(user_id)` ON DELETE SET NULL | User triggering transition (or trigger) |
| `changed_at` | `TIMESTAMPTZ` | - | NOT NULL | `CURRENT_TIMESTAMP` | ISO timestamp | Transition timestamp |
| `remarks` | `TEXT` | - | NULL | NULL | Optional text | Justification or trigger note |

---

### 4.9 Table: `risk_assessments`
| Attribute | Data Type | Key | Nullable | Default | Constraints & Permitted Values | Description |
|---|---|---|---|---|---|---|
| `risk_id` | `SERIAL` (INT) | **PK** | NOT NULL | Auto | Primary Key | Risk assessment record ID |
| `incident_id` | `INT` | **FK** | NOT NULL | None | REFERENCES `incidents(incident_id)` ON DELETE CASCADE | Target incident ID |
| `severity_score` | `NUMERIC(5,2)` | - | NOT NULL | `0.00` | CHECK (`severity_score` BETWEEN 0.00 AND 100.00) | Severity component score |
| `asset_score` | `NUMERIC(5,2)` | - | NOT NULL | `0.00` | CHECK (`asset_score` BETWEEN 0.00 AND 100.00) | Asset criticality score |
| `impact_score` | `NUMERIC(5,2)` | - | NOT NULL | `0.00` | CHECK (`impact_score` BETWEEN 0.00 AND 100.00) | Potential business impact |
| `risk_score` | `NUMERIC(5,2)` | - | NOT NULL | `0.00` | CHECK (`risk_score` BETWEEN 0.00 AND 100.00) | Composite risk score |
| `risk_level` | `VARCHAR(20)` | - | NOT NULL | None | CHECK (`risk_level` IN ('Low', 'Medium', 'High', 'Critical')) | Categorical assessment band |
| `calculated_by` | `INT` | **FK** | NULL | NULL | REFERENCES `users(user_id)` ON DELETE SET NULL | Responsible analyst or system function |
| `calculated_at` | `TIMESTAMPTZ` | - | NOT NULL | `CURRENT_TIMESTAMP` | ISO timestamp | Evaluation timestamp |

---

### 4.10 Table: `audit_logs`
| Attribute | Data Type | Key | Nullable | Default | Constraints & Permitted Values | Description |
|---|---|---|---|---|---|---|
| `audit_id` | `SERIAL` (INT) | **PK** | NOT NULL | Auto | Primary Key | System log record ID |
| `user_id` | `INT` | **FK** | NULL | NULL | REFERENCES `users(user_id)` ON DELETE SET NULL | User who initiated action |
| `incident_id` | `INT` | **FK** | NULL | NULL | REFERENCES `incidents(incident_id)` ON DELETE SET NULL | Target incident reference |
| `action` | `VARCHAR(100)` | - | NOT NULL | None | e.g. 'INCIDENT_CREATED', 'STATUS_UPDATED', 'ANALYST_ASSIGNED' | Operation type identifier |
| `description` | `TEXT` | - | NULL | NULL | Text | Operation parameters and diff |
| `created_at` | `TIMESTAMPTZ` | - | NOT NULL | `CURRENT_TIMESTAMP` | ISO timestamp | Exact audit event time |

---

### 4.11 Table: `incident_embeddings` (Vector Component)
| Attribute | Data Type | Key | Nullable | Default | Constraints & Permitted Values | Description |
|---|---|---|---|---|---|---|
| `embedding_id` | `SERIAL` (INT) | **PK** | NOT NULL | Auto | Primary Key | Vector record identifier |
| `incident_id` | `INT` | **FK** | NOT NULL | None | REFERENCES `incidents(incident_id)` ON DELETE CASCADE | Parent incident reference |
| `embedding` | `vector(384)` | - | NOT NULL | None | Dense 384-dimensional floating vector | Semantic embedding array |
| `model_name` | `VARCHAR(100)` | - | NOT NULL | `'all-MiniLM-L6-v2'` | Name of encoder model | Transformer model name |
| `created_at` | `TIMESTAMPTZ` | - | NOT NULL | `CURRENT_TIMESTAMP` | ISO timestamp | Vector generation timestamp |

---

## 5. Referential Integrity & Delete Action Policies

A critical requirement in the developer handbook (Section 12: *"Delete behavior shall be chosen deliberately; do not use CASCADE blindly"*):

| Foreign Key | Parent Relation | Child Relation | Action on Delete | Academic & Operational Rationale |
|---|---|---|---|---|
| `users.role_id` | `roles` | `users` | **RESTRICT** | A role cannot be deleted if active users still hold that role. |
| `incidents.reported_by` | `users` | `incidents` | **RESTRICT** | Prevents deletion of a user who is the primary reporting authority of an active security incident. |
| `incidents.assigned_to` | `users` | `incidents` | **SET NULL** | If an analyst leaves or is deleted, incidents are unassigned and returned to the queue rather than deleted. |
| `incidents.asset_id` | `assets` | `incidents` | **RESTRICT** | Prevents deletion of an asset that has active or historical incident investigations. |
| `incidents.incident_type_id` | `incident_types` | `incidents` | **RESTRICT** | A threat classification category cannot be removed while classified incidents exist. |
| `investigations.incident_id` | `incidents` | `investigations` | **CASCADE** | If a false positive or test incident is purged, all subsidiary notes are purged with it. |
| `investigations.analyst_id` | `users` | `investigations` | **RESTRICT** | Forensics evidence must maintain analyst attribution integrity. |
| `response_actions.incident_id`| `incidents` | `response_actions` | **CASCADE** | Subsidiary response actions belong strictly to their parent incident. |
| `incident_status_history.incident_id` | `incidents` | `incident_status_history`| **CASCADE** | Status transition history is an existence-dependent child of the incident. |
| `risk_assessments.incident_id` | `incidents` | `risk_assessments` | **CASCADE** | Calculated risk evaluations are subsidiary to the incident. |
| `incident_embeddings.incident_id` | `incidents` | `incident_embeddings`| **CASCADE** | Semantic vector embeddings have no meaning if the parent incident description is removed. |
| `audit_logs.user_id` / `incident_id` | `users` / `incidents` | `audit_logs` | **SET NULL** | Audit records must remain permanent and immutable even if the user or incident is deleted. |

---

## 6. Formal Normalization Verification

### First Normal Form (1NF)
* Every attribute in every relation contains only atomic (indivisible) values.
* There are no repeating groups or comma-separated lists (e.g. actions, tags, or status transitions are broken into normalized 1:N relations).
* Each relation possesses an unambiguous primary key.

### Second Normal Form (2NF)
* Every relation is in 1NF.
* All relations use single-attribute surrogate keys (`SERIAL` IDs: `user_id`, `incident_id`, `asset_id`, etc.).
* Because no primary key is composite, partial functional dependencies cannot exist:
  $$\forall X \rightarrow Y, \quad X \not\subset PK$$
* Hence, every non-prime attribute is fully functionally dependent on the whole primary key.

### Third Normal Form (3NF)
* Every relation is in 2NF.
* For every non-trivial functional dependency $X \rightarrow Y$:
  * Either $X$ is a superkey, or
  * $Y$ is a prime attribute (part of a candidate key).
* There are **no transitive dependencies** ($A \rightarrow B$ and $B \rightarrow C$ where $A$ is PK and $C$ is non-prime).
  * Example: `department` and `criticality` of an asset reside exclusively in `assets(asset_id)`, not in `incidents`.
  * Threat taxonomy description resides in `incident_types`, not duplicated in `incidents`.
  * User role definitions reside in `roles`, not duplicated in `users`.

### Boyce-Codd Normal Form (BCNF)
* In every relation, for every functional dependency $X \rightarrow Y$, $X$ is a superkey.
* Since all candidate keys (`role_name`, `email`, `type_name`) determine only single non-key attributes or are identical to the key, no overlapping candidate keys violate BCNF.

---

## 7. Next Step: Phase 2 (SQL DDL Implementation)
With the relational schema, constraints, data dictionary, and normalization fully documented and verified, we are ready to move directly to **Phase 2: SQL Implementation (Writing and executing the PostgreSQL DDL script `schema.sql`)**.
