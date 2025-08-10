# Project Structure: Mpiloshini RMH 24

**Version:** 1.1
**Date:** 2025-08-10

---

## 1. Overview

This project uses a **monorepo** structure to maintain a clean and scalable codebase. This approach keeps the frontend, backend, and documentation in a single Git repository. The tech stack is a **React (Vite) + TypeScript** frontend, a **FastAPI** backend, and **Supabase** for the database, auth, and storage.

---

## 2. Directory Layout


mpiloshini-rmh-24/
│
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       └── frontend-ci.yml
│
├── backend/                    # Python FastAPI Backend
│   ├── app/
│   │   ├── init.py
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── diagnose.py
│   │   │   │   └── upload.py
│   │   ├── core/
│   │   │   └── config.py       # Handles environment variables (incl. Supabase keys)
│   │   ├── schemas/            # Pydantic schemas
│   │   └── services/
│   │       ├── vibration_analysis.py
│   │       └── supabase_service.py # Service for interacting with Supabase
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt        # Will include supabase-py
│
├── frontend/                   # React (Vite) + TypeScript Frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/                # Functions for calling the backend API
│   │   ├── assets/
│   │   ├── components/         # Reusable UI components (*.tsx)
│   │   ├── hooks/              # Custom React hooks (e.g., useAuth)
│   │   ├── pages/              # Top-level page components
│   │   ├── services/           # Supabase client setup
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx            # Main entry point for Vite
│   ├── .env
│   ├── index.html              # Vite entry HTML file
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docs/                       # Project documentation
│   ├── PRD.md
│   ├── Implementation.md
│   ├── Project_structure.md
│   ├── UI_UX_doc.md
│   └── Bug_tracking.md
│
├── .gitignore
└── docker-compose.yml          # For local development (backend service only)
└── README.md


---

## 3. Rationale

* **`backend/`**: A standard FastAPI structure. Database models are removed as schema is managed directly in Supabase. A `supabase_service.py` is added to encapsulate all interactions with the Supabase Python client.
* **`frontend/`**: A standard Vite + TypeScript project structure. `index.html` is at the root of the `frontend` directory. The entry point is `src/main.tsx`.
* **`docker-compose.yml`**: This file is now simplified. It will only manage the `backend` service, as the database and auth are handled by the cloud-based Supabase service. This makes the local development setup lighter.
