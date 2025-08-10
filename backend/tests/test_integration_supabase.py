import os
import uuid
import numpy as np
import pytest

from app.services.supabase_service import SupabaseService
from app.services.vibration_analysis import VibrationAnalysisService


requires_env = pytest.mark.skipif(
    not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_SERVICE_KEY"),
    reason="Supabase env not configured"
)


@requires_env
def test_supabase_roundtrip(monkeypatch):
    supa = SupabaseService()

    # 1) Create machine and sensor
    machine_id = supa.create_machine(name=f"TestMachine-{uuid.uuid4().hex[:6]}", type_="motor")
    sensor_id = supa.create_sensor(machine_id=machine_id, position="DE", axis="X", sampling_rate=20000.0)

    # 2) Upsert baseline (simple features)
    baseline_features = {"rms": 0.5, "crest_factor": 3.0, "kurtosis": 3.0, "fft_peak_1x": 10.0}
    supa.upsert_baseline(machine_id, baseline_features)

    # 3) Upload a tiny CSV signal to storage and create a record
    t = np.linspace(0, 1.0, 4000)
    signal = (0.5 * np.sin(2 * np.pi * 50 * t)).astype(np.float64)
    csv_bytes = ("\n".join(str(x) for x in signal)).encode("utf-8")
    storage_path = f"test-data/{uuid.uuid4().hex}.csv"
    supa.upload_storage_file(storage_path, csv_bytes, content_type="text/csv")

    from datetime import datetime, timezone
    payload = {
        "sensor_id": sensor_id,
        "file_path": storage_path,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "unprocessed",
    }
    # Insert record
    record = supa.create_vibration_record_from_dict(payload)

    # 4) Run analysis service end-to-end on the new record
    analysis = VibrationAnalysisService()
    result = analysis.process_record(record["id"])

    assert "diagnosis_id" in result
    assert "health_score" in result
    assert isinstance(result["faults"], list)
