import { Settings, MapPin, Calendar, Pencil, Trash2 } from 'lucide-react'

export default function MachineCard({ machine, onEdit, onDelete }: { machine: any; onEdit: (m: any) => void; onDelete: (id: string) => void }) {
  return (
    <div className="p-5 rounded-xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full p-3 shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
            <Settings className="w-5 h-5 text-[#5a7d9a]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{machine.name}</h3>
            <p className="text-sm text-gray-600">{machine.type || 'Machine'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(machine)} className="rounded-lg p-2 shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(machine.id)} className="rounded-lg p-2 shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {machine.location || '—'}</span>
        {machine.commissioning_date && (
          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(machine.commissioning_date).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  )
}

