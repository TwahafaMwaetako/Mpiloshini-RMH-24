from typing import Dict
import numpy as np


class SignalProcessor:
    def apply_window(self, signal: np.ndarray) -> np.ndarray:
        window = np.hanning(len(signal))
        return signal * window

    def resample_signal(self, signal: np.ndarray, target_len: int) -> np.ndarray:
        # Simple linear resample to fixed length for consistent FFT
        indices = np.linspace(0, len(signal) - 1, num=target_len)
        return np.interp(indices, np.arange(len(signal)), signal)

    def extract_features(self, signal: np.ndarray, sampling_rate_hz: float) -> Dict[str, float]:
        if signal.size == 0:
            return {"rms": 0.0, "crest_factor": 0.0, "kurtosis": 0.0, "fft_peak_1x": 0.0}

        rms = float(np.sqrt(np.mean(signal**2)))
        peak = float(np.max(np.abs(signal)))
        crest_factor = float(peak / rms) if rms > 0 else 0.0
        kurtosis = float(np.mean(((signal - np.mean(signal)) / (np.std(signal) + 1e-12)) ** 4))

        # FFT peak magnitude at dominant frequency (excluding DC)
        n = 4096
        x = self.resample_signal(signal, n)
        X = np.fft.rfft(self.apply_window(x))
        freqs = np.fft.rfftfreq(n, d=1.0 / sampling_rate_hz)
        if X.size > 1:
            mag = np.abs(X)
            mag[0] = 0  # ignore DC
            idx = int(np.argmax(mag))
            dominant_mag = float(mag[idx])
            dominant_hz = float(freqs[idx])
        else:
            dominant_mag = 0.0
            dominant_hz = 0.0

        return {
            "rms": rms,
            "crest_factor": crest_factor,
            "kurtosis": kurtosis,
            "fft_peak_1x": dominant_mag,
            "fft_peak_hz": dominant_hz,
        }
