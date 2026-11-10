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
