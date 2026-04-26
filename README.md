# Hangman (FastAPI + React + Supabase)

Production-style Hangman rebuild with a decoupled architecture:
- Backend: FastAPI (`/backend`)
- Frontend: React + Vite + Tailwind (`/frontend`)
- Database/Auth: Supabase
- RBAC roles: `player`, `admin`, `super_admin`

## Features

- Email/password login with Supabase Auth.
- Role-based route and endpoint protection.
- Game flow with random words by category and hint display.
- Leaderboard with persisted wins.
- Admin dashboard for category/word management and scoreboard reset.
- Super Admin user-role management with promote/demote actions.

## Project Structure

```text
hangman/
  backend/
    app/
      api/routes/
      core/
      schemas/
      services/
  frontend/
    src/
      components/
      context/
      lib/
      pages/
  supabase/
    schema_and_policies.sql
```

## Prerequisites

- Python 3.11+ (3.13 also works)
- Node.js 20+
- npm
- Supabase project

## 1) Supabase Setup

1. Create a new Supabase project.
2. Enable Email auth in Supabase Auth settings.
3. Run SQL in Supabase SQL Editor:
   - `supabase/schema_and_policies.sql`
4. Register your first user from the app.
5. Promote first super admin in SQL:

```sql
update public.profiles
set role = 'super_admin'
where id = 'YOUR_USER_UUID';
```

## 2) Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Fill `backend/.env`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (must be service_role, not anon)
- `FRONTEND_URL=http://localhost:5173`

Run backend:

```bash
uvicorn app.main:application_instance --reload --port 8000
```

Health check:
- `http://127.0.0.1:8000/health`

## 3) Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Fill `frontend/.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_BACKEND_API_BASE_URL=http://localhost:8000`

Run frontend:

```bash
npm run dev
```

Open:
- `http://localhost:5173`

## Default Data

On backend startup, default categories and words are auto-seeded when database categories are empty:
- fruits
- animals
- countries

## Deployment (Free Tier Target)

- Frontend: Vercel
- Backend: Render
- Database/Auth: Supabase

Set environment variables in Render/Vercel exactly like local `.env` files and update backend CORS `FRONTEND_URL` to the deployed frontend URL.
