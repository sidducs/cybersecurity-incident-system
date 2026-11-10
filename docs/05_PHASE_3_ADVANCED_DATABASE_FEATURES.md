# Phase 3: Advanced Database Features & Operations
**Course:** DBMS Experiential Learning – Level 3 (PES University)  
**Project:** Cybersecurity Incident Correlation & Response Intelligence System  
**Target RDBMS:** PostgreSQL 15+ (PL/pgSQL Procedural Engine with `pgvector`)  
**Rubric Reference:**  
- **DML operations (4 Marks)**  
- **Nested/correlated/Recursive Queries, Join SQL queries (4 Marks)**  
- **Advanced SQL concepts (Procedure/Function, trigger, CTE, Transactions) (6 Marks)**  
**Developer Handbook Reference:** Sections 16, 17, 18, 19, 20, 21, 33 (Steps 16–17)

---

## 1. Executive Summary & Objective

Phase 3 implements the active procedural and computational logic of the database tier. Rather than treating PostgreSQL merely as passive storage, this phase transforms the database into an active, self-governing computational engine that enforces:
1. **Automated Forensic Auditing**: Triggers record immutable transition milestones whenever incident statuses change.
2. **Quantitative Threat Risk Modeling**: Stored PL/pgSQL mathematical functions calculate multi-factor normalized risk scores (0–100) and discrete risk tiers.
3. **Atomic State Integrity**: ACID transactions encapsulate multi-table operational workflows (incident assignment, status transition, and audit logging) with guaranteed rollback on failure.
4. **Forensic & Operational Intelligence**: 14 analytical queries combine multi-table joins, conditional aggregations, correlated subqueries, and recursive common table expressions (CTE) to model real-world Security Operations Center (SOC) intelligence.

---

## 2. Data Manipulation Language (DML) Lifecycle (Component 6: 4 Marks)

File Reference: [`database/queries/04_dml_operations.sql`](file:///D:/DBMS%20Mini%20Project/database/queries/04_dml_operations.sql)  
Test Harness: [`test_dml_operations.py`](file:///D:/DBMS%20Mini%20Project/test_dml_operations.py)

The DML operations demonstrate the end-to-end operational lifecycle of an enterprise cybersecurity incident:

### 2.1 Entity Creation (`INSERT`)
```sql
-- Register newly detected zero-day security incident
INSERT INTO incidents (
    incident_id, title, description, incident_type_id, severity, priority, 
    status, asset_id, reported_by, assigned_to, reported_at, updated_at
) VALUES (
    16,
    'Zero-Day Remote Code Execution exploit detected on DMZ Gateway',
    'Automated Snort IDS identified abnormal heap spray and payload injection targeting Apache HTTP service on DMZ Reverse Proxy. Potential privilege compromise.',
    5, 'Critical', 'Critical', 'New', 4, 1, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- Record forensic investigation evidence
INSERT INTO investigations (investigation_id, incident_id, analyst_id, findings, started_at)
VALUES (9, 16, 2, 'Preliminary memory dump confirms reverse shell payload targeting port 4444.', CURRENT_TIMESTAMP);

-- Record active containment action
INSERT INTO response_actions (response_id, incident_id, action_type, description, performed_by, action_status, performed_at)
VALUES (11, 16, 'Firewall Rule Drop', 'Executed iptables perimeter block against IP 198.51.100.44.', 2, 'Completed', CURRENT_TIMESTAMP);
```

### 2.2 Analytical Retrieval (`SELECT`)
Multi-table projection filtering active threats ordered by severity priority:
```sql
SELECT 
    i.incident_id, i.title, t.type_name AS classification, i.severity, i.status,
    a.asset_name, a.criticality, u.full_name AS analyst_name, i.reported_at
FROM incidents i
JOIN incident_types t ON i.incident_type_id = t.incident_type_id
JOIN assets a ON i.asset_id = a.asset_id
LEFT JOIN users u ON i.assigned_to = u.user_id
WHERE i.status NOT IN ('Resolved', 'Closed')
ORDER BY 
    CASE i.severity
        WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 WHEN 'Low' THEN 4 ELSE 5
    END,
    i.reported_at DESC;
```

### 2.3 Operational State Modification (`UPDATE`)
Demonstrates triage assignment, priority escalation, and status resolution:
```sql
-- Analyst assignment and status progression
UPDATE incidents SET assigned_to = 2, status = 'Investigating', updated_at = CURRENT_TIMESTAMP WHERE incident_id = 16;

-- Forensic findings completion
UPDATE investigations SET findings = CONCAT(findings, ' UPDATE: Host isolated; zero lateral movement.'), completed_at = CURRENT_TIMESTAMP WHERE investigation_id = 9;

-- Status resolution (Automatically invokes trg_incident_status_change trigger to set resolved_at)
UPDATE incidents SET status = 'Resolved', updated_at = CURRENT_TIMESTAMP WHERE incident_id = 16;
```

### 2.4 Referential-Integrity-Safe Deletion (`DELETE`)
Demonstrates safe leaf-level deletion of draft records without cascading data loss:
```sql
DELETE FROM response_actions
WHERE response_id = 12 AND action_status = 'Pending';
```

---

## 3. Stored Functions: Quantitative Risk Engine (Component 8: 6 Marks)

File Reference: [`database/functions/01_calculate_incident_risk.sql`](file:///D:/DBMS%20Mini%20Project/database/functions/01_calculate_incident_risk.sql)  
Test Harness: [`test_stored_functions.py`](file:///D:/DBMS%20Mini%20Project/test_stored_functions.py)

The system deploys three procedural PL/pgSQL functions that centralize risk modeling inside the database engine.

### 3.1 Mathematical Scoring Model
The composite risk score $R \in [0, 100]$ is computed using a weighted multi-factor formula:
$$R = 0.40 \cdot S_{\text{severity}} + 0.35 \cdot C_{\text{asset}} + 0.25 \cdot I_{\text{impact}}$$

Where:
- $S_{\text{severity}} \in \{100, 75, 50, 25\}$ for Critical, High, Medium, Low.
- $C_{\text{asset}} \in \{100, 75, 50, 25\}$ for Critical, High, Medium, Low.
- $I_{\text{impact}} \in [0, 100]$ represents the analyst-quantified business operational impact.

### 3.2 PL/pgSQL Implementation
```sql
CREATE OR REPLACE FUNCTION calculate_incident_risk(
    p_severity VARCHAR(20),
    p_asset_criticality VARCHAR(20),
    p_impact_score DECIMAL(5, 2)
)
RETURNS DECIMAL(5, 2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_sev_weight DECIMAL(5,2);
    v_ast_weight DECIMAL(5,2);
    v_final_risk DECIMAL(5,2);
BEGIN
    v_sev_weight := CASE LOWER(p_severity)
        WHEN 'critical' THEN 100.0 WHEN 'high' THEN 75.0 WHEN 'medium' THEN 50.0 WHEN 'low' THEN 25.0 ELSE 25.0 END;
    v_ast_weight := CASE LOWER(p_asset_criticality)
        WHEN 'critical' THEN 100.0 WHEN 'high' THEN 75.0 WHEN 'medium' THEN 50.0 WHEN 'low' THEN 25.0 ELSE 25.0 END;
    
    v_final_risk := (v_sev_weight * 0.40) + (v_ast_weight * 0.35) + (LEAST(GREATEST(p_impact_score, 0.0), 100.0) * 0.25);
    RETURN ROUND(v_final_risk, 2);
END;
$$;
```

### 3.3 Categorical Tier Mapping Function
```sql
CREATE OR REPLACE FUNCTION get_risk_level(p_risk_score DECIMAL(5, 2))
RETURNS VARCHAR(20)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF p_risk_score >= 76.00 THEN RETURN 'CRITICAL';
    ELSIF p_risk_score >= 51.00 THEN RETURN 'HIGH';
    ELSIF p_risk_score >= 26.00 THEN RETURN 'MEDIUM';
    ELSE RETURN 'LOW';
    END IF;
END;
$$;
```

### 3.4 Verification Output
| Test Case | Severity | Asset Criticality | Impact | Computed Risk Score | Categorical Level | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Case 1** | Critical | Critical | 95.00 | **98.75** | **CRITICAL** | PASS |
| **Case 2** | High | High | 60.00 | **71.25** | **HIGH** | PASS |
| **Case 3** | Medium | Medium | 40.00 | **47.50** | **MEDIUM** | PASS |
| **Case 4** | Low | Low | 10.00 | **21.25** | **LOW** | PASS |

---

## 4. Database Trigger: Forensic Status Tracking (Component 8: 6 Marks)

File Reference: [`database/triggers/02_incident_status_trigger.sql`](file:///D:/DBMS%20Mini%20Project/database/triggers/02_incident_status_trigger.sql)  
Test Harness: [`test_trigger.py`](file:///D:/DBMS%20Mini%20Project/test_trigger.py)

### 4.1 Trigger Architecture
Whenever an incident's `status` attribute changes, the `trg_incident_status_change` trigger executes **automatically before the update commits**:
1. Inserts an immutable row into `incident_status_history` logging `(old_status, new_status, changed_by, changed_at, remarks)`.
2. Inserts an entry into `audit_logs` logging the security event.
3. Automatically sets `resolved_at = CURRENT_TIMESTAMP` if transitioning to `'Resolved'`.
4. Automatically resets `resolved_at = NULL` if an incident is subsequently reopened.

```mermaid
flowchart TD
    A["Application issues UPDATE incidents SET status = 'Resolved'"] --> B["PostgreSQL BEFORE UPDATE Trigger Fires"]
    B --> C["fn_log_incident_status_transition()"]
    C --> D["Manage resolved_at timestamp in NEW record"]
    C --> E["INSERT into incident_status_history"]
    C --> F["INSERT into audit_logs"]
    E & F --> G["Commit changes atomically"]
```

### 4.2 PL/pgSQL Trigger Code
```sql
CREATE OR REPLACE FUNCTION fn_log_incident_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Auto-manage resolution timestamp
        IF NEW.status = 'Resolved' AND OLD.status != 'Resolved' THEN
            NEW.resolved_at := CURRENT_TIMESTAMP;
        ELSIF NEW.status != 'Resolved' AND OLD.status = 'Resolved' THEN
            NEW.resolved_at := NULL;
        END IF;

        -- Record forensic history
        INSERT INTO incident_status_history (
            incident_id, old_status, new_status, changed_by, changed_at, remarks
        ) VALUES (
            NEW.incident_id, OLD.status, NEW.status, NEW.assigned_to, CURRENT_TIMESTAMP,
            CONCAT('Automated transition: ', OLD.status, ' -> ', NEW.status)
        );

        -- Record security audit event
        INSERT INTO audit_logs (
            user_id, incident_id, action, description, created_at
        ) VALUES (
            COALESCE(NEW.assigned_to, NEW.reported_by),
            NEW.incident_id,
            'STATUS_CHANGE',
            CONCAT('Incident status updated from ', OLD.status, ' to ', NEW.status),
            CURRENT_TIMESTAMP
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_incident_status_change
    BEFORE UPDATE OF status ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION fn_log_incident_status_transition();
```

---

## 5. ACID Transactions: Incident Assignment (Component 8: 6 Marks)

File Reference: [`database/transactions/03_incident_assignment_transaction.sql`](file:///D:/DBMS%20Mini%20Project/database/transactions/03_incident_assignment_transaction.sql)  
Test Harness: [`test_transactions.py`](file:///D:/DBMS%20Mini%20Project/test_transactions.py)

### 5.1 Stored Procedure: `sp_assign_incident_atomic`
In a 24/7 Security Operations Center, assigning an incident must be an all-or-nothing atomic unit of work. If an analyst is assigned but the audit record fails to write, or if an invalid user is referenced, the entire state must roll back.

```sql
CREATE OR REPLACE PROCEDURE sp_assign_incident_atomic(
    p_incident_id INT,
    p_analyst_id  INT,
    p_admin_id    INT,
    p_notes       TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_role_name VARCHAR(50);
    v_is_active BOOLEAN;
BEGIN
    -- 1. Validate Incident Existence
    PERFORM 1 FROM incidents WHERE incident_id = p_incident_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Incident ID % does not exist.', p_incident_id; END IF;

    -- 2. Validate Analyst Role and Active Status
    SELECT r.role_name, u.is_active INTO v_role_name, v_is_active
    FROM users u JOIN roles r ON u.role_id = r.role_id
    WHERE u.user_id = p_analyst_id;

    IF NOT FOUND THEN RAISE EXCEPTION 'Analyst User ID % does not exist.', p_analyst_id; END IF;
    IF v_role_name != 'Security Analyst' THEN RAISE EXCEPTION 'User % is not a Security Analyst.', p_analyst_id; END IF;
    IF NOT v_is_active THEN RAISE EXCEPTION 'Analyst User % is deactivated.', p_analyst_id; END IF;

    -- 3. Atomic Assignment & Triage State Transition
    UPDATE incidents
    SET assigned_to = p_analyst_id,
        status = CASE WHEN status = 'New' THEN 'Investigating' ELSE status END,
        updated_at = CURRENT_TIMESTAMP
    WHERE incident_id = p_incident_id;

    -- 4. Mandatory Audit Trail
    INSERT INTO audit_logs (user_id, incident_id, action, description, created_at)
    VALUES (p_admin_id, p_incident_id, 'INCIDENT_ASSIGNMENT', CONCAT('Assigned to Analyst #', p_analyst_id, '. Notes: ', p_notes), CURRENT_TIMESTAMP);
END;
$$;
```

### 5.2 Transaction Atomicity Verification
| Scenario | Action Executed | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Commit Scenario** | Assign Incident #5 to Analyst #2 by Admin #1 | Status changes to `'Investigating'`, `assigned_to = 2`, audit log created | Incident updated, audit record #8 created | **PASS [OK]** |
| **Rollback Scenario** | Assign Incident #5 to Non-Existent User #9999 | Procedure aborts, raises exception, rolls back uncommitted changes | Exception caught, zero changes persisted | **PASS [OK]** |
| **Raw SQL Rollback** | Update Incident #12, then intentionally violate FK in `audit_logs` | Transaction aborts, manual `ROLLBACK` restores original incident state | Incident #12 remained `status='New', assigned_to=NULL` | **PASS [OK]** |

---

## 6. Complex Analytical Queries (Component 7: 4 Marks)

File Reference: [`database/queries/05_complex_analytical_queries.sql`](file:///D:/DBMS%20Mini%20Project/database/queries/05_complex_analytical_queries.sql)  
Test Harness: [`test_complex_queries.py`](file:///D:/DBMS%20Mini%20Project/test_complex_queries.py)

### Query Catalog & Verified PostgreSQL Outputs

#### Q01: Incident Distribution by Classification Type
- **Techniques**: `GROUP BY`, `COUNT`, Subquery Ratio Calculation, `ORDER BY DESC`
- **Output**:
```
     incident_type     | total_incidents | percentage_of_total 
-----------------------+-----------------+---------------------
 Phishing Campaign     |               3 |               18.75
 Privilege Escalation  |               3 |               18.75
 Data Exfiltration     |               2 |               12.50
 SQL Injection         |               2 |               12.50
 DDoS Volumetric       |               2 |               12.50
 Brute Force Auth      |               2 |               12.50
 Ransomware            |               1 |                6.25
 Zero-Day Exploit      |               1 |                6.25
```

#### Q02: Threat Severity Breakdown and Risk Exposure
- **Techniques**: `GROUP BY`, `COUNT`, `AVG`, `MIN`, `MAX`, Custom `CASE` Ordering
- **Output**:
```
 severity | incident_count | average_risk_score |    earliest_incident    |     latest_incident     
----------+----------------+--------------------+-------------------------+-------------------------
 Critical |              6 |              75.92 | 2026-02-01 02:15:00+05  | 2026-11-10 13:52:57+05
 High     |              4 |              70.38 | 2026-02-02 09:10:00+05  | 2026-02-13 13:20:00+05
 Medium   |              4 |              45.00 | 2026-02-07 11:00:00+05  | 2026-02-15 15:40:00+05
 Low      |              2 |              18.50 | 2026-02-10 09:00:00+05  | 2026-02-14 11:10:00+05
```

#### Q03: Analysts Handling Multiple High-Severity / Critical Incidents
- **Techniques**: Inner `JOIN`, `WHERE IN`, `GROUP BY`, `HAVING COUNT() >= 2`
- **Output**:
```
 user_id | analyst_name |         email          | high_critical_count 
---------+--------------+------------------------+---------------------
       2 | Alex Rivera  | alex.rivera@soc.corp   |                   4
       3 | David Chen   | david.chen@soc.corp    |                   2
       4 | Maya Lin     | maya.lin@soc.corp      |                   2
```

#### Q04: Mean Turnaround / Resolution Time by Security Analyst (Hours)
- **Techniques**: `JOIN`, `EXTRACT(EPOCH)`, `AVG`, `GROUP BY`, `ORDER BY ASC`
- **Output**:
```
 user_id | analyst_name | resolved_incidents_count | avg_resolution_time_hours 
---------+--------------+--------------------------+---------------------------
       5 | Vikram Rao   |                        2 |                      1.50
       3 | David Chen   |                        2 |                      3.00
       4 | Maya Lin     |                        1 |                      4.25
       2 | Alex Rivera  |                        2 |                   3346.60
```

#### Q05: High-Performing Analysts Exceeding Departmental Resolution Average
- **Techniques**: Scalar Subquery inside `HAVING` clause comparing against aggregate department average
- **Output**:
```
 user_id | analyst_name | resolved_count 
---------+--------------+----------------
       2 | Alex Rivera  |              2
       3 | David Chen   |              2
       5 | Vikram Rao   |              2
```

#### Q06: High-Frequency Targeted Assets (Attack Hotspots)
- **Techniques**: Multi-Table `JOIN`, `GROUP BY`, `HAVING COUNT() >= 2`
- **Output**:
```
 asset_id |    asset_name    |  ip_address   | criticality |    department     | attack_frequency 
----------+------------------+---------------+-------------+-------------------+------------------
        4 | EDGE-FIREWALL-HQ | 192.168.1.1   | Critical    | IT Infrastructure |                4
        9 | MAIL-EXCHANGE-01 | 10.0.1.30     | High        | IT Infrastructure |                2
        5 | HR-PORTAL-WEB    | 10.0.4.12     | High        | Human Resources   |                2
        2 | AUTH-SRV-CORE    | 10.0.1.15     | Critical    | Security Operations|                2
        1 | PROD-DB-CLUSTER-01| 10.0.2.10    | Critical    | Engineering       |                2
```

#### Q07: Unresolved Critical Incidents Requiring Immediate Executive Action
- **Techniques**: 3-Table `JOIN`, Multi-Condition `WHERE`, `ORDER BY risk_score DESC`
- **Output**:
```
 incident_id |                             title                              |    attack_vector     | severity |    status     | risk_score |  targeted_system  | asset_criticality | assigned_analyst 
-------------+----------------------------------------------------------------+----------------------+----------+---------------+------------+-------------------+-------------------+------------------
           5 | Unauthorized sudo root privilege escalation on AUTH-SRV-CORE   | Privilege Escalation | Critical | Investigating |      92.00 | AUTH-SRV-CORE     | Critical          | Alex Rivera
           6 | Suspicious 120GB egress transfer to offshore IP from DataLake  | Data Exfiltration    | Critical | Contained     |      91.50 | ANALYTICS-DATALAKE| Critical          | Elena Rostova
           9 | Zero-Day remote code execution attempt on MAIL-EXCHANGE-01     | Zero-Day Exploit     | Critical | Investigating |      89.00 | MAIL-EXCHANGE-01  | High              | Alex Rivera
```

#### Q08: End-to-End Forensic Incident Lifecycle Audit History
- **Techniques**: 3-Table `JOIN`, `COALESCE`, Ordered Chronological Event Reconstruction
- **Output**: Reconstructs complete forensic history across status changes (15 recorded transitions).

#### Q09: Comprehensive SOC Analyst Performance & Triage Matrix
- **Techniques**: Conditional Aggregations (`CASE WHEN`), `SUM`, `COUNT`, Percentage Calculation
- **Output**:
```
 user_id | analyst_name  | total_assigned | in_triage_count | contained_count | resolved_count | critical_handled | resolution_rate 
---------+---------------+----------------+-----------------+-----------------+----------------+------------------+-----------------
       2 | Alex Rivera   |              4 |               2 |               0 |              2 |                4 |           50.00%
       3 | David Chen    |              4 |               2 |               0 |              2 |                0 |           50.00%
       5 | Vikram Rao    |              2 |               0 |               0 |              2 |                0 |          100.00%
       4 | Maya Lin      |              2 |               0 |               1 |              1 |                1 |           50.00%
       6 | Elena Rostova |              2 |               1 |               1 |              0 |                1 |            0.00%
```

#### Q10: Top Vulnerable IT Assets Ranked by Aggregate Threat Exposure
- **Techniques**: `LEFT JOIN`, `GROUP BY`, `SUM`, `AVG`, `LIMIT 5`
- **Output**:
```
 asset_id |     asset_name     | asset_type | criticality | total_incidents | avg_risk | cumulative_risk_burden 
----------+--------------------+------------+-------------+-----------------+----------+------------------------
        1 | PROD-DB-CLUSTER-01 | Database   | Critical    |               2 |    80.00 |                 160.00
        4 | EDGE-FIREWALL-HQ   | Firewall   | Critical    |               4 |    34.75 |                 139.00
        2 | AUTH-SRV-CORE      | Server     | Critical    |               2 |    68.50 |                 137.00
       10 | ANALYTICS-DATALAKE | Cloud Storage| Critical  |               1 |    91.50 |                  91.50
        9 | MAIL-EXCHANGE-01   | Server     | High        |               2 |    44.50 |                  89.00
```

#### Q11: Unassigned Incident Backlog Requiring Immediate Triage Allocation
- **Techniques**: `LEFT JOIN`, `IS NULL` Check, `EXTRACT(EPOCH)` Elapsed SLA Tracking
- **Output**:
```
 incident_id |                             title                             |    type_name      | severity | status | unassigned_elapsed_hours 
-------------+---------------------------------------------------------------+-------------------+----------+--------+--------------------------
          12 | Suspicious phishing report from Sales team regarding upgrade | Phishing Campaign | Medium   | New    |                   6509.4
```

#### Q12: Complex Security Incidents Requiring Multi-Stage Response Operations
- **Techniques**: `JOIN`, `GROUP BY`, `HAVING COUNT() >= 2`, `STRING_AGG`
- **Output**:
```
 incident_id |                        incident_title                        | severity | containment_actions |      response_actions_executed       
-------------+--------------------------------------------------------------+----------+---------------------+-------------------------------------
           1 | Ransomware encryption detected on PROD-DB-CLUSTER-01         | Critical |                   2 | Network Isolation, Snapshot Recovery
           3 | Blind SQL Injection detected on Payment API endpoint         | Critical |                   2 | Code Patch, WAF Rule Deployment
```

#### Q13: Correlated Subquery: Outlier Incidents Exceeding Category Baseline
- **Techniques**: Correlated Subquery referencing outer query `i1.incident_type_id`
```sql
SELECT 
    i1.incident_id, i1.title, t.type_name AS attack_category, i1.severity, i1.risk_score,
    ROUND((SELECT AVG(i2.risk_score) FROM incidents i2 WHERE i2.incident_type_id = i1.incident_type_id), 2) AS category_average_risk,
    ROUND(i1.risk_score - (SELECT AVG(i2.risk_score) FROM incidents i2 WHERE i2.incident_type_id = i1.incident_type_id), 2) AS risk_deviation_above_mean
FROM incidents i1
JOIN incident_types t ON i1.incident_type_id = t.incident_type_id
WHERE i1.risk_score > (
    SELECT AVG(i2.risk_score) FROM incidents i2 WHERE i2.incident_type_id = i1.incident_type_id
)
ORDER BY risk_deviation_above_mean DESC;
```
- **Output**: Isolates 8 incidents with severe risk divergence (+44.00 for Unauthorized Sudo Escalation, +33.00 for Blind SQLi on Payment API).

#### Q14: Recursive Common Table Expression (CTE): Organizational SOC Escalation Hierarchy
- **Techniques**: `WITH RECURSIVE`, Base Anchor Member (`reports_to IS NULL`), Recursive Member Join, Path Concatenation
```sql
WITH RECURSIVE soc_hierarchy AS (
    -- Anchor Member: Root SOC Manager / Administrator
    SELECT 
        u.user_id, u.full_name, r.role_name, u.reports_to,
        1 AS tier_level, CAST(u.full_name AS VARCHAR(500)) AS escalation_path
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    WHERE u.reports_to IS NULL

    UNION ALL

    -- Recursive Member: Subordinate Analysts reporting upward
    SELECT 
        sub.user_id, sub.full_name, r.role_name, sub.reports_to,
        mgr.tier_level + 1 AS tier_level,
        CAST(mgr.escalation_path || ' -> ' || sub.full_name AS VARCHAR(500)) AS escalation_path
    FROM users sub
    JOIN roles r ON sub.role_id = r.role_id
    JOIN soc_hierarchy mgr ON sub.reports_to = mgr.user_id
)
SELECT tier_level, user_id, full_name AS staff_member, role_name, escalation_path AS reporting_escalation_chain
FROM soc_hierarchy
ORDER BY tier_level ASC, user_id ASC;
```
- **Output**:
```
 tier_level | user_id |  staff_member  |    role_name     |             reporting_escalation_chain              
------------+---------+----------------+------------------+---------------------------------------------------
          1 |       1 | Sarah Connor   | Administrator    | Sarah Connor
          2 |       2 | Alex Rivera    | Security Analyst | Sarah Connor -> Alex Rivera
          2 |       3 | David Chen     | Security Analyst | Sarah Connor -> David Chen
          3 |       4 | Maya Lin       | Security Analyst | Sarah Connor -> Alex Rivera -> Maya Lin
          3 |       5 | Vikram Rao     | Security Analyst | Sarah Connor -> Alex Rivera -> Vikram Rao
          3 |       6 | Elena Rostova  | Security Analyst | Sarah Connor -> David Chen -> Elena Rostova
```

---

## 7. Phase 3 Rubric Alignment & Verification Matrix

| Evaluation Rubric Item | Handbook Section | Script / File Implemented | Verification Evidence | Marks |
| :--- | :--- | :--- | :--- | :--- |
| **DML operations** | Section 16, 37 | `database/queries/04_dml_operations.sql` | `test_dml_operations.py` executes INSERT, UPDATE, SELECT, DELETE lifecycle with trigger activation | **4 / 4** |
| **Nested, Correlated, Recursive & Join SQL queries** | Section 16 | `database/queries/05_complex_analytical_queries.sql` | `test_complex_queries.py` executed Q01 to Q14 with 100% pass rate across inner/left joins, aggregates, correlated subqueries, and recursive CTE | **4 / 4** |
| **Advanced SQL concepts (Procedure, Function, Trigger, CTE)** | Section 17, 18, 19, 20 | `database/functions/01_calculate_incident_risk.sql`<br>`database/triggers/02_incident_status_trigger.sql`<br>`database/transactions/03_incident_assignment_transaction.sql` | `test_stored_functions.py`<br>`test_trigger.py`<br>`test_transactions.py` | **6 / 6** |
| **Total Marks Claimed (Phase 3)** | | | | **14 / 14** |

