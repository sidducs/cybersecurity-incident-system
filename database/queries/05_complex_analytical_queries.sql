
-- Coverage:
--   - Multi-Table Inner, Left, and Self Joins
--   - Aggregations: COUNT, AVG, SUM, MIN, MAX
--   - GROUP BY and HAVING clauses
--   - Subqueries: Scalar, Table, and Correlated Subqueries
--   - Conditional Aggregation (CASE WHEN)
--   - Recursive Common Table Expressions (WITH RECURSIVE)

\c cybersecurity_db;

-- ----------------------------------------------------------------------------
-- Q01: Incident Distribution by Classification Type
-- Techniques: GROUP BY + COUNT + ORDER BY DESC
-- Purpose: Quantifies incident volume per attack taxonomy to identify primary threat vectors.
-- ----------------------------------------------------------------------------
SELECT 
    t.type_name AS incident_type,
    COUNT(i.incident_id) AS total_incidents,
    ROUND(COUNT(i.incident_id) * 100.0 / (SELECT COUNT(*) FROM incidents), 2) AS percentage_of_total
FROM incident_types t
LEFT JOIN incidents i ON t.incident_type_id = i.incident_type_id
GROUP BY t.incident_type_id, t.type_name
ORDER BY total_incidents DESC;


-- ----------------------------------------------------------------------------
-- Q02: Threat Severity Breakdown and Risk Exposure
-- Techniques: GROUP BY + COUNT + AVG + ORDER BY CASE
-- Purpose: Evaluates SOC workload distribution across critical, high, medium, and low tiers.
-- ----------------------------------------------------------------------------
SELECT 
    severity,
    COUNT(*) AS incident_count,
    ROUND(AVG(risk_score), 2) AS average_risk_score,
    MIN(reported_at) AS earliest_incident,
    MAX(reported_at) AS latest_incident
FROM incidents
GROUP BY severity
ORDER BY 
    CASE severity
        WHEN 'Critical' THEN 1
        WHEN 'High'     THEN 2
        WHEN 'Medium'   THEN 3
        WHEN 'Low'      THEN 4
        ELSE 5
    END;


-- ----------------------------------------------------------------------------
-- Q03: Analysts Handling Multiple High-Severity / Critical Incidents
-- Techniques: Multi-Table JOIN + GROUP BY + HAVING Filter
-- Purpose: Identifies experienced analysts bearing the highest critical incident workload.
-- ----------------------------------------------------------------------------
SELECT 
    u.user_id,
    u.full_name AS analyst_name,
    u.email,
    COUNT(i.incident_id) AS high_critical_count
FROM users u
JOIN incidents i ON u.user_id = i.assigned_to
WHERE i.severity IN ('Critical', 'High')
GROUP BY u.user_id, u.full_name, u.email
HAVING COUNT(i.incident_id) >= 2
ORDER BY high_critical_count DESC;


-- ----------------------------------------------------------------------------
-- Q04: Mean Turnaround / Resolution Time by Security Analyst (Hours)
-- Techniques: JOIN + EXTRACT(EPOCH) + AVG + GROUP BY
-- Purpose: Measures Mean Time To Remediate (MTTR) SLA performance per SOC defender.
-- ----------------------------------------------------------------------------
SELECT 
    u.user_id,
    u.full_name AS analyst_name,
    COUNT(i.incident_id) AS resolved_incidents_count,
    ROUND(AVG(EXTRACT(EPOCH FROM (i.resolved_at - i.reported_at)) / 3600.0)::numeric, 2) AS avg_resolution_time_hours
FROM users u
JOIN incidents i ON u.user_id = i.assigned_to
WHERE i.resolved_at IS NOT NULL
GROUP BY u.user_id, u.full_name
ORDER BY avg_resolution_time_hours ASC;


-- ----------------------------------------------------------------------------
-- Q05: High-Performing Analysts Exceeding the Departmental Resolution Average
-- Techniques: Nested Subquery with Aggregate Benchmark Comparison
-- Purpose: Compares individual throughput against company-wide analyst average.
-- ----------------------------------------------------------------------------
SELECT 
    u.user_id,
    u.full_name AS analyst_name,
    COUNT(i.incident_id) AS resolved_count
FROM users u
JOIN incidents i ON u.user_id = i.assigned_to
WHERE i.status = 'Resolved'
GROUP BY u.user_id, u.full_name
HAVING COUNT(i.incident_id) > (
    -- Subquery: Department-wide average resolved incidents per assigned analyst
    SELECT AVG(resolved_per_analyst)
    FROM (
        SELECT COUNT(incident_id) AS resolved_per_analyst
        FROM incidents
        WHERE status = 'Resolved' AND assigned_to IS NOT NULL
        GROUP BY assigned_to
    ) AS dept_benchmarks
)
ORDER BY resolved_count DESC;


-- ----------------------------------------------------------------------------
-- Q06: High-Frequency Targeted Assets (Attack Hotspots)
-- Techniques: Multi-Table JOIN + GROUP BY + HAVING
-- Purpose: Isolates critical infrastructure hardware/software experiencing repeated assaults.
-- ----------------------------------------------------------------------------
SELECT 
    a.asset_id,
    a.asset_name,
    a.ip_address,
    a.criticality,
    a.department,
    COUNT(i.incident_id) AS attack_frequency
FROM assets a
JOIN incidents i ON a.asset_id = i.asset_id
GROUP BY a.asset_id, a.asset_name, a.ip_address, a.criticality, a.department
HAVING COUNT(i.incident_id) >= 2
ORDER BY attack_frequency DESC, a.criticality DESC;


-- ----------------------------------------------------------------------------
-- Q07: Unresolved Critical Incidents Requiring Immediate Executive Action
-- Techniques: Multi-Table JOIN + WHERE + ORDER BY
-- Purpose: Generates the Priority P1 Emergency Dispatch queue for SOC leadership.
-- ----------------------------------------------------------------------------
SELECT 
    i.incident_id,
    i.title,
    t.type_name AS attack_vector,
    i.severity,
    i.status,
    i.risk_score,
    a.asset_name AS targeted_system,
    a.criticality AS asset_criticality,
    COALESCE(u.full_name, 'UNASSIGNED - PENDING') AS assigned_analyst,
    i.reported_at
FROM incidents i
JOIN incident_types t ON i.incident_type_id = t.incident_type_id
JOIN assets a ON i.asset_id = a.asset_id
LEFT JOIN users u ON i.assigned_to = u.user_id
WHERE i.severity = 'Critical'
  AND i.status NOT IN ('Resolved', 'Closed', 'False Positive')
ORDER BY i.risk_score DESC, i.reported_at ASC;


-- ----------------------------------------------------------------------------
-- Q08: End-to-End Forensic Incident Lifecycle Audit History
-- Techniques: 4-Table JOIN + ORDER BY
-- Purpose: Reconstructs chronological chain-of-custody and status transition milestones.
-- ----------------------------------------------------------------------------
SELECT 
    h.history_id,
    i.incident_id,
    i.title AS incident_title,
    h.old_status,
    h.new_status,
    COALESCE(u.full_name, 'System Automation') AS modifier_name,
    h.remarks,
    h.changed_at
FROM incident_status_history h
JOIN incidents i ON h.incident_id = i.incident_id
LEFT JOIN users u ON h.changed_by = u.user_id
ORDER BY i.incident_id ASC, h.changed_at ASC;


-- ----------------------------------------------------------------------------
-- Q09: Comprehensive SOC Analyst Performance & Triage Matrix
-- Techniques: Advanced Conditional Aggregations (CASE WHEN) + SUM / COUNT
-- Purpose: Generates an executive KPI dashboard matrix summarizing individual analyst caseloads.
-- ----------------------------------------------------------------------------
SELECT 
    u.user_id,
    u.full_name AS analyst_name,
    COUNT(i.incident_id) AS total_assigned,
    SUM(CASE WHEN i.status = 'Investigating' THEN 1 ELSE 0 END) AS in_triage_count,
    SUM(CASE WHEN i.status = 'Contained'     THEN 1 ELSE 0 END) AS contained_count,
    SUM(CASE WHEN i.status = 'Resolved'      THEN 1 ELSE 0 END) AS resolved_count,
    SUM(CASE WHEN i.severity = 'Critical'    THEN 1 ELSE 0 END) AS critical_severity_handled,
    ROUND(
        CASE 
            WHEN COUNT(i.incident_id) > 0 
            THEN (SUM(CASE WHEN i.status = 'Resolved' THEN 1 ELSE 0 END) * 100.0 / COUNT(i.incident_id))
            ELSE 0 
        END, 2
    ) AS resolution_rate_percentage
FROM users u
LEFT JOIN incidents i ON u.user_id = i.assigned_to
WHERE u.role_id = 2 -- Security Analysts
GROUP BY u.user_id, u.full_name
ORDER BY total_assigned DESC, resolution_rate_percentage DESC;


-- ----------------------------------------------------------------------------
-- Q10: Top Vulnerable IT Assets Ranked by Aggregate Threat Exposure
-- Techniques: JOIN + GROUP BY + Aggregates + ORDER BY DESC + LIMIT
-- Purpose: Pinpoints corporate assets that generate the highest cumulative cyber risk.
-- ----------------------------------------------------------------------------
SELECT 
    a.asset_id,
    a.asset_name,
    a.asset_type,
    a.criticality,
    COUNT(i.incident_id) AS total_incidents_recorded,
    COALESCE(ROUND(AVG(i.risk_score), 2), 0.00) AS avg_incident_risk,
    COALESCE(ROUND(SUM(i.risk_score), 2), 0.00) AS cumulative_risk_burden
FROM assets a
LEFT JOIN incidents i ON a.asset_id = i.asset_id
GROUP BY a.asset_id, a.asset_name, a.asset_type, a.criticality
ORDER BY cumulative_risk_burden DESC, total_incidents_recorded DESC
LIMIT 5;


-- ----------------------------------------------------------------------------
-- Q11: Unassigned Incident Backlog Requiring Immediate Triage Allocation
-- Techniques: LEFT JOIN + NULL Checks + ORDER BY
-- Purpose: Flags orphaned or unassigned security alerts that risk SLA breach.
-- ----------------------------------------------------------------------------
SELECT 
    i.incident_id,
    i.title,
    t.type_name,
    i.severity,
    i.status,
    i.reported_at,
    ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - i.reported_at)) / 3600.0, 1) AS unassigned_elapsed_hours
FROM incidents i
JOIN incident_types t ON i.incident_type_id = t.incident_type_id
WHERE i.assigned_to IS NULL
  AND i.status NOT IN ('Resolved', 'Closed', 'False Positive')
ORDER BY 
    CASE i.severity
        WHEN 'Critical' THEN 1
        WHEN 'High'     THEN 2
        WHEN 'Medium'   THEN 3
        WHEN 'Low'      THEN 4
        ELSE 5
    END,
    i.reported_at ASC;


-- ----------------------------------------------------------------------------
-- Q12: Complex Security Incidents Requiring Multi-Stage Response Operations
-- Techniques: Multi-Table JOIN + GROUP BY + HAVING Filter
-- Purpose: Highlights advanced multi-phase attacks necessitating multifaceted containment actions.
-- ----------------------------------------------------------------------------
SELECT 
    i.incident_id,
    i.title AS incident_title,
    i.severity,
    COUNT(r.response_id) AS total_containment_actions_taken,
    STRING_AGG(DISTINCT r.action_type, ', ') AS response_actions_executed
FROM incidents i
JOIN response_actions r ON i.incident_id = r.incident_id
GROUP BY i.incident_id, i.title, i.severity
HAVING COUNT(r.response_id) >= 2
ORDER BY total_containment_actions_taken DESC;


-- ----------------------------------------------------------------------------
-- Q13: Correlated Subquery: Anomalously High-Risk Incidents Exceeding Category Baseline
-- Techniques: Correlated Subquery (Inner query references outer query i1.incident_type_id)
-- Purpose: Identifies incidents whose computed risk score is higher than the mean risk score
--          calculated strictly for that exact same incident attack category.
-- ----------------------------------------------------------------------------
SELECT 
    i1.incident_id,
    i1.title,
    t.type_name AS attack_category,
    i1.severity,
    i1.risk_score,
    ROUND((
        SELECT AVG(i2.risk_score)
        FROM incidents i2
        WHERE i2.incident_type_id = i1.incident_type_id
    ), 2) AS category_average_risk,
    ROUND(i1.risk_score - (
        SELECT AVG(i2.risk_score)
        FROM incidents i2
        WHERE i2.incident_type_id = i1.incident_type_id
    ), 2) AS risk_deviation_above_mean
FROM incidents i1
JOIN incident_types t ON i1.incident_type_id = t.incident_type_id
WHERE i1.risk_score > (
    -- Correlated Subquery: Evaluates average for the matching incident type
    SELECT AVG(i2.risk_score)
    FROM incidents i2
    WHERE i2.incident_type_id = i1.incident_type_id
)
ORDER BY risk_deviation_above_mean DESC;


-- ----------------------------------------------------------------------------
-- Q14: Recursive Common Table Expression (CTE): Organizational SOC Escalation Hierarchy
-- Techniques: WITH RECURSIVE + Anchor Member + Recursive Self-Join + String Aggregation
-- Purpose: Computes the complete hierarchical supervisor-to-analyst reporting chain,
--          determining organizational depth level and full escalation audit path.
-- ----------------------------------------------------------------------------
WITH RECURSIVE soc_hierarchy AS (
    -- Anchor Member: Root SOC Manager / Administrator (reports_to IS NULL)
    SELECT 
        u.user_id,
        u.full_name,
        r.role_name,
        u.reports_to,
        1 AS tier_level,
        CAST(u.full_name AS VARCHAR(500)) AS escalation_path
    FROM users u
    JOIN roles r ON u.role_id = r.role_id
    WHERE u.reports_to IS NULL

    UNION ALL

    -- Recursive Member: Subordinate Analysts reporting to their supervisor
    SELECT 
        sub.user_id,
        sub.full_name,
        r.role_name,
        sub.reports_to,
        mgr.tier_level + 1 AS tier_level,
        CAST(mgr.escalation_path || ' -> ' || sub.full_name AS VARCHAR(500)) AS escalation_path
    FROM users sub
    JOIN roles r ON sub.role_id = r.role_id
    JOIN soc_hierarchy mgr ON sub.reports_to = mgr.user_id
)
SELECT 
    tier_level,
    user_id,
    full_name AS staff_member,
    role_name,
    escalation_path AS reporting_escalation_chain
FROM soc_hierarchy
ORDER BY tier_level ASC, user_id ASC;

