---
name: vermithor_agent
description: Full-stack developer for Vermithor (Next.js + Elysia + tRPC + Better Auth + Drizzle)
---

This repo is a fresh clone of a production starter. Treat the current code as scaffolding and avoid assuming product behavior that is not documented.

## Product context (early)

- The only domain doc today is `docs/state-machines.md`, which sketches a resume -> career matches workflow.
- Treat the workflow as a direction, not a committed spec.

## Core guidelines

- Keep workspace boundaries clean; prefer shared packages in `packages/*`.
- Avoid deep relative imports across packages.
- Avoid editing `apps/web/src/components/ui/` unless there is a bug or a clear requirement.
- If requirements are unclear, state assumptions in the response and proceed.

## Stack overview

| Layer    | Technology           | Notes                          |
| -------- | -------------------- | ------------------------------ |
| Frontend | Next.js App Router   | `apps/web`                     |
| Backend  | Elysia               | `apps/server`                  |
| API      | tRPC                 | `packages/api` + `/trpc`       |
| Auth     | Better Auth          | `packages/auth` + `/api/auth`  |
| Database | PostgreSQL + Drizzle | `packages/db`                  |
| Monorepo | Turborepo + pnpm     | root `turbo.json` + workspaces |

## Repository layout

```
apps/
├── web/                      # Next.js frontend (App Router)
│   ├── src/app/              # Routes + layouts
│   ├── src/lib/              # tRPC + auth clients, site config
│   └── src/components/       # UI components and layouts
├── server/                   # Elysia backend
│   └── src/index.ts          # HTTP server + tRPC + auth endpoints
packages/
├── api/                      # tRPC router + procedures + context
├── auth/                     # Better Auth config + server client
├── db/                       # Drizzle schema + db helpers
└── config/                   # Shared TS config
```

## Baseline wiring (template)

- Web -> tRPC: `apps/web/src/lib/trpc.ts` calls `NEXT_PUBLIC_SERVER_URL + /trpc` with `credentials: "include"`.
- Web -> Auth: `authClient` (client) and `authServer` (server) talk to Better Auth endpoints.
- Server -> tRPC: `/trpc/*` uses `fetchRequestHandler` with `@vermithor/api`.
- Server -> Auth: `/api/auth/*` uses `auth.handler` from `@vermithor/auth`.
- Database: `packages/db` owns the schema; `packages/auth` uses `schema/auth.ts`.
- Drizzle config: `packages/db/drizzle.config.ts` loads env from `apps/server/.env`.
- Package scope is `@vermithor`.

## Runtime ports (defaults)

- `apps/web` runs on Next.js default port `3000` (unless overridden).
- `apps/server` listens on `3001` in `apps/server/src/index.ts`.

## Path aliases

- `apps/web` uses `~/` for `apps/web/src/*`.
- `apps/server` uses `~/` for `apps/server/src/*`.

## Commands (pnpm)

| Command            | Purpose                 |
| ------------------ | ----------------------- |
| `pnpm dev`         | Run all dev tasks       |
| `pnpm build`       | Build all packages/apps |
| `pnpm check-types` | Type-check all packages |
| `pnpm db:push`     | Push Drizzle schema     |
| `pnpm db:generate` | Generate migrations     |
| `pnpm db:migrate`  | Run migrations          |
| `pnpm db:studio`   | Open Drizzle Studio     |

## Environment variables

- `NEXT_PUBLIC_SERVER_URL` - Base URL for tRPC + auth from the web app.
- `CORS_ORIGIN` - Allowed origin for the Elysia CORS config.
- `DATABASE_URL` - PostgreSQL connection string (used by `@vermithor/db` and auth).
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth provider configuration for Better Auth.
- `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` - Better Auth core settings (per env examples).

Environment files live under each app:

- `apps/server/.env`
- `apps/web/.env`
