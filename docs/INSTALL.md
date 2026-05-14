# 🚀 Quick Installation Guide

## One-Command Setup

### Windows
```cmd
setup.bat
```

### Linux/Mac
```bash
chmod +x setup.sh && ./setup.sh
```

## What This Does

1. ✅ Checks Docker installation
2. ✅ Creates environment configuration
3. ✅ Builds both frontend and backend
4. ✅ Starts all services
5. ✅ Runs health checks
6. ✅ Shows you the access URLs

## Access Your Application

After setup completes:

- **🌐 Frontend**: http://localhost:3000
- **🔧 Backend API**: http://localhost:8000  
- **📚 API Docs**: http://localhost:8000/docs

## Test Upload

1. Go to http://localhost:3000
2. Click "Upload Vibration Data"
3. Select a .mat file from your test_data folder
4. Form auto-fills with defaults
5. Click "Upload & Process"
6. View results!

## Need Help?

- **View logs**: `docker-compose logs -f`
- **Stop services**: `docker-compose down`
- **Clean restart**: `setup.bat clean` then `setup.bat`

That's it! 🎉