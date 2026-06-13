# NOOREMOON

Premium fashion e-commerce platform — built with Next.js 16, NestJS, PostgreSQL, and Redis.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS, Redux Toolkit
- **Backend:** NestJS, REST + WebSocket (Socket.IO)
- **Database:** PostgreSQL + Redis + RabbitMQ
- **Payments:** Stripe + bKash + Bangladesh EPS (dashboard-managed)
- **Auth:** JWT + OTP (SYSSMS) + Google/Facebook OAuth2
- **CMS:** Strapi (self-hosted)
- **Infra:** Docker Compose, Cloudflare

## Getting Started

```bash
cp .env.example .env
# Fill in .env values

docker compose up -d
pnpm install
pnpm --filter apps/api run migration:run
pnpm --filter apps/api run seed
pnpm dev
```

## Build Guide

See `workflows/00_master_build_guide.md` for the complete sprint-by-sprint build plan.

## Project Structure

```
workflows/    Sprint recipe files (read before each sprint)
output/       SRS and deliverables
.claude/      Claude Code rules, commands, and skills
```
