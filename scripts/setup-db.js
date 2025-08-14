const { neon } = require("@neondatabase/serverless")

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is required")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    console.log("Setting up database...")

    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255),
          full_name VARCHAR(255),
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS permissions (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS role_permissions (
          id VARCHAR(36) PRIMARY KEY,
          role VARCHAR(50) NOT NULL,
          permission_id VARCHAR(36) NOT NULL,
          FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS media (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          original_url VARCHAR(512) NOT NULL,
          watermarked_url VARCHAR(512) NOT NULL,
          media_type VARCHAR(20) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS payments (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          media_id VARCHAR(36) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'USD',
          status VARCHAR(20) DEFAULT 'pending',
          payment_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
      );
    `

    await sql`
      CREATE TABLE IF NOT EXISTS media_access (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          media_id VARCHAR(36) NOT NULL,
          unlocked BOOLEAN DEFAULT FALSE,
          unlocked_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
          UNIQUE(user_id, media_id)
      );
    `

    // Insert sample permissions
    await sql`
      INSERT INTO permissions (id, name, description) VALUES
      ('perm-1', 'upload_media', 'Can upload media files'),
      ('perm-2', 'manage_users', 'Can manage user accounts'),
      ('perm-3', 'view_analytics', 'Can view platform analytics'),
      ('perm-4', 'delete_media', 'Can delete media files')
      ON CONFLICT (id) DO NOTHING;
    `

    // Insert role permissions
    await sql`
      INSERT INTO role_permissions (id, role, permission_id) VALUES
      ('rp-1', 'admin', 'perm-1'),
      ('rp-2', 'admin', 'perm-2'),
      ('rp-3', 'admin', 'perm-3'),
      ('rp-4', 'admin', 'perm-4'),
      ('rp-5', 'user', 'perm-1')
      ON CONFLICT (id) DO NOTHING;
    `

    console.log("Database setup completed successfully!")
  } catch (error) {
    console.error("Database setup failed:", error)
    process.exit(1)
  }
}

setupDatabase()
