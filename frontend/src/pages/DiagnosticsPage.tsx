import { useParams } from 'react-router-dom'
import NeumorphicCard from '../components/NeumorphicCard'

export default function DiagnosticsPage() {
  const { id } = useParams()
  return (
    <NeumorphicCard>
      <h2 className="text-xl font-semibold mb-4">Diagnostics</h2>
      <p>Record ID: {id}</p>
      <p>Results will be displayed here.</p>
    </NeumorphicCard>
  )
}
