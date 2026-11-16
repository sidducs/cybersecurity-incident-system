const db = require('../lib/db');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Adding username column to users table...');
  await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;');

  const updates = [
    { id: 1, username: 'admin', pass: 'admin' },
    { id: 2, username: 'analyst', pass: 'analyst' },
    { id: 3, username: 'david', pass: 'david' },
    { id: 4, username: 'maya', pass: 'maya' },
    { id: 5, username: 'vikram', pass: 'vikram' },
    { id: 6, username: 'elena', pass: 'elena' }
  ];

  for (const u of updates) {
    const hash = await bcrypt.hash(u.pass, 10);
    await db.query(
      'UPDATE users SET username = $1, password_hash = $2 WHERE user_id = $3',
      [u.username, hash, u.id]
    );
  }

  console.log('Updated all users with simple usernames and matching passwords.');

  const res = await db.query(`
    SELECT u.user_id, u.username, u.full_name, u.email, r.role_name 
    FROM users u 
    JOIN roles r ON u.role_id = r.role_id 
    ORDER BY u.user_id;
  `);
  console.table(res.rows);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
