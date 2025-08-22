#!/usr/bin/env python3
"""
Simple test script to verify backend functionality
"""
import requests
import json
import os

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health check: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_machines():
    """Test machines endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/records/machines")
        print(f"Machines: {response.status_code}")
        if response.status_code == 200:
            machines = response.json()
            print(f"Found {len(machines)} machines")
            for machine in machines:
                print(f"  - {machine['name']} ({machine['type']})")
        return response.status_code == 200
    except Exception as e:
        print(f"Machines test failed: {e}")
        return False

def test_file_upload():
    """Test file upload with a simple CSV"""
    try:
        # Create a simple test CSV file
        test_csv_content = """time,acceleration
0.0,0.1
0.001,0.15
0.002,0.08
0.003,0.12
0.004,0.09"""
        
        # Save to temporary file
        with open("test_vibration.csv", "w") as f:
            f.write(test_csv_content)
        
        # Upload the file
        with open("test_vibration.csv", "rb") as f:
            files = {"file": ("test_vibration.csv", f, "text/csv")}
            data = {
                "machine_id": "test-machine",
                "sensor_position": "Drive End",
                "axis": "Horizontal",
                "sampling_rate": "1000"
            }
            
            response = requests.post(f"{BASE_URL}/upload/file", files=files, data=data)
            print(f"File upload: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"  Uploaded: {result['file_name']}")
                print(f"  Size: {result['size']} bytes")
                return True
            else:
                print(f"  Error: {response.text}")
                return False
                
    except Exception as e:
        print(f"File upload test failed: {e}")
        return False
    finally:
        # Clean up
        if os.path.exists("test_vibration.csv"):
            os.remove("test_vibration.csv")

def main():
    print("Testing Mpiloshini RMH 24 Backend")
    print("=" * 40)
    
    tests = [
        ("Health Check", test_health),
        ("Machines API", test_machines),
        ("File Upload", test_file_upload),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        result = test_func()
        results.append((test_name, result))
        print(f"Result: {'PASS' if result else 'FAIL'}")
    
    print("\n" + "=" * 40)
    print("Test Summary:")
    for test_name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"  {test_name}: {status}")
    
    all_passed = all(result for _, result in results)
    print(f"\nOverall: {'ALL TESTS PASSED' if all_passed else 'SOME TESTS FAILED'}")

if __name__ == "__main__":
    main()