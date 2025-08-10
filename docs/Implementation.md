Implementation Plan: Mpiloshini RMH 24 (Detailed)
Version: 1.3
Date: 2025-08-10

1. Overview
This document outlines the detailed, phased implementation plan for developing the Mpiloshini RMH 24 MVP. The project is broken down into four main stages, with each stage containing specific tasks and subtasks to guide the development sprints, focusing on a FastAPI backend, Supabase BaaS, and a React (Vite) + TypeScript frontend.

2. Development Stages & Timeline
Stage 1: Foundation & Backend Setup (Sprints 1-2)
Objective: Establish the core infrastructure, Supabase project, and foundational backend services.

Key Tasks & Subtasks:

Project & Monorepo Setup

Subtask 1.1: Initialize a Git repository on GitHub.

Subtask 1.2: Create the monorepo directory structure: backend/, frontend/, docs/.

Subtask 1.3: Create a root .gitignore file, configured for Python/Node.js projects.

Infrastructure & Supabase Setup

Subtask 2.1: Create a new project in the Supabase dashboard.

Subtask 2.2: Write a Dockerfile for the FastAPI backend, using a slim Python base image.

Subtask 2.3: Create a docker-compose.yml file to orchestrate the backend service for local development.

Subtask 2.4: Store Supabase URL and keys securely in a .env file for local development and in GitHub Secrets for CI/CD.

Database Schema & Storage

Subtask 3.1: Use the Supabase SQL Editor to define tables with specific columns:

machines: id (uuid), name (text), type (text), location (text)

sensors: id (uuid), machine_id (fk), position (text), axis (text)

vibration_records: id (uuid), sensor_id (fk), timestamp (timestamptz), file_path (text), status (text)

diagnoses: id (uuid), record_id (fk), results (jsonb), health_score (int)

Subtask 3.2: Configure Row Level Security (RLS) policies. For example: CREATE POLICY "Users can view their own machines." ON machines FOR SELECT USING (auth.uid() = user_id);

Subtask 3.3: Set up a "vibration-files" bucket in Supabase Storage with appropriate access policies.

Core API Endpoints & Supabase Integration

Subtask 4.1: Implement POST /upload/signed-url endpoint.

Request: { "fileName": "string", "contentType": "string" }

Action: Uses supabase-py storage.from_("vibration-files").create_signed_url(...)

Response: { "signedUrl": "string", "filePath": "string" }

Subtask 4.2: Implement POST /records endpoint.

Request: { "sensor_id": "uuid", "file_path": "string", "timestamp": "string" }

Action: Inserts a new row into the vibration_records table.

Authentication

Subtask 5.1: On the frontend, use supabase.auth.signUp() and supabase.auth.signInWithPassword() for user management.

Subtask 5.2: On the FastAPI backend, create a dependency that decodes the JWT from the Authorization header and verifies it, returning the user object.

Continuous Integration (CI) Pipeline

Subtask 6.1: Create a GitHub Action workflow (backend-ci.yml) to automatically run pytest and flake8 on every push to the backend/ directory.

Subtask 6.2: Add GitHub repository secrets for SUPABASE_URL and SUPABASE_SERVICE_KEY to be used in the CI pipeline.

Deliverable: A running backend service that can communicate with Supabase for data and file storage, and authenticate users via Supabase Auth.

Stage 2: Core Signal Processing Engine (Sprints 3-4)
Objective: Develop the Python module responsible for all vibration analysis and fault diagnosis logic.

Key Tasks & Subtasks:

Data Loading Module

Subtask 1.1: Create a DataLoader service that downloads a file from a Supabase Storage URL using an HTTP request.

Subtask 1.2: Implement parsers for CSV, WAV, and TDMS, each returning a NumPy array of the signal and the sampling rate.

Subtask 1.3: Implement robust error handling for failed downloads or corrupted files.

Signal Conditioning & Feature Extraction

Subtask 2.1: Create a SignalProcessor class.

Subtask 2.2: Implement methods apply_filter(signal), resample_signal(signal), and apply_window(signal).

Subtask 2.3: Implement extract_features(signal) which returns a dictionary of features (e.g., { "rms": 0.5, "crest_factor": 4.2, ... }).

Fault Diagnosis Rule Engine

Subtask 3.1: Create a RuleEngine class that takes a feature dictionary and a baseline dictionary as input.

Subtask 3.2: Implement check_imbalance(): if features['fft_peak_1x'] > baseline['fft_peak_1x'] * 1.5 -> return Fault("Imbalance").

Subtask 3.3: Implement similar methods for check_misalignment(), check_bearing_faults(), etc.

Subtask 3.4: Implement calculate_health_score() based on the number and severity of detected faults.

Full API Integration

Subtask 4.1: Implement the POST /diagnose/{record_id} endpoint.

Subtask 4.2: The endpoint will:

Fetch the vibration_records row from Supabase.

Download the file from Supabase Storage.

Run the full analysis pipeline.

Insert the results into the diagnoses table.

Update the status of the vibration_records row to "processed".

Subtask 4.3: The final JSON response will have a structure like: { "diagnosis_id": "uuid", "faults": [...], "health_score": 85, "plots": { "fft_data": [...] } }.

Deliverable: A fully functional /diagnose API endpoint that can process a file from Supabase Storage and return a detailed fault analysis JSON.

Stage 3: Frontend Development & Visualization (Sprints 5-7)
Objective: Build the complete, interactive user-facing interface using React, Vite, and TypeScript.

Key Tasks & Subtasks:

Project & Component Setup

Subtask 1.1: Initialize the React application using npm create vite@latest frontend -- --template react-ts.

Subtask 1.2: Install and configure Tailwind CSS.

Subtask 1.3: Develop a library of reusable, typed UI components: Button.tsx, Card.tsx, Input.tsx, Sidebar.tsx, PlotWrapper.tsx, AuthForm.tsx.

Application Layout & Routing

Subtask 2.1: Implement the main application shell (App.tsx) with the persistent sidebar.

Subtask 2.2: Configure react-router-dom with routes for /, /login, /signup, /dashboard, /upload, and /diagnose/:id.

Subtask 2.3: Implement protected routes that redirect to /login if no user is authenticated.

Supabase Integration (Frontend)

Subtask 3.1: Install @supabase/supabase-js.

Subtask 3.2: Create a global SupabaseProvider context to make the client available throughout the app.

Subtask 3.3: Create a custom useAuth hook that subscribes to supabase.auth.onAuthStateChange and provides the user session.

Subtask 3.4: Implement the file upload logic using supabase.storage.from('vibration-files').upload(), which then triggers a call to the backend /records endpoint.

Data Visualization

Subtask 4.1: Integrate Recharts, creating specific components like FFTChart.tsx and SpectrogramChart.tsx.

Subtask 4.2: On the /diagnose/:id page, fetch data from the backend /diagnose endpoint and pass it as props to the chart components.

Subtask 4.3: Implement loading states while data is being fetched and error states if the API call fails.

Deliverable: A fully interactive and type-safe web application where users can log in, upload data directly to Supabase, and visualize the complete diagnostic results from the backend.

Stage 4: Final Features & Deployment (Sprint 8)
Objective: Finalize all MVP features, conduct end-to-end testing, and deploy the application.

Key Tasks & Subtasks:

Reporting & Alerting

Subtask 1.1: Implement PDF report generation using a library like jspdf on the frontend, feeding it data from the diagnosis.

Subtask 1.2: Create a Supabase Database Function (in PL/pgSQL) that is triggered on a new insert into the diagnoses table.

Subtask 1.3: If the health_score is below a threshold, the trigger calls a Supabase Edge Function.

Subtask 1.4: The Edge Function sends a formatted email alert using a third-party service.

End-to-End (E2E) Testing

Subtask 2.1: Write E2E tests using Cypress or Playwright.

Subtask 2.2: Create test cases for:

User signup and login flow.

Successful file upload and redirection to the diagnosis page.

Verification that plot data is rendered correctly.

Deployment (CD)

Subtask 3.1: Create a GitHub Actions workflow to build the frontend (npm run build) and deploy the static assets in the dist/ folder to Vercel or Netlify.

Subtask 3.2: Create another workflow to build the backend Docker image, push it to GitHub Container Registry (GHCR), and deploy it to a service like Google Cloud Run.

Subtask 3.3: Ensure all environment variables (Supabase keys, etc.) are correctly configured in the production environments.

Deliverable: A fully tested, deployed, and operational MVP of Mpiloshini RMH 24.
