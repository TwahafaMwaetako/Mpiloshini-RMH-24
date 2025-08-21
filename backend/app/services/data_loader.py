"""
Data loading service for various vibration data file formats
"""
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, Optional
import io
from scipy.io import loadmat
import wave
import struct


class DataLoader:
    """Service for loading vibration data from various file formats"""
    
    def __init__(self):
        pass
    
    def load_from_bytes(self, file_bytes: bytes, filename: str, sampling_rate: Optional[float] = None) -> Tuple[np.ndarray, float, Dict[str, Any]]:
        """
        Load vibration data from file bytes
        
        Args:
            file_bytes: Raw file content as bytes
            filename: Original filename to determine format
            sampling_rate: Optional sampling rate override
            
        Returns:
            Tuple of (signal_data, sampling_rate, metadata)
        """
        file_extension = filename.lower().split('.')[-1]
        
        if file_extension == 'csv':
            return self._load_csv(file_bytes, sampling_rate)
        elif file_extension == 'wav':
            return self._load_wav(file_bytes)
        elif file_extension == 'mat':
            return self._load_mat(file_bytes, sampling_rate)
        elif file_extension in ['tdms', 'mdf']:
            # For now, treat as binary data - would need specific libraries for full support
            return self._load_binary(file_bytes, sampling_rate)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
    
    def _load_csv(self, file_bytes: bytes, sampling_rate: Optional[float]) -> Tuple[np.ndarray, float, Dict[str, Any]]:
        """Load CSV file containing vibration data"""
        try:
            # Try to read as CSV
            df = pd.read_csv(io.BytesIO(file_bytes))
            
            # Assume first column is time, second is amplitude (or just amplitude if single column)
            if len(df.columns) == 1:
                signal = df.iloc[:, 0].values
                # Estimate sampling rate if not provided
                if sampling_rate is None:
                    sampling_rate = 1000.0  # Default assumption
            elif len(df.columns) >= 2:
                # Check if first column looks like time
                time_col = df.iloc[:, 0].values
                signal = df.iloc[:, 1].values
                
                if sampling_rate is None:
                    # Try to estimate from time column
                    if len(time_col) > 1:
                        dt = np.mean(np.diff(time_col))
                        sampling_rate = 1.0 / dt if dt > 0 else 1000.0
                    else:
                        sampling_rate = 1000.0
            else:
                raise ValueError("CSV file must have at least one column")
            
            metadata = {
                "format": "csv",
                "columns": list(df.columns),
                "length": len(signal),
                "estimated_sampling_rate": sampling_rate
            }
            
            return signal.astype(np.float64), float(sampling_rate), metadata
            
        except Exception as e:
            raise ValueError(f"Failed to load CSV file: {str(e)}")
    
    def _load_wav(self, file_bytes: bytes) -> Tuple[np.ndarray, float, Dict[str, Any]]:
        """Load WAV file"""
        try:
            # Use wave module to read WAV file
            with wave.open(io.BytesIO(file_bytes), 'rb') as wav_file:
                frames = wav_file.readframes(-1)
                sampling_rate = float(wav_file.getframerate())
                n_channels = wav_file.getnchannels()
                sample_width = wav_file.getsampwidth()
                
                # Convert bytes to numpy array
                if sample_width == 1:
                    dtype = np.uint8
                elif sample_width == 2:
                    dtype = np.int16
                elif sample_width == 4:
                    dtype = np.int32
                else:
                    raise ValueError(f"Unsupported sample width: {sample_width}")
                
                signal = np.frombuffer(frames, dtype=dtype)
                
                # Handle multi-channel audio (take first channel)
                if n_channels > 1:
                    signal = signal.reshape(-1, n_channels)[:, 0]
                
                # Convert to float and normalize
                signal = signal.astype(np.float64)
                if sample_width > 1:
                    signal = signal / (2 ** (8 * sample_width - 1))
                
                metadata = {
                    "format": "wav",
                    "channels": n_channels,
                    "sample_width": sample_width,
                    "length": len(signal),
                    "duration_seconds": len(signal) / sampling_rate
                }
                
                return signal, sampling_rate, metadata
                
        except Exception as e:
            raise ValueError(f"Failed to load WAV file: {str(e)}")
    
    def _load_mat(self, file_bytes: bytes, sampling_rate: Optional[float]) -> Tuple[np.ndarray, float, Dict[str, Any]]:
        """Load MATLAB .mat file"""
        try:
            # Load .mat file
            mat_data = loadmat(io.BytesIO(file_bytes))
            
            # Remove MATLAB metadata keys
            data_keys = [k for k in mat_data.keys() if not k.startswith('__')]
            
            if not data_keys:
                raise ValueError("No data found in .mat file")
            
            # Try to find the main data array
            signal = None
            found_sampling_rate = sampling_rate
            
            # Look for common variable names
            common_names = ['data', 'signal', 'vibration', 'x', 'y', 'acceleration', 'velocity']
            
            for name in common_names:
                if name in mat_data:
                    signal = mat_data[name]
                    break
            
            # If not found, take the first numeric array
            if signal is None:
                for key in data_keys:
                    value = mat_data[key]
                    if isinstance(value, np.ndarray) and value.dtype.kind in 'fc':  # float or complex
                        signal = value
                        break
            
            if signal is None:
                raise ValueError("No suitable numeric data found in .mat file")
            
            # Flatten if multi-dimensional (take first column/row)
            if signal.ndim > 1:
                if signal.shape[1] == 1:
                    signal = signal.flatten()
                else:
                    signal = signal[:, 0]  # Take first column
            
            # Look for sampling rate in the file
            if found_sampling_rate is None:
                rate_names = ['fs', 'sampling_rate', 'sample_rate', 'sr', 'freq']
                for name in rate_names:
                    if name in mat_data:
                        rate_val = mat_data[name]
                        if isinstance(rate_val, np.ndarray):
                            found_sampling_rate = float(rate_val.item())
                        else:
                            found_sampling_rate = float(rate_val)
                        break
                
                if found_sampling_rate is None:
                    found_sampling_rate = 1000.0  # Default assumption
            
            metadata = {
                "format": "mat",
                "variables": data_keys,
                "length": len(signal),
                "original_shape": mat_data[data_keys[0]].shape if data_keys else None,
                "estimated_sampling_rate": found_sampling_rate
            }
            
            return signal.astype(np.float64), float(found_sampling_rate), metadata
            
        except Exception as e:
            raise ValueError(f"Failed to load .mat file: {str(e)}")
    
    def _load_binary(self, file_bytes: bytes, sampling_rate: Optional[float]) -> Tuple[np.ndarray, float, Dict[str, Any]]:
        """Load binary file (TDMS, MDF) - basic implementation"""
        try:
            # For now, treat as raw float32 data
            # In a full implementation, you'd use libraries like nptdms for TDMS or asammdf for MDF
            
            # Try to interpret as float32 array
            signal = np.frombuffer(file_bytes, dtype=np.float32)
            
            if len(signal) == 0:
                # Try as int16
                signal = np.frombuffer(file_bytes, dtype=np.int16).astype(np.float64)
                signal = signal / 32768.0  # Normalize
            
            if sampling_rate is None:
                sampling_rate = 1000.0  # Default assumption
            
            metadata = {
                "format": "binary",
                "length": len(signal),
                "estimated_sampling_rate": sampling_rate,
                "note": "Basic binary interpretation - may need specialized library for full support"
            }
            
            return signal.astype(np.float64), float(sampling_rate), metadata
            
        except Exception as e:
            raise ValueError(f"Failed to load binary file: {str(e)}")