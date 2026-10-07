const bcrypt = require('bcryptjs');

// Test common passwords against the stored hashes
const passwords = [
  'password',
  'admin123',
  'principal',
  'registrar', 
  'accounting',
  'Test@123',
  'test123',
  '12345678',
  'password123'
];

// Full hashes from database
const admins = {
  ADMIN001: '$2a$10$1vCSiFnWhUotX/qVVe6PxOCYGSco9zHBwlzNvVJl0AkhFKLGSL4hm',
  ADMIN002: '$2a$10$QSf8Ofw2yhSCFyx7mackO.htJ8w1FmrVqirWA6Xal2Lu7drXafZqe',
  ADMIN003: '$2a$10$qu22zF3IcJETVQsL1KNIPOEH7LyxLdoYm6nR8A1SoviIuIGs6hT/C'
};

console.log('Testing passwords for admin accounts...\n');

for (const [adminId, hash] of Object.entries(admins)) {
  console.log(`\n${adminId}:`);
  for (const password of passwords) {
    const isMatch = bcrypt.compareSync(password, hash);
    if (isMatch) {
      console.log(`  ✓ Password found: "${password}"`);
    }
  }
}

console.log('\n\nIf no passwords matched, these accounts were created with random/unknown passwords.');
console.log('You can reset them by updating the database with a known password hash.');

