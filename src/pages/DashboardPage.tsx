import { useDashboardStats } from '../hooks/useStats';
import { useCategoryTree } from '../hooks/useCategories';
import { useUsers } from '../hooks/useUsers';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users, FolderTree, FileText, TrendingUp,
  ArrowUpRight, Activity, Layers, CheckCircle2, Zap,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import type { Category } from '../types';

/* ── animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

/* ── static data ── */
const activityData = [
  { day: 'Mon', demandes: 4, responses: 12 },
  { day: 'Tue', demandes: 7, responses: 18 },
  { day: 'Wed', demandes: 5, responses: 15 },
  { day: 'Thu', demandes: 9, responses: 22 },
  { day: 'Fri', demandes: 6, responses: 20 },
  { day: 'Sat', demandes: 3, responses: 8 },
  { day: 'Sun', demandes: 2, responses: 5 },
];

const statusItems = [
  { label: 'API Health', status: 'Operational' },
  { label: 'Database', status: 'Operational' },
  { label: 'Matching Engine', status: 'Active' },
  { label: 'Notifications', status: 'Active' },
];

/* ── helpers ── */
function countCategories(cats: Category[] | undefined): number {
  if (!cats) return 0;
  return cats.reduce((acc, cat) => acc + 1 + countCategories(cat.children ?? []), 0);
}

const roleBadgeClass: Record<string, string> = {
  BUYER: 'bg-blue-100 text-blue-700 border-blue-200',
  SUPPLIER: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  ADMIN: 'bg-violet-100 text-violet-700 border-violet-200',
  SUPERADMIN: 'bg-orange-100 text-orange-700 border-orange-200',
};

/* ─────────────────────────────── */
/*  Stat card                      */
/* ─────────────────────────────── */
interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  change: string;
  accent: string;
  loading: boolean;
  index: number;
}

function StatCard({ label, value, icon: Icon, change, accent, loading, index }: StatCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <Card className="relative overflow-hidden border-border/60 bg-card h-full">
        {/* accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent}`} />
        <CardContent className="pt-5 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
              {loading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <motion.p
                  key={String(value)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-3xl font-bold text-foreground tabular-nums"
                >
                  {value}
                </motion.p>
              )}
              <div className="flex items-center gap-1 pt-0.5">
                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">{change}</span>
                <span className="text-xs text-muted-foreground">this week</span>
              </div>
            </div>
            <div className={`p-2.5 rounded-xl ${accent} bg-opacity-10 shrink-0`}>
              <Icon className="w-5 h-5 text-foreground/70" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─────────────────────────────── */
/*  Custom tooltip for charts      */
/* ─────────────────────────────── */
function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────── */
/*  Page                           */
/* ─────────────────────────────── */
export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: tree } = useCategoryTree();
  const { data: users } = useUsers({ page: 0, size: 5 });

  const statCards: Omit<StatCardProps, 'loading' | 'index'>[] = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? users?.totalElements ?? '—',
      icon: Users,
      accent: 'bg-blue-500',
      change: '+12%',
    },
    {
      label: 'Categories',
      value: stats?.totalCategories ?? countCategories(tree),
      icon: FolderTree,
      accent: 'bg-violet-500',
      change: '+3%',
    },
    {
      label: 'Open Demandes',
      value: stats?.openDemandes ?? stats?.totalDemandes ?? '—',
      icon: FileText,
      accent: 'bg-amber-500',
      change: '+8%',
    },
    {
      label: 'Active Suppliers',
      value: stats?.totalSuppliers ?? '—',
      icon: TrendingUp,
      accent: 'bg-emerald-500',
      change: '+5%',
    },
  ];

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={staggerContainer}
    >
      {/* ── Header ── */}
      <motion.div variants={fadeUp} custom={0} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{today}</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          All systems operational
        </motion.div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} loading={statsLoading} index={i} />
        ))}
      </motion.div>

      {/* ── Charts ── */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* Area chart */}
        <motion.div variants={scaleIn}>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Weekly Activity</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Demandes & responses over 7 days</CardDescription>
                </div>
                <div className="p-2 rounded-lg bg-muted">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#FFC107]" />
                  Demandes
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#111111]" />
                  Responses
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={activityData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gradDemandes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFC107" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#FFC107" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradResponses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#111111" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#111111" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="demandes" stroke="#FFC107" strokeWidth={2} fill="url(#gradDemandes)" name="Demandes" />
                  <Area type="monotone" dataKey="responses" stroke="#111111" strokeWidth={2} fill="url(#gradResponses)" name="Responses" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bar chart */}
        <motion.div variants={scaleIn}>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Demandes by Day</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Volume distribution — last 7 days</CardDescription>
                </div>
                <div className="p-2 rounded-lg bg-muted">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#FFC107]" />
                  Demandes
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={activityData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="demandes" fill="#FFC107" radius={[4, 4, 0, 0]} name="Demandes" maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Bottom row ── */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* Recent Users */}
        <motion.div variants={scaleIn} className="lg:col-span-2">
          <Card className="border-border/60 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Recent Users</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Latest registered accounts</CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs font-medium">
                  {users?.totalElements ?? '—'} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <AnimatePresence mode="wait">
                {!users ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3.5 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-0.5"
                  >
                    {users.content.slice(0, 5).map((user, i) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.3 }}
                        whileHover={{ x: 3, transition: { duration: 0.15 } }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 cursor-default transition-colors"
                      >
                        <Avatar className="w-9 h-9 shrink-0">
                          <AvatarFallback className="bg-[#FFC107]/20 text-[#111111] text-xs font-bold">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate leading-none">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleBadgeClass[user.role] ?? 'bg-gray-100 text-gray-700'}`}>
                          {user.role}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right column */}
        <motion.div variants={scaleIn} className="flex flex-col gap-6">
          {/* Platform Status */}
          <Card className="border-border/60 flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Platform Status</CardTitle>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-xs text-emerald-600 font-medium">Live</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                {statusItems.map(({ label, status }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.07, duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs font-medium text-emerald-600">{status}</span>
                      </div>
                    </div>
                    {i < statusItems.length - 1 && <Separator className="opacity-50" />}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick info */}
          <motion.div
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          >
            <Card className="border-border/60 bg-[#111111] text-white">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-[#FFC107]">
                    <Zap className="w-4 h-4 text-[#111111]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">MAWRED Platform</p>
                    <p className="text-xs text-white/50">B2B Industrial Marketplace</p>
                  </div>
                </div>
                <Separator className="bg-white/10 mb-3" />
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-xl font-bold text-[#FFC107]">
                      {stats?.totalBuyers ?? '—'}
                    </p>
                    <p className="text-[10px] text-white/50 mt-0.5 uppercase tracking-wider">Buyers</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#FFC107]">
                      {stats?.totalSuppliers ?? '—'}
                    </p>
                    <p className="text-[10px] text-white/50 mt-0.5 uppercase tracking-wider">Suppliers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
