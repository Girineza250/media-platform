// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Check if DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('‚ùå DATABASE_URL not found in environment variables');
  console.log('Make sure .env.local exists and contains DATABASE_URL');
  process.exit(1);
}

console.log('‚úÖ DATABASE_URL loaded successfully');
const sql = neon(process.env.DATABASE_URL);

async function setup() {
  try {
    console.log('Ì¥ß Creating database tables...');      
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('‚úÖ Users table created!');

    // Create demo user
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash('demo123', 12);

    await sql`
      INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
      VALUES (${userId}, 'demo@example.com', ${hashedPassword}, 'Demo User', 'user', NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
    `;

    // Create admin user
    const adminId = uuidv4();
    const adminPassword = await bcrypt.hash('admin123', 12);

    await sql`
      INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
      VALUES (${adminId}, 'admin@example.com', ${adminPassword}, 'Admin User', 'admin', NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
    `;

    console.log('‚úÖ Demo users created successfully!');
    console.log('Ìæâ Database setup complete!');
    console.log('');
    console.log('You can now login with:');
    console.log('Ì≥ß demo@example.com / Ì¥ë demo123');
    console.log('Ì≥ß admin@example.com / Ì¥ë admin123');

  } catch (error) {
    console.error('‚ùå Setup failed:', error);
    process.exit(1);
  }
}

setup();
