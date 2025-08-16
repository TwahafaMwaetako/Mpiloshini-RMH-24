import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, Activity, FileText, ChevronsLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/machines', label: 'Machines', icon: Settings },
  { href: '/analysis', label: 'Analysis', icon: Activity },
  { href: '/reports', label: 'Reports', icon: FileText },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen flex-col bg-soft-light-gray p-4 shadow-neumorphic-extrude transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex flex-1 flex-col overflow-hidden">
        <div
          className={cn(
            'mb-8 flex items-center gap-3',
            isCollapsed ? 'justify-center' : 'px-2'
          )}
        >
          <img src="/icon.png" alt="Mpiloshini RMH 24 logo" className="h-11 w-11 flex-shrink-0 rounded-lg" />
          <div
            className={cn(
              'flex flex-col leading-tight transition-all duration-200',
              isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            )}
          >
            <span className="font-bold text-lg text-text-dark-gray">Mpiloshini</span>
            <span className="text-sm text-text-body">RMH 24</span>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-body transition-all',
                  isCollapsed && 'justify-center',
                  isActive
                    ? 'bg-soft-light-gray text-text-dark-gray shadow-neumorphic-inset'
                    : 'hover:bg-gray-200/50'
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className={cn('whitespace-nowrap', isCollapsed && 'hidden')}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto flex w-full justify-center border-t border-gray-300/50 pt-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-2 hover:bg-gray-200/50"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronsLeft
            className={cn(
              'h-6 w-6 text-text-body transition-transform duration-300',
              isCollapsed && 'rotate-180'
            )}
          />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;