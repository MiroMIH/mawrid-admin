import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Tags,
  Users,
  FileText,
  GitBranch,
  FlaskConical,
  BarChart3,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { to: '/',          label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/categories',label: 'Category Tree',icon: FolderTree },
  { to: '/attributes',label: 'Attributes',   icon: Tags },
  { to: '/users',     label: 'Users',        icon: Users },
  { to: '/demandes',  label: 'Demandes',     icon: FileText },
  { to: '/matching',  label: 'Matching',     icon: GitBranch },
  { to: '/simulation',label: 'Simulation',   icon: FlaskConical },
  { to: '/stats',     label: 'Stats',        icon: BarChart3 },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className="fixed left-0 top-0 h-full bg-[#111111] flex flex-col z-40 overflow-hidden transition-[width] duration-200 ease-in-out"
      style={{ width: collapsed ? '4rem' : '16rem' }}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-white/10 h-16 transition-all duration-200 ${collapsed ? 'justify-center px-0' : 'gap-3 px-6'}`}>
        <div className="w-8 h-8 bg-[#FFC107] rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap className="w-5 h-5 text-[#111111]" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <span className="text-white font-bold text-lg tracking-tight">MAWRED</span>
            <p className="text-white/40 text-xs">Admin Backoffice</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="px-3 py-2 text-xs font-semibold text-white/30 uppercase tracking-wider whitespace-nowrap">
            Navigation
          </p>
        )}
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center py-2.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap
              ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'}
              ${isActive
                ? 'bg-[#FFC107] text-[#111111]'
                : 'text-white/60 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* Toggle + Footer */}
      <div className="border-t border-white/10">
        <button
          onClick={onToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-full flex items-center justify-center gap-2 py-3 text-white/40 hover:text-white hover:bg-white/5 transition-colors text-xs"
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <><ChevronLeft className="w-4 h-4" /><span>Réduire</span></>
          }
        </button>
        {!collapsed && (
          <div className="px-6 pb-4">
            <p className="text-white/30 text-xs">v1.0.0 · MAWRED Platform</p>
          </div>
        )}
      </div>
    </aside>
  );
}
