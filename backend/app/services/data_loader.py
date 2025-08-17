import os
from io import StringIO, BytesIO
from typing import Tuple
import numpy as np
from scipy.io import loadmat

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
        elif file_ext == ".mat":
            return self._parse_mat(raw_bytes), sampling_rate_hz
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

    def _parse_mat(self, raw_bytes: bytes) -> np.ndarray:
        # Load the .mat file from bytes
        mat_file = BytesIO(raw_bytes)
        mat_data = loadmat(mat_file)

        # Find the first variable that is a numpy array and not a metadata key
        for key, value in mat_data.items():
            if not key.startswith("__") and isinstance(value, np.ndarray):
                # Assuming the first ndarray found is the signal data
                signal = value.flatten()
                return np.asarray(signal, dtype=float)

        raise ValueError("No suitable signal data found in .mat file")
