# 📄 Product Requirements Document (PRD)

**App Name:** Mpiloshini RMH 24
**Purpose:** Intelligent Vibration Analysis for Predictive Maintenance of Rotating Machinery

---

## 1. 📌 Problem Statement

Rotating machines (motors, pumps, compressors, turbines) develop faults (misalignment, imbalance, bearing wear) that lead to unplanned downtime, expensive repairs, and safety issues. Manual diagnosis is slow and requires specialist interpretation. There is a need for an automated, explainable solution that continuously monitors vibration data, compares it to commissioning baselines, and notifies engineers with actionable diagnostics — all while using **Supabase** as the single backend for auth, storage, and database.

---

## 2. 🎯 Goal

Build an MVP of **Mpiloshini RMH 24** that:

- Ingests vibration data from files and streams.
- Stores raw files and metadata in Supabase.
- Compares current signals with commissioning baseline signatures stored in Supabase.
- Detects and classifies common faults and visualizes results in a React + Vite + TypeScript frontend.
- Produces alerts and downloadable reports.

**Success Criteria (MVP):**

- Diagnose 1-minute, 20 kHz data in < 20s (processing on the Python backend).
- Support ≥ 3 rotating machine types.
- Alert generation for ≥ 4 common fault types with ≥ 80% accuracy on known labeled data.

---

## 3. 🧰 Core Features (for MVP)

### 1. **Universal Vibration Ingestion**

- Frontend (React + Vite + TypeScript) allows drag-and-drop import: CSV, WAV, TDMS, MAT, MDF.
- Files upload directly to **Supabase Storage** (pre-signed uploads from client).
- Optional: Real-time TCP/IP stream ingestion routed through edge/process service; messages logged into Supabase (see Implementation).
- Metadata captured: `machine_id`, `sensor_position`, `axis`, `sampling_rate`, `rpm`, `timestamp`.

### 2. **Signal Conditioning & Feature Extraction**

- Backend (Python, FastAPI) pulls files from Supabase Storage, applies band-pass/notch filtering, resampling.
- Extract features: RMS, crest factor, kurtosis, FFT peaks, envelope spectrum, order analysis, STFT spectrogram.
- Save extracted feature vectors (JSONB or numeric[]) into Supabase Postgres for queries and trend charts.

### 3. **Baseline Comparison & Fault Detection**

- Commissioning "golden" signatures stored in Supabase (BaselineSignatures table).
- Detection via distance metrics (Mahalanobis / cosine) + rule-based heuristics for:

  - Bearing defects (BPFI, BPFO)
  - Misalignment (2× peak + phase)
  - Imbalance (1× dominant)
  - Gear mesh sidebands

- Results and per-detection details stored in Supabase (FaultDetections table).

### 4. **Visualization & Trend Dashboards**

- Frontend visual components (React + TypeScript + Tailwind + Recharts/D3/Plotly):

  - Overlay FFT: current vs baseline
  - Spectrogram (STFT)
  - Time-domain waveform
  - Health index trend (line chart)

- Drill-down with zoom, annotations, and downloadable images.

### 5. **Alerts & PDF Reporting**

- Configurable thresholds in Supabase (Settings table).
- Alerts: in-app banners + email/SMS (via backend using SendGrid/Twilio; user contact stored in Supabase).
- Report generation (Python ReportLab/WeasyPrint) — PDF stored in Supabase Storage and link saved to the DB.

### 6. **Role-Based Access & Audit Logging**

- Supabase Auth (email/password, OAuth providers).
- Row-Level Security (RLS) policies in Supabase to enforce role permissions (Admin, Engineer, Viewer).
- Audit logs stored in Supabase (AuditLogs table).

---

## 4. 🧱 Tech Stack (updated)

| Layer                                | Technology                                                                                            |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Frontend                             | React + Vite + TypeScript, Tailwind CSS, Recharts / Plotly / D3                                       |
| Backend (processing + API)           | Python (FastAPI) — heavy DSP & ML work                                                                |
| Database + Auth + Storage + Realtime | **Supabase (Postgres + Storage + Auth + Realtime + Edge Functions)**                                  |
| Signal Processing                    | NumPy, SciPy, PyWavelets, optional PyTorch / scikit-learn                                             |
| Reports                              | ReportLab / WeasyPrint (Python)                                                                       |
| CI / Deployment                      | Docker, GitHub Actions, deploy backend to Cloud Run / AWS / DigitalOcean; Supabase managed DB/storage |
| Notifications                        | SendGrid / Twilio (invoked by backend)                                                                |

**Notes:**

- Supabase Postgres will be the single DB for metadata, feature vectors, detection records, settings, users, and simple time-series (timestamped rows). Raw files go to Supabase Storage with file URLs in DB.
- Use Supabase Realtime for live dashboard updates (new diagnoses, alerts).
- Use Supabase Edge Functions for small serverless tasks if needed; heavy DSP stays in Python (FastAPI) for performance and existing DSP libraries.

---

## 5. 🧪 Database Schema (Supabase-centric)

All IDs use `uuid`, timestamps use `timestamptz`. Feature vectors and detection details use `jsonb` or `numeric[]`.

### **machines**

- `id uuid PK`
- `name text`
- `type text` — (motor, pump, compressor, ...)
- `commissioning_date timestamptz`
- `location text`
- `metadata jsonb` — optional

### **sensors**

- `id uuid PK`
- `machine_id uuid FK -> machines.id`
- `position text`
- `axis text`
- `sampling_rate double precision`
- `created_at timestamptz`

### **vibration_records**

- `id uuid PK`
- `sensor_id uuid FK -> sensors.id`
- `uploaded_by uuid` — user id
- `timestamp timestamptz` — when sample was taken
- `storage_path text` — Supabase Storage path (bucket/object)
- `file_name text`
- `duration_seconds double precision`
- `processed boolean default false`
- `created_at timestamptz`

### **baseline_signatures**

- `id uuid PK`
- `machine_id uuid FK -> machines.id`
- `feature_vector jsonb` — canonical commissioning signature
- `sample_storage_path text` — optional raw file reference
- `created_at timestamptz`

### **fault_detections**

- `id uuid PK`
- `record_id uuid FK -> vibration_records.id`
- `fault_type text` — e.g., "Bearing Outer Race"
- `severity_score double precision` — 0–100
- `confidence double precision` — 0–1
- `details jsonb` — peaks, bands, Mahalanobis distance, recommended action
- `created_at timestamptz`

### **users** (managed by Supabase Auth; store extras here)

- `id uuid PK` (matches Supabase auth user id)
- `email text`
- `role text` — ('admin', 'engineer', 'viewer')
- `display_name text`
- `phone text`
- `created_at timestamptz`
- `last_login timestamptz`

### **audit_logs**

- `id uuid PK`
- `user_id uuid FK -> users.id`
- `action text`
- `target_table text`
- `target_id uuid`
- `details jsonb`
- `created_at timestamptz`

### **settings** (thresholds, notification config)

- `id uuid PK`
- `machine_id uuid FK` (nullable for global defaults)
- `thresholds jsonb` — e.g., health_index thresholds
- `notification_channels jsonb` — email/SMS config
- `created_at timestamptz`

---

## 6. 🛠️ Backend & Integration (Supabase-first flow)

### Client-side (React Vite TypeScript)

- Use official Supabase JS client:

  - Auth flows with Supabase Auth (sign-up, sign-in, magic link/OAuth).
  - Upload files directly to Supabase Storage (use signed uploads or authenticated client).
  - Insert a `vibration_records` DB row (processed=false) after upload (or via an Edge Function).
  - Notify backend processing service (FastAPI) to process the new record (HTTP call or Pub/Sub).

### Processing Backend (FastAPI, Python)

- Endpoints:

  - `POST /process-record` — payload `{ record_id }`. Backend will:

    1. Use Supabase service key (server-side) to fetch file from Supabase Storage.
    2. Run signal conditioning & feature extraction.
    3. Compare features with baseline_signatures in Supabase.
    4. Insert fault_detections and update vibration_records.processed = true.
    5. Store processed artifacts (plots, spectrogram images, PDF) back into Supabase Storage and save paths.
    6. Trigger Supabase Realtime update (or write DB row) so frontend reflects new diagnosis.

- Alternatively, use Supabase Edge Function as a webhook receiver to invoke the FastAPI job queue.

### Example Processing Flow (high level)

1. User uploads file from frontend to Supabase Storage.
2. Frontend creates `vibration_records` entry in Postgres.
3. Frontend calls `POST /process-record` (FastAPI) with `record_id`.
4. FastAPI fetches file from Storage, processes, writes `fault_detections`, images, and PDFs to Storage, updates DB.
5. Supabase Realtime broadcasts change; frontend updates.

---

## 7. 🔐 Authentication & Security

- **Supabase Auth** for user identity (email/password, OAuth).
- Use **Row-Level Security (RLS)** and fine-grained policies in Supabase to restrict access:

  - Engineers can create/diagnose for assigned machines.
  - Viewers have read-only access.
  - Admins can manage baselines and users.

- Use Supabase service role keys **only** on server/backends (FastAPI) — never in the browser.
- Use signed upload URLs or authenticated client to store files to Supabase Storage.
- Audit every action in `audit_logs`.

---

## 8. 📲 User Flow (updated for Supabase + React Vite TS)

1. **Login** via Supabase Auth in the React frontend.
2. **Upload vibration data** — client uploads file to Supabase Storage and writes metadata to `vibration_records`.
3. **Trigger processing** — frontend calls FastAPI `/process-record` or an automated job picks up unprocessed records.
4. **System processes signal** (Python): filters → features → baseline comparison → stores detections in Supabase.
5. **Frontend receives results** via Realtime or polling and displays dashboard visualizations.
6. **Alerts** are generated if thresholds exceeded; backend sends email/SMS; alert record saved in DB.
7. **User downloads report** (PDF hosted in Supabase Storage).

---

## 9. 🚫 Out-of-Scope (MVP)

- Dedicated mobile app (web responsive only).
- Multi-language UI.
- Full cloud ML training pipelines (only local/managed training for classifier prototypes).
- Edge deployment embedded on PLCs.
- TimescaleDB / InfluxDB — **Supabase only** (all time-series & feature storage handled in Postgres tables or JSONB arrays).

---

## 10. 🧠 Future Feature Ideas

- Use Postgres extensions (e.g., partitioning or hypertables) to scale time-series within Supabase if needed.
- Vector similarity (pgvector) for advanced baseline/feature searching (check Supabase support/plan).
- Online adaptive learning when users confirm or correct diagnoses.
- ERP/CMMS integration (Maximo, SAP) using webhooks and Supabase Edge Functions.
- Live shop-floor dashboards with Supabase Realtime and WebSockets.
- Edge processing adapter for on-prem devices that upload processed features to Supabase.

---

## 11. 📈 Success Metrics

- > 90% uptime across services (excluding client-side updates).
- < 20s time to process a 1-minute file (Python backend).
- ≥ 80% diagnostic accuracy on labeled known faults.
- < 5% false-positive rate on baseline data.
- > 75% feature adoption (users use visualization + reports regularly).

---

## 12. 📣 Launch & Marketing Plan

### Early Users

- Pilot with 1–2 industrial sites, provide free 30-day tier that uses Supabase hosted backend.

### Messaging

- “Upload your vibration file to Supabase-powered Mpiloshini RMH 24 and detect faults in seconds.”
- Promote on LinkedIn (industrial automation), product-hunt style posts, and targeted reliability-engineering communities.

---

### Quick Implementation Notes / Best Practices

- Keep all raw files in Supabase Storage (single source of truth) and only save extracted features/diagnoses in Postgres for fast queries.
- Use Supabase Realtime to push diagnostics and alerts into the React UI in near real-time.
- Apply strict RLS policies and never leak service keys on the client.
- Consider background job queue (Redis / Celery / Cloud Tasks) for large-scale parallel processing; FastAPI triggers jobs referencing Supabase storage paths.
- If vector searches or very high-frequency time-series analytics are needed later, investigate pgvector and/or partitioning strategies with Supabase support.
