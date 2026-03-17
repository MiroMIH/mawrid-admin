import { useState } from 'react';
import { useUsers, useToggleUser } from '../hooks/useUsers';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { useToast } from '../components/ui/Toast';
import type { User } from '../types';
import { Search, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';

function roleBadge(role: string) {
  const map: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
    BUYER: 'info',
    SUPPLIER: 'success',
    ADMIN: 'warning',
    SUPERADMIN: 'warning',
  };
  return <Badge variant={map[role] ?? 'default'}>{role}</Badge>;
}

export function UsersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch } = useUsers({ page, size: 20 });
  const toggleUser = useToggleUser();
  const { showToast } = useToast();

  const handleToggle = async (user: User) => {
    try {
      await toggleUser.mutateAsync(user.id);
      showToast(`${user.firstName} ${user.lastName} ${user.enabled ? 'disabled' : 'enabled'}`);
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed', 'error');
    }
  };

  const filtered = data?.content.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.companyName?.toLowerCase().includes(q)
    );
  }) ?? [];

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (u: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FFC107]/20 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 flex-shrink-0">
            {u.firstName?.[0]}{u.lastName?.[0]}
          </div>
          <div>
            <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
            <p className="text-xs text-gray-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      render: (u: User) => (
        <span className="text-gray-600">{u.companyName ?? '—'}</span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u: User) => roleBadge(u.role),
    },
    {
      key: 'wilaya',
      header: 'Wilaya',
      render: (u: User) => <span className="text-gray-600">{u.wilaya ?? '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (u: User) => (
        <Badge variant={u.enabled ? 'success' : 'danger'}>
          {u.enabled ? 'Active' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u: User) => (
        <button
          onClick={() => handleToggle(u)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
            ${u.enabled
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          disabled={toggleUser.isPending}
        >
          {u.enabled
            ? <><ToggleLeft className="w-3.5 h-3.5" /> Disable</>
            : <><ToggleRight className="w-3.5 h-3.5" /> Enable</>
          }
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data?.totalElements ?? 0} total users on the platform
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} icon={<RefreshCw className="w-4 h-4" />}>
          Refresh
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: data?.totalElements ?? '—', color: 'text-gray-900' },
          {
            label: 'Buyers',
            value: data?.content.filter((u) => u.role === 'BUYER').length ?? '—',
            color: 'text-blue-600',
          },
          {
            label: 'Suppliers',
            value: data?.content.filter((u) => u.role === 'SUPPLIER').length ?? '—',
            color: 'text-green-600',
          },
          {
            label: 'Active',
            value: data?.content.filter((u) => u.enabled).length ?? '—',
            color: 'text-emerald-600',
          },
        ].map(({ label, value, color }) => (
          <Card key={label} className="text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </Card>
        ))}
      </div>

      <Card padding={false}>
        {/* Search bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, company…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none flex-1"
            />
          </div>
          <p className="text-sm text-gray-500">{filtered.length} results</p>
        </div>

        <Table
          columns={columns}
          data={filtered}
          loading={isLoading}
          keyExtractor={(u) => u.id}
          emptyMessage="No users found"
        />

        <Pagination
          page={page}
          totalPages={data?.totalPages ?? 1}
          totalElements={data?.totalElements}
          onPageChange={setPage}
          size={20}
        />
      </Card>
    </div>
  );
}
