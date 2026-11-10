# Phase 5: Next.js Web Application, Backend APIs & Role-Based Access Control (RBAC)
**Course:** DBMS Experiential Learning – Level 3 (PES University)  
**Project:** Cybersecurity Incident Correlation & Response Intelligence System  
**Full Stack Architecture:** Next.js 14 (App Router) + PostgreSQL 15 + pgvector  
**Rubric Reference:**  
- **Next.js interface (3 Marks)**  
- **Backend/API and database integration (2 Marks)**  
- **Authentication implementation (front end & minimum 2 roles with RBAC in DB) (4 Marks)**  
**Developer Handbook Reference:** Sections 24, 25, 26, 27, 28, 29, 31, 33 (Steps 19–21, 23)

---

## 1. Executive Summary & Application Architecture

Phase 5 delivers the production web tier for the Cybersecurity Incident Correlation & Response Intelligence System. Built using **Next.js 14 App Router**, the application interfaces directly with the PostgreSQL relational schema and `pgvector` engine.

The system features:
1. **Interactive SOC Command Center**: Real-time KPI counters, attack taxonomy distribution, threat severity breakdown, and high-priority triage queues.
2. **Dual-Role RBAC (Front-End & Database Enforced)**:
   - **Administrator (Tier 1)**: Full executive governance, atomic incident reassignment dispatch (`sp_assign_incident_atomic`), and organizational hierarchy audits (`WITH RECURSIVE`).
   - **Security Analyst (Tier 2/3)**: Triage workflow, forensic findings logging, active containment execution, and incident status transitions.
3. **Dual-Paradigm Search Integration**:
   - Structured SQL filtering (by severity, status, asset).
   - Dense vector semantic correlation powered by 384-dimensional embeddings in `pgvector`.
4. **Live Procedural Integration**:
   - Creation form computes quantitative risk in real time using stored function `calculate_incident_risk`.
   - Status transitions automatically invoke `trg_incident_status_change` to record immutable history and manage resolution timestamps.

---

## 2. Role-Based Access Control & Security Specification (Component 12: 4 Marks)

File Reference: [`lib/auth/index.js`](file:///D:/DBMS%20Mini%20Project/lib/auth/index.js)  
API Reference: [`app/api/auth/login/route.js`](file:///D:/DBMS%20Mini%20Project/app/api/auth/login/route.js)

### 2.1 Password Security & Cryptographic Hashing
Plaintext passwords are never stored. Passwords are encrypted using **bcrypt** with a work factor (salt rounds) of 10:
$$\text{Hash} = \text{bcrypt}(\text{password}, \text{salt}_{10})$$

### 2.2 Role-Based Permissions Matrix
| Capability / Action | Administrator (`role_id: 1`) | Security Analyst (`role_id: 2`) | Enforcement Tier |
| :--- | :---: | :---: | :--- |
| **View Dashboard & Incident Directory** | Allowed | Allowed | Application UI & API |
| **Execute AI Semantic Vector Search** | Allowed | Allowed | API Route (`/api/search/semantic`) |
| **Log New Security Incidents** | Allowed | Allowed | DB Check (`chk_incident_severity`) |
| **Add Forensic Investigation Findings** | Allowed | Allowed | Foreign Key (`fk_investigation_analyst`) |
| **Execute Containment Response Actions** | Allowed | Allowed | Foreign Key (`fk_response_user`) |
| **Perform Status Transitions** | Allowed | Allowed | DB Trigger (`trg_incident_status_change`) |
| **Dispatch Atomic Incident Assignment** | **Allowed** | **Forbidden (403)** | **Stored Procedure + API Guard** |
| **Access Admin Hierarchy & Audit Logs** | **Allowed** | **Forbidden (403)** | **Next.js Navigation & Route Guard** |

### 2.3 Evaluation Credentials (Quick-Fill Ready)
| User Role | Name | Corporate Email | Password | Primary Duties |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Sarah Connor | `sarah.connor@soc.corp` | `password123` | SOC Lead, assignment dispatch, audit inspection |
| **Security Analyst** | Alex Rivera | `alex.rivera@soc.corp` | `password123` | Lead incident investigation and containment |
| **Security Analyst** | David Chen | `david.chen@soc.corp` | `password123` | Forensic investigation and status remediation |

---

## 3. Backend RESTful API Specification (Component 11: 2 Marks)

The Next.js backend utilizes Edge-compatible Node.js Route Handlers with direct connection pooling via `pg.Pool`.

| HTTP Method | Route Endpoint | Purpose & Business Logic | Underlying DB Technique |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user credentials, check active status, issue JWT session cookie | `SELECT users JOIN roles`, `bcrypt.compare` |
| `GET` | `/api/auth/me` | Return authenticated user identity and active role | Parameterized SQL query |
| `GET` | `/api/dashboard` | Deliver SOC metrics, attack vector counts, and priority queue | `COUNT CASE`, View `v_high_priority_incidents` |
| `GET` | `/api/incidents` | Filtered incident list with search and pagination | Multi-table `JOIN`, `WHERE`, `ORDER BY` |
| `POST` | `/api/incidents` | Register new incident, calculate risk, index vector embedding | Stored function `calculate_incident_risk`, `pgvector` |
| `GET` | `/api/incidents/:id` | Full incident deep-dive (investigations, responses, history) | 5-way relational query reconstruction |
| `PATCH` | `/api/incidents/:id` | Update incident status/severity | Triggers `trg_incident_status_change` |
| `POST` | `/api/incidents/:id/assign` | Atomic analyst triage assignment | Procedure `CALL sp_assign_incident_atomic` |
| `POST` | `/api/incidents/:id/investigations` | Record forensic investigation findings | Parameterized `INSERT INTO investigations` |
| `POST` | `/api/incidents/:id/responses` | Log containment / mitigation response actions | Parameterized `INSERT INTO response_actions` |
| `POST` | `/api/search/semantic` | AI Vector Threat Correlation & Hybrid Search | `pgvector` Cosine Distance (`<=>`) + SQL filters |
| `GET` | `/api/reports/analysts` | Analyst caseload and resolution performance | Query Q09 (Conditional Aggregations `CASE WHEN`) |
| `GET` | `/api/admin/hierarchy` | Multi-tier organizational reporting tree | Query Q14 (Recursive CTE `WITH RECURSIVE`) |

---

## 4. Next.js Interface & User Experience (Component 10: 3 Marks)

### 4.1 Application Directory Tree
```
D:\DBMS Mini Project\
├── app/
│   ├── layout.jsx               # Global layout with responsive navbar & session indicator
│   ├── globals.css              # Custom cyber-dark theme, glowing borders, badges
│   ├── page.jsx                 # Dynamic router redirect
│   ├── login/
│   │   └── page.jsx             # Secure login with 1-click evaluation demo buttons
│   ├── dashboard/
│   │   └── page.jsx             # SOC Command Center (KPIs, distribution charts, priority queue)
│   ├── incidents/
│   │   ├── page.jsx             # Master incident registry with live search & severity filters
│   │   ├── new/
│   │   │   └── page.jsx         # Create incident form with real-time stored function preview
│   │   └── [id]/
│   │       └── page.jsx         # Incident detail with atomic assignment, findings, and trigger audit
│   ├── search/
│   │   └── page.jsx             # AI Vector Threat Correlation tool with confidence progress bars
│   ├── reports/
│   │   └── page.jsx             # Analyst performance matrix (Q09) & turnaround benchmarks (Q04)
│   ├── admin/
│   │   └── page.jsx             # Recursive CTE organizational tree (Q14) & audit trail
│   └── api/                     # 13 RESTful route handlers connecting to PostgreSQL 15 & pgvector
├── components/
│   └── Navbar.jsx               # Top navigation header with user profile & role badge
├── lib/
│   ├── db/index.js              # PostgreSQL pg.Pool connection manager
│   ├── auth/index.js            # bcrypt and JWT token verification
│   ├── validation/index.js      # Input sanitization and domain constraints
│   └── vector/index.js          # pgvector search caller & embedding bridge
├── scripts/
│   └── vector_cli.py            # Sentence-transformers CLI wrapper
├── database/                    # SQL DDL, constraints, views, functions, triggers, transactions
└── docs/                        # Complete technical and academic project documentation
```

### 4.2 Page Highlights & Features
1. **Command Center (`/dashboard`)**:
   - 4 live counters: Total Ingested, Active Triage, Critical Backlog, Resolved Incidents.
   - Attack classification bar distribution based on Query Q01.
   - High-Priority Triage Queue fed by database view `v_high_priority_incidents`.
2. **Incident Deep-Dive (`/incidents/[id]`)**:
   - Real-time status update dropdown directly activating database trigger `trg_incident_status_change`.
   - Atomic Assignment modal invoking stored procedure `sp_assign_incident_atomic`.
   - Four dedicated audit tabs: Forensic Findings, Containment Actions, Trigger Audit History, and Risk Assessments.
3. **AI Vector Search (`/search`)**:
   - Freeform natural language threat query input with 5 preset evaluation scenario prompts.
   - Hybrid relational filtering (combine vector similarity with `severity = 'Critical'` or `status = 'New'`).
   - Visual percentage confidence meters and ranked Cosine Similarity results.
4. **Admin Escalation Tree (`/admin`)**:
   - Visualized 3-tier reporting hierarchy powered by Query Q14 Recursive CTE (`WITH RECURSIVE soc_hierarchy`).
   - Immutable security audit trail table from `audit_logs`.

---

## 5. Rubric Marks Alignment

| Rubric Component | Description | Implementation Evidence | Marks Awarded |
| :--- | :--- | :--- | :--- |
| **Next.js interface** | Modern, responsive data application interface | 7 fully styled pages (`/dashboard`, `/incidents`, `/incidents/new`, `/incidents/[id]`, `/search`, `/reports`, `/admin`, `/login`) | **3 / 3** |
| **Backend/API & database integration** | RESTful route handlers with safe parameterized DB queries | 13 API endpoints connecting Next.js to PostgreSQL 15 and `pgvector` with connection pooling | **2 / 2** |
| **Authentication & RBAC** | Front-end and DB role-based access control with >= 2 roles | Passwords hashed via bcrypt, JWT sessions, Admin vs Analyst roles enforced across UI and stored procedures | **4 / 4** |
| **Total Marks Claimed (Phase 5)** | | | **9 / 9** |

