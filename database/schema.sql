-- ============================================================================
-- DBMS EXPERIENTIAL LEARNING LEVEL 3 PROJECT
-- PROJECT: Cybersecurity Incident Correlation & Response Intelligence System
-- MASTER DATABASE SCHEMA (ALL-IN-ONE DEPLOYMENT SCRIPT)
-- TARGET RDBMS: PostgreSQL 14+ with pgvector extension
-- ============================================================================
-- INSTRUCTIONS FOR FACULTY EVALUATION & LOCAL EXECUTION:
-- 1. Create a database:
--    CREATE DATABASE cybersecurity_db;
-- 2. Connect to the database:
--    \c cybersecurity_db;
-- 3. Execute this master schema file:
--    \i schema.sql
-- ============================================================================

﻿-- ============================================================================
-- DBMS EXPERIENTIAL LEARNING LEVEL 3 PROJECT
-- PROJECT: Cybersecurity Incident Correlation & Response Intelligence System
-- PHASE 2: SQL DDL IMPLEMENTATION - SCRIPT 01: CREATE TABLES & CONSTRAINTS
-- TARGET RDBMS: PostgreSQL (Relational SQL + pgvector extension)
-- ============================================================================

-- Enable pgvector extension for dense semantic incident similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- ----------------------------------------------------------------------------
-- 1. TABLE: roles
-- Defines system access permissions (Administrator, Security Analyst)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    role_id     SERIAL PRIMARY KEY,
    role_name   VARCHAR(50) NOT NULL UNIQUE,
    CONSTRAINT chk_role_name CHECK (role_name IN ('Administrator', 'Security Analyst'))
);

-- ----------------------------------------------------------------------------
-- 2. TABLE: users
-- Authorized operators, incident reporters, and investigating analysts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id         SERIAL PRIMARY KEY,
    role_id         INT NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role 
        FOREIGN KEY (role_id) 
        REFERENCES roles(role_id) 
        ON DELETE RESTRICT,
    CONSTRAINT chk_user_email 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_full_name_length 
        CHECK (LENGTH(TRIM(full_name)) >= 2)
);

-- ----------------------------------------------------------------------------
-- 3. TABLE: assets
-- Protected organizational IT, database, server, and cloud infrastructure
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assets (
    asset_id        SERIAL PRIMARY KEY,
    asset_name      VARCHAR(100) NOT NULL,
    asset_type      VARCHAR(50) NOT NULL,
    criticality     VARCHAR(20) NOT NULL,
    ip_address      VARCHAR(45) NULL,
    department      VARCHAR(100) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_asset_type 
        CHECK (asset_type IN ('Server', 'Database', 'Workstation', 'Cloud Resource', 'Firewall')),
    CONSTRAINT chk_asset_criticality 
        CHECK (criticality IN ('Critical', 'High', 'Medium', 'Low'))
);

-- ----------------------------------------------------------------------------
-- 4. TABLE: incident_types
-- Standard threat taxonomies classifying attack categories
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incident_types (
    incident_type_id SERIAL PRIMARY KEY,
    type_name        VARCHAR(50) NOT NULL UNIQUE,
    description      TEXT NULL
);

-- ----------------------------------------------------------------------------
-- 5. TABLE: incidents (Central Operational Hub Entity)
-- Records detected security breaches, life cycle state, risk score, and timing
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incidents (
    incident_id         SERIAL PRIMARY KEY,
    incident_type_id    INT NOT NULL,
    reported_by         INT NOT NULL,
    assigned_to         INT NULL,
    asset_id            INT NOT NULL,
    title               VARCHAR(200) NOT NULL,
    description         TEXT NOT NULL,
    severity            VARCHAR(20) NOT NULL,
    status              VARCHAR(25) NOT NULL DEFAULT 'New',
    priority            VARCHAR(20) NOT NULL DEFAULT 'Medium',
    risk_score          NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    reported_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at         TIMESTAMPTZ NULL,
    CONSTRAINT fk_incident_type 
        FOREIGN KEY (incident_type_id) 
        REFERENCES incident_types(incident_type_id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_incident_reporter 
        FOREIGN KEY (reported_by) 
        REFERENCES users(user_id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_incident_assignee 
        FOREIGN KEY (assigned_to) 
        REFERENCES users(user_id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_incident_asset 
        FOREIGN KEY (asset_id) 
        REFERENCES assets(asset_id) 
        ON DELETE RESTRICT,
    CONSTRAINT chk_incident_severity 
        CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    CONSTRAINT chk_incident_status 
        CHECK (status IN ('New', 'Investigating', 'Contained', 'Resolved', 'False Positive')),
    CONSTRAINT chk_incident_priority 
        CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    CONSTRAINT chk_incident_risk_score 
        CHECK (risk_score >= 0.00 AND risk_score <= 100.00),
    CONSTRAINT chk_incident_resolved_date 
        CHECK (resolved_at IS NULL OR resolved_at >= reported_at)
);

-- ----------------------------------------------------------------------------
-- 6. TABLE: investigations
-- In-depth forensic findings, timelines, and observations by analysts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS investigations (
    investigation_id    SERIAL PRIMARY KEY,
    incident_id         INT NOT NULL,
    analyst_id          INT NOT NULL,
    findings            TEXT NOT NULL,
    started_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at        TIMESTAMPTZ NULL,
    CONSTRAINT fk_investigation_incident 
        FOREIGN KEY (incident_id) 
        REFERENCES incidents(incident_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_investigation_analyst 
        FOREIGN KEY (analyst_id) 
        REFERENCES users(user_id) 
        ON DELETE RESTRICT,
    CONSTRAINT chk_investigation_completion 
        CHECK (completed_at IS NULL OR completed_at >= started_at)
);

-- ----------------------------------------------------------------------------
-- 7. TABLE: response_actions
-- Remediation and containment steps executed against incidents
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS response_actions (
    response_id         SERIAL PRIMARY KEY,
    incident_id         INT NOT NULL,
    performed_by        INT NOT NULL,
    action_type         VARCHAR(50) NOT NULL,
    description         TEXT NOT NULL,
    action_status       VARCHAR(25) NOT NULL DEFAULT 'Pending',
    performed_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_response_incident 
        FOREIGN KEY (incident_id) 
        REFERENCES incidents(incident_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_response_user 
        FOREIGN KEY (performed_by) 
        REFERENCES users(user_id) 
        ON DELETE RESTRICT,
    CONSTRAINT chk_response_status 
        CHECK (action_status IN ('Pending', 'In Progress', 'Completed', 'Failed'))
);

-- ----------------------------------------------------------------------------
-- 8. TABLE: incident_status_history
-- Automated audit trail logging lifecycle status transitions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incident_status_history (
    history_id          SERIAL PRIMARY KEY,
    incident_id         INT NOT NULL,
    old_status          VARCHAR(25) NULL,
    new_status          VARCHAR(25) NOT NULL,
    changed_by          INT NULL,
    changed_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remarks             TEXT NULL,
    CONSTRAINT fk_history_incident 
        FOREIGN KEY (incident_id) 
        REFERENCES incidents(incident_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_history_user 
        FOREIGN KEY (changed_by) 
        REFERENCES users(user_id) 
        ON DELETE SET NULL,
    CONSTRAINT chk_history_status 
        CHECK (new_status IN ('New', 'Investigating', 'Contained', 'Resolved', 'False Positive'))
);

-- ----------------------------------------------------------------------------
-- 9. TABLE: risk_assessments
-- Quantitative multi-factor risk scores evaluated by stored functions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS risk_assessments (
    risk_id             SERIAL PRIMARY KEY,
    incident_id         INT NOT NULL,
    severity_score      NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    asset_score         NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    impact_score        NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    risk_score          NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    risk_level          VARCHAR(20) NOT NULL,
    calculated_by       INT NULL,
    calculated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_risk_incident 
        FOREIGN KEY (incident_id) 
        REFERENCES incidents(incident_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_risk_user 
        FOREIGN KEY (calculated_by) 
        REFERENCES users(user_id) 
        ON DELETE SET NULL,
    CONSTRAINT chk_risk_severity_score 
        CHECK (severity_score >= 0.00 AND severity_score <= 100.00),
    CONSTRAINT chk_risk_asset_score 
        CHECK (asset_score >= 0.00 AND asset_score <= 100.00),
    CONSTRAINT chk_risk_impact_score 
        CHECK (impact_score >= 0.00 AND impact_score <= 100.00),
    CONSTRAINT chk_risk_total_score 
        CHECK (risk_score >= 0.00 AND risk_score <= 100.00),
    CONSTRAINT chk_risk_level_category 
        CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical'))
);

-- ----------------------------------------------------------------------------
-- 10. TABLE: audit_logs
-- Immutable security logging tracking critical administrative operations
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id            SERIAL PRIMARY KEY,
    user_id             INT NULL,
    incident_id         INT NULL,
    action              VARCHAR(100) NOT NULL,
    description         TEXT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(user_id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_audit_incident 
        FOREIGN KEY (incident_id) 
        REFERENCES incidents(incident_id) 
        ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- 11. TABLE: incident_embeddings (Vector Paradigm - pgvector)
-- Dense 384-dimensional vector embeddings of incident narratives
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incident_embeddings (
    embedding_id        SERIAL PRIMARY KEY,
    incident_id         INT NOT NULL,
    embedding           vector(384) NOT NULL,
    model_name          VARCHAR(100) NOT NULL DEFAULT 'all-MiniLM-L6-v2',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_embedding_incident 
        FOREIGN KEY (incident_id) 
        REFERENCES incidents(incident_id) 
        ON DELETE CASCADE
);

-- ============================================================================
-- DBMS EXPERIENTIAL LEARNING LEVEL 3 PROJECT
-- PROJECT: Cybersecurity Incident Correlation & Response Intelligence System
-- PHASE 2: SQL DDL IMPLEMENTATION - SCRIPT 04: INDEXING STRATEGY
-- TARGET RDBMS: PostgreSQL 14+ (B-Tree + pgvector HNSW)
-- ============================================================================
-- Purpose:
-- Implements production-grade indexing to optimize search, filtering, foreign-key
-- joins, chronological ordering, and vector similarity retrieval as specified in
-- Section 5 of the rubric and Section 22 of the Developer Handbook.
-- ============================================================================

-- ============================================================================
-- 1. SINGLE-COLUMN B-TREE INDEXES (FREQUENT SOC FILTERING ATTRIBUTES)
-- ============================================================================

-- Optimization for: SELECT * FROM incidents WHERE status = 'Investigating';
CREATE INDEX IF NOT EXISTS idx_incidents_status
    ON incidents(status);

-- Optimization for: SELECT * FROM incidents WHERE severity = 'Critical';
CREATE INDEX IF NOT EXISTS idx_incidents_severity
    ON incidents(severity);

-- Optimization for: SELECT * FROM incidents ORDER BY reported_at DESC;
CREATE INDEX IF NOT EXISTS idx_incidents_reported_at
    ON incidents(reported_at DESC);

-- Optimization for: SELECT * FROM incidents WHERE risk_score >= 75.00;
CREATE INDEX IF NOT EXISTS idx_incidents_risk_score
    ON incidents(risk_score DESC);

-- ============================================================================
-- 2. FOREIGN-KEY JOIN INDEXES (RELATIONAL JOIN ACCELERATION)
-- PostgreSQL does not automatically create indexes on foreign key columns.
-- Without these, parent-child joins trigger expensive sequential table scans.
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_incidents_type_id
    ON incidents(incident_type_id);

CREATE INDEX IF NOT EXISTS idx_incidents_assigned_to
    ON incidents(assigned_to);

CREATE INDEX IF NOT EXISTS idx_incidents_reported_by
    ON incidents(reported_by);

CREATE INDEX IF NOT EXISTS idx_incidents_asset_id
    ON incidents(asset_id);

CREATE INDEX IF NOT EXISTS idx_investigations_incident_id
    ON investigations(incident_id);

CREATE INDEX IF NOT EXISTS idx_investigations_analyst_id
    ON investigations(analyst_id);

CREATE INDEX IF NOT EXISTS idx_response_actions_incident_id
    ON response_actions(incident_id);

CREATE INDEX IF NOT EXISTS idx_history_incident_id
    ON incident_status_history(incident_id);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_incident_id
    ON risk_assessments(incident_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
    ON audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_incident_id
    ON audit_logs(incident_id);

-- ============================================================================
-- 3. COMPOSITE B-TREE INDEX (MULTI-COLUMN DASHBOARD FILTERING)
-- Handbook Section 22: Composite status/severity/date index
-- Optimized for main dashboard triage query:
-- SELECT * FROM incidents WHERE status = 'New' AND severity = 'Critical' ORDER BY reported_at DESC;
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_incidents_composite_filter
    ON incidents(status, severity, reported_at DESC);

-- ============================================================================
-- 4. PARTIAL / CONDITIONAL B-TREE INDEX (UNRESOLVED CRITICAL INCIDENTS)
-- Real-world SOC optimization: indexes only open/active urgent incidents,
-- maintaining an ultra-compact memory footprint.
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_incidents_active_urgent
    ON incidents(severity, risk_score DESC)
    WHERE status NOT IN ('Resolved', 'False Positive');

-- ============================================================================
-- 5. VECTOR INDEX (pgvector HNSW - APPROXIMATE NEAREST NEIGHBOR SEARCH)
-- Handbook Section 22 & 23:
-- Implements Hierarchical Navigable Small World (HNSW) graph index using
-- cosine distance operator class (vector_cosine_ops).
-- Parameters:
--   m = 16 (number of bidirectional links per vector node)
--   ef_construction = 64 (size of dynamic candidate list during graph construction)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_incident_embeddings_hnsw
    ON incident_embeddings
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- ============================================================================
-- VERIFICATION QUERY FOR VIVA DEMONSTRATION:
-- SELECT schemaname, tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;
-- ============================================================================


-- ============================================================================
-- DBMS EXPERIENTIAL LEARNING LEVEL 3 PROJECT
-- PROJECT: Cybersecurity Incident Correlation & Response Intelligence System
-- PHASE 2: SQL DDL IMPLEMENTATION - SCRIPT 05: REPORTING & ANALYTICAL VIEWS
-- TARGET RDBMS: PostgreSQL 14+ (ANSI SQL Standard)
-- ============================================================================
-- Purpose:
-- Implements the three core reporting views mandated by Section 21 of the
-- Developer Handbook plus an asset vulnerability exposure view for dashboards.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. VIEW: v_high_priority_incidents
-- Handbook Section 21: Shows incident, severity, asset, analyst, risk score and status.
-- Serves the SOC real-time critical triage queue on the Next.js /dashboard.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_high_priority_incidents AS
SELECT 
    i.incident_id,
    i.title AS incident_title,
    it.type_name AS attack_category,
    i.severity,
    i.priority,
    i.status,
    i.risk_score,
    a.asset_id,
    a.asset_name,
    a.criticality AS asset_criticality,
    a.ip_address AS asset_ip,
    u_assigned.user_id AS analyst_id,
    COALESCE(u_assigned.full_name, 'Unassigned') AS assigned_analyst,
    u_reporter.full_name AS reported_by_user,
    i.reported_at,
    i.updated_at
FROM incidents i
JOIN incident_types it ON i.incident_type_id = it.incident_type_id
JOIN assets a ON i.asset_id = a.asset_id
JOIN users u_reporter ON i.reported_by = u_reporter.user_id
LEFT JOIN users u_assigned ON i.assigned_to = u_assigned.user_id
WHERE i.severity IN ('Critical', 'High') 
   OR i.risk_score >= 60.00;

-- ----------------------------------------------------------------------------
-- 2. VIEW: v_analyst_performance
-- Handbook Section 21: Shows total incidents, resolved incidents, and avg resolution time.
-- Serves the Next.js /admin/reports management analytics page.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_analyst_performance AS
SELECT 
    u.user_id AS analyst_id,
    u.full_name AS analyst_name,
    u.email AS analyst_email,
    COUNT(i.incident_id) AS total_assigned_incidents,
    COUNT(CASE WHEN i.status = 'Resolved' THEN 1 END) AS resolved_incidents,
    COUNT(CASE WHEN i.status IN ('Investigating', 'Contained') THEN 1 END) AS active_incidents,
    ROUND(
        COALESCE(
            AVG(
                CASE WHEN i.status = 'Resolved' AND i.resolved_at IS NOT NULL
                     THEN EXTRACT(EPOCH FROM (i.resolved_at - i.reported_at)) / 3600.0
                END
            ), 0.00
        )::numeric, 2
    ) AS avg_resolution_hours,
    ROUND(COALESCE(AVG(i.risk_score), 0.00)::numeric, 2) AS avg_risk_handled,
    COUNT(DISTINCT inv.investigation_id) AS forensic_investigations_conducted,
    COUNT(DISTINCT ra.response_id) AS response_actions_executed
FROM users u
JOIN roles r ON u.role_id = r.role_id
LEFT JOIN incidents i ON u.user_id = i.assigned_to
LEFT JOIN investigations inv ON u.user_id = inv.analyst_id
LEFT JOIN response_actions ra ON u.user_id = ra.performed_by
WHERE r.role_name = 'Security Analyst' AND u.is_active = TRUE
GROUP BY u.user_id, u.full_name, u.email;

-- ----------------------------------------------------------------------------
-- 3. VIEW: v_incident_summary
-- Handbook Section 21: Aggregated incident counts for dashboard KPI cards.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_incident_summary AS
SELECT 
    COUNT(*) AS total_incidents,
    COUNT(CASE WHEN severity = 'Critical' THEN 1 END) AS critical_severity_count,
    COUNT(CASE WHEN severity = 'High' THEN 1 END) AS high_severity_count,
    COUNT(CASE WHEN severity = 'Medium' THEN 1 END) AS medium_severity_count,
    COUNT(CASE WHEN severity = 'Low' THEN 1 END) AS low_severity_count,
    COUNT(CASE WHEN status = 'New' THEN 1 END) AS new_unassigned_count,
    COUNT(CASE WHEN status = 'Investigating' THEN 1 END) AS investigating_count,
    COUNT(CASE WHEN status = 'Contained' THEN 1 END) AS contained_count,
    COUNT(CASE WHEN status = 'Resolved' THEN 1 END) AS resolved_count,
    COUNT(CASE WHEN status = 'False Positive' THEN 1 END) AS false_positive_count,
    COUNT(CASE WHEN assigned_to IS NULL THEN 1 END) AS total_unassigned_count,
    ROUND(COALESCE(AVG(risk_score), 0.00)::numeric, 2) AS overall_avg_risk_score
FROM incidents;

-- ----------------------------------------------------------------------------
-- 4. VIEW: v_asset_threat_exposure
-- Correlates organizational assets with attack frequency and exposure risk.
-- Serves Next.js /admin/assets risk metrics.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_asset_threat_exposure AS
SELECT 
    a.asset_id,
    a.asset_name,
    a.asset_type,
    a.criticality,
    a.department,
    a.ip_address,
    COUNT(i.incident_id) AS total_incidents_recorded,
    COUNT(CASE WHEN i.severity = 'Critical' THEN 1 END) AS critical_breaches,
    COUNT(CASE WHEN i.status NOT IN ('Resolved', 'False Positive') THEN 1 END) AS active_threats,
    ROUND(COALESCE(AVG(i.risk_score), 0.00)::numeric, 2) AS avg_incident_risk,
    MAX(i.reported_at) AS last_incident_detected
FROM assets a
LEFT JOIN incidents i ON a.asset_id = i.asset_id
GROUP BY a.asset_id, a.asset_name, a.asset_type, a.criticality, a.department, a.ip_address;

-- ============================================================================
-- VERIFICATION QUERY FOR VIVA DEMONSTRATION:
-- SELECT table_name, view_definition FROM information_schema.views WHERE table_schema = 'public';
-- ============================================================================
