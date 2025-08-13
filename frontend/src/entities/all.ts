import { supabase } from '../services/supabaseClient'

export type Machine = {
  id: string
  name: string
  type?: string
  location?: string
  status?: 'active' | 'inactive'
  created_at?: string
}

export type FaultDetection = {
  id: string
  record_id: string
  fault_type: string
  severity_score: number
  confidence: number
  created_at?: string
}

export type VibrationRecord = {
  id?: string
  file_path?: string
  file_name?: string
  timestamp?: string
  processed?: boolean
  sensor_id?: string
  sensor_position?: string
  axis?: string
  sampling_rate?: number | null
  duration?: number | null
  file_url?: string
  machine_id?: string
}

function fileNameFromPath(path: string): string {
  const parts = path.split('/')
  return parts[parts.length - 1] || path
}

export const MachineEntity = {
  async list(order: string = '-created_at'): Promise<Machine[]> {
    const ascending = !order.startsWith('-')
    const field = order.replace(/^[-+]/, '') || 'created_at'
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .order(field, { ascending })
    if (error) throw error
    return (data ?? []).map((m) => ({ ...m, status: 'active' }))
  },
}

export const FaultDetectionEntity = {
  async list(order: string = '-created_at', limit = 100): Promise<FaultDetection[]> {
    const ascending = !order.startsWith('-')
    const field = order.replace(/^[-+]/, '') || 'created_at'
    const { data, error } = await supabase
      .from('fault_detections')
      .select('*')
      .order(field, { ascending })
      .limit(limit)
    if (error) throw error
    return data ?? []
  },
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export const VibrationRecordEntity = {
  async list(order: string = '-created_at', limit = 50): Promise<VibrationRecord[]> {
    const ascending = !order.startsWith('-')
    const field = order.replace(/^[-+]/, '') || 'created_at'
    const { data, error } = await supabase
      .from('vibration_records')
      .select('*, sensors:sensor_id(position, axis, sampling_rate, machine_id)')
      .order(field, { ascending })
      .limit(limit)
    if (error) throw error
    return (data ?? []).map((r: any) => ({
      id: r.id,
      file_path: r.file_path,
      file_name: fileNameFromPath(r.file_path),
      timestamp: r.timestamp,
      processed: r.status === 'processed',
      sensor_id: r.sensor_id,
      sensor_position: r.sensors?.position,
      axis: r.sensors?.axis,
      sampling_rate: r.sensors?.sampling_rate,
      machine_id: r.sensors?.machine_id,
    }))
  },
  async create(payload: VibrationRecord): Promise<any> {
    const session = (await supabase.auth.getSession()).data.session
    const res = await fetch(`${API_BASE_URL}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({
        sensor_id: payload.machine_id || payload.sensor_id || 'REPLACE_WITH_SENSOR_ID',
        file_path: payload.file_path || payload.file_url || '',
        timestamp: payload.timestamp || new Date().toISOString(),
      }),
    })
    if (!res.ok) throw new Error(`Failed to create record: ${res.status}`)
    return res.json()
  },
}

export const Machine = MachineEntity
export const FaultDetection = FaultDetectionEntity
export const VibrationRecord = VibrationRecordEntity
