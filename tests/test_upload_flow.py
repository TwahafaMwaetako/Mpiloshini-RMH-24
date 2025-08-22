#!/usr/bin/env python3
"""
Test the complete upload and analysis flow
"""
import requests
import json
import os
import numpy as np
from scipy.io import savemat

BASE_URL = "http://localhost:8000"

def create_test_mat_file():
    """Create a test .mat file with vibration data"""
    # Generate synthetic vibration data
    fs = 1000  # Sampling frequency
    t = np.linspace(0, 1, fs)  # 1 second of data
    
    # Create a signal with some characteristics
    # Base signal with some noise
    signal = 0.1 * np.sin(2 * np.pi * 30 * t)  # 30 Hz component (imbalance)
    signal += 0.05 * np.sin(2 * np.pi * 60 * t)  # 60 Hz harmonic
    signal += 0.02 * np.random.randn(len(t))  # Random noise
    
    # Add some impulsive behavior (bearing defect simulation)
    impulse_times = [0.2, 0.4, 0.6, 0.8]
    for imp_time in impulse_times:
        idx = int(imp_time * fs)
        if idx < len(signal):
            # Create impulse response
            remaining_samples = len(signal) - idx
            impulse_response = 0.3 * np.exp(-50 * np.arange(remaining_samples) / fs)
            signal[idx:] += impulse_response
    
    # Save as .mat file
    mat_data = {
        'data': signal,
        'fs': fs,
        'time': t,
        'description': 'Test vibration data with imbalance and bearing defect'
    }
    
    savemat('test_vibration.mat', mat_data)
    return 'test_vibration.mat'

def test_complete_flow():
    """Test the complete upload and analysis flow"""
    try:
        print("Creating test .mat file...")
        mat_file = create_test_mat_file()
        
        print("1. Testing file upload...")
        with open(mat_file, "rb") as f:
            files = {"file": (mat_file, f, "application/octet-stream")}
            data = {
                "machine_id": "test-machine-001",
                "sensor_position": "Drive End",
                "axis": "Horizontal", 
                "sampling_rate": "1000"
            }
            
            response = requests.post(f"{BASE_URL}/upload/file", files=files, data=data)
            
        if response.status_code != 200:
            print(f"Upload failed: {response.status_code} - {response.text}")
            return False
            
        upload_result = response.json()
        print(f"✓ File uploaded successfully: {upload_result['file_name']}")
        print(f"  Storage path: {upload_result['storage_path']}")
        
        print("2. Creating vibration record...")
        record_data = {
            "machine_id": data["machine_id"],
            "file_path": upload_result["storage_path"],
            "file_url": upload_result["file_url"],
            "file_name": upload_result["file_name"],
            "sensor_position": data["sensor_position"],
            "axis": data["axis"],
            "sampling_rate": int(data["sampling_rate"]),
            "measurement_date": "2025-01-21T12:00:00Z"
        }
        
        response = requests.post(f"{BASE_URL}/upload/vibration-record", 
                               json=record_data,
                               headers={"Content-Type": "application/json"})
        
        if response.status_code != 200:
            print(f"Record creation failed: {response.status_code} - {response.text}")
            return False
            
        record_result = response.json()
        print(f"✓ Vibration record created: {record_result['record_id']}")
        
        print("3. Running analysis...")
        response = requests.post(f"{BASE_URL}/diagnose/analyze/{record_result['record_id']}")
        
        if response.status_code != 200:
            print(f"Analysis failed: {response.status_code} - {response.text}")
            return False
            
        analysis_result = response.json()
        print(f"✓ Analysis completed successfully!")
        print(f"  Health Score: {analysis_result.get('health_score', 'N/A')}")
        
        # Print detected faults
        fault_detection = analysis_result.get('fault_detection', {})
        detected_faults = fault_detection.get('detected_faults', [])
        
        if detected_faults:
            print(f"  Detected {len(detected_faults)} fault(s):")
            for fault in detected_faults:
                print(f"    - {fault['fault_type']}: {fault['severity']:.1f}% severity")
        else:
            print("  No faults detected")
            
        # Print recommendations
        recommendations = analysis_result.get('recommendations', [])
        if recommendations:
            print(f"  Recommendations:")
            for rec in recommendations:
                print(f"    - {rec['action']} ({rec['priority']} priority)")
        
        return True
        
    except Exception as e:
        print(f"Test failed with exception: {e}")
        return False
    finally:
        # Clean up
        if os.path.exists('test_vibration.mat'):
            os.remove('test_vibration.mat')

def main():
    print("Testing Complete Upload and Analysis Flow")
    print("=" * 50)
    
    success = test_complete_flow()
    
    print("\n" + "=" * 50)
    if success:
        print("✓ Complete flow test PASSED!")
        print("The upload and analysis functionality is working correctly.")
    else:
        print("✗ Complete flow test FAILED!")
        print("There are issues with the upload or analysis functionality.")

if __name__ == "__main__":
    main()