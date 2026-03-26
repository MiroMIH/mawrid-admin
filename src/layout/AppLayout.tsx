import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const { isAuthenticated } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const sidebarW = collapsed ? '4rem' : '16rem';

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <Topbar sidebarWidth={sidebarW} />
      <main
        className="pt-16 min-h-screen transition-[margin-left] duration-200 ease-in-out"
        style={{ marginLeft: sidebarW }}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
