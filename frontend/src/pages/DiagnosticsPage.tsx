import { useParams } from 'react-router-dom'

export default function DiagnosticsPage() {
  const { id } = useParams()
  return (
    <div className="p-6 rounded-xl neumorphic">
      <h2 className="text-xl font-semibold mb-4">Diagnostics</h2>
      <p className="text-sm text-gray-600 mb-2">Record ID: {id}</p>
      <div className="rounded-xl p-4 neumorphic-inset">
        <p className="text-sm text-gray-600">Results will be displayed here.</p>
      </div>
    </div>
  )
}
