# Simple Media Platform

A streamlined media platform with upload, watermarking, and purchase unlock functionality.

## Features

✅ **Admin Upload**: Only admins can upload media files  
✅ **Automatic Watermarking**: Images get watermarked automatically  
✅ **Media Gallery**: Browse watermarked previews  
✅ **Purchase System**: Pay to unlock original files  
✅ **Download Access**: Download originals after purchase  
✅ **Admin Dashboard**: View stats and manage media  

## Quick Start

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment**:
   Create `.env.local` with:
   \`\`\`env
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   \`\`\`

3. **Start development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Access the app**:
   - Visit: http://localhost:3000
   - Demo User: `user@example.com` / `user123`
   - Demo Admin: `admin@example.com` / `admin123`

## How It Works

### For Admins:
1. Sign in with admin account
2. Go to "Upload" tab
3. Upload images/videos with title and price
4. Files are automatically watermarked
5. Manage uploads in "Admin" dashboard

### For Users:
1. Sign in with user account
2. Browse media gallery
3. Preview watermarked versions
4. Click "Unlock" to purchase originals
5. Download purchased files

## Technical Details

- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Authentication**: NextAuth.js with demo accounts
- **Storage**: Local file system (public/uploads/)
- **Watermarking**: Sharp for image processing
- **State**: In-memory storage (replace with database)

## File Structure

\`\`\`
├── app/
│   ├── api/           # API routes
│   ├── auth/          # Authentication pages
│   └── page.tsx       # Main dashboard
├── components/        # React components
├── public/uploads/    # File storage
└── README.md
\`\`\`

## Demo Accounts

- **User**: user@example.com / user123
- **Admin**: admin@example.com / admin123

## Next Steps

For production deployment:
1. Replace in-memory storage with database
2. Add real payment processing (Stripe)
3. Implement video watermarking with FFmpeg
4. Add cloud storage (AWS S3, Vercel Blob)
5. Add user registration
