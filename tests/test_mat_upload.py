#!/usr/bin/env python3
"""
Test script to verify .mat file upload and processing works correctly
"""

import requests
import os
import sys

def test_mat_upload():
    """Test uploading a .mat file and processing it"""
    
    # Backend URL
    base_url = "http://localhost:8000"
    
    # Test health endpoint first
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code != 200:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
        print("✅ Backend is healthy")
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        return False
    
    # Test machines endpoint
    try:
        response = requests.get(f"{base_url}/records/machines")
        if response.status_code != 200:
            print(f"❌ Machines endpoint failed: {response.status_code}")
            return False
        machines = response.json()
        print(f"✅ Found {len(machines)} machines")
        if len(machines) == 0:
            print("❌ No machines available for testing")
            return False
        machine_id = machines[0]["id"]
        print(f"Using machine: {machines[0]['name']} (ID: {machine_id})")
    except Exception as e:
        print(f"❌ Failed to get machines: {e}")
        return False
    
    # Find a .mat file to test with
    test_data_dirs = [
        "test_data/Healthy",
        "test_data/Faulty", 
        "c:/Users/piono/Mpiloshini RMH 24/test_data/Healthy",
        "c:/Users/piono/Mpiloshini RMH 24/test_data/Faulty"
    ]
    
    mat_file = None
    for test_dir in test_data_dirs:
        if os.path.exists(test_dir):
            for file in os.listdir(test_dir):
                if file.endswith('.mat'):
                    mat_file = os.path.join(test_dir, file)
                    break
            if mat_file:
                break
    
    if not mat_file:
        print("❌ No .mat files found in test directories")
        print("Available directories checked:")
        for d in test_data_dirs:
            print(f"  - {d} (exists: {os.path.exists(d)})")
        return False
    
    print(f"✅ Found test file: {mat_file}")
    
    # Test file upload
    try:
        with open(mat_file, 'rb') as f:
            files = {'file': (os.path.basename(mat_file), f, 'application/octet-stream')}
            data = {
                'machine_id': machine_id,
                'sensor_position': 'Drive End',
                'axis': 'Horizontal',
                'sampling_rate': '12000'
            }
            
            response = requests.post(f"{base_url}/upload/file", files=files, data=data)
            
            if response.status_code != 200:
                print(f"❌ File upload failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
            
            upload_result = response.json()
            print(f"✅ File uploaded successfully")
            print(f"   File URL: {upload_result['file_url']}")
            print(f"   Storage Path: {upload_result['storage_path']}")
            
    except Exception as e:
        print(f"❌ File upload failed: {e}")
        return False
    
    # Test vibration record creation
    try:
        record_data = {
            "machine_id": machine_id,
            "file_path": upload_result["storage_path"],
            "file_url": upload_result["file_url"],
            "file_name": upload_result["file_name"],
            "sensor_position": "Drive End",
            "axis": "Horizontal",
            "sampling_rate": 12000,
            "measurement_date": "2025-01-21T12:00:00Z"
        }
        
        response = requests.post(f"{base_url}/upload/vibration-record", json=record_data)
        
        if response.status_code != 200:
            print(f"❌ Vibration record creation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        record_result = response.json()
        record_id = record_result["record_id"]
        print(f"✅ Vibration record created: {record_id}")
        
    except Exception as e:
        print(f"❌ Vibration record creation failed: {e}")
        return False
    
    # Test analysis
    try:
        response = requests.post(f"{base_url}/diagnose/analyze/{record_id}")
        
        if response.status_code != 200:
            print(f"❌ Analysis failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        analysis_result = response.json()
        print(f"✅ Analysis completed successfully")
        print(f"   Health Score: {analysis_result.get('health_score', 'N/A')}")
        print(f"   Faults Detected: {len(analysis_result.get('fault_detections', []))}")
        
        # Print some key results
        if 'fault_detections' in analysis_result:
            for fault in analysis_result['fault_detections'][:3]:  # Show first 3 faults
                print(f"   - {fault.get('fault_type', 'Unknown')}: {fault.get('confidence', 0):.2f} confidence")
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        return False
    
    print("\n🎉 All tests passed! .mat file upload and processing is working correctly.")
    return True

if __name__ == "__main__":
    print("🧪 Testing .mat file upload and processing...")
    print("=" * 60)
    
    success = test_mat_upload()
    
    if success:
        print("\n✅ Test completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Test failed!")
        sys.exit(1)