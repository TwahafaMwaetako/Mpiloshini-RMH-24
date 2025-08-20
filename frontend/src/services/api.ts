// API Service Layer for backend communication
import { Machine, VibrationRecord } from '@/entities/all';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// Machine API endpoints
export const machineAPI = {
  getAll: () => apiCall<Machine[]>('/records/machines'),
  
  getById: (id: string) => apiCall<Machine>(`/records/machines/${id}`),
  
  create: (machine: Partial<Machine>) => 
    apiCall<Machine>('/records/machines', {
      method: 'POST',
      body: JSON.stringify(machine),
    }),
  
  update: (id: string, machine: Partial<Machine>) =>
    apiCall<Machine>(`/records/machines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(machine),
    }),
  
  delete: (id: string) =>
    apiCall<void>(`/records/machines/${id}`, {
      method: 'DELETE',
    }),
};

// Vibration Records API endpoints
export const vibrationAPI = {
  getAll: () => apiCall<VibrationRecord[]>('/records/vibrations'),
  
  getByMachineId: (machineId: string) => 
    apiCall<VibrationRecord[]>(`/records/vibrations/machine/${machineId}`),
  
  create: (record: Partial<VibrationRecord>) =>
    apiCall<VibrationRecord>('/records/vibrations', {
      method: 'POST',
      body: JSON.stringify(record),
    }),
  
  delete: (id: string) =>
    apiCall<void>(`/records/vibrations/${id}`, {
      method: 'DELETE',
    }),
};

// File Upload API
export const uploadAPI = {
  uploadFile: async (file: File, metadata?: any) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata) {
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });
    }

    const response = await fetch(`${API_URL}/upload/file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Upload Error: ${response.status}`);
    }

    return response.json();
  },
  
  createVibrationRecord: async (recordData: any) => {
    return apiCall<any>('/upload/vibration-record', {
      method: 'POST',
      body: JSON.stringify(recordData),
    });
  },
};

// Diagnosis API
export const diagnosisAPI = {
  analyze: (vibrationId: string) =>
    apiCall<any>(`/diagnose/analyze/${vibrationId}`, {
      method: 'POST',
    }),
  
  getHistory: (machineId: string) =>
    apiCall<any[]>(`/diagnose/history/${machineId}`),
};

// Health check
export const healthCheck = () => apiCall<{ status: string }>('/health');
