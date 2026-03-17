import { useDashboardStats } from '../hooks/useStats';
import { useCategoryTree } from '../hooks/useCategories';
import { useUsers } from '../hooks/useUsers';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { RefreshCw, BarChart3 } from 'lucide-react';

const COLORS = ['#FFC107', '#111111', '#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export function StatsPage() {
  const { data: stats, isLoading, refetch } = useDashboardStats();
  const { data: tree } = useCategoryTree();
  const { data: users } = useUsers({ page: 0, size: 100 });

  const countByDepth = (cats: typeof tree, counts: Record<number, number> = {}): Record<number, number> => {
    for (const cat of cats ?? []) {
      counts[cat.depth] = (counts[cat.depth] ?? 0) + 1;
      if (cat.children) countByDepth(cat.children, counts);
    }
    return counts;
  };
  const depthCounts = countByDepth(tree);
  const depthData = Object.entries(depthCounts).map(([depth, count]) => ({
    name: `Depth ${depth}`,
    count,
  }));

  const roleData = ['BUYER', 'SUPPLIER', 'ADMIN'].map((role) => ({
    name: role,
    value: users?.content.filter((u) => u.role === role).length ?? 0,
  })).filter((d) => d.value > 0);

  const statItems: { label: string; key: string; color: string }[] = [
    { label: 'Total Users', key: 'totalUsers', color: 'bg-blue-50 text-blue-700' },
    { label: 'Total Buyers', key: 'totalBuyers', color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Total Suppliers', key: 'totalSuppliers', color: 'bg-green-50 text-green-700' },
    { label: 'Total Demandes', key: 'totalDemandes', color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Open Demandes', key: 'openDemandes', color: 'bg-orange-50 text-orange-700' },
    { label: 'Total Categories', key: 'totalCategories', color: 'bg-purple-50 text-purple-700' },
    { label: 'Active Categories', key: 'activeCategories', color: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Statistics</h1>
          <p className="text-sm text-gray-500 mt-1">Live metrics from the MAWRED platform</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} icon={<RefreshCw className="w-4 h-4" />}>
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {statItems.map(({ label, key, color }) => (
          <Card key={key}>
            <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
            {isLoading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
            ) : (
              <p className={`text-2xl font-bold px-2 py-1 rounded-lg inline-block ${color}`}>
                {stats?.[key] ?? '—'}
              </p>
            )}
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User role distribution */}
        <Card>
          <CardHeader
            title="User Role Distribution"
            description="Breakdown by role"
          />
          {roleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {roleData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-16 text-center text-gray-400">
              <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p>No user data available</p>
            </div>
          )}
        </Card>

        {/* Category depth distribution */}
        <Card>
          <CardHeader
            title="Categories by Depth"
            description="Distribution across hierarchy levels"
          />
          {depthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={depthData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip />
                <Bar dataKey="count" fill="#FFC107" radius={[0, 4, 4, 0]} name="Categories" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-16 text-center text-gray-400">
              <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p>No category data available</p>
            </div>
          )}
        </Card>
      </div>

      {/* Raw stats JSON */}
      {stats && (
        <Card>
          <CardHeader title="Raw API Response" description="Full dashboard stats payload" />
          <pre className="bg-gray-50 rounded-lg p-4 text-xs text-gray-700 overflow-auto max-h-64">
            {JSON.stringify(stats, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
