// This is a placeholder for your data entities.
// In a real application, these would be generated from your database schema
// or defined in a shared library.

export interface Machine {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
  health_score: number;
  last_updated: string;
  type: string;
}

export interface FaultDetection {
  id: string;
  record_id: string;
  fault_type: string;
  severity_score: number;
  confidence: number;
  details: Record<string, any>;
  created_date: string;
}

export interface VibrationRecord {
  id: string;
  sensor_id: string;
  file_name: string;
  processed: boolean;
  created_date: string;
  sensor_position?: string;
  axis?: string;
  sampling_rate?: number;
  rms_value?: number;
}

export interface Alert {
  id: string | number;
  machine: string;
  message: string;
  severity: "critical" | "warning" | "info";
  timestamp: string;
}