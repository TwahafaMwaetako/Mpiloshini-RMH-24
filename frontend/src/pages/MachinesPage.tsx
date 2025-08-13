import React from 'react'
import { Machine } from '@/entities/Machine'
import { Plus, Settings } from 'lucide-react'
import MachineCard from '@/components/machines/MachineCard'
import MachineForm from '@/components/machines/MachineForm'

export default function MachinesPage() {
  const [machines, setMachines] = React.useState<any[]>([])
  const [showForm, setShowForm] = React.useState(false)
  const [editingMachine, setEditingMachine] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    loadMachines()
  }, [])

  const loadMachines = async () => {
    try {
      const data = await Machine.list('-created_at')
      setMachines(data)
    } catch (error) {
      console.error('Error loading machines:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (machineData: any) => {
    try {
      if (editingMachine) {
        await Machine.update(editingMachine.id, machineData)
      } else {
        await Machine.create(machineData)
      }
      setShowForm(false)
      setEditingMachine(null)
      loadMachines()
    } catch (error) {
      console.error('Error saving machine:', error)
    }
  }

  const handleEdit = (m: any) => {
    setEditingMachine(m)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this machine?')) {
      try {
        await Machine.delete(id)
        loadMachines()
      } catch (error) {
        console.error('Error deleting machine:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="rounded-2xl p-8 shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="rounded-full p-4 shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
                <Settings className="w-8 h-8 text-[#5a7d9a]" />
              </div>
              <p className="text-gray-600 font-medium">Loading machines...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Machine Management</h1>
          <p className="text-gray-600">Configure and monitor your rotating machinery</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl font-medium px-6 py-3 text-white bg-[#5a7d9a] shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]"
        >
          <span className="inline-flex items-center gap-2"><Plus className="w-5 h-5" /> Add Machine</span>
        </button>
      </div>

      {showForm && (
        <div className="p-6 rounded-2xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
          <h2 className="text-xl font-bold text-gray-800 mb-6">{editingMachine ? 'Edit Machine' : 'Add New Machine'}</h2>
          <MachineForm
            machine={editingMachine}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingMachine(null) }}
          />
        </div>
      )}

      {machines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines.map((m) => (
            <MachineCard key={m.id} machine={m} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
          <div className="rounded-full p-8 w-24 h-24 mx-auto mb-6 shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
            <Settings className="w-8 h-8 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Machines Configured</h3>
          <p className="text-gray-600 mb-6">Add your first machine to start vibration monitoring</p>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl font-medium px-6 py-3 text-white bg-[#5a7d9a] shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]"
          >
            <span className="inline-flex items-center gap-2"><Plus className="w-5 h-5" /> Add Your First Machine</span>
          </button>
        </div>
      )}
    </div>
  )
}
