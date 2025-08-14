# Media Platform - Complete Working Project

A professional media upload, watermarking, and monetization platform built with Next.js 14.

## 🚀 Quick Start

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Setup database and demo users**:
   \`\`\`bash
   npm run dev-setup
   \`\`\`

3. **Start development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Visit your app**: http://localhost:3000

## 🔑 Demo Accounts

- **Demo User**: demo@example.com / demo123
- **Admin User**: admin@example.com / admin123

## ✅ Features

- ✅ User authentication with NextAuth.js
- ✅ File upload with drag & drop
- ✅ Automatic image watermarking
- ✅ Payment simulation for unlocking content
- ✅ Admin dashboard with analytics
- ✅ Responsive design
- ✅ Database integration with Neon

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: Neon PostgreSQL
- **UI**: shadcn/ui components
- **Authentication**: NextAuth.js with credentials

## 📁 Project Structure

\`\`\`
├── .env.local              # Environment variables (included)
├── package.json            # Dependencies and scripts
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── page.tsx           # Main application
├── components/            # React components
│   ├── ui/               # UI components
│   ├── auth/             # Auth components
│   └── providers/        # Context providers
├── lib/                  # Utility libraries
├── scripts/              # Setup scripts
└── types/                # TypeScript definitions
\`\`\`

## 🎯 Getting Started

The project is ready to run with your Neon database connection already configured in `.env.local`. Just run the setup script and start developing!
