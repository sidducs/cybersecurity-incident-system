
-- ============================================================================
-- RUBRIC 1 & 2: ER Diagram (2 Marks) & Relational Schema (3 Marks)
-- ============================================================================
-- Show all 11 normalized relational tables in the database:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Show Primary Keys, Foreign Keys, and Referential Constraints:
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;


-- ============================================================================
-- RUBRIC 3: SQL Database Implementation - DDL with Constraints (4 Marks)
-- ============================================================================
-- Show Check Constraints, Enum validations, and RegEx rules on all tables:
SELECT 
    conname AS constraint_name, 
    contype AS type, 
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE n.nspname = 'public' AND c.contype = 'c'
ORDER BY conname;


-- ============================================================================
-- RUBRIC 4: NoSQL / Vector Database Creation (4 Marks)
-- ============================================================================
-- 1. Show pgvector extension installed:
SELECT extname, extversion 
FROM pg_extension 
WHERE extname = 'vector';

-- 2. Show the vector column (384-dimensional dense embeddings):
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'incident_embeddings';

-- 3. Show the HNSW (Hierarchical Navigable Small World) index for fast search:
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'incident_embeddings';


-- ============================================================================
-- RUBRIC 5: Technology Justification (1 Mark)
-- ============================================================================
-- EXPLAIN THIS TO TEACHER:
-- "We chose PostgreSQL with pgvector instead of a separate vector DB (like Pinecone)
-- because keeping relational data and vectors in the same DB avoids the dual-database 
-- sync problem, supports unified ACID transactions, and allows Hybrid Search in one SQL query."


-- ============================================================================
-- RUBRIC 6: DML Operations (INSERT, SELECT, UPDATE, DELETE) (4 Marks)
-- ============================================================================
-- 1. INSERT:
INSERT INTO response_actions (investigation_id, action_type, description, assigned_to, status, scheduled_at)
VALUES (1, 'Firewall Block', 'Block malicious Command and Control IP 198.51.100.45', 2, 'Pending', CURRENT_TIMESTAMP);

-- 2. SELECT:
SELECT action_id, action_type, description, status 
FROM response_actions 
WHERE description LIKE '%198.51.100.45%';

-- 3. UPDATE:
UPDATE response_actions 
SET status = 'Completed', execution_notes = 'IP successfully blocked on perimeter firewalls.'
WHERE description LIKE '%198.51.100.45%';

-- 4. DELETE:
DELETE FROM response_actions 
WHERE description LIKE '%198.51.100.45%';


-- ============================================================================
-- RUBRIC 7: Nested / Correlated / Recursive Queries & Joins (4 Marks)
-- ============================================================================
-- 1. Multi-Table JOIN (Incidents + Assets + Users + Roles):
SELECT 
    i.incident_id, 
    LEFT(i.title, 35) AS title, 
    i.severity, 
    a.asset_name, 
    a.criticality AS asset_criticality,
    u.full_name AS analyst_name,
    r.role_name
FROM incidents i
JOIN assets a ON i.asset_id = a.asset_id
JOIN users u ON i.assigned_to = u.user_id
JOIN roles r ON u.role_id = r.role_id
ORDER BY i.incident_id
LIMIT 5;

-- 2. Correlated Subquery (Incidents with risk higher than the average of their category):
SELECT 
    i1.incident_id, 
    LEFT(i1.title, 35) AS title, 
    i1.category, 
    i1.risk_score
FROM incidents i1
WHERE i1.risk_score > (
    SELECT AVG(i2.risk_score)
    FROM incidents i2
    WHERE i2.category = i1.category
)
ORDER BY i1.category, i1.risk_score DESC;

-- 3. Recursive CTE (Q14: Organizational Reporting Hierarchy):
WITH RECURSIVE soc_hierarchy AS (
    SELECT 
        u.user_id, u.full_name, r.role_name, u.reports_to, 1 AS tier_level,
        CAST(u.full_name AS VARCHAR(500)) AS escalation_path
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    WHERE u.reports_to IS NULL
    UNION ALL
    SELECT 
        u.user_id, u.full_name, r.role_name, u.reports_to, h.tier_level + 1,
        CAST(h.escalation_path || ' -> ' || u.full_name AS VARCHAR(500))
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    JOIN soc_hierarchy h ON u.reports_to = h.user_id
)
SELECT user_id, full_name, role_name, tier_level, escalation_path
FROM soc_hierarchy
ORDER BY tier_level, user_id;


-- ============================================================================
-- RUBRIC 8: Advanced SQL Concepts (Function, Trigger, CTE) (6 Marks)
-- ============================================================================
-- 1. Stored Function Execution (Mathematical Risk Engine):
SELECT calculate_incident_risk('Critical'::varchar, 'Critical'::varchar, 85.0) AS computed_risk_score;

-- 2. Database Trigger Execution (Automatic Lifecycle Audit Trail):
-- Step A: Trigger fires automatically on UPDATE of status:
UPDATE incidents SET status = 'Investigating' WHERE incident_id = 1;

-- Step B: Verify the trigger inserted the audit row without any manual insert:
SELECT history_id, incident_id, old_status, new_status, remarks, changed_at 
FROM incident_status_history 
WHERE incident_id = 1 
ORDER BY history_id DESC 
LIMIT 1;

-- Step C: Reset status back to Resolved:
UPDATE incidents SET status = 'Resolved' WHERE incident_id = 1;

-- 3. Common Table Expression (CTE: Threat Severity Summary):
WITH severity_breakdown AS (
    SELECT severity, COUNT(*) AS count, AVG(risk_score) AS avg_risk
    FROM incidents
    GROUP BY severity
)
SELECT severity, count, ROUND(avg_risk::numeric, 2) AS avg_risk
FROM severity_breakdown
ORDER BY avg_risk DESC;


-- ============================================================================
-- RUBRIC 9: NoSQL / Vector Feature & Vector CRUD (7 Marks)
-- ============================================================================
-- 1. Vector Search Query (Cosine Distance <=> with Top-K Ranking):
SELECT 
    i.incident_id, 
    LEFT(i.title, 40) AS title, 
    i.severity, 
    ROUND((1 - (ie.embedding <=> (SELECT embedding FROM incident_embeddings WHERE incident_id = 1)))::numeric * 100, 2) AS similarity_pct
FROM incidents i
JOIN incident_embeddings ie ON i.incident_id = ie.incident_id
WHERE i.incident_id != 1
ORDER BY ie.embedding <=> (SELECT embedding FROM incident_embeddings WHERE incident_id = 1)
LIMIT 3;

-- 2. Vector Hybrid Search (Vector Cosine Distance + Relational SQL Filter):
SELECT 
    i.incident_id, 
    LEFT(i.title, 40) AS title, 
    i.severity, 
    i.status
FROM incidents i
JOIN incident_embeddings ie ON i.incident_id = ie.incident_id
WHERE i.severity IN ('Critical', 'High')  -- Relational Filter
ORDER BY ie.embedding <=> (SELECT embedding FROM incident_embeddings WHERE incident_id = 1)  -- Vector Distance
LIMIT 3;


-- ============================================================================
-- RUBRIC 10, 11 & 12: RBAC & User Authentication (4 Marks)
-- ============================================================================
-- Show Dual Roles and Seeded Accounts in Database:
SELECT 
    u.user_id, 
    u.username, 
    u.full_name, 
    u.email, 
    r.role_name, 
    u.is_active
FROM users u
JOIN roles r ON u.role_id = r.role_id
ORDER BY u.role_id, u.user_id;

