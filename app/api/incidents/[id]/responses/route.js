import { NextResponse } from 'next/server';
const db = require('../../../../../lib/db');
const { getSessionFromRequest } = require('../../../../../lib/auth');

export async function POST(request, { params }) {
  try {
    const incidentId = parseInt(params.id, 10);
    const session = getSessionFromRequest(request);
    const performerId = session ? session.userId : 2;

    const body = await request.json();
    const { action_type, description, action_status = 'Completed' } = body;

    if (!action_type || !description) {
      return NextResponse.json({ error: 'Action type and description are required.' }, { status: 400 });
    }

    const insertRes = await db.query(
      `INSERT INTO response_actions (incident_id, performed_by, action_type, description, action_status, performed_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING response_id, performed_at;`,
      [incidentId, performerId, action_type.trim(), description.trim(), action_status]
    );

    return NextResponse.json({
      success: true,
      responseId: insertRes.rows[0].response_id,
      performedAt: insertRes.rows[0].performed_at,
      message: 'Containment response action logged.',
    }, { status: 201 });
  } catch (error) {
    console.error('Add response error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

