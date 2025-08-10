import os
from io import StringIO
from typing import Tuple
import numpy as np

from ..services.supabase_service import SupabaseService


class DataLoader:
    def __init__(self) -> None:
        self._supabase = SupabaseService()

    def download_bytes(self, storage_path: str) -> bytes:
        return self._supabase.download_storage_file(storage_path)

    def load_signal(self, storage_path: str, sampling_rate_hz: float) -> Tuple[np.ndarray, float]:
        file_ext = os.path.splitext(storage_path)[1].lower()
        raw_bytes = self.download_bytes(storage_path)

        if file_ext == ".csv":
            return self._parse_csv(raw_bytes), sampling_rate_hz
        elif file_ext == ".wav":
            # Placeholder for WAV parser (scipy/soundfile recommended)
            raise NotImplementedError("WAV parsing not implemented yet")
        elif file_ext == ".tdms":
            raise NotImplementedError("TDMS parsing not implemented yet")
        else:
            raise ValueError(f"Unsupported file extension: {file_ext}")

    def _parse_csv(self, raw_bytes: bytes) -> np.ndarray:
        # Expect single-column CSV of numeric values
        text = raw_bytes.decode("utf-8", errors="ignore")
        data = np.loadtxt(StringIO(text), delimiter=",", ndmin=1)
        if data.ndim > 1 and data.shape[1] > 1:
            data = data[:, 0]
        return np.asarray(data, dtype=float)
