# 🚀 Quick Start Guide - Servixing Repair Shop

This guide will get you up and running with the Servixing Repair Shop Management System in under 5 minutes.

---

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- PostgreSQL database (we recommend [Neon](https://neon.tech) for free tier)
- Git installed

---

## Step 1: Clone & Install

```bash
# Navigate to your project
cd servixing

# Install dependencies
pnpm install
```

---

## Step 2: Configure Environment

```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your actual values
nano .env  # or use your preferred editor
```

### Minimum Required Variables

```env
# Database (Required)
DATABASE_URL="your-postgresql-connection-string"

# NextAuth (Required)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="run: openssl rand -base64 32"

# Paystack (Required for payments)
PAYSTACK_SECRET_KEY="sk_test_your_key"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_your_key"
```

---

## Step 3: Set Up Database

```bash
# Generate Prisma Client
pnpm prisma generate

# Run database migrations
pnpm db:migrate

# Seed the database with test data
pnpm db:seed
```

You should see:

```
🎉 Database seeding completed successfully!

📊 Summary:
   Users: 4 (1 Super Admin, 1 Technician, 2 Customers)
   Devices: 4
   Work Orders: 4
   ...
```

---

## Step 4: Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Step 5: Test Login

Use these credentials to log in:

### Super Admin

- Email: `admin@servixing.com`
- Password: `Admin@123456`

### Customer

- Email: `user@example.com`
- Password: `User@123456`

---

## 🎯 What's Available Now?

After Stage 1 setup, you have:

✅ Complete database schema with 15 models  
✅ Seeded test data  
✅ All external service integrations ready  
✅ Utility functions for common tasks  
✅ UI component library (shadcn/ui)  
✅ Type-safe environment variables

---

## 📊 Explore Your Data

```bash
# Open Prisma Studio to browse your database
pnpm db:studio
```

This opens a visual database browser at `http://localhost:5555`

---

## 🛠️ Useful Commands

```bash
# Development
pnpm dev                 # Start dev server
pnpm build              # Build for production
pnpm start              # Start production server

# Database
pnpm db:migrate         # Create new migration
pnpm db:push            # Push schema changes (no migration)
pnpm db:studio          # Visual database browser
pnpm db:seed            # Re-seed database

# Testing
pnpm test               # Run tests
pnpm lint               # Run linter
```

---

## 🔧 Troubleshooting

### Database Connection Error

- Verify `DATABASE_URL` in `.env`
- Ensure database is accessible
- Check connection string format

### Migration Failed

```bash
# Reset database (CAUTION: Deletes all data)
pnpm prisma migrate reset --force
```

### Module Not Found

```bash
# Reinstall dependencies
pnpm install
```

### Port Already in Use

```bash
# Change port in package.json dev script
"dev": "next dev -p 3001"
```

---

## 📁 Project Structure

```
servixing/
├── app/              # Next.js pages and API routes
├── components/       # Reusable React components
├── lib/             # Utility functions
│   ├── cloudinary.ts   # Image uploads
│   ├── redis.ts        # Caching
│   ├── queue.ts        # Background jobs
│   ├── paystack.ts     # Payments
│   └── config.ts       # Configuration
├── prisma/          # Database schema and migrations
└── types/           # TypeScript type definitions
```

---

## 🎓 Next Steps

1. **Review the database schema**: Open `prisma/schema.prisma`
2. **Explore seeded data**: Run `pnpm db:studio`
3. **Check configuration**: Review `lib/config.ts`
4. **Read Stage 1 docs**: See `STAGE1_COMPLETE.md`
5. **Start Stage 2**: Begin building authentication system

---

## 🔐 External Services Setup (Optional)

### Cloudinary (Image Uploads)

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret
3. Add to `.env`:
   ```env
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

### Upstash Redis (Caching)

1. Sign up at [upstash.com](https://upstash.com)
2. Create a Redis database
3. Add to `.env`:
   ```env
   UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="your-token"
   ```

### Paystack (Payments)

1. Sign up at [paystack.com](https://paystack.com)
2. Get test API keys from dashboard
3. Add to `.env`:
   ```env
   PAYSTACK_SECRET_KEY="sk_test_your_key"
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_your_key"
   ```

### Google OAuth (Authentication)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

---

## 📞 Support

- **Documentation**: Check `/STAGE1_COMPLETE.md`
- **Database Issues**: Review Prisma docs
- **Environment Setup**: Check `.env.example`

---

## ✅ Checklist

- [ ] Dependencies installed
- [ ] `.env` file configured
- [ ] Database migrated
- [ ] Database seeded
- [ ] Development server running
- [ ] Can log in with test credentials
- [ ] Prisma Studio accessible

---

**🎉 You're all set! Happy coding!**

_For detailed information, see `STAGE1_COMPLETE.md`_
