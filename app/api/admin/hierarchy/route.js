import { NextResponse } from 'next/server';
const db = require('../../../../lib/db');

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Q14: Recursive Common Table Expression (CTE): Organizational SOC Escalation Hierarchy
    const hierarchyRes = await db.query(`
      WITH RECURSIVE soc_hierarchy AS (
        -- Anchor Member: Root SOC Manager / Administrator
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
    `);

    // Audit logs
    const auditRes = await db.query(`
      SELECT 
        a.audit_id,
        a.incident_id,
        u.full_name AS user_name,
        a.action,
        a.description,
        a.created_at
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.user_id
      ORDER BY a.audit_id DESC
      LIMIT 25;
    `);

    return NextResponse.json({
      hierarchy: hierarchyRes.rows,
      recentAuditLogs: auditRes.rows,
    });
  } catch (error) {
    console.error('Hierarchy API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

