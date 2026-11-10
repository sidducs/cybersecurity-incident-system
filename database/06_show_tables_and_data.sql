-- ============================================================================
-- DBMS EXPERIENTIAL LEARNING LEVEL 3 PROJECT
-- PROJECT: Cybersecurity Incident Correlation & Response Intelligence System
-- VIVA DEMONSTRATION SCRIPT: TABLE DESCRIPTIONS & DUMMY VALUE INSPECTION
-- TARGET RDBMS: MySQL 8.0+
-- ============================================================================

USE cybersecurity_db;

-- ============================================================================
-- 1. ROLES
-- ============================================================================
SELECT '==================== 1. TABLE: roles ====================' AS section;
DESC roles;
SELECT * FROM roles;

-- ============================================================================
-- 2. USERS
-- ============================================================================
SELECT '==================== 2. TABLE: users ====================' AS section;
DESC users;
SELECT user_id, role_id, full_name, email, is_active, created_at FROM users;

-- ============================================================================
-- 3. ASSETS
-- ============================================================================
SELECT '==================== 3. TABLE: assets ====================' AS section;
DESC assets;
SELECT asset_id, asset_name, asset_type, criticality, ip_address, department, is_active FROM assets;

-- ============================================================================
-- 4. INCIDENT_TYPES
-- ============================================================================
SELECT '==================== 4. TABLE: incident_types ====================' AS section;
DESC incident_types;
SELECT * FROM incident_types;

-- ============================================================================
-- 5. INCIDENTS (Central Operational Entity)
-- ============================================================================
SELECT '==================== 5. TABLE: incidents ====================' AS section;
DESC incidents;
SELECT incident_id, incident_type_id, reported_by, assigned_to, asset_id, title, severity, status, priority, risk_score, reported_at FROM incidents;

-- ============================================================================
-- 6. INVESTIGATIONS
-- ============================================================================
SELECT '==================== 6. TABLE: investigations ====================' AS section;
DESC investigations;
SELECT investigation_id, incident_id, analyst_id, LEFT(findings, 60) AS findings_snippet, started_at, completed_at FROM investigations;

-- ============================================================================
-- 7. RESPONSE_ACTIONS
-- ============================================================================
SELECT '==================== 7. TABLE: response_actions ====================' AS section;
DESC response_actions;
SELECT response_id, incident_id, performed_by, action_type, action_status, performed_at FROM response_actions;

-- ============================================================================
-- 8. INCIDENT_STATUS_HISTORY
-- ============================================================================
SELECT '==================== 8. TABLE: incident_status_history ====================' AS section;
DESC incident_status_history;
SELECT history_id, incident_id, old_status, new_status, changed_by, changed_at, remarks FROM incident_status_history;

-- ============================================================================
-- 9. RISK_ASSESSMENTS
-- ============================================================================
SELECT '==================== 9. TABLE: risk_assessments ====================' AS section;
DESC risk_assessments;
SELECT risk_id, incident_id, severity_score, asset_score, impact_score, risk_score, risk_level, calculated_by, calculated_at FROM risk_assessments;

-- ============================================================================
-- 10. AUDIT_LOGS
-- ============================================================================
SELECT '==================== 10. TABLE: audit_logs ====================' AS section;
DESC audit_logs;
SELECT audit_id, user_id, incident_id, action, description, created_at FROM audit_logs;

-- ============================================================================
-- 11. INCIDENT_EMBEDDINGS (Vector Paradigm)
-- ============================================================================
SELECT '==================== 11. TABLE: incident_embeddings ====================' AS section;
DESC incident_embeddings;
SELECT embedding_id, incident_id, model_name, JSON_LENGTH(embedding) AS vector_dimensions, created_at FROM incident_embeddings;

