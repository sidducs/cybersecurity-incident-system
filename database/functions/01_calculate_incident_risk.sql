-- ============================================================================
-- DBMS EXPERIENTIAL LEARNING LEVEL 3 PROJECT
-- PROJECT: Cybersecurity Incident Correlation & Response Intelligence System
-- PHASE 3: ADVANCED DBMS FEATURES - STORED FUNCTION (RISK SCORING ENGINE)
-- TARGET RDBMS: PostgreSQL 14+ (PL/pgSQL)
-- ============================================================================
-- Rubric Reference: Component 8 (Advanced SQL Concepts - 6 Marks)
-- Developer Handbook Reference: Section 20 (Stored Function Design)
-- ============================================================================

-- Connect to project database
\c cybersecurity_db;

-- ----------------------------------------------------------------------------
-- 1. FUNCTION: calculate_incident_risk
-- Purpose:
--   Centralizes quantitative multi-factor threat risk calculation inside the
--   database engine, ensuring identical scoring logic across the Next.js API,
--   automated alert ingestors, and batch audit scripts.
-- Parameters:
--   - p_severity: Threat severity ('Critical', 'High', 'Medium', 'Low')
--   - p_asset_criticality: Target asset value ('Critical', 'High', 'Medium', 'Low')
--   - p_impact_score: Forensic blast-radius impact rating (0.00 to 100.00)
-- Weighting Formula (SOC Quantitative Risk Framework):
--   Score = (Severity * 40%) + (Asset Criticality * 35%) + (Impact Score * 25%)
-- Returns:
--   NUMERIC(5,2) score between 0.00 and 100.00
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_incident_risk(
    p_severity VARCHAR(20),
    p_asset_criticality VARCHAR(20),
    p_impact_score NUMERIC
) 
RETURNS NUMERIC(5,2) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_sev_weight    NUMERIC(5,2);
    v_asset_weight  NUMERIC(5,2);
    v_total_score   NUMERIC(5,2);
BEGIN
    -- 1. Map Threat Severity to Numeric Base (40% Weight)
    CASE UPPER(TRIM(p_severity))
        WHEN 'CRITICAL' THEN v_sev_weight := 100.00;
        WHEN 'HIGH'     THEN v_sev_weight := 75.00;
        WHEN 'MEDIUM'   THEN v_sev_weight := 50.00;
        WHEN 'LOW'      THEN v_sev_weight := 25.00;
        ELSE RAISE EXCEPTION 'Invalid severity: %. Must be Critical, High, Medium, or Low.', p_severity;
    END CASE;

    -- 2. Map Asset Criticality to Numeric Base (35% Weight)
    CASE UPPER(TRIM(p_asset_criticality))
        WHEN 'CRITICAL' THEN v_asset_weight := 100.00;
        WHEN 'HIGH'     THEN v_asset_weight := 75.00;
        WHEN 'MEDIUM'   THEN v_asset_weight := 50.00;
        WHEN 'LOW'      THEN v_asset_weight := 25.00;
        ELSE RAISE EXCEPTION 'Invalid asset criticality: %. Must be Critical, High, Medium, or Low.', p_asset_criticality;
    END CASE;

    -- 3. Validate Forensic Impact Score Range (25% Weight)
    IF p_impact_score IS NULL OR p_impact_score < 0.00 OR p_impact_score > 100.00 THEN
        RAISE EXCEPTION 'Invalid impact score: %. Must be between 0.00 and 100.00.', p_impact_score;
    END IF;

    -- 4. Calculate Weighted Composite Threat Score
    v_total_score := (v_sev_weight * 0.40) + (v_asset_weight * 0.35) + (p_impact_score * 0.25);

    RETURN ROUND(v_total_score, 2);
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. FUNCTION: get_risk_level
-- Purpose:
--   Converts a numeric risk score (0-100) into its categorical SOC threat band
--   as defined in Section 20 of the Developer Handbook:
--     0–25   : LOW
--     26–50  : MEDIUM
--     51–75  : HIGH
--     76–100 : CRITICAL
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_risk_level(p_risk_score NUMERIC) 
RETURNS VARCHAR(20) 
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_risk_score < 0.00 OR p_risk_score > 100.00 THEN
        RAISE EXCEPTION 'Risk score % is out of bounds (0.00 - 100.00)', p_risk_score;
    ELSIF p_risk_score <= 25.00 THEN
        RETURN 'Low';
    ELSIF p_risk_score <= 50.00 THEN
        RETURN 'Medium';
    ELSIF p_risk_score <= 75.00 THEN
        RETURN 'High';
    ELSE
        RETURN 'Critical';
    END IF;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. FUNCTION: assess_and_update_incident_risk
-- Purpose:
--   Takes an incident_id and impact_score, queries associated incident severity
--   and asset criticality from relational tables, executes calculate_incident_risk(),
--   updates the incidents table risk_score, and logs the assessment into risk_assessments.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION assess_and_update_incident_risk(
    p_incident_id INT,
    p_impact_score NUMERIC,
    p_analyst_id INT
)
RETURNS TABLE (
    incident_id INT,
    computed_risk_score NUMERIC(5,2),
    assigned_risk_level VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_severity          VARCHAR(20);
    v_criticality       VARCHAR(20);
    v_computed_score    NUMERIC(5,2);
    v_level             VARCHAR(20);
BEGIN
    -- Query severity from incidents and criticality from joined assets
    SELECT i.severity, a.criticality 
    INTO v_severity, v_criticality
    FROM incidents i
    JOIN assets a ON i.asset_id = a.asset_id
    WHERE i.incident_id = p_incident_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Incident with ID % does not exist.', p_incident_id;
    END IF;

    -- Execute calculate_incident_risk function
    v_computed_score := calculate_incident_risk(v_severity, v_criticality, p_impact_score);
    v_level := get_risk_level(v_computed_score);

    -- Update central incident entity
    UPDATE incidents 
    SET risk_score = v_computed_score,
        updated_at = CURRENT_TIMESTAMP
    WHERE incidents.incident_id = p_incident_id;

    -- Record detailed quantitative assessment
    INSERT INTO risk_assessments (
        incident_id, severity_score, asset_score, impact_score, risk_score, risk_level, calculated_by, calculated_at
    ) VALUES (
        p_incident_id,
        CASE v_severity WHEN 'Critical' THEN 100 WHEN 'High' THEN 75 WHEN 'Medium' THEN 50 ELSE 25 END,
        CASE v_criticality WHEN 'Critical' THEN 100 WHEN 'High' THEN 75 WHEN 'Medium' THEN 50 ELSE 25 END,
        p_impact_score,
        v_computed_score,
        v_level,
        p_analyst_id,
        CURRENT_TIMESTAMP
    );

    RETURN QUERY SELECT p_incident_id, v_computed_score, v_level;
END;
$$;

-- ============================================================================
-- VERIFICATION QUERIES FOR VIVA EVALUATION:
-- ============================================================================
-- Test 1: Calculate risk for Critical Ransomware on Critical Database with 90% impact:
-- SELECT calculate_incident_risk('Critical', 'Critical', 90.00);  -- Expected: (40 + 35 + 22.5) = 97.50
-- SELECT get_risk_level(97.50);                                    -- Expected: 'Critical'

-- Test 2: Calculate risk for Low severity SQL probe on Low asset with 20% impact:
-- SELECT calculate_incident_risk('Low', 'Low', 20.00);            -- Expected: (10 + 8.75 + 5.0) = 23.75
-- SELECT get_risk_level(23.75);                                    -- Expected: 'Low'

