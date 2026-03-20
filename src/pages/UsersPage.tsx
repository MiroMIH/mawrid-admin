import { useState } from 'react';
import { useUsers, useToggleUser } from '../hooks/useUsers';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Search, RefreshCw, Users, ShoppingBag, Truck,
  CheckCircle2, ChevronLeft, ChevronRight, UserX, UserCheck, Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User } from '../types';

/* ── variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.35, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

const rowVariant = {
  hidden: { opacity: 0, x: -8 },
  show: (i: number) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.25, delay: i * 0.04, ease: 'easeOut' },
  }),
};

/* ── role config ── */
const roleConfig: Record<string, { label: string; className: string }> = {
  BUYER:      { label: 'Buyer',      className: 'bg-blue-100 text-blue-700 border-blue-200' },
  SUPPLIER:   { label: 'Supplier',   className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ADMIN:      { label: 'Admin',      className: 'bg-violet-100 text-violet-700 border-violet-200' },
  SUPERADMIN: { label: 'Super Admin',className: 'bg-orange-100 text-orange-700 border-orange-200' },
};

export function UsersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch, isFetching } = useUsers({ page, size: 20 });
  const toggleUser = useToggleUser();
  const { showToast } = useToast();

  const handleExport = async () => {
    try {
      const res = await apiClient.get('/admin/users/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast('Export failed', 'error');
    }
  };

  const handleToggle = async (user: User) => {
    try {
      await toggleUser.mutateAsync(user.id);
      showToast(`${user.firstName} ${user.lastName} ${user.enabled ? 'disabled' : 'enabled'}`);
    } catch (e: unknown) {
      showToast(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed',
        'error',
      );
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

  const summaryStats = [
    {
      label: 'Total Users',
      value: data?.totalElements ?? '—',
      icon: Users,
      color: 'text-foreground',
      bg: 'bg-muted',
    },
    {
      label: 'Buyers',
      value: data?.content.filter((u) => u.role === 'BUYER').length ?? '—',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Suppliers',
      value: data?.content.filter((u) => u.role === 'SUPPLIER').length ?? '—',
      icon: Truck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Active',
      value: data?.content.filter((u) => u.enabled).length ?? '—',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show">

      {/* Header */}
      <motion.div variants={fadeUp} custom={0} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data?.totalElements ?? 0} total accounts on the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
      >
        {summaryStats.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div key={label} variants={fadeUp} custom={i}
            whileHover={{ y: -2, transition: { duration: 0.18 } }}
          >
            <Card className="border-border/60">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                    <p className={`text-2xl font-bold mt-0.5 tabular-nums ${color}`}>{value}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${bg}`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Table card */}
      <motion.div variants={fadeUp} custom={4}>
        <Card className="border-border/60">
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold">All Users</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                  {search ? ` for "${search}"` : ''}
                </CardDescription>
              </div>
              {/* Search */}
              <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 w-full sm:w-72 bg-background">
                <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search name, email, company…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1 min-w-0"
                />
                <AnimatePresence>
                  {search && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      onClick={() => setSearch('')}
                      className="text-muted-foreground hover:text-foreground text-xs leading-none"
                    >
                      ✕
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </CardHeader>

          <Separator className="mt-4" />

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/60">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-6">User</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wilaya</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <TableRow key={i} className="border-b border-border/40">
                            <TableCell className="pl-6 py-3">
                              <div className="flex items-center gap-3">
                                <Skeleton className="w-9 h-9 rounded-full" />
                                <div className="space-y-1.5">
                                  <Skeleton className="h-3.5 w-28" />
                                  <Skeleton className="h-3 w-40" />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell><Skeleton className="h-3.5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-3.5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                            <TableCell className="pr-6 text-right"><Skeleton className="h-7 w-20 ml-auto rounded-md" /></TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-16 text-center">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-2"
                          >
                            <Users className="w-8 h-8 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">No users found</p>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((user, i) => (
                        <motion.tr
                          key={user.id}
                          variants={rowVariant}
                          initial="hidden"
                          animate="show"
                          custom={i}
                          className="border-b border-border/40 hover:bg-muted/40 transition-colors"
                        >
                          {/* User */}
                          <TableCell className="pl-6 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9 shrink-0">
                                <AvatarFallback className="bg-[#FFC107]/20 text-[#111111] text-xs font-bold">
                                  {user.firstName?.[0]}{user.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate leading-none">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Company */}
                          <TableCell className="text-sm text-muted-foreground">
                            {user.companyName ?? <span className="text-muted-foreground/40">—</span>}
                          </TableCell>

                          {/* Role */}
                          <TableCell>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleConfig[user.role]?.className ?? 'bg-gray-100 text-gray-700'}`}>
                              {roleConfig[user.role]?.label ?? user.role}
                            </span>
                          </TableCell>

                          {/* Wilaya */}
                          <TableCell className="text-sm text-muted-foreground">
                            {user.wilaya ?? <span className="text-muted-foreground/40">—</span>}
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${
                              user.enabled
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-600 border-red-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${user.enabled ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              {user.enabled ? 'Active' : 'Disabled'}
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="pr-6 text-right">
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggle(user)}
                                disabled={toggleUser.isPending}
                                className={`h-7 px-3 text-xs gap-1.5 ${
                                  user.enabled
                                    ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                    : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                                }`}
                              >
                                {user.enabled
                                  ? <><UserX className="w-3.5 h-3.5" />Disable</>
                                  : <><UserCheck className="w-3.5 h-3.5" />Enable</>
                                }
                              </Button>
                            </motion.div>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {(data?.totalPages ?? 0) > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between px-6 py-3 border-t border-border/60"
              >
                <p className="text-xs text-muted-foreground">
                  Page {page + 1} of {data?.totalPages} · {data?.totalElements} total
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 gap-1 text-xs"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev
                  </Button>
                  <span className="text-xs font-medium text-foreground px-1 tabular-nums">
                    {page + 1} / {data?.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 gap-1 text-xs"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= (data?.totalPages ?? 1) - 1}
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
