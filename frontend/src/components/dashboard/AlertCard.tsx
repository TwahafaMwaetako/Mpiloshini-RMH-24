import NeumorphicCard from '../NeumorphicCard'
import { AlertTriangle } from 'lucide-react'

interface Alert {
  id: number | string
  machine: string
  message: string
  severity: 'critical' | 'warning' | 'info'
  timestamp: string
}

export default function AlertCard({ alert }: { alert: Alert }) {
  const color = alert.severity === 'critical' ? 'text-red-600' : alert.severity === 'warning' ? 'text-orange-500' : 'text-gray-600'
  return (
    <div className="p-4 rounded-xl shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
      <div className="flex items-center gap-3">
        <AlertTriangle className={`w-5 h-5 ${color}`} />
        <div className="flex-1">
          <p className="font-medium">{alert.machine}</p>
          <p className="text-sm text-gray-600">{alert.message}</p>
        </div>
        <span className="text-xs text-gray-500">{alert.timestamp}</span>
      </div>
    </div>
  )
}

