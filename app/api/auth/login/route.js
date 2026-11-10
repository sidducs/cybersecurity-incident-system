import { NextResponse } from 'next/server';
const db = require('../../../../lib/db');
const { comparePassword, signToken } = require('../../../../lib/auth');

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Query user by email with role information
    const userRes = await db.query(
      `SELECT u.user_id, u.role_id, u.full_name, u.email, u.password_hash, u.is_active, r.role_name
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE LOWER(u.email) = LOWER($1);`,
      [email.trim()]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact your SOC administrator.' },
        { status: 403 }
      );
    }

    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const token = signToken(user);

    // Record login in audit_logs
    await db.query(
      `INSERT INTO audit_logs (user_id, action, description, created_at)
       VALUES ($1, 'USER_LOGIN', $2, CURRENT_TIMESTAMP);`,
      [user.user_id, `User ${user.full_name} (${user.role_name}) logged in successfully.`]
    );

    const response = NextResponse.json({
      success: true,
      user: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        roleId: user.role_id,
        roleName: user.role_name,
      },
      token,
    });

    // Set HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: false, // Accessible to client-side scripts for easy UI state
      path: '/',
      maxAge: 8 * 3600, // 8 hours
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server authentication error: ' + error.message },
      { status: 500 }
    );
  }
}

