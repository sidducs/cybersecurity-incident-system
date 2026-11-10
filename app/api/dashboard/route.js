import { NextResponse } from 'next/server';
const db = require('../../../lib/db');

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Core metric counters
    const countsRes = await db.query(`
      SELECT 
        COUNT(*) AS total_incidents,
        COUNT(CASE WHEN status IN ('New', 'Investigating', 'Contained') THEN 1 END) AS active_incidents,
        COUNT(CASE WHEN severity = 'Critical' AND status NOT IN ('Resolved', 'Closed') THEN 1 END) AS active_critical,
        COUNT(CASE WHEN status = 'Resolved' THEN 1 END) AS resolved_incidents,
        ROUND(AVG(risk_score), 1) AS avg_risk_score
      FROM incidents;
    `);

    // 2. Incident distribution by attack classification (Q01)
    const typesRes = await db.query(`
      SELECT 
        t.type_name,
        COUNT(i.incident_id) AS count
      FROM incident_types t
      LEFT JOIN incidents i ON t.incident_type_id = i.incident_type_id
      GROUP BY t.type_name
      ORDER BY count DESC;
    `);

    // 3. Severity breakdown (Q02)
    const severityRes = await db.query(`
      SELECT 
        severity,
        COUNT(*) AS count
      FROM incidents
      GROUP BY severity
      ORDER BY 
        CASE severity
          WHEN 'Critical' THEN 1
          WHEN 'High' THEN 2
          WHEN 'Medium' THEN 3
          WHEN 'Low' THEN 4
          ELSE 5
        END;
    `);

    // 4. High-Priority incidents queue (using database VIEW v_high_priority_incidents)
    const highPriorityRes = await db.query(`
      SELECT 
        incident_id,
        incident_title AS title,
        severity,
        priority,
        status,
        asset_name,
        asset_criticality AS criticality,
        assigned_analyst,
        risk_score,
        reported_at
      FROM v_high_priority_incidents
      LIMIT 6;
    `);

    // 5. Frequently attacked assets (Q06 / v_asset_threat_exposure)
    const assetsRes = await db.query(`
      SELECT 
        a.asset_name,
        a.criticality,
        a.department,
        COUNT(i.incident_id) AS attack_count
      FROM assets a
      JOIN incidents i ON a.asset_id = i.asset_id
      GROUP BY a.asset_id, a.asset_name, a.criticality, a.department
      ORDER BY attack_count DESC
      LIMIT 5;
    `);

    return NextResponse.json({
      metrics: countsRes.rows[0],
      incidentTypes: typesRes.rows,
      severityBreakdown: severityRes.rows,
      highPriorityQueue: highPriorityRes.rows,
      topAssets: assetsRes.rows,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

