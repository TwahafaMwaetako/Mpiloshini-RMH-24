import NeumorphicInput from '@/components/NeumorphicInput'
import NeumorphicButton from '@/components/NeumorphicButton'

interface Props {
  machines: any[]
  metadata: {
    machine_id: string
    sensor_position: string
    axis: string
    sampling_rate: string
    duration: string
  }
  onChange: (m: Props['metadata']) => void
  onSubmit: () => void
  isUploading: boolean
  hasFiles: boolean
  disabled?: boolean
}

export default function MetadataForm({ machines, metadata, onChange, onSubmit, isUploading, hasFiles, disabled }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm">Machine</label>
        <select
          value={metadata.machine_id}
          onChange={(e) => onChange({ ...metadata, machine_id: e.target.value })}
          className="w-full p-4 rounded-lg shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff] bg-transparent"
        >
          <option value="">Select a machine…</option>
          {machines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Sensor position</label>
          <NeumorphicInput
            placeholder="e.g. DE"
            value={metadata.sensor_position}
            onChange={(e) => onChange({ ...metadata, sensor_position: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm">Axis</label>
          <NeumorphicInput
            placeholder="X / Y / Z"
            value={metadata.axis}
            onChange={(e) => onChange({ ...metadata, axis: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm">Sampling rate (Hz)</label>
          <NeumorphicInput
            placeholder="20000"
            value={metadata.sampling_rate}
            onChange={(e) => onChange({ ...metadata, sampling_rate: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm">Duration (s)</label>
          <NeumorphicInput
            placeholder="60"
            value={metadata.duration}
            onChange={(e) => onChange({ ...metadata, duration: e.target.value })}
          />
        </div>
      </div>

      <NeumorphicButton onClick={onSubmit} className="w-full" disabled={isUploading || !hasFiles || disabled}>
        {isUploading ? 'Uploading…' : 'Start Upload'}
      </NeumorphicButton>
    </div>
  )
}

