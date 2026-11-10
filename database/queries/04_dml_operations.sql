-- ============================================================================
-- DBMS EXPERIENTIAL LEARNING LEVEL 3 PROJECT
-- PROJECT: Cybersecurity Incident Correlation & Response Intelligence System
-- PHASE 3: DATABASE OPERATIONS - DATA MANIPULATION LANGUAGE (DML)
-- TARGET RDBMS: PostgreSQL 14+ / MySQL 8.0+
-- ============================================================================
-- Rubric Reference: Component 6 (DML Operations - 4 Marks)
-- Developer Handbook Reference: Section 16 & Section 37
-- ============================================================================
-- This script contains verified DML operations demonstrating the complete
-- lifecycle of SOC cybersecurity incident management:
--   1. INSERT: Registering new incidents, response actions, and notes.
--   2. SELECT: Analytical retrieval with projections, WHERE clauses, and ORDER BY.
--   3. UPDATE: Triage, severity escalation, and status transitions (activating triggers).
--   4. DELETE: Safe referential-integrity-aware removal of test/draft records.
-- ============================================================================

\c cybersecurity_db;

-- ----------------------------------------------------------------------------
-- 1. INSERT OPERATIONS
-- Demonstrating primary and dependent entity creation with constraint checks.
-- ----------------------------------------------------------------------------

-- 1.1 Insert a newly detected security incident into `incidents`
INSERT INTO incidents (
    incident_id,
    title,
    description,
    incident_type_id,
    severity,
    priority,
    status,
    asset_id,
    reported_by,
    assigned_to,
    reported_at,
    updated_at
) VALUES (
    16,
    'Zero-Day Remote Code Execution exploit detected on DMZ Gateway',
    'Automated Snort IDS identified abnormal heap spray and payload injection targeting Apache HTTP service on DMZ Reverse Proxy. Potential privilege compromise.',
    5, -- Unauthorized Access
    'Critical',
    'Critical',
    'New',
    4, -- NGW-DMZ-01
    1, -- Reported by Alice Chen (Admin)
    NULL, -- Initially Unassigned
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 1.2 Insert an initial investigation finding for the incident
INSERT INTO investigations (
    investigation_id,
    incident_id,
    analyst_id,
    findings,
    started_at
) VALUES (
    9,
    16,
    2, -- Sarah Connor (Security Analyst)
    'Preliminary memory dump analysis confirms reverse shell payload targeting port 4444. Source IP 198.51.100.44 traced to known malicious Tor exit node.',
    CURRENT_TIMESTAMP
);

-- 1.3 Insert an active containment response action
INSERT INTO response_actions (
    response_id,
    incident_id,
    action_type,
    description,
    performed_by,
    action_status,
    performed_at
) VALUES (
    11,
    16,
    'Firewall Rule Drop',
    'Executed iptables perimeter block against IP 198.51.100.44 and severed external port 4444 on DMZ-GW-01 router.',
    2,
    'Completed',
    CURRENT_TIMESTAMP
);


-- ----------------------------------------------------------------------------
-- 2. SELECT OPERATIONS
-- Demonstrating projections, multi-condition filtering, and ordered listings.
-- ----------------------------------------------------------------------------

-- 2.1 Retrieve all active and unresolved incidents with severity ordering
SELECT 
    i.incident_id,
    i.title,
    t.type_name AS classification,
    i.severity,
    i.status,
    a.asset_name,
    a.criticality,
    u.full_name AS analyst_name,
    i.reported_at
FROM incidents i
JOIN incident_types t ON i.incident_type_id = t.incident_type_id
JOIN assets a ON i.asset_id = a.asset_id
LEFT JOIN users u ON i.assigned_to = u.user_id
WHERE i.status NOT IN ('Resolved', 'Closed')
ORDER BY 
    CASE i.severity
        WHEN 'Critical' THEN 1
        WHEN 'High'     THEN 2
        WHEN 'Medium'   THEN 3
        WHEN 'Low'      THEN 4
        ELSE 5
    END,
    i.reported_at DESC;

-- 2.2 Projections of high-criticality assets currently under threat
SELECT 
    asset_id,
    asset_name,
    ip_address,
    criticality,
    department
FROM assets
WHERE criticality = 'High'
  AND is_active = TRUE
ORDER BY asset_name ASC;


-- ----------------------------------------------------------------------------
-- 3. UPDATE OPERATIONS
-- Demonstrating field updates, timestamp tracking, and triggering business logic.
-- ----------------------------------------------------------------------------

-- 3.1 Assign the new incident and update its status to 'Investigating'
-- Note: This automatically invokes the `trg_incident_status_change` trigger
-- which logs the change to `incident_status_history` and `audit_logs`!
UPDATE incidents
SET 
    assigned_to = 2,
    status = 'Investigating',
    updated_at = CURRENT_TIMESTAMP
WHERE incident_id = 16;

-- 3.2 Escalate severity and update investigation findings
UPDATE incidents
SET 
    severity = 'Critical',
    priority = 'Critical',
    updated_at = CURRENT_TIMESTAMP
WHERE incident_id = 16;

UPDATE investigations
SET 
    findings = CONCAT(findings, ' UPDATE: Host isolated from internal VLAN. Zero lateral movement observed.'),
    completed_at = CURRENT_TIMESTAMP
WHERE investigation_id = 9;

-- 3.3 Mark incident as 'Resolved'
-- The trigger will automatically record resolved_at = CURRENT_TIMESTAMP
UPDATE incidents
SET 
    status = 'Resolved',
    updated_at = CURRENT_TIMESTAMP
WHERE incident_id = 16;


-- ----------------------------------------------------------------------------
-- 4. DELETE OPERATIONS
-- Demonstrating safe data cleanup adhering to Foreign Key constraints.
-- ----------------------------------------------------------------------------

-- 4.1 Create a temporary/pending response action to demonstrate safe deletion
INSERT INTO response_actions (
    response_id,
    incident_id,
    action_type,
    description,
    performed_by,
    action_status,
    performed_at
) VALUES (
    12,
    16,
    'Honeypot Probe',
    'Proposed honeypot deployment for threat actor surveillance (Temporary probe).',
    2,
    'Pending',
    CURRENT_TIMESTAMP
);

-- 4.2 Delete the pending response action (Leaf record in referential hierarchy)
DELETE FROM response_actions
WHERE response_id = 12
  AND action_status = 'Pending';

-- Verification of deletion
SELECT COUNT(*) AS pending_actions_remaining
FROM response_actions
WHERE response_id = 12;
