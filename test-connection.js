require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function testConnection() {
  try {
    console.log('Testing Neon database connection...');
    const sql = neon(process.env.DATABASE_URL);
    
    // Simple query to test connection
    const result = await sql`SELECT NOW() as current_time`;
    console.log('‚úÖ Connection successful!');
    console.log('Current time from database:', result[0].current_time);
    
  } catch (error) {
    console.error('‚ùå Connection failed:', error.message);
    console.log('\nÌ≤° Try these solutions:');
    console.log('1. Check your Neon dashboard - database might be suspended');
    console.log('2. Reset your database password in Neon console');
    console.log('3. Get a fresh connection string from Neon');
    console.log('4. Update your .env.local file with the new connection string');
  }
}

testConnection();
