import NeumorphicCard from '../components/NeumorphicCard'

export default function DashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <NeumorphicCard>
        <h3 className="font-semibold mb-2">Summary</h3>
        <p>Health indices, alerts, and recent uploads will appear here.</p>
      </NeumorphicCard>
      <NeumorphicCard>
        <h3 className="font-semibold mb-2">Recent Diagnostics</h3>
        <p>Latest records and statuses.</p>
      </NeumorphicCard>
    </div>
  )
}
