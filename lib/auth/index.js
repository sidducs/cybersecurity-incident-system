const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cyber_jwt_secret_pesu_level3_eval_2026';

/**
 * Hash plaintext password using bcrypt with salt rounds = 10.
 */
async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compare candidate password with stored bcrypt hash.
 */
async function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

/**
 * Sign JWT token containing user identity and role.
 */
function signToken(user) {
  const payload = {
    userId: user.user_id,
    email: user.email,
    username: user.username || user.email,
    fullName: user.full_name,
    roleId: user.role_id,
    roleName: user.role_name,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

/**
 * Verify and decode JWT token.
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Extract authenticated user session from Next.js request headers / cookie.
 */
function getSessionFromRequest(req) {
  // Check Authorization Bearer header
  const authHeader = req.headers.get('authorization');
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Check cookie
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) return null;
  return verifyToken(token);
}

module.exports = {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  getSessionFromRequest,
};

