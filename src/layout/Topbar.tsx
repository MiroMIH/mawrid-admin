import { Bell, Search, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../features/auth/api';

interface TopbarProps {
  sidebarWidth: string;
}

export function Topbar({ sidebarWidth }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <header
      className="fixed top-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30 transition-[left] duration-200 ease-in-out"
      style={{ left: sidebarWidth }}
    >
      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-72">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search anything..."
          className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none flex-1"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#FFC107] rounded-full" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900 leading-none">
              {user?.firstName ?? 'Admin'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{user?.role ?? 'ADMIN'}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-red-500"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
