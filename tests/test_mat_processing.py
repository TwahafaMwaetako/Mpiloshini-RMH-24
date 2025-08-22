#!/usr/bin/env python3
"""
Quick test to verify .mat file processing works
"""

import os
import sys
sys.path.append('backend')

def test_mat_processing():
    """Test that we can load and process a .mat file"""
    
    # Find a .mat file
    test_files = [
        "test_data/Healthy/H8.mat",
        "test_data/Faulty/H8.mat",
        "c:/Users/piono/Mpiloshini RMH 24/test_data/Healthy/H8.mat",
        "c:/Users/piono/Mpiloshini RMH 24/test_data/Faulty/H8.mat"
    ]
    
    mat_file = None
    for f in test_files:
        if os.path.exists(f):
            mat_file = f
            break
    
    if not mat_file:
        print("❌ No H8.mat file found")
        return False
    
    print(f"✅ Found test file: {mat_file}")
    
    try:
        # Test data loading
        from backend.app.services.data_loader import DataLoader
        
        loader = DataLoader()
        
        with open(mat_file, 'rb') as f:
            file_bytes = f.read()
        
        print(f"✅ Read {len(file_bytes)} bytes")
        
        # Load the signal
        signal_data, sampling_rate, metadata = loader.load_from_bytes(
            file_bytes, "H8.mat"
        )
        
        print(f"✅ Loaded signal: {len(signal_data)} samples at {sampling_rate} Hz")
        print(f"   Signal range: {signal_data.min():.3f} to {signal_data.max():.3f}")
        print(f"   Metadata: {metadata}")
        
        # Test signal processing
        from backend.app.services.signal_processor import SignalProcessor
        
        processor = SignalProcessor()
        
        analysis_result = processor.process_signal(signal_data, sampling_rate)
        
        print(f"✅ Analysis completed")
        print(f"   Features extracted: {list(analysis_result.keys())}")
        
        if 'time_features' in analysis_result:
            time_features = analysis_result['time_features']
            print(f"   RMS: {time_features.get('rms', 'N/A'):.3f}")
            print(f"   Peak: {time_features.get('peak', 'N/A'):.3f}")
            print(f"   Crest Factor: {time_features.get('crest_factor', 'N/A'):.3f}")
        
        if 'frequency_features' in analysis_result:
            freq_features = analysis_result['frequency_features']
            print(f"   Dominant Frequency: {freq_features.get('dominant_frequency', 'N/A'):.1f} Hz")
            print(f"   Spectral Centroid: {freq_features.get('spectral_centroid', 'N/A'):.1f} Hz")
        
        # Test fault detection
        from backend.app.services.rule_engine import RuleEngine
        
        rule_engine = RuleEngine(baseline=None)
        
        # Combine features for fault detection
        all_features = {}
        if 'time_features' in analysis_result:
            all_features.update(analysis_result['time_features'])
        if 'frequency_features' in analysis_result:
            all_features.update(analysis_result['frequency_features'])
        
        fault_detections = rule_engine.evaluate(all_features)
        health_score = rule_engine.calculate_health_score(fault_detections)
        
        print(f"✅ Fault detection completed")
        print(f"   Health Score: {health_score}")
        print(f"   Faults detected: {len(fault_detections)}")
        
        for fault in fault_detections[:3]:  # Show first 3
            print(f"   - {fault.get('fault_type', 'Unknown')}: {fault.get('confidence', 0):.2f} confidence")
        
        return True
        
    except Exception as e:
        print(f"❌ Processing failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🧪 Testing .mat file processing...")
    print("=" * 50)
    
    success = test_mat_processing()
    
    if success:
        print("\n✅ .mat file processing works correctly!")
    else:
        print("\n❌ .mat file processing failed!")
    
    print("=" * 50)