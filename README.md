# 🚀 Mpiloshini RMH 24 - Intelligent Vibration Analysis System

<div align="center">

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Vite](https://img.shields.io/badge/Vite-6.3.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)](https://supabase.com/)

**Intelligent vibration analysis for predictive maintenance of rotating machinery**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Testing](#-testing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Testing](#-testing)
- [API Documentation](#-api-documentation)
- [Development Workflow](#-development-workflow)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Mpiloshini RMH 24** is an advanced predictive maintenance system that uses vibration analysis to detect faults in rotating machinery. The system helps prevent unplanned downtime, reduce maintenance costs, and improve equipment reliability through early fault detection and intelligent diagnostics.

### Key Capabilities
- **Real-time vibration data processing** from multiple sensor types
- **Automated fault detection** for bearing defects, misalignment, imbalance, and gear issues
- **Baseline comparison** with commissioning signatures
- **Interactive visualizations** including FFT, spectrograms, and trend analysis
- **Automated reporting** with PDF generation and alert notifications
- **Role-based access control** for multi-user environments

---

## ✨ Features

### 🔧 Core Functionality
- **Universal Data Ingestion**: Support for CSV, WAV, TDMS, MAT, and MDF formats
- **Signal Processing**: Advanced DSP with filtering, resampling, and feature extraction
- **Fault Detection**: Automated diagnosis of:
  - Bearing defects (BPFI, BPFO)
  - Shaft misalignment
  - Rotor imbalance
  - Gear mesh problems
- **Machine Learning**: Pattern recognition and anomaly detection
- **Trend Analysis**: Historical data tracking and health scoring

### 📊 Visualization & Reporting
- **Interactive Dashboards**: Real-time monitoring with drill-down capabilities
- **Advanced Charts**: FFT overlays, spectrograms, time-domain waveforms
- **Custom Reports**: Automated PDF generation with diagnostic details
- **Alert System**: Configurable thresholds with email/SMS notifications

### 🔐 Security & Management
- **Authentication**: Secure user management via Supabase Auth
- **Role-Based Access**: Admin, Engineer, and Viewer roles
- **Audit Logging**: Complete activity tracking
- **Data Privacy**: Row-level security policies

---

## 🛠 Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React 18 + TypeScript | User interface |
| **Build Tool** | Vite 6.3 | Fast development and building |
| **Styling** | Tailwind CSS | Responsive, modern UI |
| **Charts** | Recharts / D3.js | Data visualization |
| **Backend** | FastAPI (Python 3.11+) | REST API & processing |
| **Database** | Supabase (PostgreSQL) | Data persistence |
| **Storage** | Supabase Storage | File management |
| **Auth** | Supabase Auth | User authentication |
| **DSP Libraries** | NumPy, SciPy | Signal processing |
| **ML Libraries** | scikit-learn (optional) | Fault classification |
| **Reports** | ReportLab | PDF generation |
| **Testing** | Pytest, Jest | Unit & integration tests |
| **CI/CD** | GitHub Actions | Automated workflows |

---

## 📁 Project Structure

```
mpiloshini-rmh-24/
├── 📂 backend/                    # FastAPI Backend Service
│   ├── 📂 app/
│   │   ├── 📂 api/
│   │   │   └── 📂 endpoints/     # API route handlers
│   │   │       ├── diagnose.py   # Diagnosis endpoints
│   │   │       ├── machines.py   # Machine management
│   │   │       ├── records.py    # Vibration records
│   │   │       └── upload.py     # File upload handling
│   │   ├── 📂 core/              # Core configurations
│   │   │   ├── auth.py          # Authentication logic
│   │   │   └── config.py        # Environment settings
│   │   ├── 📂 schemas/           # Pydantic models
│   │   ├── 📂 services/          # Business logic
│   │   │   ├── supabase_service.py
│   │   │   └── vibration_analysis.py
│   │   └── main.py              # Application entry point
│   ├── 📂 tests/                # Backend tests
│   ├── 📂 uploads/              # Local file storage (dev)
│   ├── .env                     # Environment variables
│   ├── .gitignore
│   ├── Dockerfile               # Container configuration
│   └── requirements.txt        # Python dependencies
│
├── 📂 frontend/                 # React + TypeScript Frontend
│   ├── 📂 public/              # Static assets
│   ├── 📂 src/
│   │   ├── 📂 components/      # Reusable UI components
│   │   │   ├── 📂 dashboard/
│   │   │   ├── 📂 machines/
│   │   │   ├── 📂 ui/          # Base UI components
│   │   │   └── 📂 upload/
│   │   ├── 📂 entities/        # TypeScript interfaces
│   │   ├── 📂 hooks/           # Custom React hooks
│   │   ├── 📂 integrations/    # External service integrations
│   │   ├── 📂 layouts/         # Page layouts
│   │   ├── 📂 pages/           # Page components
│   │   ├── 📂 services/        # API service layer
│   │   ├── 📂 styles/          # Global styles
│   │   ├── 📂 utils/           # Utility functions
│   │   ├── App.tsx             # Main app component
│   │   └── main.tsx            # Entry point
│   ├── .env                    # Environment variables
│   ├── .gitignore
│   ├── index.html
│   ├── package.json            # Node dependencies
│   ├── tailwind.config.ts      # Tailwind configuration
│   ├── tsconfig.json           # TypeScript configuration
│   └── vite.config.ts          # Vite configuration
│
├── 📂 docs/                    # Documentation
│   ├── PRD.md                  # Product Requirements
│   ├── Implementation.md       # Implementation Guide
│   ├── Project_structure.md    # Architecture Details
│   └── UI_UX_doc.md           # UI/UX Guidelines
│
├── 📂 .github/
│   └── 📂 workflows/          # CI/CD pipelines
│       ├── backend-ci.yml
│       └── frontend-ci.yml
│
├── .gitignore
├── start_services.ps1          # Windows startup script
├── test_connection.ps1         # Connection test script
└── README.md                   # This file
```

---

## 📋 Prerequisites

### System Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **Memory**: Minimum 8GB RAM (16GB recommended)
- **Storage**: At least 2GB free space
- **Network**: Internet connection for package installation

### Required Software

#### Backend Requirements
- **Python**: 3.11 or higher
- **pip**: Latest version
- **Virtual Environment**: venv or virtualenv

#### Frontend Requirements
- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher (comes with Node.js)

#### Database & Services
- **Supabase Account**: Free tier is sufficient for development
- **Git**: For version control

### Verification Commands

```bash
# Check Python version
python --version  # Should show Python 3.11.x or higher

# Check Node.js version
node --version    # Should show v18.x.x or higher

# Check npm version
npm --version     # Should show 9.x.x or higher

# Check Git version
git --version     # Any recent version
```

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/mpiloshini-rmh-24.git

# Navigate to project directory
cd "Mpiloshini RMH 24"
```

### Step 2: Backend Setup

#### 2.1 Create Python Virtual Environment

**Windows (PowerShell):**
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate
```

**macOS/Linux:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

#### 2.2 Install Python Dependencies

```bash
# Ensure pip is up to date
pip install --upgrade pip

# Install required packages
pip install -r requirements.txt
```

#### 2.3 Verify Installation

```bash
# Test FastAPI import
python -c "import fastapi; print(f'FastAPI version: {fastapi.__version__}')"

# Test other critical imports
python -c "import numpy, supabase, pydantic; print('All imports successful!')"
```

### Step 3: Frontend Setup

#### 3.1 Install Node Dependencies

```bash
cd ../frontend
npm install
```

#### 3.2 Verify Installation

```bash
# Check if all packages installed correctly
npm list --depth=0

# Build the project to verify configuration
npm run build
```

---

## ⚙️ Configuration

### Step 1: Supabase Setup

1. **Create a Supabase Project**:
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up/login and create a new project
   - Note down your project URL and API keys

2. **Configure Database Schema** (Optional for testing):
   ```sql
   -- Run these in Supabase SQL Editor if needed
   
   -- Create machines table
   CREATE TABLE machines (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     type TEXT NOT NULL,
     manufacturer TEXT,
     model TEXT,
     serial_number TEXT,
     installation_date TIMESTAMPTZ,
     location TEXT,
     status TEXT DEFAULT 'operational',
     rpm_nominal INTEGER,
     power_kw FLOAT,
     description TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   -- Create vibration_records table
   CREATE TABLE vibration_records (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     machine_id UUID REFERENCES machines(id),
     file_url TEXT NOT NULL,
     file_name TEXT NOT NULL,
     sensor_position TEXT,
     axis TEXT,
     sampling_rate INTEGER,
     measurement_date TIMESTAMPTZ,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

### Step 2: Environment Variables

#### Backend Configuration (.env)

Create `backend/.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here
SUPABASE_BUCKET=vibration-files

# Application Settings
APP_ENV=development
DEBUG=true
LOG_LEVEL=INFO

# Optional: Email Service (for alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

#### Frontend Configuration (.env)

Create `frontend/.env` file:

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Application Settings
VITE_APP_NAME=Mpiloshini RMH 24
VITE_APP_ENV=development
```

### Step 3: Verify Configuration

Run the connection test script:

**Windows (PowerShell):**
```powershell
.\test_connection.ps1
```

**macOS/Linux:**
```bash
# Create a test script
cat > test_connection.sh << 'EOF'
#!/bin/bash
echo "Testing Backend Health..."
curl -s http://localhost:8000/health || echo "Backend not running"
echo -e "\nAPI Docs: http://localhost:8000/docs"
echo "Frontend: http://localhost:8080"
EOF

chmod +x test_connection.sh
./test_connection.sh
```

---

## 🎮 Running the Application

### Option 1: Automated Startup (Recommended for Windows)

```powershell
# Run the startup script from project root
.\start_services.ps1
```

This will:
- Start the backend server on http://localhost:8000
- Start the frontend dev server on http://localhost:8080
- Open two terminal windows for monitoring

### Option 2: Manual Startup

#### Start Backend Server

**Terminal 1:**
```bash
cd backend
# Activate virtual environment
.\.venv\Scripts\Activate  # Windows
# source .venv/bin/activate  # macOS/Linux

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

#### Start Frontend Development Server

**Terminal 2:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v6.3.4  ready in 500 ms

➜  Local:   http://localhost:8080/
➜  Network: http://192.168.1.x:8080/
➜  press h + enter to show help
```

### Option 3: Docker Setup (Alternative)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run separately
docker build -t mpiloshini-backend ./backend
docker run -p 8000:8000 --env-file ./backend/.env mpiloshini-backend
```

### Accessing the Application

Once both services are running:

1. **Frontend Application**: http://localhost:8080
   - Main user interface
   - Login/signup functionality
   - Machine management
   - File upload
   - Analysis dashboard

2. **Backend API Documentation**: http://localhost:8000/docs
   - Interactive API documentation (Swagger UI)
   - Test API endpoints directly
   - View request/response schemas

3. **API Health Check**: http://localhost:8000/health
   - Verify backend is running

---

## 🧪 Testing

### Backend Testing

```bash
cd backend
# Activate virtual environment
.\.venv\Scripts\Activate  # Windows

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_api.py

# Run with verbose output
pytest -v

# Run only unit tests
pytest tests/unit/

# Run only integration tests
pytest tests/integration/
```

### Frontend Testing

```bash
cd frontend

# Run Jest tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run E2E tests (if configured)
npm run test:e2e
```

### Manual Testing Workflow

1. **Test Machine Management**:
   ```
   1. Navigate to http://localhost:8080
   2. Go to Machines page
   3. Click "Add Machine"
   4. Fill in details:
      - Name: "Test Pump 01"
      - Type: "Centrifugal Pump"
      - Manufacturer: "ABC Corp"
      - Location: "Building A"
   5. Click Save
   6. Verify machine appears in list
   ```

2. **Test File Upload**:
   ```
   1. Go to Upload page
   2. Select a test CSV file
   3. Choose machine from dropdown
   4. Set metadata:
      - Sensor Position: "Drive End"
      - Axis: "Horizontal"
      - Sampling Rate: "20000"
   5. Click Upload
   6. Verify success notification
   ```

3. **Test API Endpoints**:
   ```bash
   # Test health endpoint
   curl http://localhost:8000/health
   
   # Test machines endpoint
   curl http://localhost:8000/records/machines
   
   # Create a machine
   curl -X POST http://localhost:8000/records/machines \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Machine","type":"Motor"}'
   ```

### Load Testing

```bash
# Install locust
pip install locust

# Create locustfile.py
cat > locustfile.py << 'EOF'
from locust import HttpUser, task, between

class VibrationUser(HttpUser):
    wait_time = between(1, 3)
    
    @task
    def get_health(self):
        self.client.get("/health")
    
    @task(3)
    def get_machines(self):
        self.client.get("/records/machines")
EOF

# Run load test
locust -f locustfile.py --host=http://localhost:8000
```

---

## 📚 API Documentation

### Core Endpoints

#### Health Check
```http
GET /health
```
Response:
```json
{
  "status": "ok"
}
```

#### Machine Management

**List All Machines**
```http
GET /records/machines
```

**Create Machine**
```http
POST /records/machines
Content-Type: application/json

{
  "name": "Pump 01",
  "type": "Centrifugal Pump",
  "manufacturer": "ABC Corp",
  "location": "Building A",
  "status": "operational"
}
```

**Update Machine**
```http
PUT /records/machines/{machine_id}
Content-Type: application/json

{
  "status": "maintenance"
}
```

**Delete Machine**
```http
DELETE /records/machines/{machine_id}
```

#### File Upload

**Upload Vibration File**
```http
POST /upload/file
Content-Type: multipart/form-data

file: (binary)
machine_id: "uuid"
sensor_position: "Drive End"
axis: "Horizontal"
sampling_rate: "20000"
```

#### Vibration Records

**List Records**
```http
GET /records/vibrations
```

**Get Records by Machine**
```http
GET /records/vibrations/machine/{machine_id}
```

**Create Record**
```http
POST /records/vibrations
Content-Type: application/json

{
  "machine_id": "uuid",
  "file_url": "/uploads/file.csv",
  "file_name": "measurement.csv",
  "sensor_position": "Drive End",
  "axis": "Horizontal",
  "sampling_rate": 20000
}
```

#### Diagnosis

**Analyze Vibration Data**
```http
POST /diagnose/analyze/{vibration_id}
```

**Get Diagnosis History**
```http
GET /diagnose/history/{machine_id}
```

### Authentication

All protected endpoints require a Bearer token:
```http
Authorization: Bearer <jwt_token>
```

---

## 💻 Development Workflow

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### Code Style

#### Python (Backend)
```bash
# Format code with black
black app/

# Check with flake8
flake8 app/

# Type checking with mypy
mypy app/
```

#### TypeScript (Frontend)
```bash
# Format with Prettier
npm run format

# Lint with ESLint
npm run lint

# Fix linting issues
npm run lint:fix
```

### Hot Reload Development

Both frontend and backend support hot reload:

- **Backend**: Uses `--reload` flag with uvicorn
- **Frontend**: Vite provides HMR (Hot Module Replacement)

Changes are reflected immediately without restarting servers.

---

## 🚢 Deployment

### Production Build

#### Backend
```bash
cd backend
# Create production requirements
pip freeze > requirements-prod.txt

# Build Docker image
docker build -t mpiloshini-backend:prod .
```

#### Frontend
```bash
cd frontend
# Production build
npm run build

# Output in dist/ directory
ls -la dist/
```

### Deployment Options

#### 1. Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### 2. Railway/Render (Backend)
```yaml
# railway.toml or render.yaml
services:
  - type: web
    name: mpiloshini-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

#### 3. Docker Compose (Full Stack)
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

### Environment Variables for Production

```env
# Production .env
APP_ENV=production
DEBUG=false
LOG_LEVEL=WARNING
CORS_ORIGINS=https://your-domain.com
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Backend Won't Start

**Issue**: `ModuleNotFoundError: No module named 'fastapi'`
```bash
# Solution: Activate virtual environment
.\.venv\Scripts\Activate  # Windows
pip install -r requirements.txt
```

**Issue**: `Address already in use`
```bash
# Find and kill process on port 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

#### Frontend Won't Start

**Issue**: `Cannot find module` errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Port 8080 already in use
```bash
# Change port in vite.config.ts
server: {
  port: 3000  // Use different port
}
```

#### Database Connection Issues

**Issue**: Cannot connect to Supabase
```bash
# Verify credentials
curl https://your-project.supabase.co/rest/v1/ \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

#### CORS Errors

**Issue**: CORS policy blocking requests
```python
# Update backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Debug Mode

Enable detailed logging:

```python
# backend/app/main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

```typescript
// frontend/src/main.tsx
if (import.meta.env.DEV) {
  console.log('Debug mode enabled');
}
```

---

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

### Code Review Process

1. All code must be reviewed before merging
2. Tests must pass
3. Documentation must be updated
4. Follow code style guidelines

---

## 📄 License

This project is proprietary software for internal use only.

---

## 🙏 Acknowledgments

- FastAPI community for the excellent framework
- Supabase team for the backend platform
- React and Vite communities
- All contributors and testers

---

## 📞 Support

For issues, questions, or suggestions:

1. Check the [Documentation](./docs/)
2. Search [existing issues](https://github.com/yourusername/mpiloshini-rmh-24/issues)
3. Create a new issue with detailed information
4. Contact the development team

---

<div align="center">
Made with ❤️ for predictive maintenance excellence
</div>
