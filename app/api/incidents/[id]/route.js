import { NextResponse } from 'next/server';
const db = require('../../../../lib/db');
const { getSessionFromRequest } = require('../../../../lib/auth');

export async function GET(request, { params }) {
  try {
    const incidentId = parseInt(params.id, 10);
    if (isNaN(incidentId)) {
      return NextResponse.json({ error: 'Invalid incident ID.' }, { status: 400 });
    }

    // 1. Fetch Master Incident Details
    const incRes = await db.query(
      `SELECT 
        i.incident_id,
        i.title,
        i.description,
        i.incident_type_id,
        t.type_name AS classification,
        t.description AS type_description,
        i.severity,
        i.priority,
        i.status,
        i.risk_score,
        i.asset_id,
        a.asset_name,
        a.asset_type,
        a.criticality AS asset_criticality,
        a.ip_address,
        a.department AS asset_department,
        i.reported_by,
        reporter.full_name AS reported_by_name,
        reporter.email AS reporter_email,
        i.assigned_to,
        assignee.full_name AS assigned_to_name,
        assignee.email AS assignee_email,
        i.reported_at,
        i.updated_at,
        i.resolved_at
      FROM incidents i
      JOIN incident_types t ON i.incident_type_id = t.incident_type_id
      JOIN assets a ON i.asset_id = a.asset_id
      LEFT JOIN users reporter ON i.reported_by = reporter.user_id
      LEFT JOIN users assignee ON i.assigned_to = assignee.user_id
      WHERE i.incident_id = $1;`,
      [incidentId]
    );

    if (incRes.rows.length === 0) {
      return NextResponse.json({ error: 'Incident not found.' }, { status: 404 });
    }

    const incident = incRes.rows[0];

    // 2. Fetch Forensic Investigations
    const invRes = await db.query(
      `SELECT 
        inv.investigation_id,
        inv.analyst_id,
        u.full_name AS analyst_name,
        inv.findings,
        inv.started_at,
        inv.completed_at
      FROM investigations inv
      JOIN users u ON inv.analyst_id = u.user_id
      WHERE inv.incident_id = $1
      ORDER BY inv.started_at ASC;`,
      [incidentId]
    );

    // 3. Fetch Containment / Response Actions
    const respRes = await db.query(
      `SELECT 
        r.response_id,
        r.action_type,
        r.description,
        r.action_status,
        r.performed_by,
        u.full_name AS performed_by_name,
        r.performed_at
      FROM response_actions r
      JOIN users u ON r.performed_by = u.user_id
      WHERE r.incident_id = $1
      ORDER BY r.performed_at ASC;`,
      [incidentId]
    );

    // 4. Fetch Status History Audit Trail (populated by database trigger)
    const histRes = await db.query(
      `SELECT 
        h.history_id,
        h.old_status,
        h.new_status,
        h.changed_by,
        COALESCE(u.full_name, 'System Automation') AS changed_by_name,
        h.remarks,
        h.changed_at
      FROM incident_status_history h
      LEFT JOIN users u ON h.changed_by = u.user_id
      WHERE h.incident_id = $1
      ORDER BY h.changed_at ASC;`,
      [incidentId]
    );

    // 5. Fetch Risk Assessment Records
    const riskRes = await db.query(
      `SELECT 
        risk_id,
        severity_score,
        asset_score,
        impact_score,
        risk_score,
        risk_level,
        calculated_at
      FROM risk_assessments
      WHERE incident_id = $1
      ORDER BY calculated_at DESC;`,
      [incidentId]
    );

    return NextResponse.json({
      incident,
      investigations: invRes.rows,
      responseActions: respRes.rows,
      statusHistory: histRes.rows,
      riskAssessments: riskRes.rows,
    });
  } catch (error) {
    console.error('Incident detail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const incidentId = parseInt(params.id, 10);
    const session = getSessionFromRequest(request);
    const userId = session ? session.userId : null;

    const body = await request.json();
    const { status, severity, priority } = body;

    const updates = [];
    const vals = [];
    let idx = 1;

    if (status) {
      updates.push(`status = $${idx++}`);
      vals.push(status);
    }
    if (severity) {
      updates.push(`severity = $${idx++}`);
      vals.push(severity);
    }
    if (priority) {
      updates.push(`priority = $${idx++}`);
      vals.push(priority);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    vals.push(incidentId);

    // Note: If status is modified, trg_incident_status_change trigger fires automatically!
    const sql = `
      UPDATE incidents
      SET ${updates.join(', ')}
      WHERE incident_id = $${idx}
      RETURNING incident_id, status, severity, updated_at, resolved_at;
    `;

    const res = await db.query(sql, vals);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Incident not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      updated: res.rows[0],
      message: 'Incident updated successfully (trigger executed state tracking).',
    });
  } catch (error) {
    console.error('Update incident error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

