import { NextResponse } from 'next/server';
const db = require('../../../../lib/db');

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Q09: Comprehensive SOC Analyst Performance & Triage Matrix
    const matrixRes = await db.query(`
      SELECT 
        u.user_id,
        u.full_name AS analyst_name,
        u.email,
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
      GROUP BY u.user_id, u.full_name, u.email
      ORDER BY total_assigned DESC, resolution_rate_percentage DESC;
    `);

    // Q04: Mean Turnaround / Resolution Time by Security Analyst (Hours)
    const turnaroundRes = await db.query(`
      SELECT 
        u.user_id,
        u.full_name AS analyst_name,
        COUNT(i.incident_id) AS resolved_count,
        ROUND(AVG(EXTRACT(EPOCH FROM (i.resolved_at - i.reported_at)) / 3600.0)::numeric, 2) AS avg_turnaround_hours
      FROM users u
      JOIN incidents i ON u.user_id = i.assigned_to
      WHERE i.resolved_at IS NOT NULL
      GROUP BY u.user_id, u.full_name
      ORDER BY avg_turnaround_hours ASC;
    `);

    return NextResponse.json({
      analystCaseloadMatrix: matrixRes.rows,
      resolutionTurnaround: turnaroundRes.rows,
    });
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

