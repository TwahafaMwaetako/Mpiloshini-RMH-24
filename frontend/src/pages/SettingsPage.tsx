import NeumorphicCard from '../components/NeumorphicCard'
import NeumorphicInput from '../components/NeumorphicInput'

export default function SettingsPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <NeumorphicCard>
        <h3 className="font-semibold mb-2">Health Index Thresholds</h3>
        <div className="space-y-3">
          <NeumorphicInput placeholder="Warning threshold" />
          <NeumorphicInput placeholder="Critical threshold" />
        </div>
      </NeumorphicCard>
      <NeumorphicCard>
        <h3 className="font-semibold mb-2">Notifications</h3>
        <div className="space-y-3">
          <NeumorphicInput placeholder="Email" />
          <NeumorphicInput placeholder="Phone" />
        </div>
      </NeumorphicCard>
    </div>
  )
}

