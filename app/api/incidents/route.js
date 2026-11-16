import { NextResponse } from 'next/server';
const db = require('../../../lib/db');
const { validateIncidentInput } = require('../../../lib/validation');
const { getSessionFromRequest } = require('../../../lib/auth');
const { embedIncident } = require('../../../lib/vector');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const assetId = searchParams.get('asset_id');
    const typeId = searchParams.get('type_id');
    const assignedTo = searchParams.get('assigned_to');
    const search = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const conditions = ['1=1'];
    const params = [];
    let paramIdx = 1;

    if (severity) {
      conditions.push(`i.severity = $${paramIdx++}`);
      params.push(severity);
    }
    if (status) {
      conditions.push(`i.status = $${paramIdx++}`);
      params.push(status);
    }
    if (assetId) {
      conditions.push(`i.asset_id = $${paramIdx++}`);
      params.push(assetId);
    }
    if (typeId) {
      conditions.push(`i.incident_type_id = $${paramIdx++}`);
      params.push(typeId);
    }
    if (assignedTo) {
      conditions.push(`i.assigned_to = $${paramIdx++}`);
      params.push(parseInt(assignedTo, 10));
    }
    if (search) {
      conditions.push(`(i.title ILIKE $${paramIdx} OR i.description ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    const whereClause = conditions.join(' AND ');

    const countRes = await db.query(
      `SELECT COUNT(*) FROM incidents i WHERE ${whereClause};`,
      params
    );
    const totalCount = parseInt(countRes.rows[0].count, 10);

    params.push(limit, offset);
    const querySql = `
      SELECT 
        i.incident_id,
        i.title,
        i.description,
        t.type_name AS classification,
        i.severity,
        i.priority,
        i.status,
        i.risk_score,
        a.asset_name,
        a.criticality AS asset_criticality,
        reporter.full_name AS reported_by_name,
        assignee.full_name AS assigned_to_name,
        i.reported_at,
        i.updated_at,
        i.resolved_at
      FROM incidents i
      JOIN incident_types t ON i.incident_type_id = t.incident_type_id
      JOIN assets a ON i.asset_id = a.asset_id
      LEFT JOIN users reporter ON i.reported_by = reporter.user_id
      LEFT JOIN users assignee ON i.assigned_to = assignee.user_id
      WHERE ${whereClause}
      ORDER BY 
        CASE i.severity
          WHEN 'Critical' THEN 1
          WHEN 'High' THEN 2
          WHEN 'Medium' THEN 3
          WHEN 'Low' THEN 4
          ELSE 5
        END,
        i.reported_at DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++};
    `;

    const incidentsRes = await db.query(querySql, params);

    return NextResponse.json({
      total: totalCount,
      limit,
      offset,
      incidents: incidentsRes.rows,
    });
  } catch (error) {
    console.error('Get incidents error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = getSessionFromRequest(request);
    const reporterId = session ? session.userId : 1; // Default to admin if unauthenticated in lab demo

    const body = await request.json();
    const validation = validateIncidentInput(body);

    if (!validation.isValid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const {
      title,
      description,
      incident_type_id,
      asset_id,
      severity,
      priority = severity,
      assigned_to = null,
      impact_score = 50.0,
    } = body;

    // Get asset criticality for stored risk function
    const assetRes = await db.query(
      `SELECT criticality FROM assets WHERE asset_id = $1;`,
      [asset_id]
    );
    const assetCriticality = assetRes.rows.length > 0 ? assetRes.rows[0].criticality : 'Medium';

    // Calculate initial risk score using PostgreSQL stored function calculate_incident_risk
    const riskRes = await db.query(
      `SELECT calculate_incident_risk($1, $2, $3) AS risk_score;`,
      [severity, assetCriticality, impact_score]
    );
    const calculatedRisk = parseFloat(riskRes.rows[0].risk_score);

    // Insert Incident
    const insertRes = await db.query(
      `INSERT INTO incidents (
        title, description, incident_type_id, severity, priority,
        status, asset_id, reported_by, assigned_to, risk_score,
        reported_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, 'New', $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING incident_id;`,
      [
        title.trim(),
        description.trim(),
        parseInt(incident_type_id, 10),
        severity,
        priority,
        parseInt(asset_id, 10),
        reporterId,
        assigned_to ? parseInt(assigned_to, 10) : null,
        calculatedRisk,
      ]
    );

    const newIncidentId = insertRes.rows[0].incident_id;

    // Record in audit_logs
    await db.query(
      `INSERT INTO audit_logs (user_id, incident_id, action, description, created_at)
       VALUES ($1, $2, 'INCIDENT_CREATED', $3, CURRENT_TIMESTAMP);`,
      [
        reporterId,
        newIncidentId,
        `Incident #${newIncidentId} ('${title}') registered. Initial risk score: ${calculatedRisk}.`,
      ]
    );

    // Trigger vector embedding generation asynchronously
    const fullNarrative = `${title}. ${description}`;
    embedIncident(newIncidentId, fullNarrative).catch((err) =>
      console.warn('Async embedding warning:', err.message)
    );

    return NextResponse.json({
      success: true,
      incidentId: newIncidentId,
      calculatedRisk,
      message: 'Security incident logged and indexed into vector engine.',
    }, { status: 201 });
  } catch (error) {
    console.error('Create incident error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

