# iTrack

A personal job/internship application tracker. Next.js (App Router) + TypeScript + Tailwind CSS, backed by Supabase (Postgres + Auth). Single-user, deployable to Vercel with zero extra config.

## Features

- **Dashboard** — stat cards, a "follow-ups due" panel (mark done / snooze +3 days), recent activity feed, applications-per-week chart
- **Applications table** — sortable, filterable, searchable, inline cell editing, bulk status change / delete, CSV export, "New Application" slide-over for fast entry
- **Board** — Kanban view grouped by status with drag-and-drop (updates status + logs activity)
- **Application detail** — editable fields, collapsible job description reading pane, contacts (outreach status, copy email, open LinkedIn), custom key/value fields, activity timeline
- **Auth** — Supabase email/password, single user, all routes protected

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com/dashboard) → **New project**.
2. Once it's provisioned, open **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key

## 2. Run the schema

1. Open **SQL Editor** in the Supabase dashboard → **New query**.
2. Paste the contents of `schema.sql` and run it. This creates the `applications`, `contacts`, and `activity_log` tables, enums, indexes, an `updated_at` trigger, and Row Level Security policies scoped to `auth.uid()`.

## 3. Create your user

Since there's no public sign-up page (single-user app), create your account directly:

1. Supabase Dashboard → **Authentication → Users → Add user**.
2. Enter your email and a password. You'll use these to sign in to iTrack.

## 4. (Optional) Seed sample data

To see the UI populated immediately:

1. SQL Editor → **New query** → paste `seed.sql` → run it.
2. It automatically attaches the sample applications, contacts, and activity log entries to your (single) user account.

## 5. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local` with the Project URL and anon key from step 1:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 6. Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`. Sign in with the user you created in step 3.

## 7. Deploy to Vercel

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo. Set the **root directory** to `itrack` if it's part of a larger monorepo.
3. Add the two environment variables from `.env.local` in the Vercel project settings (**Settings → Environment Variables**).
4. Deploy. No further configuration is needed — the build is a standard `next build`.

## Project structure

```
app/
  login/              — sign-in page (public)
  (app)/               — auth-protected route group (sidebar + mobile nav layout)
    page.tsx            — dashboard
    applications/        — table view + [id] detail page
    board/               — kanban view
lib/
  supabase/            — browser/server Supabase clients + auth proxy helper
  actions.ts           — server actions (create/update/delete, mutations)
  data.ts              — server-side data fetching
  constants.ts         — status/job-type labels, colors, options
  utils.ts             — date helpers, cn()
components/            — UI components (table, board, detail, forms, etc.)
types/database.ts       — TypeScript types mirroring the Postgres schema
schema.sql              — paste into Supabase SQL editor
seed.sql                 — optional sample data
```

## Notes

- Route protection is implemented via `proxy.ts` (Next.js's current name for what was previously `middleware.ts`), which refreshes the Supabase session on every request and redirects unauthenticated requests to `/login`.
- All mutations go through Server Actions in `lib/actions.ts`, which re-check `auth.getUser()` server-side — defense in depth on top of Postgres Row Level Security.
- Inline edits and drag-and-drop use optimistic UI updates that revert with a toast if the underlying mutation fails.
