const bcrypt = require('bcryptjs');

const password = 'admin123';
const hash = '$2a$10$u90HiCbXFVX3gWf5ZSt5uOcYFEp1.kC9E4DHfm0joUi5IGNMNSL2y';

const isMatch = bcrypt.compareSync(password, hash);

console.log(`Testing password: ${password}`);
console.log(`Against hash: ${hash}`);
console.log(`Match: ${isMatch}`);
