import React from 'react'
import { VibrationRecord, FaultDetection, Machine } from '@/entities/all'
import { Activity, AlertTriangle, TrendingUp, Filter } from 'lucide-react'
import AnalysisCard from '@/components/analysis/AnalysisCard'
import FaultChart from '@/components/analysis/FaultChart'

export default function Analysis() {
  const [records, setRecords] = React.useState<any[]>([])
  const [detections, setDetections] = React.useState<any[]>([])
  const [machines, setMachines] = React.useState<any[]>([])
  const [selectedMachine, setSelectedMachine] = React.useState('all')
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [recordsData, detectionsData, machinesData] = await Promise.all([
        VibrationRecord.list('-created_at'),
        FaultDetection.list('-created_at'),
        Machine.list('-created_at'),
      ])
      setRecords(recordsData)
      setDetections(detectionsData)
      setMachines(machinesData)
    } catch (error) {
      console.error('Error loading analysis data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = selectedMachine === 'all' ? records : records.filter((r) => r.machine_id === selectedMachine)
  const processedRecords = filteredRecords.filter((r) => r.processed)
  const totalRecords = filteredRecords.length
  const faultCount = detections.filter((d) => (d.severity_score ?? 0) > 50).length
  const avgHealthScore = 87

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="rounded-2xl p-8 shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="rounded-full p-4 shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
                <Activity className="w-8 h-8 text-[#5a7d9a]" />
              </div>
              <p className="text-gray-600 font-medium">Loading analysis data...</p>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Vibration Analysis</h1>
          <p className="text-gray-600">Review fault detection results and machine health trends</p>
        </div>

        <div className="rounded-xl p-2 shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
          <div className="flex items-center gap-2 p-2 rounded-lg shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
            <Filter className="w-4 h-4" />
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="bg-transparent outline-none"
            >
              <option value="all">All Machines</option>
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-xl p-3 shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
              <Activity className="w-6 h-6 text-[#5a7d9a]" />
            </div>
            <span className="text-sm text-green-600 font-medium">+{processedRecords.length}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Processed Records</h3>
          <p className="text-2xl font-bold text-gray-800">
            {processedRecords.length}/{totalRecords}
          </p>
        </div>

        <div className="p-6 rounded-2xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-xl p-3 shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <span className="text-sm text-red-600 font-medium">{faultCount}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Active Faults</h3>
          <p className="text-2xl font-bold text-gray-800">{faultCount}</p>
        </div>

        <div className="p-6 rounded-2xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
          <div className="flex items-center justify-between mb-4">
            <div className="rounded-xl p-3 shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+2%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Avg Health Score</h3>
          <p className="text-2xl font-bold text-gray-800">{avgHealthScore}%</p>
        </div>
      </div>

      {processedRecords.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Analysis</h2>
            <div className="space-y-4">
              {processedRecords.slice(0, 10).map((record) => (
                <AnalysisCard key={record.id} record={record} machines={machines} detections={detections.filter((d) => d.record_id === record.id)} />
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Fault Distribution</h2>
            <FaultChart detections={detections} />
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
          <div className="rounded-full p-8 w-24 h-24 mx-auto mb-6 shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
            <Activity className="w-8 h-8 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Analysis Results</h3>
          <p className="text-gray-600 mb-6">Upload vibration data to see analysis results</p>
        </div>
      )}
    </div>
  )
}
