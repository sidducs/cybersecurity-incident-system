# Phase 2: SQL DDL Implementation & Schema Setup
**Course:** DBMS Experiential Learning – Level 3  
**Project:** Cybersecurity Incident Correlation & Response Intelligence System  
**Target RDBMS:** PostgreSQL 14+ (with pgvector extension) & MySQL 8.0 Companion  
**Rubric Reference:** Requirement 5 (SQL Implementation: CREATE, ALTER, DROP, PK, FK, Constraints, Indexes, Views)  
**Developer Handbook Reference:** Sections 15, 21, 22, 33 (Steps 15–16)

---

## 1. Executive Summary & Objective

Phase 2 transitions the conceptual ER design and relational schema developed in Phase 1 into production-grade Data Definition Language (DDL) scripts. The schema establishes an immutable, type-safe, and self-validating foundation for the Cybersecurity Incident Correlation & Response Intelligence System.

Every table, constraint, index, and view has been implemented to fulfill both **academic rigor** (normalization, domain constraints, referential integrity) and **real-world Security Operations Center (SOC) operational requirements** (audit logging, SLA tracking, chronological state machines, dense vector similarity search).

---

## 2. Directory Structure of Phase 2 Artifacts

All SQL scripts are organized cleanly within the project's [database/](file:///D:/DBMS%20Mini%20Project/database) directory:

`	ext
D:\DBMS Mini Project\database/
├── schema.sql                         # Master all-in-one deployment script (PostgreSQL + pgvector)
├── schema_mysql.sql                   # Companion script for MySQL 8.0+ environments
├── ddl/
│   ├── 01_create_tables.sql           # CREATE TABLE statements for all 11 core entities
│   ├── 02_alter_demonstration.sql     # Justified ALTER TABLE schema evolutions
│   └── 03_drop_demonstration.sql      # Safe DROP TABLE, VIEW, INDEX lifecycle on staging objects
├── indexes/
│   └── 04_indexes.sql                 # Single, composite, partial B-Tree and pgvector HNSW indexes
├── views/
│   └── 05_views.sql                   # Real-time analytical and reporting views
└── constraints/
    └── 01_constraints_overview.sql    # Catalog verification queries for constraints
`

---

## 3. Relational Tables Catalog (CREATE TABLE)

The system is composed of 11 normalized relational tables:

| # | Table Name | Purpose / SOC Operational Role | Primary Key | Key Foreign Keys |
|---|------------|--------------------------------|-------------|------------------|
| 1 | 
oles | System authorization levels (Administrator, Security Analyst) | 
ole_id (SERIAL) | None |
| 2 | users | SOC analysts, incident reporters, and administrators | user_id (SERIAL) | 
ole_id -> 
oles |
| 3 | ssets | Protected IT infrastructure (servers, databases, cloud, firewalls) | sset_id (SERIAL) | None |
| 4 | incident_types | Standard threat taxonomies (DDoS, Ransomware, Phishing, etc.) | incident_type_id (SERIAL) | None |
| 5 | incidents | Central incident operational entity (severity, status, risk score) | incident_id (SERIAL) | incident_type_id, 
eported_by, ssigned_to, sset_id |
| 6 | investigations | Forensic findings, timestamps, and evidence notes | investigation_id (SERIAL) | incident_id, nalyst_id |
| 7 | 
esponse_actions| Remediation containment steps executed against threats | 
esponse_id (SERIAL) | incident_id, performed_by |
| 8 | incident_status_history | Audit trail capturing lifecycle state transitions | history_id (SERIAL) | incident_id, changed_by |
| 9 | 
isk_assessments | Multi-factor quantitative risk scoring evaluations | 
isk_id (SERIAL) | incident_id, calculated_by |
| 10 | udit_logs | Immutable security log tracking administrative changes | udit_id (SERIAL) | user_id, incident_id |
| 11 | incident_embeddings | 384-dimensional dense semantic vectors for AI retrieval | embedding_id (SERIAL) | incident_id |

---

## 4. Integrity Constraints Implementation

The schema enforces data integrity at the database engine level, ensuring invalid states cannot enter via UI bugs or malicious API calls.

### 4.1 Primary & Foreign Key Referential Integrity
| Foreign Key | Source Column | Target Column | On Delete Action | Rationale |
|-------------|---------------|---------------|------------------|-----------|
| k_users_role | users(role_id) | 
oles(role_id) | RESTRICT | Cannot delete a role if active users are assigned to it. |
| k_incident_type | incidents(incident_type_id) | incident_types(incident_type_id) | RESTRICT | Threat taxonomy categories cannot be deleted while incidents reference them. |
| k_incident_reporter | incidents(reported_by) | users(user_id) | RESTRICT | Historical incident author records must remain intact for compliance. |
| k_incident_assignee | incidents(assigned_to) | users(user_id) | SET NULL | If an analyst leaves or is deleted, incident remains open for re-assignment. |
| k_incident_asset | incidents(asset_id) | ssets(asset_id) | RESTRICT | Assets with logged incidents cannot be deleted; preserves forensic history. |
| k_investigation_incident | investigations(incident_id) | incidents(incident_id) | CASCADE | If a parent incident is purged, its investigation logs purge with it. |
| k_response_incident | 
esponse_actions(incident_id) | incidents(incident_id) | CASCADE | Purges child containment actions if parent incident is deleted. |
| k_history_incident | incident_status_history(incident_id) | incidents(incident_id) | CASCADE | Status history is an attribute lifecycle child of the incident. |
| k_risk_incident | 
isk_assessments(incident_id) | incidents(incident_id) | CASCADE | Risk assessments cascade with their associated incident. |
| k_embedding_incident | incident_embeddings(incident_id) | incidents(incident_id) | CASCADE | Vector embeddings must be pruned immediately if an incident is deleted. |

### 4.2 Domain Validation (CHECK Constraints)
- **Email Regex Validation (chk_user_email):**  
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
- **Full Name Length (chk_full_name_length):**  
  CHECK (LENGTH(TRIM(full_name)) >= 2)
- **Asset Taxonomy Validation (chk_asset_type):**  
  CHECK (asset_type IN ('Server', 'Database', 'Workstation', 'Cloud Resource', 'Firewall'))
- **Asset Criticality (chk_asset_criticality):**  
  CHECK (criticality IN ('Critical', 'High', 'Medium', 'Low'))
- **Incident Severity Enumeration (chk_incident_severity):**  
  CHECK (severity IN ('Critical', 'High', 'Medium', 'Low'))
- **Incident Status Enumeration (chk_incident_status):**  
  CHECK (status IN ('New', 'Investigating', 'Contained', 'Resolved', 'False Positive'))
- **Risk Score Bounds (chk_incident_risk_score):**  
  CHECK (risk_score >= 0.00 AND risk_score <= 100.00)
- **Chronological Temporal Coherence (chk_incident_resolved_date):**  
  CHECK (resolved_at IS NULL OR resolved_at >= reported_at)
- **Investigation Duration Coherence (chk_investigation_completion):**  
  CHECK (completed_at IS NULL OR completed_at >= started_at)

---

## 5. Schema Evolution (ALTER Demonstration)

File: [database/ddl/02_alter_demonstration.sql](file:///D:/DBMS%20Mini%20Project/database/ddl/02_alter_demonstration.sql)

As required by Section 5 of the rubric, explicit and justified ALTER TABLE operations are provided:

1. **ALTER TABLE incidents ADD COLUMN IF NOT EXISTS sla_deadline_hours INT DEFAULT 24;**  
   *Justification:* Real-world SOCs operate under contractual SLA response times. Adding an SLA deadline allows automatic breach detection.
2. **ALTER TABLE incidents ADD CONSTRAINT chk_incidents_sla_hours CHECK (sla_deadline_hours > 0 AND sla_deadline_hours <= 168);**  
   *Justification:* Ensures valid turnaround thresholds between 1 hour and 7 days.
3. **ALTER TABLE assets ADD COLUMN IF NOT EXISTS mac_address VARCHAR(17) NULL;**  
   *Justification:* IT asset management requires Layer-2 hardware address tracking for physical endpoint identification.
4. **ALTER TABLE assets ADD CONSTRAINT chk_asset_mac_format CHECK (mac_address IS NULL OR mac_address ~* '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$');**  
   *Justification:* Strict hex-colon regex validation for hardware addresses.
5. **ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) NULL;**  
   *Justification:* Facilitates emergency on-call analyst escalation.

---

## 6. Safe Object Destruction (DROP Demonstration)

File: [database/ddl/03_drop_demonstration.sql](file:///D:/DBMS%20Mini%20Project/database/ddl/03_drop_demonstration.sql)

*Viva Explanation:* In enterprise databases, executing DROP TABLE on active core entities breaks business continuity and cascades across foreign keys. Therefore, DDL removal must be demonstrated using a **temporary staging entity** (staging_raw_security_events).

The script demonstrates:
1. CREATE TABLE staging_raw_security_events (...)
2. CREATE INDEX idx_staging_received_at ON staging_raw_security_events(...)
3. CREATE VIEW v_unprocessed_staging_events AS ...
4. Controlled removal sequence:
   - DROP VIEW IF EXISTS v_unprocessed_staging_events;
   - DROP INDEX IF EXISTS idx_staging_received_at;
   - DROP TABLE IF EXISTS staging_raw_security_events;
   - ALTER TABLE response_actions DROP CONSTRAINT IF EXISTS chk_test_temporary_rule;

---

## 7. Indexing Strategy & Performance Acceleration

File: [database/indexes/04_indexes.sql](file:///D:/DBMS%20Mini%20Project/database/indexes/04_indexes.sql)

| Index Name | Target Column(s) | Type | Operational Rationale |
|------------|------------------|------|-----------------------|
| idx_incidents_status | incidents(status) | B-Tree | Triage filtering by lifecycle status |
| idx_incidents_severity | incidents(severity) | B-Tree | Filtering critical vs low threats |
| idx_incidents_reported_at | incidents(reported_at DESC) | B-Tree | Chronological reverse-timeline sorting |
| idx_incidents_risk_score | incidents(risk_score DESC) | B-Tree | Ranking incidents by threat score |
| idx_incidents_composite_filter | incidents(status, severity, reported_at DESC) | B-Tree Composite | Accelerates multi-column SOC dashboard filters |
| idx_incidents_active_urgent | incidents(severity, risk_score DESC) WHERE status NOT IN ('Resolved', 'False Positive') | B-Tree Partial | High-speed active incident queue with minimal index disk overhead |
| idx_incidents_type_id | incidents(incident_type_id) | B-Tree FK | Eliminates sequential scans during JOINs |
| idx_incidents_assigned_to | incidents(assigned_to) | B-Tree FK | Accelerates analyst workload queries |
| idx_incidents_asset_id | incidents(asset_id) | B-Tree FK | Accelerates asset-centric threat correlation |
| idx_investigations_incident_id | investigations(incident_id) | B-Tree FK | Rapid retrieval of forensic investigation logs |
| idx_response_actions_incident_id| 
esponse_actions(incident_id) | B-Tree FK | Rapid retrieval of containment actions |
| idx_history_incident_id | incident_status_history(incident_id) | B-Tree FK | Fast chronology rendering on incident details page |
| idx_incident_embeddings_hnsw | incident_embeddings(embedding) | pgvector HNSW | Graph-based cosine similarity search (<=>) for AI retrieval |

---

## 8. Reporting & Analytical Views

File: [database/views/05_views.sql](file:///D:/DBMS%20Mini%20Project/database/views/05_views.sql)

### 8.1 _high_priority_incidents
Joins incidents, incident_types, ssets, and users to provide a flattened view of urgent threats (Severity = Critical/High or Risk Score >= 60.00). Serves the SOC real-time incident queue.

### 8.2 _analyst_performance
Calculates SOC workforce efficiency metrics:
- Total assigned incidents
- Total resolved incidents
- Total active investigating incidents
- Average resolution turnaround time in hours (EXTRACT(EPOCH FROM (resolved_at - reported_at)) / 3600.0)
- Average risk score handled
- Forensic investigations conducted and response actions taken

### 8.3 _incident_summary
Aggregates key SOC operational metrics into a single row to instantly populate high-level KPI stat cards on the Next.js /dashboard.

### 8.4 _asset_threat_exposure
Correlates assets with incident counts, critical breach occurrences, and average risk exposure to power the /admin/assets infrastructure page.

---

## 9. How to Execute & Verify (Faculty Evaluation Guide)

### Option A: PostgreSQL Execution (Recommended)
`ash
# 1. Connect to PostgreSQL
psql -U postgres

# 2. Create and connect to the database
CREATE DATABASE cybersecurity_db;
\c cybersecurity_db

# 3. Execute the Master Schema
\i 'D:/DBMS Mini Project/database/schema.sql'

# 4. Run ALTER and DROP demonstration scripts
\i 'D:/DBMS Mini Project/database/ddl/02_alter_demonstration.sql'
\i 'D:/DBMS Mini Project/database/ddl/03_drop_demonstration.sql'
`

### Option B: MySQL 8.0 Execution
`ash
# Connect and execute the companion MySQL script
mysql -u root -p < 'D:/DBMS Mini Project/database/schema_mysql.sql'
`

### Verification Queries
`sql
-- List all generated tables
\dt

-- Inspect views
SELECT table_name FROM information_schema.views WHERE table_schema = 'public';

-- Inspect indexes
SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;
`

---
*Next Phase in Roadmap:* **Phase 3: Database Operations & Advanced Features (DML, Stored Functions, Triggers, Transactions, and Complex Analytical Queries).**
