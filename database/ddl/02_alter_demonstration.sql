
-- DEMONSTRATION 1: ADD COLUMN (SLA Deadline Tracking)

ALTER TABLE incidents 
    ADD COLUMN IF NOT EXISTS sla_deadline_hours INT DEFAULT 24;

COMMENT ON COLUMN incidents.sla_deadline_hours IS 
    'Maximum permissible turnaround hours before SLA escalation breach';


-- DEMONSTRATION 2: ADD CONSTRAINT (SLA Range Validation)

ALTER TABLE incidents 
    DROP CONSTRAINT IF EXISTS chk_incidents_sla_hours;

ALTER TABLE incidents 
    ADD CONSTRAINT chk_incidents_sla_hours 
    CHECK (sla_deadline_hours > 0 AND sla_deadline_hours <= 168);

-- 
-- DEMONSTRATION 3: ADD COLUMN & CONSTRAINT (Asset Physical Network Identification)
ALTER TABLE assets 
    ADD COLUMN IF NOT EXISTS mac_address VARCHAR(17) NULL;

ALTER TABLE assets 
    DROP CONSTRAINT IF EXISTS chk_asset_mac_format;

ALTER TABLE assets 
    ADD CONSTRAINT chk_asset_mac_format 
    CHECK (mac_address IS NULL OR mac_address ~* '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$');


ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) NULL;

-- 
-- DEMONSTRATION 5: ALTER COLUMN (Modify Default Value)

ALTER TABLE incidents 
    ALTER COLUMN priority SET DEFAULT 'Medium';


-- Step 6a: Add temporary legacy column
ALTER TABLE incidents 
    ADD COLUMN IF NOT EXISTS legacy_ticket_ref VARCHAR(50) NULL;

-- Step 6b: Safely remove deprecated legacy column
ALTER TABLE incidents 
    DROP COLUMN IF EXISTS legacy_ticket_ref;

