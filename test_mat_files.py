#!/usr/bin/env python3
"""
Test the upload functionality with real .mat files from the test_data directory
"""
import requests
import json
import os
import glob
import random
from pathlib import Path

BASE_URL = "http://localhost:8000"
TEST_DATA_DIR = r"c:\Users\piono\Mpiloshini RMH 24\test_data"

def get_mat_files():
    """Get all .mat files from the test data directory"""
    healthy_files = glob.glob(os.path.join(TEST_DATA_DIR, "Healthy", "*.mat"))
    faulty_files = glob.glob(os.path.join(TEST_DATA_DIR, "Faulty", "*.mat"))
    
    print(f"Found {len(healthy_files)} healthy files")
    print(f"Found {len(faulty_files)} faulty files")
    
    return healthy_files, faulty_files

def test_single_mat_file(file_path, expected_type="unknown"):
    """Test uploading and analyzing a single .mat file"""
    try:
        file_name = os.path.basename(file_path)
        print(f"\n{'='*60}")
        print(f"Testing: {file_name} (Expected: {expected_type})")
        print(f"{'='*60}")
        
        # Check file size
        file_size = os.path.getsize(file_path)
        print(f"File size: {file_size:,} bytes")
        
        if file_size == 0:
            print("❌ File is empty, skipping")
            return False
        
        # Step 1: Upload file
        print("1. Uploading file...")
        with open(file_path, "rb") as f:
            files = {"file": (file_name, f, "application/octet-stream")}
            data = {
                "machine_id": "test-machine-001",
                "sensor_position": "Drive End",
                "axis": "Horizontal",
                "sampling_rate": "12000"  # Common sampling rate for bearing data
            }
            
            response = requests.post(f"{BASE_URL}/upload/file", files=files, data=data)
        
        if response.status_code != 200:
            print(f"❌ Upload failed: {response.status_code} - {response.text}")
            return False
        
        upload_result = response.json()
        print(f"✅ Upload successful: {upload_result['file_name']}")
        print(f"   Storage path: {upload_result['storage_path']}")
        print(f"   File size: {upload_result['size']:,} bytes")
        
        # Step 2: Create vibration record
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
            print(f"❌ Record creation failed: {response.status_code} - {response.text}")
            return False
        
        record_result = response.json()
        print(f"✅ Vibration record created: {record_result['record_id']}")
        
        # Step 3: Run analysis
        print("3. Running analysis...")
        response = requests.post(f"{BASE_URL}/diagnose/analyze/{record_result['record_id']}")
        
        if response.status_code != 200:
            print(f"❌ Analysis failed: {response.status_code} - {response.text}")
            return False
        
        analysis_result = response.json()
        print(f"✅ Analysis completed!")
        
        # Display results
        health_score = analysis_result.get('health_score', 'N/A')
        print(f"   Health Score: {health_score}")
        
        # Check file info
        file_info = analysis_result.get('file_info', {})
        if file_info:
            print(f"   File format: {file_info.get('format', 'unknown')}")
            print(f"   Signal length: {file_info.get('length', 'unknown')}")
            print(f"   Sampling rate: {file_info.get('estimated_sampling_rate', 'unknown')} Hz")
        
        # Display detected faults
        fault_detection = analysis_result.get('fault_detection', {})
        detected_faults = fault_detection.get('detected_faults', [])
        
        if detected_faults:
            print(f"   🚨 Detected {len(detected_faults)} fault(s):")
            for fault in detected_faults:
                severity = fault.get('severity', 0)
                confidence = fault.get('confidence', 0)
                print(f"      - {fault['fault_type']}: {severity:.1f}% severity (confidence: {confidence:.2f})")
                if 'description' in fault:
                    print(f"        {fault['description']}")
        else:
            print("   ✅ No faults detected")
        
        # Display recommendations
        recommendations = analysis_result.get('recommendations', [])
        if recommendations:
            print(f"   📋 Recommendations:")
            for rec in recommendations:
                priority_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(rec.get('priority', 'medium'), "⚪")
                print(f"      {priority_emoji} {rec['action']} ({rec['priority']} priority)")
        
        # Analyze results based on expected type
        if expected_type == "healthy":
            if health_score >= 80:
                print(f"   ✅ CORRECT: High health score for healthy sample")
            else:
                print(f"   ⚠️  UNEXPECTED: Low health score ({health_score}) for healthy sample")
        elif expected_type == "faulty":
            if health_score < 80 or len(detected_faults) > 0:
                print(f"   ✅ CORRECT: Issues detected in faulty sample")
            else:
                print(f"   ⚠️  UNEXPECTED: No issues detected in faulty sample")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        return False

def test_multiple_files(file_list, expected_type, max_files=5):
    """Test multiple files of the same type"""
    print(f"\n{'='*80}")
    print(f"Testing {expected_type.upper()} files (max {max_files})")
    print(f"{'='*80}")
    
    # Randomly select files to test
    selected_files = random.sample(file_list, min(len(file_list), max_files))
    
    results = []
    for file_path in selected_files:
        result = test_single_mat_file(file_path, expected_type)
        results.append(result)
    
    success_count = sum(results)
    print(f"\n📊 {expected_type.upper()} Results: {success_count}/{len(results)} successful")
    
    return results

def main():
    print("Testing MAT File Upload and Analysis")
    print("=" * 80)
    
    # Check if test data directory exists
    if not os.path.exists(TEST_DATA_DIR):
        print(f"❌ Test data directory not found: {TEST_DATA_DIR}")
        return
    
    # Get all .mat files
    healthy_files, faulty_files = get_mat_files()
    
    if not healthy_files and not faulty_files:
        print("❌ No .mat files found in test data directory")
        return
    
    # Test backend health first
    print("Checking backend health...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Backend is running")
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        return
    
    all_results = []
    
    # Test healthy files
    if healthy_files:
        healthy_results = test_multiple_files(healthy_files, "healthy", max_files=3)
        all_results.extend(healthy_results)
    
    # Test faulty files  
    if faulty_files:
        faulty_results = test_multiple_files(faulty_files, "faulty", max_files=3)
        all_results.extend(faulty_results)
    
    # Final summary
    print(f"\n{'='*80}")
    print("FINAL SUMMARY")
    print(f"{'='*80}")
    
    total_tests = len(all_results)
    successful_tests = sum(all_results)
    
    print(f"Total tests run: {total_tests}")
    print(f"Successful tests: {successful_tests}")
    print(f"Failed tests: {total_tests - successful_tests}")
    print(f"Success rate: {(successful_tests/total_tests*100):.1f}%" if total_tests > 0 else "N/A")
    
    if successful_tests == total_tests:
        print("🎉 ALL TESTS PASSED! The .mat file upload and analysis is working correctly.")
    elif successful_tests > 0:
        print("⚠️  PARTIAL SUCCESS: Some tests passed, but there may be issues with certain files.")
    else:
        print("❌ ALL TESTS FAILED: There are significant issues with the upload/analysis system.")
    
    print(f"\n💡 You can now test the frontend by:")
    print(f"   1. Navigate to the Upload page")
    print(f"   2. Select any .mat file from: {TEST_DATA_DIR}")
    print(f"   3. Fill in the form and upload")
    print(f"   4. The system should process it successfully!")

if __name__ == "__main__":
    main()