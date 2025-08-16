import React from 'react'
import { VibrationRecord, Machine } from '@/entities/all'
import { FileText, Download, Calendar, Filter } from 'lucide-react'
import ReportCard from '@/components/reports/ReportCard'
import ReportGenerator from '@/components/reports/ReportGenerator'

export default function Reports() {
  const [records, setRecords] = React.useState<any[]>([])
  const [machines, setMachines] = React.useState<any[]>([])
  const [selectedMachine, setSelectedMachine] = React.useState('all')
  const [selectedPeriod, setSelectedPeriod] = React.useState('30')
  const [showGenerator, setShowGenerator] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [recordsData, machinesData] = await Promise.all([
        VibrationRecord.list('-created_at'),
        Machine.list('-created_at'),
      ])
      setRecords(recordsData)
      setMachines(machinesData)
    } catch (error) {
      console.error('Error loading reports data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = records.filter((record) => {
    const machineMatch = selectedMachine === 'all' || record.machine_id === selectedMachine
    const daysAgo = parseInt(selectedPeriod)
    const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    const createdAt = (record as any).created_at ? new Date((record as any).created_at) : new Date(record.timestamp || 0)
    const periodMatch = createdAt >= cutoffDate
    return machineMatch && periodMatch && record.processed
  })

  const generateSummaryReport = () => {
    const data = {
      period: `Last ${selectedPeriod} days`,
      machine: selectedMachine === 'all' ? 'All Machines' : machines.find((m) => m.id === selectedMachine)?.name,
      totalRecords: filteredRecords.length,
      processedRecords: filteredRecords.filter((r) => r.processed).length,
      avgRMS:
        filteredRecords.reduce((sum, r) => sum + ((r as any).rms_value || 0), 0) / filteredRecords.length || 0,
      records: filteredRecords,
    }

    const reportContent = `
Vibration Analysis Summary Report
Generated: ${new Date().toLocaleDateString()}
Period: ${data.period}
Machine: ${data.machine}

SUMMARY:
- Total Records: ${data.totalRecords}
- Processed Records: ${data.processedRecords}
- Average RMS: ${data.avgRMS.toFixed(4)}

DETAILED RECORDS:
${data.records
  .map(
    (record) => `
- File: ${record.file_name}
  Machine: ${machines.find((m) => m.id === record.machine_id)?.name || 'Unknown'}
  Position: ${record.sensor_position || 'N/A'}
  RMS: ${(record as any).rms_value?.toFixed ? (record as any).rms_value.toFixed(4) : 'N/A'}
  Date: ${new Date((record as any).created_at || record.timestamp || 0).toLocaleDateString()}
`
  )
  .join('')}
    `

    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `vibration-report-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="rounded-2xl p-8 shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="rounded-full p-4 shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
                <FileText className="w-8 h-8 text-[#5a7d9a]" />
              </div>
              <p className="text-gray-600 font-medium">Loading reports...</p>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Analysis Reports</h1>
          <p className="text-gray-600">Generate and download vibration analysis reports</p>
        </div>
        <button
          onClick={() => setShowGenerator(true)}
          className="rounded-xl font-medium px-6 py-3 text-white bg-[#5a7d9a] shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]"
        >
          <span className="inline-flex items-center gap-2"><FileText className="w-5 h-5" /> Generate Report</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Report Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Machine</label>
            <div className="rounded-lg p-2 shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
              <select value={selectedMachine} onChange={(e) => setSelectedMachine(e.target.value)} className="bg-transparent outline-none w-full">
                <option value="all">All Machines</option>
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Time Period</label>
            <div className="rounded-lg p-2 shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
              <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="bg-transparent outline-none w-full">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={generateSummaryReport}
              disabled={filteredRecords.length === 0}
              className="w-full rounded-lg px-4 py-2 shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff] disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-2"><Download className="w-4 h-4" /> Download Summary</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Report Preview</h2>
        {filteredRecords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ReportCard title="Total Records" value={filteredRecords.length} icon={FileText} description={`${filteredRecords.filter((r) => r.processed).length} processed`} />
            <ReportCard title="Average RMS" value={(filteredRecords.reduce((s, r) => s + ((r as any).rms_value || 0), 0) / filteredRecords.length || 0).toFixed(4)} icon={Calendar} description="Overall vibration level" />
            <ReportCard title="Machines Monitored" value={new Set(filteredRecords.map((r) => r.machine_id)).size} icon={Filter} description="Unique machines" />
          </div>
        ) : (
          <div className="rounded-xl p-8 text-center shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No data available</p>
            <p className="text-sm text-gray-500 mt-2">Adjust filters or upload more vibration data</p>
          </div>
        )}
      </div>

      {showGenerator && <ReportGenerator records={filteredRecords} machines={machines} onClose={() => setShowGenerator(false)} />}
    </div>
  )
}

