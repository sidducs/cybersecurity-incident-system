-- ============================================================================
-- DBMS EXPERIENTIAL LEARNING LEVEL 3 PROJECT
-- PROJECT: Cybersecurity Incident Correlation & Response Intelligence System
-- PHASE 2: SQL DDL IMPLEMENTATION - SCRIPT 02: ALTER DEMONSTRATION
-- TARGET RDBMS: PostgreSQL 14+ (ANSI SQL Standard)
-- ============================================================================
-- Purpose:
-- Demonstrates schema evolution capabilities using ALTER TABLE statements with
-- academic and industrial justifications as required by Section 5 of the rubric
-- and Section 15 of the Developer Handbook.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- DEMONSTRATION 1: ADD COLUMN (SLA Deadline Tracking)
-- Justification: Real-world Security Operations Centers (SOC) require strict
-- Service Level Agreement (SLA) turnaround thresholds based on incident severity.
-- We add an 'sla_deadline_hours' attribute to track maximum allowable triage hours.
-- ----------------------------------------------------------------------------
ALTER TABLE incidents 
    ADD COLUMN IF NOT EXISTS sla_deadline_hours INT DEFAULT 24;

COMMENT ON COLUMN incidents.sla_deadline_hours IS 
    'Maximum permissible turnaround hours before SLA escalation breach';

-- ----------------------------------------------------------------------------
-- DEMONSTRATION 2: ADD CONSTRAINT (SLA Range Validation)
-- Justification: Ensure the SLA deadline is positive and does not exceed standard
-- 7-day (168 hours) SOC retention windows.
-- ----------------------------------------------------------------------------
ALTER TABLE incidents 
    DROP CONSTRAINT IF EXISTS chk_incidents_sla_hours;

ALTER TABLE incidents 
    ADD CONSTRAINT chk_incidents_sla_hours 
    CHECK (sla_deadline_hours > 0 AND sla_deadline_hours <= 168);

-- ----------------------------------------------------------------------------
-- DEMONSTRATION 3: ADD COLUMN & CONSTRAINT (Asset Physical Network Identification)
-- Justification: IT Asset Management (ITAM) needs MAC address logging for physical
-- layer-2 hardware identification during forensic incident investigations.
-- ----------------------------------------------------------------------------
ALTER TABLE assets 
    ADD COLUMN IF NOT EXISTS mac_address VARCHAR(17) NULL;

ALTER TABLE assets 
    DROP CONSTRAINT IF EXISTS chk_asset_mac_format;

ALTER TABLE assets 
    ADD CONSTRAINT chk_asset_mac_format 
    CHECK (mac_address IS NULL OR mac_address ~* '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$');

-- ----------------------------------------------------------------------------
-- DEMONSTRATION 4: ADD COLUMN (User Mobile Contact for Urgent Escalations)
-- Justification: On-call security analysts require emergency contact numbers
-- when Critical severity ransomware or exfiltration incidents occur off-hours.
-- ----------------------------------------------------------------------------
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) NULL;

-- ----------------------------------------------------------------------------
-- DEMONSTRATION 5: ALTER COLUMN (Modify Default Value)
-- Justification: Adjust system-wide default priority to ensure newly ingested
-- automated sensor incidents are safely marked as 'Medium' unless triage elevates them.
-- ----------------------------------------------------------------------------
ALTER TABLE incidents 
    ALTER COLUMN priority SET DEFAULT 'Medium';

-- ----------------------------------------------------------------------------
-- DEMONSTRATION 6: TEMPORARY EVOLUTION & ROLLBACK (Demonstrating DROP COLUMN)
-- Justification: Demonstrates lifecycle of an experimental schema field:
-- adding a legacy migration column and safely dropping it after deprecation.
-- ----------------------------------------------------------------------------
-- Step 6a: Add temporary legacy column
ALTER TABLE incidents 
    ADD COLUMN IF NOT EXISTS legacy_ticket_ref VARCHAR(50) NULL;

-- Step 6b: Safely remove deprecated legacy column
ALTER TABLE incidents 
    DROP COLUMN IF EXISTS legacy_ticket_ref;

-- ============================================================================
-- VERIFICATION QUERY FOR VIVA DEMONSTRATION:
-- Run to confirm the columns and constraints were successfully integrated
-- ============================================================================
-- SELECT column_name, data_type, column_default, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'incidents' AND column_name IN ('sla_deadline_hours', 'priority');
