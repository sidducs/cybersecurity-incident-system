import { NextResponse } from 'next/server';
const db = require('../../../../../lib/db');
const { getSessionFromRequest } = require('../../../../../lib/auth');

export async function POST(request, { params }) {
  try {
    const incidentId = parseInt(params.id, 10);
    const session = getSessionFromRequest(request);
    let analystId = session ? session.userId : 2;

    // Validate that analyst exists in users table (in case of stale session)
    const userCheck = await db.query('SELECT user_id FROM users WHERE user_id = $1;', [analystId]);
    if (userCheck.rows.length === 0) {
      analystId = 2; // Default to active analyst Alex Rivera
    }

    const body = await request.json();
    const { findings } = body;

    if (!findings || typeof findings !== 'string' || findings.trim().length < 5) {
      return NextResponse.json({ error: 'Findings must be at least 5 characters.' }, { status: 400 });
    }

    const insertRes = await db.query(
      `INSERT INTO investigations (incident_id, analyst_id, findings, started_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING investigation_id, started_at;`,
      [incidentId, analystId, findings.trim()]
    );

    return NextResponse.json({
      success: true,
      investigationId: insertRes.rows[0].investigation_id,
      startedAt: insertRes.rows[0].started_at,
      message: 'Forensic investigation logged.',
    }, { status: 201 });
  } catch (error) {
    console.error('Add investigation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

