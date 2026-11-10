-- ============================================================================
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