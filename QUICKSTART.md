# Quick Start Guide

## 1. Environment Setup

Create a `.env.local` file with these required variables:

\`\`\`env
# Required for NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-make-it-long

# Database (get from Neon.tech)
DATABASE_URL=postgresql://username:password@host:port/database
\`\`\`

## 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

## 3. Setup Database & Demo Users

\`\`\`bash
npm run dev-setup
\`\`\`

This will:
- Create all necessary database tables
- Create demo users for testing

## 4. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

## 5. Test the Application

Visit http://localhost:3000 and sign in with:

**Demo User:**
- Email: demo@example.com
- Password: demo123

**Admin User:**
- Email: admin@example.com  
- Password: admin123

## Troubleshooting

### NextAuth Error
If you see NextAuth errors, ensure:
1. `NEXTAUTH_SECRET` is set (generate with: `openssl rand -base64 32`)
2. `NEXTAUTH_URL` matches your domain
3. Database is accessible

### Database Connection
If database connection fails:
1. Check your `DATABASE_URL` format
2. Ensure database exists
3. Check network connectivity

### File Upload Issues
For development without Vercel Blob:
- Files will be stored locally in `/uploads` folder
- Watermarking will work for images
- Videos will show original (watermarking requires external service)
