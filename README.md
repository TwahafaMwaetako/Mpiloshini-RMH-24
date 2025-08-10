# Mpiloshini RMH 24

Intelligent vibration analysis for predictive maintenance of rotating machinery.

## Monorepo Structure
- `backend/`: FastAPI service (DSP pipeline, Supabase integration)
- `frontend/`: React (Vite + TypeScript) UI (Supabase auth, upload, dashboards)
- `docs/`: Product and engineering docs
- `.github/workflows/`: CI for backend and frontend

## Quickstart

### Backend
1. Create `backend/.env` with:
   - `SUPABASE_URL=`
   - `SUPABASE_SERVICE_KEY=`
   - `SUPABASE_BUCKET=vibration-files`
2. Install deps: `pip install -r backend/requirements.txt`
3. Run: `uvicorn app.main:app --reload --port 8000 --app-dir backend`

### Frontend
1. Copy `frontend/.env.example` to `frontend/.env` and set:
   - `VITE_SUPABASE_URL=`
   - `VITE_SUPABASE_ANON_KEY=`
   - `VITE_API_BASE_URL=http://localhost:8000`
2. Install deps: `cd frontend && npm install`
3. Run dev server: `npm run dev`

## CI
GitHub Actions build and test for both backend and frontend on push/PR.

## License
Proprietary – Internal MVP.
