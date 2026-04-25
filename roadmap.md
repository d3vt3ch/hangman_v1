# Hangman Rebuild Roadmap Checklist

## Milestone 1: Supabase Schema & Auth Setup
- [ ] Create Supabase project and enable Email/Password authentication.
- [ ] Create `profiles` table linked to `auth.users`.
- [ ] Create `categories`, `words`, and `scoreboard` tables.
- [ ] Add role constraint for `player`, `admin`, `super_admin`.
- [ ] Add trigger to auto-create `profiles` row on user signup.
- [ ] Add RLS policies for player/admin/super_admin access.
- [ ] Manually seed first `super_admin` in Supabase SQL editor.

## Milestone 2: Backend Infrastructure (FastAPI + Supabase Connection)
- [ ] Create virtual environment in `/backend`.
- [ ] Add backend dependencies to `requirements.txt`.
- [ ] Create FastAPI app structure (`app/core`, `app/api/routes`, `app/services`, `app/schemas`).
- [ ] Add environment configuration via `.env` and `.env.example`.
- [ ] Add health-check endpoint.
- [ ] Add shared Supabase client factory.

## Milestone 3: Authentication & Role Middleware (Backend)
- [ ] Implement Bearer token extraction from requests.
- [ ] Verify Supabase JWT and load user profile from `profiles`.
- [ ] Implement role guards (`player+`, `admin+`, `super_admin`).
- [ ] Add `GET /api/v1/auth/me` endpoint.

## Milestone 4: Administrative CRUD Endpoints
- [ ] Add category CRUD endpoints (`admin+`).
- [ ] Add word CRUD endpoints (`admin+`).
- [ ] Add scoreboard list/reset endpoints (`admin+`).
- [ ] Add promote/demote admin endpoints (`super_admin` only).

## Milestone 5: Game Logic Endpoints
- [ ] Add endpoint to fetch random word by category.
- [ ] Add endpoint to record authenticated player win.
- [ ] Add leaderboard endpoint.
- [ ] Add input validation and consistent response models.

## Milestone 6: React Frontend Setup & Auth Integration
- [ ] Initialize React + Vite project in `/frontend`.
- [ ] Add Tailwind CSS setup.
- [ ] Add Supabase client in frontend.
- [ ] Implement auth flow (register, login, logout).
- [ ] Store session token and send it to FastAPI.
- [ ] Add protected route wrappers for role-based pages.

## Milestone 7: Game UI & Admin Dashboard
- [ ] Build game page (category, hint, guessing, lives, win/loss).
- [ ] Build leaderboard page.
- [ ] Build admin category/word management page.
- [ ] Build super admin role-management page.
- [ ] Style all pages with Tailwind components.

## Milestone 8: Production Spec, Testing, and Deployment
- [ ] Write `PROD_SPEC.md` (architecture, RBAC matrix, API contracts, env vars).
- [ ] Add backend test checklist.
- [ ] Add frontend test checklist.
- [ ] Configure CORS for deployed frontend URL.
- [ ] Deploy backend to Render.
- [ ] Deploy frontend to Vercel.
- [ ] Run end-to-end deployment validation checklist.
