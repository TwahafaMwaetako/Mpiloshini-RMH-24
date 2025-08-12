const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export async function createRecord(payload: {
  sensor_id: string
  file_path: string
  timestamp: string
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Failed to create record: ${res.status}`)
  return res.json()
}

export async function diagnoseRecord(recordId: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/diagnose/${recordId}`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error(`Failed to diagnose: ${res.status}`)
  return res.json()
}
