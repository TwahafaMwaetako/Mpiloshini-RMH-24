import { ComponentType } from 'react'

interface Props {
  title: string
  value: string | number
  description?: string
  icon: ComponentType<{ className?: string; size?: number }>
}

export default function ReportCard({ title, value, description, icon: Icon }: Props) {
  return (
    <div className="p-5 rounded-xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
      <div className="flex items-center justify-between mb-3">
        <div className="rounded-xl p-3 shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]">
          <Icon className="text-[#5a7d9a]" size={20} />
        </div>
      </div>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
      {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
    </div>
  )
}

