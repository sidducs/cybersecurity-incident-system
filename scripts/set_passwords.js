const bcrypt = require('bcryptjs');
const db = require('../lib/db');

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  console.log('Generated bcrypt hash:', hash);
  const res = await db.query('UPDATE users SET password_hash = $1', [hash]);
  console.log(`Updated ${res.rowCount} users with password 'password123'.`);
  
  // Verify
  const users = await db.query(`
    SELECT u.user_id, u.full_name, u.email, r.role_name, u.is_active 
    FROM users u 
    JOIN roles r ON u.role_id = r.role_id 
    ORDER BY r.role_name, u.full_name;
  `);
  console.log('\nUsers and roles in database:');
  console.table(users.rows);
  
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

