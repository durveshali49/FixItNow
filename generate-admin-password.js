const bcrypt = require('bcryptjs');

// Change this to your desired admin password
const plainPassword = 'admin123';

// Generate hash with cost factor of 10
const hash = bcrypt.hashSync(plainPassword, 10);

console.log('Plain password:', plainPassword);
console.log('Hashed password:', hash);
console.log('\nSQL command:');
console.log(`INSERT INTO admin_users (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@fixitnow.com',
  '${hash}',
  'System Administrator',
  'super_admin',
  true
);`);