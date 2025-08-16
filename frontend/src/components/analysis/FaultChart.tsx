interface Props { detections: Array<{ fault_type: string; severity_score: number }> }

export default function FaultChart({ detections }: Props) {
  const counts = detections.reduce<Record<string, number>>((acc, d) => {
    acc[d.fault_type] = (acc[d.fault_type] || 0) + 1
    return acc
  }, {})
  const entries = Object.entries(counts)
  const max = Math.max(1, ...entries.map(([, v]) => v))

  return (
    <div className="space-y-3">
      {entries.length === 0 && <p className="text-sm text-gray-600">No detections yet.</p>}
      {entries.map(([type, count]) => (
        <div key={type}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">{type}</span>
            <span className="text-gray-600">{count}</span>
          </div>
          <div className="w-full h-3 rounded-full bg-[#e6e6e6] neumorphic-inset">
            <div className="h-3 rounded-full bg-[#5a7d9a]" style={{ width: `${(count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

