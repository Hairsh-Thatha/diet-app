# NutriArc

Nuxt 4 + Vue 3 nutrition tracker with PostgreSQL/Drizzle persistence, server-side food image estimation, and Winter Arc habit tracking.

## Run locally

1. Install Node.js 20+ and PostgreSQL 15+.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`; set `AI_API_KEY` / `AI_MODEL` to enable food-image analysis.
3. Install packages with `npm install`.
4. Apply the initial database migration with `npm run db:migrate`.
5. Start Nuxt with `npm run dev`.

The AI key and database credentials are only read by Nitro server code. Food estimates are returned as estimates and must be reviewed before saving.

## Authentication

NutriArc includes account creation and login endpoints with scrypt password hashes and opaque, revocable server sessions. Session tokens are stored only as SHA-256 hashes in `auth_sessions`, and session cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` in production. All user data routes resolve identity from the session and never accept a user ID from request bodies. Apply the updated SQL schema before using registration; for existing installations, `nutriarc_schema.sql` adds `password_hash` and `auth_sessions` safely.

## Current implementation

Working foundations include the responsive app shell, food image selection/analysis/edit/save, meal listing/manual entry/removal, goal persistence, Winter Arc challenge creation/default habits/daily check-ins, and basic nutrition progress summaries. Profile management, user-facing authentication, custom habit editing, numerical habit progress inputs, rest days/calendar, and expanded fitness analytics remain to be implemented.
