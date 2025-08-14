# Media Platform Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Neon Database**: Create a database at [neon.tech](https://neon.tech)
3. **Stripe Account**: Set up at [stripe.com](https://stripe.com)

## Environment Variables

Set these in your Vercel dashboard or `.env.local`:

\`\`\`env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here

# File Storage
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# Payment
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
WATERMARK_TEXT=PREVIEW
\`\`\`

## Deployment Steps

### 1. Database Setup

1. Create a Neon database
2. Copy the connection string
3. Run the setup script:

\`\`\`bash
npm run db:setup
\`\`\`

### 2. Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy:

\`\`\`bash
vercel --prod
\`\`\`

### 3. Stripe Configuration

1. Set up webhook endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
2. Enable events: `payment_intent.succeeded`
3. Copy webhook secret to environment variables

### 4. Vercel Blob Setup

1. Enable Vercel Blob in your project
2. Copy the read/write token
3. Add to environment variables

## Post-Deployment

1. Test file upload functionality
2. Test payment flow
3. Verify webhook is receiving events
4. Check database connections

## Monitoring

- Use Vercel Analytics for performance monitoring
- Set up Stripe Dashboard for payment monitoring
- Monitor Neon database usage

## Scaling Considerations

- Enable Vercel Pro for higher limits
- Consider CDN for media delivery
- Implement caching strategies
- Monitor database performance
\`\`\`

Create a database setup script:
