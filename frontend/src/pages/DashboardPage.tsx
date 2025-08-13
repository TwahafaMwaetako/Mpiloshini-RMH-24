import { useEffect, useState } from 'react'
import { Activity, Settings as Cog, Zap, AlertTriangle, TrendingUp } from 'lucide-react'
import StatsCard from '../components/dashboard/StatsCard'
import AlertCard from '../components/dashboard/AlertCard'
import MachineStatusCard from '../components/dashboard/MachineStatusCard'
import { MachineEntity, FaultDetectionEntity, VibrationRecordEntity } from '../entities/all'

export default function DashboardPage() {
  const [machines, setMachines] = useState<any[]>([])
  const [detections, setDetections] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [machinesData, detectionsData, recordsData] = await Promise.all([
        MachineEntity.list('-created_at'),
        FaultDetectionEntity.list('-created_at', 10),
        VibrationRecordEntity.list('-created_at', 10),
      ])
      setMachines(machinesData)
      setDetections(detectionsData)
      setRecords(recordsData)
    } catch (e) {
      console.error('Error loading dashboard data:', e)
    } finally {
      setLoading(false)
    }
  }

  const activeMachines = machines.length
  const criticalAlerts = detections.filter((d) => (d.severity_score ?? 0) > 80).length
  const totalRecords = records.length
  const avgHealthScore = 94

  const mockAlerts = [
    { id: 1, machine: 'Pump Unit 3', message: 'Bearing outer race defect detected', severity: 'critical', timestamp: '2 minutes ago' },
    { id: 2, machine: 'Motor Assembly 1', message: 'Slight imbalance detected', severity: 'warning', timestamp: '15 minutes ago' },
    { id: 3, machine: 'Compressor A', message: 'Scheduled maintenance due', severity: 'info', timestamp: '1 hour ago' },
  ]

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="rounded-2xl p-8 shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="rounded-full p-4 shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
                <Zap className="w-8 h-8 text-[#5a7d9a]" />
              </div>
              <p className="text-gray-600 font-medium">Loading system data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Vibration Analysis Dashboard</h1>
        <p className="text-gray-600">Monitor rotating machinery health and detect potential faults</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Active Machines" value={activeMachines} icon={Cog} trend="up" trendValue="+2" />
        <StatsCard title="Critical Alerts" value={criticalAlerts} icon={AlertTriangle} trend="down" trendValue="-1" />
        <StatsCard title="Processed Records" value={totalRecords} icon={Activity} trend="up" trendValue="+12" />
        <StatsCard title="Avg Health Score" value={`${avgHealthScore}%`} icon={TrendingUp} trend="up" trendValue="+3%" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="p-6 rounded-2xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Machine Status</h2>
            {machines.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {machines.slice(0, 6).map((machine) => (
                  <MachineStatusCard key={machine.id} machine={machine} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl p-8 text-center shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
                <Cog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No machines configured</p>
                <p className="text-sm text-gray-500 mt-2">Add your first machine to start monitoring</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Alerts</h2>
          <div className="space-y-3">
            {mockAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert as any} />
            ))}
          </div>

          <div className="rounded-xl p-4 mt-6 shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">System Health</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm font-medium text-gray-800">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Vibration Analysis</h2>
        {records.length > 0 ? (
          <div className="space-y-3">
            {records.slice(0, 5).map((record) => (
              <div key={record.id} className="rounded-xl p-4 shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-800">{record.file_name}</h4>
                    <p className="text-sm text-gray-600">
                      {record.sensor_position ?? 'N/A'} • {record.axis ?? 'N/A'}-axis • {record.sampling_rate ?? '—'} Hz
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${record.processed ? 'text-green-600' : 'text-orange-500'}`}>
                      {record.processed ? 'Processed' : 'Processing...'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl p-8 text-center shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No vibration data recorded</p>
            <p className="text-sm text-gray-500 mt-2">Upload your first vibration file to begin analysis</p>
          </div>
        )}
      </div>
    </div>
  )
}
