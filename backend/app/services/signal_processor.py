"""
Signal processing service for vibration analysis
"""
import numpy as np
from scipy import signal
from scipy.fft import fft, fftfreq
from typing import Dict, Any, Tuple, Optional
import warnings

warnings.filterwarnings('ignore')


class SignalProcessor:
    """Service for processing vibration signals and extracting features"""
    
    def __init__(self):
        pass
    
    def process_signal(self, raw_signal: np.ndarray, sampling_rate: float) -> Dict[str, Any]:
        """
        Process raw vibration signal and extract features
        
        Args:
            raw_signal: Raw vibration data
            sampling_rate: Sampling rate in Hz
            
        Returns:
            Dictionary containing processed signal and extracted features
        """
        try:
            # Basic signal conditioning
            conditioned_signal = self.condition_signal(raw_signal, sampling_rate)
            
            # Extract time domain features
            time_features = self.extract_time_features(conditioned_signal)
            
            # Extract frequency domain features
            freq_features = self.extract_frequency_features(conditioned_signal, sampling_rate)
            
            # Generate plots data
            plots_data = self.generate_plots_data(conditioned_signal, sampling_rate)
            
            return {
                "signal_length": len(conditioned_signal),
                "sampling_rate": sampling_rate,
                "duration_seconds": len(conditioned_signal) / sampling_rate,
                "time_features": time_features,
                "frequency_features": freq_features,
                "plots": plots_data,
                "processing_status": "success"
            }
            
        except Exception as e:
            return {
                "processing_status": "error",
                "error_message": str(e),
                "signal_length": len(raw_signal) if raw_signal is not None else 0,
                "sampling_rate": sampling_rate
            }
    
    def condition_signal(self, signal: np.ndarray, sampling_rate: float) -> np.ndarray:
        """Apply basic signal conditioning"""
        try:
            # Remove DC component
            signal = signal - np.mean(signal)
            
            # Apply high-pass filter to remove low-frequency noise
            nyquist = sampling_rate / 2
            high_cutoff = min(1.0, nyquist * 0.01)  # 1 Hz or 1% of Nyquist
            
            if high_cutoff < nyquist:
                sos = signal.butter(4, high_cutoff / nyquist, btype='high', output='sos')
                signal = signal.sosfilt(sos, signal)
            
            # Apply anti-aliasing filter
            low_cutoff = min(nyquist * 0.8, 1000.0)  # 80% of Nyquist or 1kHz
            if low_cutoff < nyquist:
                sos = signal.butter(4, low_cutoff / nyquist, btype='low', output='sos')
                signal = signal.sosfilt(sos, signal)
            
            return signal
            
        except Exception:
            # If filtering fails, return original signal minus DC
            return signal - np.mean(signal)
    
    def extract_time_features(self, signal: np.ndarray) -> Dict[str, float]:
        """Extract time domain features"""
        try:
            features = {}
            
            # Basic statistical features
            features['rms'] = float(np.sqrt(np.mean(signal**2)))
            features['peak'] = float(np.max(np.abs(signal)))
            features['peak_to_peak'] = float(np.ptp(signal))
            features['mean'] = float(np.mean(signal))
            features['std'] = float(np.std(signal))
            features['variance'] = float(np.var(signal))
            
            # Shape factors
            if features['rms'] > 0:
                features['crest_factor'] = features['peak'] / features['rms']
                features['form_factor'] = features['rms'] / np.mean(np.abs(signal)) if np.mean(np.abs(signal)) > 0 else 0
            else:
                features['crest_factor'] = 0
                features['form_factor'] = 0
            
            # Higher order moments
            if features['std'] > 0:
                features['skewness'] = float(np.mean(((signal - features['mean']) / features['std'])**3))
                features['kurtosis'] = float(np.mean(((signal - features['mean']) / features['std'])**4))
            else:
                features['skewness'] = 0
                features['kurtosis'] = 0
            
            # Impulse factor
            if np.mean(np.abs(signal)) > 0:
                features['impulse_factor'] = features['peak'] / np.mean(np.abs(signal))
            else:
                features['impulse_factor'] = 0
            
            return features
            
        except Exception as e:
            return {"error": f"Time feature extraction failed: {str(e)}"}
    
    def extract_frequency_features(self, signal: np.ndarray, sampling_rate: float) -> Dict[str, Any]:
        """Extract frequency domain features"""
        try:
            # Compute FFT
            n = len(signal)
            fft_values = fft(signal)
            frequencies = fftfreq(n, 1/sampling_rate)
            
            # Take positive frequencies only
            positive_freq_idx = frequencies > 0
            frequencies = frequencies[positive_freq_idx]
            magnitude = np.abs(fft_values[positive_freq_idx])
            
            # Power spectral density
            psd = magnitude**2 / (sampling_rate * n)
            
            features = {}
            
            # Spectral features
            features['spectral_centroid'] = float(np.sum(frequencies * magnitude) / np.sum(magnitude)) if np.sum(magnitude) > 0 else 0
            features['spectral_rolloff'] = self._calculate_spectral_rolloff(frequencies, magnitude)
            features['spectral_bandwidth'] = self._calculate_spectral_bandwidth(frequencies, magnitude, features['spectral_centroid'])
            
            # Peak detection
            peaks, _ = signal.find_peaks(magnitude, height=np.max(magnitude) * 0.1)
            if len(peaks) > 0:
                # Dominant frequency
                dominant_peak_idx = peaks[np.argmax(magnitude[peaks])]
                features['dominant_frequency'] = float(frequencies[dominant_peak_idx])
                features['dominant_magnitude'] = float(magnitude[dominant_peak_idx])
                
                # Harmonic analysis (look for multiples of dominant frequency)
                harmonics = self._find_harmonics(frequencies, magnitude, features['dominant_frequency'])
                features['harmonics'] = harmonics
            else:
                features['dominant_frequency'] = 0
                features['dominant_magnitude'] = 0
                features['harmonics'] = []
            
            # Frequency band analysis
            features['frequency_bands'] = self._analyze_frequency_bands(frequencies, psd, sampling_rate)
            
            return features
            
        except Exception as e:
            return {"error": f"Frequency feature extraction failed: {str(e)}"}
    
    def _calculate_spectral_rolloff(self, frequencies: np.ndarray, magnitude: np.ndarray, rolloff_percent: float = 0.85) -> float:
        """Calculate spectral rolloff frequency"""
        try:
            total_energy = np.sum(magnitude)
            cumulative_energy = np.cumsum(magnitude)
            rolloff_idx = np.where(cumulative_energy >= rolloff_percent * total_energy)[0]
            if len(rolloff_idx) > 0:
                return float(frequencies[rolloff_idx[0]])
            return float(frequencies[-1])
        except Exception:
            return 0.0
    
    def _calculate_spectral_bandwidth(self, frequencies: np.ndarray, magnitude: np.ndarray, centroid: float) -> float:
        """Calculate spectral bandwidth"""
        try:
            if np.sum(magnitude) > 0:
                return float(np.sqrt(np.sum(((frequencies - centroid)**2) * magnitude) / np.sum(magnitude)))
            return 0.0
        except Exception:
            return 0.0
    
    def _find_harmonics(self, frequencies: np.ndarray, magnitude: np.ndarray, fundamental_freq: float, max_harmonics: int = 5) -> list:
        """Find harmonic frequencies"""
        harmonics = []
        try:
            for i in range(2, max_harmonics + 1):
                harmonic_freq = fundamental_freq * i
                # Find closest frequency bin
                idx = np.argmin(np.abs(frequencies - harmonic_freq))
                if np.abs(frequencies[idx] - harmonic_freq) < fundamental_freq * 0.1:  # Within 10% tolerance
                    harmonics.append({
                        "order": i,
                        "frequency": float(frequencies[idx]),
                        "magnitude": float(magnitude[idx])
                    })
        except Exception:
            pass
        return harmonics
    
    def _analyze_frequency_bands(self, frequencies: np.ndarray, psd: np.ndarray, sampling_rate: float) -> Dict[str, float]:
        """Analyze energy in different frequency bands"""
        try:
            bands = {}
            
            # Define frequency bands (adjust based on typical machinery frequencies)
            band_definitions = {
                "low_freq": (0, min(10, sampling_rate/4)),
                "bearing_freq": (10, min(1000, sampling_rate/4)),
                "gear_mesh": (1000, min(5000, sampling_rate/4)),
                "high_freq": (5000, sampling_rate/2)
            }
            
            for band_name, (low_freq, high_freq) in band_definitions.items():
                band_mask = (frequencies >= low_freq) & (frequencies <= high_freq)
                if np.any(band_mask):
                    bands[f"{band_name}_energy"] = float(np.sum(psd[band_mask]))
                else:
                    bands[f"{band_name}_energy"] = 0.0
            
            return bands
            
        except Exception:
            return {}
    
    def generate_plots_data(self, signal: np.ndarray, sampling_rate: float, max_points: int = 1000) -> Dict[str, Any]:
        """Generate data for plotting"""
        try:
            plots = {}
            
            # Time domain plot (downsample if too many points)
            n_samples = len(signal)
            if n_samples > max_points:
                step = n_samples // max_points
                time_indices = np.arange(0, n_samples, step)
            else:
                time_indices = np.arange(n_samples)
            
            time_values = time_indices / sampling_rate
            plots['time_domain'] = {
                "time": time_values.tolist(),
                "amplitude": signal[time_indices].tolist(),
                "sampling_rate": sampling_rate,
                "duration": n_samples / sampling_rate
            }
            
            # Frequency domain plot
            n_fft = min(len(signal), 2048)  # Limit FFT size for performance
            fft_values = fft(signal[:n_fft])
            frequencies = fftfreq(n_fft, 1/sampling_rate)
            
            # Take positive frequencies only
            positive_freq_idx = frequencies > 0
            freq_plot = frequencies[positive_freq_idx]
            magnitude_plot = np.abs(fft_values[positive_freq_idx])
            
            # Limit frequency range for plotting
            max_freq = min(sampling_rate/2, 1000)  # Up to 1kHz or Nyquist
            freq_mask = freq_plot <= max_freq
            
            plots['frequency_domain'] = {
                "frequency": freq_plot[freq_mask].tolist(),
                "magnitude": magnitude_plot[freq_mask].tolist(),
                "max_frequency": max_freq
            }
            
            return plots
            
        except Exception as e:
            return {"error": f"Plot generation failed: {str(e)}"}