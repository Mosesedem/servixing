# Servixing Deployment Guide

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Git repository

## Environment Setup

1. Copy `.env.example` to `.env.local`:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. Fill in all required environment variables:
   - Database connection string
   - NextAuth secret (generate with `openssl rand -base64 32`)
   - Google OAuth credentials
   - Paystack API keys

## Database Migration

\`\`\`bash
# Install dependencies
npm install

# Run Prisma migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
\`\`\`

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables in Vercel Settings
4. Deploy!

## Post-Deployment

1. Update `NEXTAUTH_URL` to production domain
2. Configure Google OAuth redirect URIs
3. Update Paystack webhooks
4. Set up SSL certificate
5. Enable HSTS headers

## Monitoring

- Vercel Analytics dashboard
- NextAuth logs
- Paystack transaction logs
- Database performance metrics

## Support

For deployment issues, check:
- Vercel documentation
- NextAuth.js documentation
- Database provider docs
