-- ============================================================================
-- DBMS EXPERIENTIAL LEARNING LEVEL 3 PROJECT
-- PROJECT: Cybersecurity Incident Correlation & Response Intelligence System
-- PHASE 3: ADVANCED DBMS FEATURES - DATABASE TRIGGER (LIFECYCLE AUDIT TRAIL)
-- TARGET RDBMS: PostgreSQL 14+ (PL/pgSQL Trigger Engine)
-- ============================================================================
-- Rubric Reference: Component 8 (Advanced SQL Concepts - 6 Marks)
-- Developer Handbook Reference: Section 19 (Trigger Design)
-- ============================================================================

\c cybersecurity_db;

-- ----------------------------------------------------------------------------
-- 1. TRIGGER FUNCTION: trg_fn_log_incident_status_change
-- Purpose:
--   Executes automatically whenever an incident's lifecycle status is updated.
--   Enforces automated auditing by inserting historical logs and synchronizing
--   temporal resolution milestones without requiring manual client-side inserts.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_fn_log_incident_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_operator_id INT;
BEGIN
    -- Only fire when the status column actually changes value
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        -- Identify active operator: Prefer assignee, fallback to reporter
        v_operator_id := COALESCE(NEW.assigned_to, OLD.assigned_to, NEW.reported_by);

        -- 1. Automatic insertion into incident_status_history (Handbook Sec. 19)
        INSERT INTO incident_status_history (
            incident_id,
            old_status,
            new_status,
            changed_by,
            changed_at,
            remarks
        ) VALUES (
            NEW.incident_id,
            OLD.status,
            NEW.status,
            v_operator_id,
            CURRENT_TIMESTAMP,
            CONCAT('Automated transition: ', OLD.status, ' -> ', NEW.status)
        );

        -- 2. Automatic insertion into immutable audit_logs
        INSERT INTO audit_logs (
            user_id,
            incident_id,
            action,
            description,
            created_at
        ) VALUES (
            v_operator_id,
            NEW.incident_id,
            'STATUS_TRANSITION',
            CONCAT('Incident #', NEW.incident_id, ' (', NEW.title, ') transitioned from ''', OLD.status, ''' to ''', NEW.status, ''''),
            CURRENT_TIMESTAMP
        );

        -- 3. Temporal resolution management (Integrity Constraint Enforcement)
        IF NEW.status = 'Resolved' AND OLD.status != 'Resolved' THEN
            NEW.resolved_at := CURRENT_TIMESTAMP;
        ELSIF NEW.status != 'Resolved' AND OLD.status = 'Resolved' THEN
            NEW.resolved_at := NULL;
        END IF;

        -- 4. Automatically touch updated_at
        NEW.updated_at := CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. TRIGGER DEFINITION: trg_incident_status_change
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_incident_status_change ON incidents;

CREATE TRIGGER trg_incident_status_change
BEFORE UPDATE OF status ON incidents
FOR EACH ROW
EXECUTE FUNCTION trg_fn_log_incident_status_change();

-- ============================================================================
-- VERIFICATION QUERY FOR VIVA DEMONSTRATION:
-- ============================================================================
-- Step A: Note initial status & counts
-- SELECT incident_id, status, updated_at, resolved_at FROM incidents WHERE incident_id = 1;
-- SELECT COUNT(*) FROM incident_status_history WHERE incident_id = 1;

-- Step B: Update incident status
-- UPDATE incidents SET status = 'Resolved' WHERE incident_id = 1;

-- Step C: Confirm trigger fired automatically:
-- SELECT incident_id, status, resolved_at FROM incidents WHERE incident_id = 1;
-- SELECT * FROM incident_status_history WHERE incident_id = 1 ORDER BY history_id DESC LIMIT 1;
-- SELECT * FROM audit_logs WHERE incident_id = 1 ORDER BY audit_id DESC LIMIT 1;

