import { NextResponse } from 'next/server';
const { getSessionFromRequest } = require('../../../../lib/auth');
const db = require('../../../../lib/db');

export async function GET(request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  try {
    const userRes = await db.query(
      `SELECT u.user_id, u.role_id, u.full_name, u.email, r.role_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = $1 AND u.is_active = TRUE;`,
      [session.userId]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const u = userRes.rows[0];
    return NextResponse.json({
      authenticated: true,
      user: {
        userId: u.user_id,
        fullName: u.full_name,
        email: u.email,
        roleId: u.role_id,
        roleName: u.role_name,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

