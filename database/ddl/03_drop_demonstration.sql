-- ============================================================================
-- DBMS EXPERIENTIAL LEARNING LEVEL 3 PROJECT
-- PROJECT: Cybersecurity Incident Correlation & Response Intelligence System
-- PHASE 2: SQL DDL IMPLEMENTATION - SCRIPT 03: DROP DEMONSTRATION
-- TARGET RDBMS: PostgreSQL 14+ (ANSI SQL Standard)
-- ============================================================================
-- Purpose:
-- Demonstrates safe DDL object removal (DROP TABLE, DROP VIEW, DROP INDEX)
-- using an isolated staging entity as mandated by Section 5 of the rubric
-- and Section 15 of the Developer Handbook.
--
-- VIVA NOTE: In production enterprise DBMS environments, dropping active 
-- core tables (like 'incidents' or 'users') destroys data integrity and active
-- foreign key linkages. Therefore, DDL removal must always be demonstrated on
-- temporary/staging data objects or obsolete migration views.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: CREATE TEST STAGING ARTIFACTS
-- Emulates an asynchronous SIEM raw log ingestion staging buffer
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS staging_raw_security_events (
    staging_id          SERIAL PRIMARY KEY,
    raw_payload         TEXT NOT NULL,
    source_ip           VARCHAR(45) NOT NULL,
    ingestion_status    VARCHAR(20) DEFAULT 'Pending',
    received_at         TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insert dummy test log entries for demonstration
INSERT INTO staging_raw_security_events (raw_payload, source_ip, ingestion_status)
VALUES 
    ('SYSLOG ALERT: Port scan detected on firewall port 443', '192.168.1.105', 'Pending'),
    ('AUTH FAILURE: Invalid password attempt for user admin', '10.0.0.42', 'Pending');

-- ----------------------------------------------------------------------------
-- STEP 2: CREATE TEMPORARY INDEX
-- Index created to speed up log ingestion polling
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_staging_received_at 
    ON staging_raw_security_events (received_at DESC);

-- ----------------------------------------------------------------------------
-- STEP 3: CREATE TEMPORARY ANALYTICAL VIEW
-- View to filter only unprocessed staging logs
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_unprocessed_staging_events AS
SELECT 
    staging_id,
    source_ip,
    raw_payload,
    received_at
FROM staging_raw_security_events
WHERE ingestion_status = 'Pending';

-- Verify the objects exist before dropping
-- SELECT COUNT(*) FROM v_unprocessed_staging_events;

-- ----------------------------------------------------------------------------
-- STEP 4: CONTROLLED DDL DROP OPERATIONS (REMOVAL SEQUENCE)
-- Proper dependency management requires dropping views dependent on tables first,
-- followed by custom indexes, and finally the table itself.
-- ----------------------------------------------------------------------------

-- 4a. Drop View
DROP VIEW IF EXISTS v_unprocessed_staging_events;

-- 4b. Drop Index
DROP INDEX IF EXISTS idx_staging_received_at;

-- 4c. Drop Table (Demonstrating IF EXISTS safety safeguard)
DROP TABLE IF EXISTS staging_raw_security_events;

-- ============================================================================
-- DEMONSTRATION 4d: CONSTRAINT REMOVAL DEMONSTRATION
-- Shows how to safely drop a specific table constraint without dropping the table
-- ============================================================================
-- Example: Creating and dropping a test check constraint on response_actions
ALTER TABLE response_actions 
    ADD CONSTRAINT chk_test_temporary_rule 
    CHECK (LENGTH(action_type) > 2);

-- Drop the test constraint safely
ALTER TABLE response_actions 
    DROP CONSTRAINT IF EXISTS chk_test_temporary_rule;

-- ============================================================================
-- SUMMARY OF DROP COMMANDS DEMONSTRATED:
-- 1. DROP VIEW IF EXISTS <view_name>;
-- 2. DROP INDEX IF EXISTS <index_name>;
-- 3. DROP TABLE IF EXISTS <table_name>;
-- 4. ALTER TABLE <table_name> DROP CONSTRAINT IF EXISTS <constraint_name>;
-- ============================================================================
