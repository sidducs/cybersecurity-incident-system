-- Purpose:
-- Implements the three core reporting views mandated by Section 21 of the
-- Developer Handbook plus an asset vulnerability exposure view for dashboards.

-- 1. VIEW: v_high_priority_incidents
-- Handbook Section 21: Shows incident, severity, asset, analyst, risk score and status.
-- Serves the SOC real-time critical triage queue on the Next.js /dashboard.
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

