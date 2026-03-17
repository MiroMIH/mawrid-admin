import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderTree,
  Tags,
  Users,
  GitBranch,
  FlaskConical,
  BarChart3,
  Zap,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/categories', label: 'Category Tree', icon: FolderTree },
  { to: '/attributes', label: 'Attributes', icon: Tags },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/matching', label: 'Matching', icon: GitBranch },
  { to: '/simulation', label: 'Simulation', icon: FlaskConical },
  { to: '/stats', label: 'Stats', icon: BarChart3 },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#111111] flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-[#FFC107] rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-[#111111]" />
        </div>
        <div>
          <span className="text-white font-bold text-lg tracking-tight">MAWRED</span>
          <p className="text-white/40 text-xs">Admin Backoffice</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-2 text-xs font-semibold text-white/30 uppercase tracking-wider">Navigation</p>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
              ${isActive
                ? 'bg-[#FFC107] text-[#111111]'
                : 'text-white/60 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-white/30 text-xs">v1.0.0 · MAWRED Platform</p>
      </div>
    </aside>
  );
}
