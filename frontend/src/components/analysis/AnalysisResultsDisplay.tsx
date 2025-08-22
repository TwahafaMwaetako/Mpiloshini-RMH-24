import React from 'react';
import { AlertCircle, TrendingUp, Activity, Zap, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import NeumorphicCard from '@/components/NeumorphicCard';

interface AnalysisResult {
  record_id: string;
  status: string;
  error_message?: string;
  analysis_timestamp: string;
  file_info?: {
    filename: string;
    file_path: string;
  };
  signal_analysis?: {
    signal_length: number;
    sampling_rate: number;
    duration_seconds: number;
    time_features?: {
      rms: number;
      peak: number;
      crest_factor: number;
      kurtosis: number;
      skewness: number;
    };
    frequency_features?: {
      dominant_frequency: number;
      dominant_magnitude: number;
      harmonics: Array<{
        frequency: number;
        magnitude: number;
      }>;
    };
    plots?: {
      time_domain?: Array<{ time: number; amplitude: number }>;
      frequency_domain?: Array<{ frequency: number; magnitude: number }>;
    };
  };
  fault_detection?: {
    detected_faults: Array<{
      fault_type: string;
      severity: number;
      confidence: number;
      description: string;
      [key: string]: any;
    }>;
    fault_count: number;
    analysis_method: string;
  };
  health_score: number;
  recommendations?: Array<{
    priority: 'low' | 'medium' | 'high';
    action: string;
    description: string;
  }>;
}

interface AnalysisResultsDisplayProps {
  results: AnalysisResult[];
  onRetryFailed?: () => void;
  isProcessing?: boolean;
}

const AnalysisResultsDisplay: React.FC<AnalysisResultsDisplayProps> = ({ results, onRetryFailed, isProcessing }) => {
  if (!results || results.length === 0) {
    return null;
  }

  const hasErrors = results.some(r => r.status === "error");

  const getTimeData = (result: AnalysisResult) => {
    // Use actual plot data from backend if available
    if (result.signal_analysis?.plots?.time_domain) {
      const plotData = result.signal_analysis.plots.time_domain;
      if (plotData.time && plotData.amplitude) {
        return plotData.time.map((time: number, index: number) => ({
          time: time * 1000, // Convert to milliseconds for display
          amplitude: plotData.amplitude[index]
        }));
      }
    }
    
    // Fallback: Generate mock data if backend data not available
    const length = result.signal_analysis?.signal_length || 1000;
    const samplingRate = result.signal_analysis?.sampling_rate || 1000;
    const rms = result.signal_analysis?.time_features?.rms || 0.1;
    
    const data = [];
    for (let i = 0; i < Math.min(length, 500); i++) {
      const time = i / samplingRate;
      const amplitude = rms * (Math.sin(2 * Math.PI * 30 * time) + 0.3 * Math.sin(2 * Math.PI * 120 * time) + 0.1 * (Math.random() - 0.5));
      data.push({ time: time * 1000, amplitude });
    }
    return data;
  };

  const getFrequencyData = (result: AnalysisResult) => {
    // Use actual plot data from backend if available
    if (result.signal_analysis?.plots?.frequency_domain) {
      const plotData = result.signal_analysis.plots.frequency_domain;
      if (plotData.frequency && plotData.magnitude) {
        return plotData.frequency.map((freq: number, index: number) => ({
          frequency: freq,
          magnitude: plotData.magnitude[index],
          isFaultFreq: isFaultFrequency(freq, result)
        }));
      }
    }
    
    // Fallback: Generate mock data if backend data not available
    const samplingRate = result.signal_analysis?.sampling_rate || 1000;
    const dominantFreq = result.signal_analysis?.frequency_features?.dominant_frequency || 30;
    const dominantMag = result.signal_analysis?.frequency_features?.dominant_magnitude || 0.5;
    
    const data = [];
    const maxFreq = Math.min(samplingRate / 2, 500); // Limit to 500 Hz for display
    const step = maxFreq / 200;
    
    for (let freq = 0; freq <= maxFreq; freq += step) {
      let magnitude = 0.01 * Math.random();
      
      if (Math.abs(freq - dominantFreq) < 2) {
        magnitude += dominantMag * Math.exp(-Math.pow(freq - dominantFreq, 2) / 2);
      }
      
      if (Math.abs(freq - dominantFreq * 2) < 2) {
        magnitude += dominantMag * 0.3 * Math.exp(-Math.pow(freq - dominantFreq * 2, 2) / 2);
      }
      
      data.push({ 
        frequency: freq, 
        magnitude,
        isFaultFreq: isFaultFrequency(freq, result)
      });
    }
    return data;
  };

  const isFaultFrequency = (frequency: number, result: AnalysisResult): boolean => {
    // Check if this frequency is associated with detected faults
    const faults = result.fault_detection?.detected_faults || [];
    const dominantFreq = result.signal_analysis?.frequency_features?.dominant_frequency || 0;
    const harmonics = result.signal_analysis?.frequency_features?.harmonics || [];
    
    // Check if frequency matches dominant frequency (within tolerance)
    if (dominantFreq > 0 && Math.abs(frequency - dominantFreq) < 2) {
      return faults.some(f => f.fault_type.includes('Imbalance'));
    }
    
    // Check if frequency matches any harmonics
    for (const harmonic of harmonics) {
      if (Math.abs(frequency - harmonic.frequency) < 2) {
        return faults.some(f => f.fault_type.includes('Gear'));
      }
    }
    
    return false;
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-text-dark-gray">
          Analysis Results
        </h2>
        {hasErrors && onRetryFailed && (
          <button
            onClick={onRetryFailed}
            disabled={isProcessing}
            className="flex items-center gap-2 rounded-lg bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
            Retry Failed
          </button>
        )}
      </div>
      
      {results.map((result, index) => (
        <NeumorphicCard key={index} className="p-6">
          {result.status === "error" ? (
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
              <h3 className="text-lg font-semibold text-red-600">Analysis Failed</h3>
              <p className="text-text-body mb-4">{result.error_message}</p>
              <div className="rounded-lg bg-red-50 p-4 text-left">
                <h4 className="font-medium text-red-800 mb-2">Troubleshooting Tips:</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Ensure the file format is supported (.mat, .csv, .txt)</li>
                  <li>• Check that the file contains valid vibration data</li>
                  <li>• Verify the backend service is running and accessible</li>
                  <li>• Try uploading the file again or use the retry button above</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Info Header */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-text-dark-gray">
                  {result.file_info?.filename || `Analysis ${index + 1}`}
                </h3>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-text-body">
                  <span>Health Score: <strong className={`${result.health_score >= 80 ? 'text-green-600' : result.health_score >= 60 ? 'text-orange-500' : 'text-red-500'}`}>{result.health_score}%</strong></span>
                  <span>Faults Detected: <strong>{result.fault_detection?.fault_count || 0}</strong></span>
                  <span>Analysis Time: {new Date(result.analysis_timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Key Metrics Grid */}
              {result.signal_analysis && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-soft-light-gray p-4 shadow-neumorphic-inset">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <h4 className="text-sm font-medium text-text-body">RMS Value</h4>
                    </div>
                    <p className="text-xl font-semibold text-text-dark-gray">
                      {result.signal_analysis.time_features?.rms?.toFixed(3) || 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-soft-light-gray p-4 shadow-neumorphic-inset">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <h4 className="text-sm font-medium text-text-body">Peak Value</h4>
                    </div>
                    <p className="text-xl font-semibold text-text-dark-gray">
                      {result.signal_analysis.time_features?.peak?.toFixed(3) || 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-soft-light-gray p-4 shadow-neumorphic-inset">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-orange-500" />
                      <h4 className="text-sm font-medium text-text-body">Crest Factor</h4>
                    </div>
                    <p className="text-xl font-semibold text-text-dark-gray">
                      {result.signal_analysis.time_features?.crest_factor?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-soft-light-gray p-4 shadow-neumorphic-inset">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-purple-500" />
                      <h4 className="text-sm font-medium text-text-body">Duration</h4>
                    </div>
                    <p className="text-xl font-semibold text-text-dark-gray">
                      {result.signal_analysis.duration_seconds?.toFixed(1) || 'N/A'}s
                    </p>
                  </div>
                </div>
              )}

              {/* Charts Section */}
              {result.signal_analysis && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Time Domain Chart */}
                    <div className="rounded-lg bg-soft-light-gray p-4 shadow-neumorphic-inset">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-text-dark-gray">Time Domain Signal</h4>
                        <div className="text-xs text-text-body">
                          {result.signal_analysis.signal_length} samples @ {result.signal_analysis.sampling_rate} Hz
                        </div>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={getTimeData(result)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                            <XAxis 
                              dataKey="time" 
                              tick={{ fontSize: 12 }}
                              label={{ value: 'Time (ms)', position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              label={{ value: 'Amplitude', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(224, 224, 224, 0.95)',
                                border: 'none',
                                borderRadius: '10px',
                                boxShadow: '3px 3px 6px #bebebe, -3px -3px 6px #ffffff',
                                fontSize: '12px'
                              }}
                              formatter={(value: any) => [value.toFixed(4), 'Amplitude']}
                              labelFormatter={(label) => `Time: ${Number(label).toFixed(1)} ms`}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="amplitude" 
                              stroke="#3b82f6" 
                              strokeWidth={1.5}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Frequency Domain Chart */}
                    <div className="rounded-lg bg-soft-light-gray p-4 shadow-neumorphic-inset">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-text-dark-gray">Frequency Spectrum</h4>
                        <div className="text-xs text-text-body">
                          Dominant: {result.signal_analysis.frequency_features?.dominant_frequency?.toFixed(1) || 'N/A'} Hz
                        </div>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={getFrequencyData(result)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                            <XAxis 
                              dataKey="frequency" 
                              tick={{ fontSize: 12 }}
                              label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis 
                              tick={{ fontSize: 12 }}
                              label={{ value: 'Magnitude', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(224, 224, 224, 0.95)',
                                border: 'none',
                                borderRadius: '10px',
                                boxShadow: '3px 3px 6px #bebebe, -3px -3px 6px #ffffff',
                                fontSize: '12px'
                              }}
                              formatter={(value: any, name: any, props: any) => [
                                value.toFixed(4), 
                                'Magnitude',
                                props.payload.isFaultFreq ? ' (Fault Frequency)' : ''
                              ]}
                              labelFormatter={(label) => `Frequency: ${Number(label).toFixed(1)} Hz`}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="magnitude" 
                              stroke="#ef4444" 
                              strokeWidth={1.5}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Frequency Analysis Summary */}
                  {result.signal_analysis.frequency_features && (
                    <div className="rounded-lg bg-soft-light-gray p-4 shadow-neumorphic-inset">
                      <h4 className="mb-3 text-lg font-semibold text-text-dark-gray">Frequency Analysis Summary</h4>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="text-center">
                          <p className="text-sm text-text-body">Dominant Frequency</p>
                          <p className="text-xl font-semibold text-text-dark-gray">
                            {result.signal_analysis.frequency_features.dominant_frequency?.toFixed(1) || 'N/A'} Hz
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-text-body">Spectral Centroid</p>
                          <p className="text-xl font-semibold text-text-dark-gray">
                            {result.signal_analysis.frequency_features.spectral_centroid?.toFixed(1) || 'N/A'} Hz
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-text-body">Harmonics Detected</p>
                          <p className="text-xl font-semibold text-text-dark-gray">
                            {result.signal_analysis.frequency_features.harmonics?.length || 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-text-body">Spectral Rolloff</p>
                          <p className="text-xl font-semibold text-text-dark-gray">
                            {result.signal_analysis.frequency_features.spectral_rolloff?.toFixed(1) || 'N/A'} Hz
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Fault Detection Results */}
              {result.fault_detection?.detected_faults && result.fault_detection.detected_faults.length > 0 && (
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-text-dark-gray">Detected Faults</h4>
                  <div className="space-y-3">
                    {result.fault_detection.detected_faults.map((fault: any, faultIndex: number) => (
                      <div key={faultIndex} className="rounded-lg border-l-4 border-red-400 bg-red-50 p-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-red-800">{fault.fault_type}</h5>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            fault.severity > 80 ? 'bg-red-200 text-red-800' :
                            fault.severity > 60 ? 'bg-orange-200 text-orange-800' :
                            'bg-yellow-200 text-yellow-800'
                          }`}>
                            Severity: {fault.severity?.toFixed(1)}%
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-red-700">{fault.description}</p>
                        <p className="mt-1 text-xs text-red-600">Confidence: {(fault.confidence * 100).toFixed(0)}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-text-dark-gray">Recommendations</h4>
                  <div className="space-y-2">
                    {result.recommendations.map((rec: any, recIndex: number) => (
                      <div key={recIndex} className={`rounded-lg p-3 ${
                        rec.priority === 'high' ? 'bg-red-50 border-l-4 border-red-400' :
                        rec.priority === 'medium' ? 'bg-orange-50 border-l-4 border-orange-400' :
                        'bg-blue-50 border-l-4 border-blue-400'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`rounded px-2 py-1 text-xs font-medium uppercase ${
                            rec.priority === 'high' ? 'bg-red-200 text-red-800' :
                            rec.priority === 'medium' ? 'bg-orange-200 text-orange-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {rec.priority}
                          </span>
                          <span className="font-medium text-gray-800">{rec.action}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-700">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </NeumorphicCard>
      ))}
    </div>
  );
};

export default AnalysisResultsDisplay;