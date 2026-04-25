# Hangman Production Specification

## 1. System Overview
- Frontend: React + Vite + Tailwind (`/frontend`) deployed to Vercel.
- Backend: FastAPI (`/backend`) deployed to Render.
- Database and Auth: Supabase PostgreSQL + Supabase Auth.
- Architecture style: Decoupled frontend and backend, with backend protecting service-role data access.

## 2. RBAC Matrix
- `player`: play game, read categories/words, view leaderboard, update own score through game endpoint.
- `admin`: all player permissions + manage categories and words + reset player scores.
- `super_admin`: all admin permissions + promote/demote admin roles.

## 3. Database Contracts
- `profiles(id uuid pk -> auth.users.id, username text unique, role text check, created_at timestamptz)`.
- `categories(id bigint identity pk, name text unique not null)`.
- `words(id bigint identity pk, category_id bigint fk categories, word text, hint text)`.
- `scoreboard(id bigint identity pk, profile_id uuid unique fk profiles, wins int default 0)`.

## 4. Backend API Contracts
- Health: `GET /health`.
- Auth: `GET /api/v1/auth/me`.
- Game:
  - `GET /api/v1/game/categories`
  - `GET /api/v1/game/random-word?category_id={id}`
  - `POST /api/v1/game/record-win`
  - `GET /api/v1/game/leaderboard`
- Admin:
  - `GET/POST/PUT/DELETE /api/v1/admin/categories`
  - `GET/POST/PUT/DELETE /api/v1/admin/words`
  - `GET /api/v1/admin/scoreboard`
  - `POST /api/v1/admin/scoreboard/reset?profile_id={uuid}`
  - `POST /api/v1/admin/roles/promote-admin`
  - `POST /api/v1/admin/roles/demote-admin`

## 5. Environment Variables
### Backend (`/backend/.env`)
- `APP_NAME`
- `APP_ENV`
- `APP_PORT`
- `FRONTEND_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_AUDIENCE`

### Frontend (`/frontend/.env`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_BACKEND_API_BASE_URL`

## 6. Deployment Runbook
1. Run Supabase SQL script: `supabase/schema_and_policies.sql`.
2. Seed first super admin:
   - register first account,
   - update role to `super_admin` in Supabase SQL editor.
3. Deploy backend on Render:
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:application_instance --host 0.0.0.0 --port $PORT`
4. Deploy frontend on Vercel:
   - Framework preset: Vite
   - Set `VITE_BACKEND_API_BASE_URL` to Render URL.
5. Update backend `FRONTEND_URL` to deployed Vercel URL for CORS.

## 7. Quality Gates
- Backend smoke checks:
  - `/health` returns `status=ok`.
  - auth token accepted by `/api/v1/auth/me`.
  - role restrictions enforced by admin routes.
- Frontend smoke checks:
  - register/login works
  - protected routes redirect correctly
  - gameplay loop and leaderboard update
  - admin and super admin pages enforce access.

## 8. Rollback Plan
- Keep previous working deployment in Render/Vercel.
- If backend release fails: redeploy previous Render version.
- If frontend release fails: redeploy previous Vercel deployment.
- If schema migration breaks behavior: restore from Supabase backup and rerun tested SQL script version.
