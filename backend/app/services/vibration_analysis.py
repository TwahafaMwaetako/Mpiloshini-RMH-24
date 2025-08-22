from typing import Dict, Any, List
from .supabase_service import SupabaseService
from .data_loader import DataLoader
from .signal_processor import SignalProcessor
from .rule_engine import RuleEngine


class VibrationAnalysisService:
    def __init__(self) -> None:
        self._supabase = SupabaseService()
        from .data_loader import DataLoader
        from .signal_processor import SignalProcessor
        self._loader = DataLoader()
        self._processor = SignalProcessor()
    
    def process_record(self, record_id: str) -> dict:
        """Process a vibration record and perform analysis"""
        try:
            print(f"Processing record: {record_id}")
            
            # Get the vibration record from database
            record = self._supabase.get_vibration_record(record_id)
            if not record:
                raise ValueError(f"Vibration record {record_id} not found")
            
            print(f"Found record: {record}")
            
            # Download the file from Supabase Storage
            file_path = record.get('file_path') or record.get('storage_path')
            if not file_path:
                raise ValueError("No file path found in vibration record")
            
            print(f"Downloading file from: {file_path}")
            
            file_bytes = self._supabase.download_storage_file(file_path)
            
            print(f"Downloaded {len(file_bytes)} bytes")
            
            # Extract filename from path
            filename = file_path.split('/')[-1]
            
            print(f"Processing file: {filename}")
            
            # Load and process the signal
            signal_data, sampling_rate, load_metadata = self._loader.load_from_bytes(
                file_bytes, filename
            )
            
            print(f"Loaded signal: {len(signal_data)} samples at {sampling_rate} Hz")
            
            # Process the signal and extract features
            analysis_result = self._processor.process_signal(signal_data, sampling_rate)
            
            print(f"Analysis result keys: {list(analysis_result.keys())}")
            
            # Perform fault detection
            fault_analysis = self._detect_faults(analysis_result)
            
            print(f"Fault analysis: {fault_analysis}")
            
            # Calculate overall health score
            health_score = self._calculate_health_score(fault_analysis)
            
            # Prepare final result
            result = {
                "record_id": record_id,
                "analysis_timestamp": "2025-01-21T12:00:00Z",  # Current timestamp
                "file_info": {
                    "filename": filename,
                    "file_path": file_path,
                    **load_metadata
                },
                "signal_analysis": analysis_result,
                "fault_detection": fault_analysis,
                "health_score": health_score,
                "recommendations": self._generate_recommendations(fault_analysis, health_score),
                "status": "completed"
            }
            
            # Store results in database
            self._store_analysis_results(record_id, result)
            
            # Mark record as processed
            self._supabase.mark_record_processed(record_id)
            
            # Also mark as processed in the in-memory database
            try:
                from ..api.endpoints.machines import vibration_records_db
                if record_id in vibration_records_db:
                    vibration_records_db[record_id]["processed"] = True
                    print(f"Marked record {record_id} as processed in in-memory database")
            except Exception as e:
                print(f"Failed to update in-memory database: {e}")
            
            return result
            
        except Exception as e:
            error_result = {
                "record_id": record_id,
                "status": "error",
                "error_message": str(e),
                "analysis_timestamp": "2025-01-21T12:00:00Z"
            }
            return error_result
    
    def _detect_faults(self, analysis_result: dict) -> dict:
        """Detect potential faults based on analysis results"""
        faults = []
        
        try:
            time_features = analysis_result.get('time_features', {})
            freq_features = analysis_result.get('frequency_features', {})
            
            # Check for imbalance (high 1x frequency component)
            dominant_freq = freq_features.get('dominant_frequency', 0)
            if dominant_freq > 0:
                # Assume machine running at ~30 Hz (1800 RPM) for example
                expected_running_freq = 30.0
                if abs(dominant_freq - expected_running_freq) < 2.0:  # Within 2 Hz
                    magnitude = freq_features.get('dominant_magnitude', 0)
                    if magnitude > 0.1:  # Threshold for imbalance
                        faults.append({
                            "fault_type": "Imbalance",
                            "severity": min(magnitude * 100, 100),
                            "confidence": 0.7,
                            "description": f"High 1x frequency component at {dominant_freq:.1f} Hz",
                            "frequency": dominant_freq
                        })
            
            # Check for high crest factor (bearing issues)
            crest_factor = time_features.get('crest_factor', 0)
            if crest_factor > 4.0:
                severity = min((crest_factor - 3.0) * 25, 100)
                faults.append({
                    "fault_type": "Bearing Defect",
                    "severity": severity,
                    "confidence": 0.6,
                    "description": f"High crest factor ({crest_factor:.2f}) indicates impulsive behavior",
                    "crest_factor": crest_factor
                })
            
            # Check for high kurtosis (impulsive behavior)
            kurtosis = time_features.get('kurtosis', 0)
            if kurtosis > 5.0:
                severity = min((kurtosis - 3.0) * 10, 100)
                faults.append({
                    "fault_type": "Impulsive Behavior",
                    "severity": severity,
                    "confidence": 0.5,
                    "description": f"High kurtosis ({kurtosis:.2f}) suggests impulsive events",
                    "kurtosis": kurtosis
                })
            
            # Check harmonics for gear mesh issues
            harmonics = freq_features.get('harmonics', [])
            if len(harmonics) >= 3:
                avg_harmonic_magnitude = sum(h.get('magnitude', 0) for h in harmonics) / len(harmonics)
                if avg_harmonic_magnitude > 0.05:
                    faults.append({
                        "fault_type": "Gear Mesh Issues",
                        "severity": min(avg_harmonic_magnitude * 200, 100),
                        "confidence": 0.6,
                        "description": f"Multiple harmonics detected, average magnitude: {avg_harmonic_magnitude:.3f}",
                        "harmonic_count": len(harmonics)
                    })
            
            # Check overall vibration level
            rms = time_features.get('rms', 0)
            if rms > 0.5:  # High vibration threshold
                faults.append({
                    "fault_type": "High Vibration Level",
                    "severity": min(rms * 100, 100),
                    "confidence": 0.8,
                    "description": f"Overall RMS level ({rms:.3f}) exceeds normal range",
                    "rms_level": rms
                })
            
        except Exception as e:
            faults.append({
                "fault_type": "Analysis Error",
                "severity": 50,
                "confidence": 1.0,
                "description": f"Error during fault detection: {str(e)}"
            })
        
        return {
            "detected_faults": faults,
            "fault_count": len(faults),
            "analysis_method": "rule_based"
        }
    
    def _calculate_health_score(self, fault_analysis: dict) -> int:
        """Calculate overall machine health score (0-100, higher is better)"""
        try:
            faults = fault_analysis.get('detected_faults', [])
            
            if not faults:
                return 95  # Excellent health if no faults detected
            
            # Calculate weighted severity
            total_severity = 0
            total_weight = 0
            
            for fault in faults:
                severity = fault.get('severity', 0)
                confidence = fault.get('confidence', 0.5)
                weight = confidence
                
                total_severity += severity * weight
                total_weight += weight
            
            if total_weight > 0:
                avg_severity = total_severity / total_weight
                # Convert severity to health score (inverse relationship)
                health_score = max(0, 100 - avg_severity)
            else:
                health_score = 95
            
            return int(health_score)
            
        except Exception:
            return 50  # Default moderate health if calculation fails
    
    def _generate_recommendations(self, fault_analysis: dict, health_score: int) -> list:
        """Generate maintenance recommendations based on analysis"""
        recommendations = []
        
        try:
            faults = fault_analysis.get('detected_faults', [])
            
            if health_score >= 90:
                recommendations.append({
                    "priority": "low",
                    "action": "Continue normal operation",
                    "description": "Machine is operating within normal parameters"
                })
            elif health_score >= 70:
                recommendations.append({
                    "priority": "medium",
                    "action": "Schedule routine maintenance",
                    "description": "Minor issues detected, plan maintenance during next scheduled downtime"
                })
            else:
                recommendations.append({
                    "priority": "high",
                    "action": "Investigate immediately",
                    "description": "Significant issues detected, investigate and address promptly"
                })
            
            # Specific recommendations based on fault types
            fault_types = [f.get('fault_type', '') for f in faults]
            
            if 'Imbalance' in fault_types:
                recommendations.append({
                    "priority": "medium",
                    "action": "Check rotor balance",
                    "description": "Perform balancing procedure or check for loose components"
                })
            
            if 'Bearing Defect' in fault_types:
                recommendations.append({
                    "priority": "high",
                    "action": "Inspect bearings",
                    "description": "Check bearing condition, lubrication, and consider replacement"
                })
            
            if 'Gear Mesh Issues' in fault_types:
                recommendations.append({
                    "priority": "medium",
                    "action": "Inspect gearbox",
                    "description": "Check gear teeth condition, alignment, and lubrication"
                })
            
        except Exception:
            recommendations.append({
                "priority": "medium",
                "action": "Manual inspection recommended",
                "description": "Unable to generate specific recommendations, perform manual inspection"
            })
        
        return recommendations
    
    def _store_analysis_results(self, record_id: str, result: dict):
        """Store analysis results in the database"""
        try:
            # Store diagnosis summary
            findings = result.get('fault_detection', {}).get('detected_faults', [])
            health_score = result.get('health_score', 50)
            
            self._supabase.insert_diagnosis(record_id, findings, health_score)
            
            # Store individual fault detections
            if findings:
                self._supabase.insert_fault_detections(record_id, findings)
                
        except Exception as e:
            print(f"Failed to store analysis results: {e}")
            # Don't raise exception here to avoid breaking the main analysis flow


