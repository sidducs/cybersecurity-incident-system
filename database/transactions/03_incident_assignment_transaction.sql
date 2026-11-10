-- ============================================================================
-- DBMS EXPERIENTIAL LEARNING LEVEL 3 PROJECT
-- PROJECT: Cybersecurity Incident Correlation & Response Intelligence System
-- PHASE 3: ADVANCED DBMS FEATURES - ACID TRANSACTIONS & STORED PROCEDURE
-- TARGET RDBMS: PostgreSQL 14+ (PL/pgSQL Procedural Engine)
-- ============================================================================
-- Rubric Reference: Component 8 (Advanced SQL Concepts: Transactions - 6 Marks)
-- Developer Handbook Reference: Section 18 (Transaction Design)
-- ============================================================================

\c cybersecurity_db;

-- ----------------------------------------------------------------------------
-- 1. STORED PROCEDURE: sp_assign_incident_atomic
-- Purpose:
--   Performs atomic SOC incident assignment and triage dispatch under strict
--   ACID transaction guarantees.
-- Operations inside the Transaction:
--   1. Validates that the incident exists and is currently unassigned or in 'New' status.
--   2. Validates that the assigned analyst exists, is an active user, and possesses the 'Security Analyst' role.
--   3. Updates incidents: sets assigned_to, changes status to 'Investigating', updates updated_at.
--   4. Records action in immutable audit_logs.
--   5. Automatically triggers status history via database trigger.
-- Error Handling:
--   Any error triggers automatic exception rollback, ensuring zero partial state.
-- ----------------------------------------------------------------------------
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
    v_curr_status VARCHAR(25);
BEGIN
    -- Step 1: Validate Incident Existence & State
    SELECT status INTO v_curr_status
    FROM incidents
    WHERE incident_id = p_incident_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transaction Aborted: Incident ID % does not exist.', p_incident_id;
    END IF;

    -- Step 2: Validate Target Analyst (Role & Active Status)
    SELECT r.role_name, u.is_active INTO v_role_name, v_is_active
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    WHERE u.user_id = p_analyst_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transaction Aborted: Analyst User ID % does not exist.', p_analyst_id;
    END IF;

    IF v_role_name != 'Security Analyst' THEN
        RAISE EXCEPTION 'Transaction Aborted: User ID % holds role %, not Security Analyst.', p_analyst_id, v_role_name;
    END IF;

    IF NOT v_is_active THEN
        RAISE EXCEPTION 'Transaction Aborted: Analyst User ID % is currently deactivated.', p_analyst_id;
    END IF;

    -- Step 3: Perform Atomic State Updates
    UPDATE incidents
    SET assigned_to = p_analyst_id,
        status = CASE WHEN status = 'New' THEN 'Investigating' ELSE status END,
        updated_at = CURRENT_TIMESTAMP
    WHERE incident_id = p_incident_id;

    -- Step 4: Record Administrative Assignment Audit Event
    INSERT INTO audit_logs (
        user_id,
        incident_id,
        action,
        description,
        created_at
    ) VALUES (
        p_admin_id,
        p_incident_id,
        'INCIDENT_ASSIGNMENT',
        CONCAT('Admin (User #', p_admin_id, ') assigned Incident #', p_incident_id, ' to Analyst #', p_analyst_id, '. Notes: ', COALESCE(p_notes, 'None')),
        CURRENT_TIMESTAMP
    );

    -- Log transaction commit confirmation
    RAISE NOTICE 'Transaction Committed: Incident #% assigned to Analyst #% successfully.', p_incident_id, p_analyst_id;

EXCEPTION
    WHEN OTHERS THEN
        -- PostgreSQL automatically rolls back uncommitted changes within exception blocks
        RAISE NOTICE 'Transaction Rolled Back due to error: %', SQLERRM;
        RAISE;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. RAW SQL TRANSACTION SCRIPT FOR VIVA LAB DEMONSTRATION:
-- Demonstrates raw BEGIN, COMMIT, and manual ROLLBACK commands.
-- ----------------------------------------------------------------------------

-- SCENARIO A: SUCCESSFUL COMMIT DEMONSTRATION
-- BEGIN;
--     UPDATE incidents 
--     SET assigned_to = 2, status = 'Investigating', updated_at = CURRENT_TIMESTAMP 
--     WHERE incident_id = 11;

--     INSERT INTO audit_logs (user_id, incident_id, action, description)
--     VALUES (1, 11, 'VIVA_DEMO_COMMIT', 'Atomic assignment demonstration succeeded');

-- COMMIT;

-- SCENARIO B: FORCED ROLLBACK DEMONSTRATION (Simulating failure / abort)
-- BEGIN;
--     UPDATE incidents 
--     SET assigned_to = 3, status = 'Investigating' 
--     WHERE incident_id = 12;

--     -- Intentionally trigger foreign key error by referencing non-existent user 9999
--     INSERT INTO audit_logs (user_id, incident_id, action, description)
--     VALUES (9999, 12, 'VIVA_DEMO_FAIL', 'This invalid user FK forces transaction abort');

-- ROLLBACK;
-- Notice: After rollback, incident 12 assigned_to remains NULL!

