#!/usr/bin/env python3
"""
Test backend connectivity and endpoints
"""

import requests
import json

def test_backend():
    """Test all backend endpoints"""
    
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Backend Connectivity")
    print("=" * 50)
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check: OK")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        print("   Make sure backend is running: uvicorn app.main:app --reload --port 8000")
        return False
    
    # Test 2: Machines endpoint
    try:
        response = requests.get(f"{base_url}/records/machines", timeout=5)
        if response.status_code == 200:
            machines = response.json()
            print(f"✅ Machines endpoint: {len(machines)} machines found")
        else:
            print(f"❌ Machines endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Machines endpoint error: {e}")
    
    # Test 3: Upload endpoint (without file)
    try:
        response = requests.post(f"{base_url}/upload/file", timeout=5)
        # This should fail with 422 (validation error) which is expected
        if response.status_code == 422:
            print("✅ Upload endpoint: Available (validation error expected)")
        else:
            print(f"⚠️  Upload endpoint: Unexpected status {response.status_code}")
    except Exception as e:
        print(f"❌ Upload endpoint error: {e}")
    
    # Test 4: CORS headers
    try:
        response = requests.options(f"{base_url}/upload/file", 
                                  headers={'Origin': 'http://localhost:3000'}, 
                                  timeout=5)
        cors_headers = response.headers.get('Access-Control-Allow-Origin', '')
        if 'localhost:3000' in cors_headers or '*' in cors_headers:
            print("✅ CORS: Configured for frontend")
        else:
            print(f"⚠️  CORS: May not be configured correctly")
            print(f"   Access-Control-Allow-Origin: {cors_headers}")
    except Exception as e:
        print(f"❌ CORS test error: {e}")
    
    print("=" * 50)
    print("✅ Backend is accessible!")
    print("🌐 Frontend should be able to connect")
    print("")
    print("Next steps:")
    print("1. Start frontend: cd frontend && npm run dev")
    print("2. Open browser: http://localhost:3000")
    print("3. Try uploading a .mat file")
    
    return True

if __name__ == "__main__":
    test_backend()