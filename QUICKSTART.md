# 🚀 Servixing - Repair Shop Management System - Quick Start

## ✅ Phase 1 Complete!

Foundation infrastructure is ready. See `PHASE1_SUMMARY.md` for full details.

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Setup environment (copy and fill in .env)
cp .env.example .env.local

# 3. Push database schema
pnpm db:push

# 4. Start development server
pnpm dev
```

Server runs at `http://localhost:3000`

## Test Health Check

```bash
curl http://localhost:3000/api/health
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm db:push` - Push schema to database
- `pnpm db:studio` - Open Prisma Studio
- `pnpm test` - Run tests

## Documentation

- **Full Phase 1 Summary:** [PHASE1_SUMMARY.md](./PHASE1_SUMMARY.md)
- **Environment Template:** [.env.example](./.env.example)
- **Database Schema:** [prisma/schema.prisma](./prisma/schema.prisma)

## What's Built (Phase 1)

✅ Complete Prisma schema (13 models, 8 enums)  
✅ Error handling system  
✅ Logging infrastructure  
✅ Validation schemas (Zod)  
✅ Service layer (Auth, Device, WorkOrder, Payment)  
✅ Standardized API responses  
✅ Health check endpoint  
✅ Test framework setup

## Next: Phase 2

- Authentication pages (signup/signin)
- Device registration
- Work order creation
- Admin dashboard basics

---

Built with Next.js 16, TypeScript, Prisma, and Tailwind CSS
