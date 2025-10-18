# FixItNow

FixItNow is a production-ready Next.js (App Router) web app scaffolded as a marketplace for home service bookings. It combines a user-facing booking experience with provider tools and an admin console. The data layer and authentication use Supabase; the UI uses Tailwind (shadcn components), Radix primitives, and some mapping via Leaflet.

This README expands on project features, architecture, database setup (Supabase), environment variables, developer workflow, and deployment notes.

## Key features

- User booking flow: search providers, pick a time, create appointments
- Provider dashboard: manage availability, view appointments, invoices
- Admin console: manage users/providers, view analytics, invoice management
- Invoicing: providers can create invoices tied to appointments; admin tools to view and update invoices
- Chat & AI assist: an AI-powered chatbot that stores messages in `chat_messages` and uses `/api/chat` for processing
- Maps: provider locations and selection tools using Leaflet
- Auth: Supabase-based auth with additional admin session handling (service role key for admin operations)

## Repo structure (selected)

- `app/` — Next.js App Router pages and layouts (customer, provider, admin)
- `components/` — UI components including `ai-chatbot`, invoice viewers, maps, admin components
- `lib/` — helpers and Supabase clients (including `lib/admin` which uses the Supabase service role key)
- `scripts/` — SQL migrations and utility scripts for Supabase schema, RLS policies, triggers, and fixes
- `public/` — static assets and leaflet resources

## Environment variables

Create a `.env.local` at the repository root. Example variables used across the codebase (create `.env.local` from the example file included):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
AI_API_KEY=
```

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public Supabase client
- `SUPABASE_SERVICE_ROLE_KEY` — server-side service role key used by `lib/admin` and setup scripts; keep secret
- `AI_API_KEY` — key used by AI/chat features if the app is configured to call an external LLM

I've added `.env.local.example` to this repo with the above keys (no secrets).

## Database & Supabase setup

The `scripts/` folder contains SQL and helpers for initializing and fixing the database:

- `001_create_database_schema.sql` — core tables: users, providers, appointments, invoices, chat_messages, admin_users, etc.
- `002_enable_rls_policies.sql` and `fix-invoice-policies.sql` — enable Row-Level Security and add policies so providers can create/update invoices tied to their appointments
- `003_create_functions_triggers.sql` — triggers and functions used by the app
- `004_create_chat_messages_table.sql` — chat messages table used by AI chatbot
- `005_create_admin_schema.sql` — admin-specific tables
- Other scripts handle storage policies, foreign keys, and specific fixes for the running instance

Recommended steps to set up a fresh Supabase project:

1. Create a new Supabase project.
2. Set the environment variables above in your deployment or `.env.local` for local dev.
3. Run the SQL files in order from the Supabase SQL editor or using `psql`/the Supabase CLI. The main entry is `001_create_database_schema.sql` then the rest in numeric order.
4. If you need a seeded admin user, see `generate-admin-password.js` and `verify-password.js` which help produce SQL to insert or update an admin user.

Important: `lib/admin/auth.ts` uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for admin operations — ensure this key is only used server-side (do not expose in the browser).

## Development

Install dependencies:

```bash
pnpm install
```

Run dev server:

```bash
pnpm dev
```

Linting and build:

```bash
pnpm lint
pnpm build
pnpm start
```

## Admin utilities

- `generate-admin-password.js` — helper to generate an SQL insert with a hashed admin password. Edit the plain password in the file before running if you want a custom one.
- `verify-password.js` — prints SQL to update an admin password for the seeded admin email.

## Notes on security and deployment

- Keep `SUPABASE_SERVICE_ROLE_KEY` secret. Store it in your deployment provider's secret store (Vercel, Netlify, etc.).
- RLS is enabled; SQL policies live in `scripts/`. If you modify policies, test with non-admin accounts.
- When deploying, use environment variables rather than committing secrets.

## Running DB fixes

Several SQL files are included to fix issues found during development (e.g., `fix-invoice-policies.sql`, `fix-verification-constraint.sql`). Run these in your Supabase SQL editor against the correct project when needed.

## Contributing

1. Fork and create a branch for your feature or fix.
2. Add tests where applicable and update the README if you change behavior.
3. Open a PR describing the change.

## Next steps / TODOs

- Add automated tests and a CI workflow
- Add Docker / containerized local dev
- Add an `infra/` or `supabase/` folder with a reproducible migration plan (eg. pg_dump, seed data)

---

If you'd like, I can expand the README with a diagram of the data model (I can generate one from the SQL), or create `.env.local.example` now (I will add it below if you want me to proceed).
