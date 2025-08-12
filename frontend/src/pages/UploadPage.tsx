import { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import NeumorphicCard from '../components/NeumorphicCard'
import NeumorphicButton from '../components/NeumorphicButton'
import { createRecord, diagnoseRecord } from '../lib/api'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')

  const onUpload = async () => {
    if (!file) return
    setStatus('Uploading…')

    const bucket = 'vibration-files'
    const path = `uploads/${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    })
    if (upErr) {
      setStatus(`Upload error: ${upErr.message}`)
      return
    }

    setStatus('Creating record…')
    const payload = {
      sensor_id: 'REPLACE_WITH_SENSOR_ID',
      file_path: path,
      timestamp: new Date().toISOString(),
    }
    const record = await createRecord(payload)

    setStatus('Diagnosing…')
    const result = await diagnoseRecord(record.id)
    setStatus(`Done. Health score: ${result.health_score}`)
  }

  return (
    <NeumorphicCard>
      <h2 className="text-xl font-semibold mb-4">Upload Vibration Data</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="w-full mb-3 p-4 rounded-lg shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]"
      />
      <NeumorphicButton onClick={onUpload}>Upload & Diagnose</NeumorphicButton>
      {status && <p className="mt-3 text-sm">{status}</p>}
    </NeumorphicCard>
  )
}
