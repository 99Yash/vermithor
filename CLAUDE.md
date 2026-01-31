# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vermithor is a full-stack TypeScript monorepo for a resume-to-career-matches platform. Uses Next.js 16 frontend, Elysia backend, tRPC for type-safe APIs, Better-Auth for authentication, and Drizzle ORM with PostgreSQL.

## Commands

| Command            | Purpose                           |
| ------------------ | --------------------------------- |
| `pnpm dev`         | Run all dev tasks (web + server)  |
| `pnpm dev:web`     | Run web app only (port 3000)      |
| `pnpm dev:server`  | Run server only (port 3001)       |
| `pnpm build`       | Build all packages/apps           |
| `pnpm check-types` | Type-check all packages with tsc  |
| `pnpm db:push`     | Push Drizzle schema to database   |
| `pnpm db:generate` | Generate database migrations      |
| `pnpm db:migrate`  | Run pending migrations            |
| `pnpm db:studio`   | Open Drizzle Studio GUI           |

## Architecture

```
apps/
├── web/                 # Next.js frontend (App Router, React 19)
│   └── src/
│       ├── app/         # Routes: (auth), dashboard
│       ├── components/  # UI + layouts
│       ├── hooks/       # Custom React hooks
│       └── lib/         # tRPC client, auth, utils, env
├── server/              # Elysia backend (port 3001)
│   └── src/index.ts     # HTTP server + tRPC + auth endpoints
packages/
├── api/                 # tRPC router + procedures + context
│   └── src/routers/     # resumes.ts, streaming.ts
├── auth/                # Better-Auth config + server client
├── db/                  # Drizzle schema + migrations
│   └── src/schema/      # auth.ts, resume.ts
└── config/              # Shared TypeScript configs
```

## Key Wiring

- **Web → tRPC**: `apps/web/src/lib/trpc.ts` calls `NEXT_PUBLIC_SERVER_URL/trpc` with credentials
- **Web → Auth**: `authClient` (client) and `authServer` (server components) use Better-Auth
- **Server → tRPC**: `/trpc/*` uses `fetchRequestHandler` with `@vermithor/api`
- **Server → Auth**: `/api/auth/*` uses Better-Auth handler
- **Database**: `packages/db` owns schema; `packages/auth` uses `schema/auth.ts`
- **Package scope**: `@vermithor/*`

## Path Aliases

- `~/` → `./src/*` in both `apps/web` and `apps/server`

## Environment Variables

Required in `apps/server/.env` and `apps/web/.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SERVER_URL` - Base URL for tRPC + auth from web
- `CORS_ORIGIN` - Allowed origin for Elysia CORS
- `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` - Auth settings
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth provider

## Development Guidelines

- Keep workspace boundaries clean; business logic in `packages/*`, not in UI components
- Avoid deep relative imports across packages
- Avoid editing `apps/web/src/components/ui/` unless fixing bugs
- Use `protectedProcedure` for authenticated tRPC routes, `publicProcedure` otherwise
- All procedure inputs validated with Zod schemas
- S3 keys follow format: `resumes/{userId}/{resumeId}.pdf`
- PDF validation: check magic header + content-type

## Workflow Reference

See `docs/state-machines.md` for the three main workflows:
1. Resume → Career Matches (upload, parse, fetch jobs, analyze, stream results)
2. Results Exploration (filters, sorts, pagination)
3. Resume Improvement (inline editing with suggestions)
