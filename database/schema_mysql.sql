-- ============================================================================
-- DBMS EXPERIENTIAL LEARNING LEVEL 3 PROJECT
-- PROJECT: Cybersecurity Incident Correlation & Response Intelligence System
-- COMPANION SCHEMA: MySQL 8.0+ COMPATIBLE SCRIPT
-- TARGET RDBMS: MySQL 8.0 (ANSI SQL Engine)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS cybersecurity_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cybersecurity_db;

-- 1. roles
CREATE TABLE IF NOT EXISTS roles (
    role_id     INT AUTO_INCREMENT PRIMARY KEY,
    role_name   VARCHAR(50) NOT NULL UNIQUE,
    CONSTRAINT chk_role_name CHECK (role_name IN ('Administrator', 'Security Analyst'))
) ENGINE=InnoDB;

-- 2. users
CREATE TABLE IF NOT EXISTS users (
    user_id         INT AUTO_INCREMENT PRIMARY KEY,
    role_id         INT NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT,
    CONSTRAINT chk_user_email CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_full_name_length CHECK (CHAR_LENGTH(TRIM(full_name)) >= 2)
) ENGINE=InnoDB;

-- 3. assets
CREATE TABLE IF NOT EXISTS assets (
    asset_id        INT AUTO_INCREMENT PRIMARY KEY,
    asset_name      VARCHAR(100) NOT NULL,
    asset_type      VARCHAR(50) NOT NULL,
    criticality     VARCHAR(20) NOT NULL,
    ip_address      VARCHAR(45) NULL,
    department      VARCHAR(100) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_asset_type CHECK (asset_type IN ('Server', 'Database', 'Workstation', 'Cloud Resource', 'Firewall')),
    CONSTRAINT chk_asset_criticality CHECK (criticality IN ('Critical', 'High', 'Medium', 'Low'))
) ENGINE=InnoDB;

-- 4. incident_types
CREATE TABLE IF NOT EXISTS incident_types (
    incident_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name        VARCHAR(50) NOT NULL UNIQUE,
    description      TEXT NULL
) ENGINE=InnoDB;

-- 5. incidents
CREATE TABLE IF NOT EXISTS incidents (
    incident_id         INT AUTO_INCREMENT PRIMARY KEY,
    incident_type_id    INT NOT NULL,
    reported_by         INT NOT NULL,
    assigned_to         INT NULL,
    asset_id            INT NOT NULL,
    title               VARCHAR(200) NOT NULL,
    description         TEXT NOT NULL,
    severity            VARCHAR(20) NOT NULL,
    status              VARCHAR(25) NOT NULL DEFAULT 'New',
    priority            VARCHAR(20) NOT NULL DEFAULT 'Medium',
    risk_score          DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    reported_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at         DATETIME NULL,
    CONSTRAINT fk_incident_type FOREIGN KEY (incident_type_id) REFERENCES incident_types(incident_type_id) ON DELETE RESTRICT,
    CONSTRAINT fk_incident_reporter FOREIGN KEY (reported_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_incident_assignee FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_incident_asset FOREIGN KEY (asset_id) REFERENCES assets(asset_id) ON DELETE RESTRICT,
    CONSTRAINT chk_incident_severity CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    CONSTRAINT chk_incident_status CHECK (status IN ('New', 'Investigating', 'Contained', 'Resolved', 'False Positive')),
    CONSTRAINT chk_incident_priority CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    CONSTRAINT chk_incident_risk_score CHECK (risk_score >= 0.00 AND risk_score <= 100.00),
    CONSTRAINT chk_incident_resolved_date CHECK (resolved_at IS NULL OR resolved_at >= reported_at)
) ENGINE=InnoDB;

-- 6. investigations
CREATE TABLE IF NOT EXISTS investigations (
    investigation_id    INT AUTO_INCREMENT PRIMARY KEY,
    incident_id         INT NOT NULL,
    analyst_id          INT NOT NULL,
    findings            TEXT NOT NULL,
    started_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at        DATETIME NULL,
    CONSTRAINT fk_investigation_incident FOREIGN KEY (incident_id) REFERENCES incidents(incident_id) ON DELETE CASCADE,
    CONSTRAINT fk_investigation_analyst FOREIGN KEY (analyst_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT chk_investigation_completion CHECK (completed_at IS NULL OR completed_at >= started_at)
) ENGINE=InnoDB;

-- 7. response_actions
CREATE TABLE IF NOT EXISTS response_actions (
    response_id         INT AUTO_INCREMENT PRIMARY KEY,
    incident_id         INT NOT NULL,
    performed_by        INT NOT NULL,
    action_type         VARCHAR(50) NOT NULL,
    description         TEXT NOT NULL,
    action_status       VARCHAR(25) NOT NULL DEFAULT 'Pending',
    performed_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_response_incident FOREIGN KEY (incident_id) REFERENCES incidents(incident_id) ON DELETE CASCADE,
    CONSTRAINT fk_response_user FOREIGN KEY (performed_by) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT chk_response_status CHECK (action_status IN ('Pending', 'In Progress', 'Completed', 'Failed'))
) ENGINE=InnoDB;

-- 8. incident_status_history
CREATE TABLE IF NOT EXISTS incident_status_history (
    history_id          INT AUTO_INCREMENT PRIMARY KEY,
    incident_id         INT NOT NULL,
    old_status          VARCHAR(25) NULL,
    new_status          VARCHAR(25) NOT NULL,
    changed_by          INT NULL,
    changed_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remarks             TEXT NULL,
    CONSTRAINT fk_history_incident FOREIGN KEY (incident_id) REFERENCES incidents(incident_id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT chk_history_status CHECK (new_status IN ('New', 'Investigating', 'Contained', 'Resolved', 'False Positive'))
) ENGINE=InnoDB;

-- 9. risk_assessments
CREATE TABLE IF NOT EXISTS risk_assessments (
    risk_id             INT AUTO_INCREMENT PRIMARY KEY,
    incident_id         INT NOT NULL,
    severity_score      DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    asset_score         DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    impact_score        DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    risk_score          DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    risk_level          VARCHAR(20) NOT NULL,
    calculated_by       INT NULL,
    calculated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_risk_incident FOREIGN KEY (incident_id) REFERENCES incidents(incident_id) ON DELETE CASCADE,
    CONSTRAINT fk_risk_user FOREIGN KEY (calculated_by) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT chk_risk_severity_score CHECK (severity_score >= 0.00 AND severity_score <= 100.00),
    CONSTRAINT chk_risk_asset_score CHECK (asset_score >= 0.00 AND asset_score <= 100.00),
    CONSTRAINT chk_risk_impact_score CHECK (impact_score >= 0.00 AND impact_score <= 100.00),
    CONSTRAINT chk_risk_total_score CHECK (risk_score >= 0.00 AND risk_score <= 100.00),
    CONSTRAINT chk_risk_level_category CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical'))
) ENGINE=InnoDB;

-- 10. audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id             INT NULL,
    incident_id         INT NULL,
    action              VARCHAR(100) NOT NULL,
    description         TEXT NULL,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_audit_incident FOREIGN KEY (incident_id) REFERENCES incidents(incident_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 11. incident_embeddings (MySQL JSON Vector storage alternative)
CREATE TABLE IF NOT EXISTS incident_embeddings (
    embedding_id        INT AUTO_INCREMENT PRIMARY KEY,
    incident_id         INT NOT NULL,
    embedding           JSON NOT NULL,
    model_name          VARCHAR(100) NOT NULL DEFAULT 'all-MiniLM-L6-v2',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_embedding_incident FOREIGN KEY (incident_id) REFERENCES incidents(incident_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- INDEXES
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_reported_at ON incidents(reported_at DESC);
CREATE INDEX idx_incidents_risk_score ON incidents(risk_score DESC);
CREATE INDEX idx_incidents_type_id ON incidents(incident_type_id);
CREATE INDEX idx_incidents_assigned_to ON incidents(assigned_to);
CREATE INDEX idx_incidents_asset_id ON incidents(asset_id);
CREATE INDEX idx_incidents_composite_filter ON incidents(status, severity, reported_at DESC);
CREATE INDEX idx_investigations_incident_id ON investigations(incident_id);
CREATE INDEX idx_response_actions_incident_id ON response_actions(incident_id);
CREATE INDEX idx_history_incident_id ON incident_status_history(incident_id);

-- VIEWS
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
WHERE i.severity IN ('Critical', 'High') OR i.risk_score >= 60.00;

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
    ROUND(COALESCE(AVG(risk_score), 0.00), 2) AS overall_avg_risk_score
FROM incidents;
