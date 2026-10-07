const bcrypt = require('bcryptjs');

const password = 'superadmin007';
const storedHash = '$2a$10$35F.uacNfhStE1mKXjn9aOHxDx6LvpQWvV3ZzRZT780ZwVNiV5pQy';

const isMatch = bcrypt.compareSync(password, storedHash);

console.log(`Password: ${password}`);
console.log(`Stored Hash: ${storedHash}`);
console.log(`Match: ${isMatch}`);
