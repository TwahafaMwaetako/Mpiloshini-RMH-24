from typing import Dict, Any, List
from .supabase_service import SupabaseService
from .data_loader import DataLoader
from .signal_processor import SignalProcessor
from .rule_engine import RuleEngine


class VibrationAnalysisService:
    def __init__(self) -> None:
        self._supabase = SupabaseService()
        self._loader = DataLoader()
        self._processor = SignalProcessor()

    def process_record(self, record_id: str) -> Dict[str, Any]:
        # 1) Fetch record and sensor metadata
        record = self._supabase.get_vibration_record(record_id)
        if not record:
            raise RuntimeError("record not found")

        sensor = self._supabase.get_sensor(record["sensor_id"])
        if not sensor:
            raise RuntimeError("sensor not found")

        sampling_rate = float(sensor.get("sampling_rate") or 0.0)
        if sampling_rate <= 0:
            raise RuntimeError("invalid sampling rate for sensor")

        storage_path = record["file_path"]

        # 2) Load signal
        signal, fs = self._loader.load_signal(storage_path, sampling_rate)

        # 3) Extract features
        features = self._processor.extract_features(signal, fs)

        # 4) Baseline: find machine baseline
        machine_id = sensor.get("machine_id")
        baseline = self._supabase.get_latest_baseline(machine_id)
        baseline_features = baseline.get("feature_vector") if baseline else None

        # 5) Rule engine
        engine = RuleEngine(baseline_features)
        findings = engine.evaluate(features)
        health_score = engine.calculate_health_score(findings)

        # 6) Persist diagnoses and detections; mark record processed
        diagnosis_id = self._supabase.insert_diagnosis(record_id, findings, health_score)
        self._supabase.insert_fault_detections(record_id, findings)
        self._supabase.mark_record_processed(record_id)

        return {
            "diagnosis_id": diagnosis_id,
            "faults": findings,
            "health_score": health_score,
            "features": features,
        }
