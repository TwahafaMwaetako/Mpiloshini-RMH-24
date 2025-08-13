import { NavLink } from 'react-router-dom'
import { Gauge, Upload, Settings, FileChartColumn, Wrench, FileText } from 'lucide-react'

const linkBase = 'block px-4 py-3 rounded-lg mb-3 transition-shadow hover:shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]'

export default function Sidebar() {
  const navItem = (to: string, label: string, Icon: any) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? 'shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]' : 'shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]'} flex items-center gap-3`
      }
    >
      <Icon size={18} className="text-[#5a7d9a]" />
      <span>{label}</span>
    </NavLink>
  )

  return (
    <aside className="w-64 p-4">
      <div className="p-4 rounded-xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
        <h2 className="text-lg font-semibold mb-4">Navigation</h2>
        {navItem('/', 'Dashboard', Gauge)}
        {navItem('/machines', 'Machines', Wrench)}
        {navItem('/upload', 'Upload', Upload)}
        {navItem('/analysis', 'Analysis', FileChartColumn)}
        {navItem('/reports', 'Reports', FileText)}
        {navItem('/settings', 'Settings', Settings)}
      </div>
    </aside>
  )
}

