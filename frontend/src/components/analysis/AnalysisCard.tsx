import { AlertTriangle } from 'lucide-react'

export default function AnalysisCard({ record, detections, machines }: { record: any; detections: any[]; machines: any[] }) {
  const machineName = machines.find((m) => m.id === record.machine_id)?.name || 'Machine'
  return (
    <div className="p-4 rounded-xl shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-gray-800">{record.file_name}</h4>
          <p className="text-sm text-gray-600">{machineName} • {record.axis ?? 'N/A'}-axis • {record.sampling_rate ?? '—'} Hz</p>
        </div>
        <span className="text-xs font-medium text-green-600">Processed</span>
      </div>
      {detections.length > 0 ? (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          {detections.slice(0, 4).map((d) => (
            <div key={d.id} className="flex items-center gap-2 text-sm">
              <AlertTriangle className={`w-4 h-4 ${d.severity_score > 80 ? 'text-red-600' : 'text-orange-500'}`} />
              <span className="font-medium">{d.fault_type}</span>
              <span className="text-gray-600">{Math.round(d.severity_score)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600 mt-2">No faults detected.</p>
      )}
    </div>
  )
}

