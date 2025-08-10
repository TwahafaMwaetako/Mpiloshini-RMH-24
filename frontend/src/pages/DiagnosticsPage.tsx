import { useParams } from 'react-router-dom'

function DiagnosticsPage() {
  const { id } = useParams()
  return (
    <div className="p-6 rounded-xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
      <h2 className="text-xl font-semibold mb-4">Diagnostics</h2>
      <p>Record ID: {id}</p>
    </div>
  )
}

export default DiagnosticsPage
