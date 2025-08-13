import NeumorphicCard from '../NeumorphicCard'

interface Props {
  title: string
  value: string | number
  icon: React.ComponentType<{ size?: number; className?: string }>
  trend?: 'up' | 'down'
  trendValue?: string
}

export default function StatsCard({ title, value, icon: Icon, trend, trendValue }: Props) {
  return (
    <NeumorphicCard>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
          {trend && trendValue && (
            <p className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{trendValue}</p>
          )}
        </div>
        <div className="rounded-full p-3 shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
          <Icon size={22} className="text-[#5a7d9a]" />
        </div>
      </div>
    </NeumorphicCard>
  )}

