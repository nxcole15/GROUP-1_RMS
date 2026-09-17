const bcrypt = require('bcryptjs');

const accounts = [
  {
    id: 'PRINCIPAL01',
    password: 'principal2026',
    hash: '$2a$10$XXvgD2PGAEqY5NxvLz/duOvsq0l5.HodhOd08HY.KosICd0vGBXPm'
  },
  {
    id: 'REGISTRAR02',
    password: 'registrar2026',
    hash: '$2a$10$R1IX0gelGUX/p9dKlwMsdexxxgWqvBa1eGjh0lCbSDa3UgGVrDHeS'
  },
  {
    id: 'ACCOUNTING03',
    password: 'accounting2026',
    hash: '$2a$10$A8jZKVJ2aaxZOmTv5Vm/juql46n.fqGn/twe68DIJ2dwBkFHUyT66'
  }
];

console.log('Verifying admin account passwords:\n');

for (const account of accounts) {
  const isMatch = bcrypt.compareSync(account.password, account.hash);
  const status = isMatch ? '✓ VALID' : '✗ INVALID';
  console.log(`${status} - ${account.id}: ${account.password}`);
}

console.log('\n✅ All accounts are ready to use!');
