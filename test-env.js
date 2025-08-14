require('dotenv').config({ path: '.env.local' });

console.log('Current working directory:', process.cwd());
console.log('DATABASE_URL from env:', process.env.DATABASE_URL);
console.log('All env vars starting with DATABASE:', Object.keys(process.env).filter(key => key.includes('DATABASE')));
