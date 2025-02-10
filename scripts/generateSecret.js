// ### Generate a Secure Session Secret

// If you haven't already generated a secure session secret, you can use the following script to generate one:

const crypto = require('crypto');

const secret = crypto.randomBytes(64).toString('hex');
console.log(secret);
