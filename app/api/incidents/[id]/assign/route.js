import { NextResponse } from 'next/server';
const db = require('../../../../../lib/db');
const { getSessionFromRequest } = require('../../../../../lib/auth');

export async function POST(request, { params }) {
  try {
    const incidentId = parseInt(params.id, 10);
    const session = getSessionFromRequest(request);

    // Enforce role authorization: Only Admins can dispatch assignments
    if (session && session.roleName !== 'Administrator') {
      return NextResponse.json(
        { error: 'Forbidden: Only SOC Administrators can dispatch incident assignments.' },
        { status: 403 }
      );
    }

    const adminId = session ? session.userId : 1;
    const body = await request.json();
    const { analyst_id, notes = 'Standard SOC triage allocation' } = body;

    if (!analyst_id || isNaN(parseInt(analyst_id, 10))) {
      return NextResponse.json({ error: 'Valid analyst_id is required.' }, { status: 400 });
    }

    // Execute atomic stored procedure sp_assign_incident_atomic
    await db.query(
      `CALL sp_assign_incident_atomic($1, $2, $3, $4);`,
      [incidentId, parseInt(analyst_id, 10), adminId, notes]
    );

    return NextResponse.json({
      success: true,
      message: `Incident #${incidentId} atomically assigned to Analyst #${analyst_id} via ACID transaction.`,
    });
  } catch (error) {
    console.error('Assign incident error:', error);
    return NextResponse.json(
      { error: 'ACID Transaction Aborted: ' + error.message },
      { status: 400 }
    );
  }
}

