import { Settings } from 'lucide-react'

export default function MachineStatusCard({ machine }: { machine: any }) {
  return (
    <div className="p-4 rounded-xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
      <div className="flex items-center gap-3">
        <div className="rounded-full p-3 shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
          <Settings className="w-5 h-5 text-[#5a7d9a]" />
        </div>
        <div className="flex-1">
          <p className="font-medium">{machine.name}</p>
          <p className="text-sm text-gray-600">{machine.type || 'Machine'} • {machine.location || 'Unknown'}</p>
        </div>
        <span className="text-xs text-green-600 font-medium">Active</span>
      </div>
    </div>
  )
}

