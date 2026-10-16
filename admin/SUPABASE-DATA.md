# Why admin shows no data after login

## Short answer

**Yes — live player/farm data only appears when the Express backend is running with your Supabase `DATABASE_URL`.**

The admin UI alone (static `searcho2.online/admin/dashboard.html`) cannot open Supabase from the browser with your DB password. That would expose secrets. Data flows like this:

```
Players (searcho2.online)
    → heartbeat / farm API  →  Express backend  →  Supabase Postgres
Admin dashboard
    → /api/admin/stats, /api/presence/live, /api/leaderboard  →  same backend  →  Supabase
```

If `/api/*` on searcho2.online still returns the HTML game page, **no backend is connected** → stats stay empty even after a successful local admin login.

## What I need from you (optional)

I do **not** need your Supabase password in chat if you can set it yourself:

1. Supabase → **Project Settings → Database → Connection string (URI)**  
2. Put it in `backend/.env` as `DATABASE_URL=...` (pooler port **6543** preferred)  
3. Run migrations `001`–`004` against that database  
4. Deploy/start backend and proxy `https://searcho2.online/api` → that service  

If you want me to verify connectivity in this environment, share a **temporary** connection string and **rotate the password after**.

## Schema note

SearchO2 Express expects tables: `users`, `farms`, `plots`, `user_sessions`, …  
Supabase may be empty or only have Better Auth tables (`user`, `session`).  
Run:

```bash
cd backend
cp .env.example .env   # set DATABASE_URL
npm install
npm run db:migrate
npm run dev
```

Then open `/api/health` — should return JSON `{ "status": "healthy", "database": "connected" }`.

## Guest players on static site only

Without backend, guests play in **browser localStorage only**. Those sessions never hit Supabase, so the admin DB will not list them until cloud save / presence is online.
