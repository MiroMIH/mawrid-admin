import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw, ChevronLeft, ChevronRight, MoreHorizontal,
  XCircle, Clock, FolderInput, BarChart3, Tag, MapPin,
  CalendarDays, Package, CheckCircle2, AlertTriangle,
  FileText, Search, TrendingUp, Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useDemandes, useDemandeStats, useDemandeDetail,
  useDemandeScores, useForceClose, useExpireDemande, useRecategorize,
} from '../hooks/useDemandes';
import { useCategorySearch } from '../hooks/useCategories';
import type { DemandeStatus, DemandeSummary, DemandeDetail, ScoreBreakdown } from '../types';

// ── Animations ──────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.35, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const rowVariant = {
  hidden: { opacity: 0, x: -8 },
  show: (i: number) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.25, delay: i * 0.04, ease: 'easeOut' },
  }),
};

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<DemandeStatus, { label: string; dot: string; badge: string }> = {
  OPEN:      { label: 'Open',      dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CLOSED:    { label: 'Closed',    dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border-blue-200'         },
  CANCELLED: { label: 'Cancelled', dot: 'bg-red-500',     badge: 'bg-red-50 text-red-600 border-red-200'            },
  EXPIRED:   { label: 'Expired',   dot: 'bg-orange-500',  badge: 'bg-orange-50 text-orange-700 border-orange-200'   },
};

const TIER_CFG: Record<string, { label: string; cls: string }> = {
  IMMEDIATE:    { label: 'Immediate',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  DELAYED_15MIN:{ label: '15 min',     cls: 'bg-blue-50 text-blue-700 border-blue-200'          },
  DELAYED_1H:   { label: '1 hour',     cls: 'bg-amber-50 text-amber-700 border-amber-200'       },
  FEED_ONLY:    { label: 'Feed only',  cls: 'bg-muted text-muted-foreground border-border'       },
};

const STATUS_TABS: Array<{ label: string; value: DemandeStatus | 'ALL' }> = [
  { label: 'All',       value: 'ALL'       },
  { label: 'Open',      value: 'OPEN'      },
  { label: 'Closed',    value: 'CLOSED'    },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Expired',   value: 'EXPIRED'   },
];

// ── Small reusable pieces ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DemandeStatus }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.OPEN;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const cfg = TIER_CFG[tier] ?? TIER_CFG.FEED_ONLY;
  return (
    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function QualityDot({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <span
      className="inline-flex items-center justify-center text-[10px] font-bold rounded-full w-6 h-6 shrink-0"
      style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
    >
      {score}
    </span>
  );
}

function ScoreBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs tabular-nums font-medium">{value}</span>
    </div>
  );
}

function fmtDate(d?: string): string {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysColor(days: number): string {
  if (days <= 3) return 'text-red-600';
  if (days <= 7) return 'text-amber-600';
  return 'text-emerald-600';
}

// ── Detail panel (Sheet content) ─────────────────────────────────────────────

interface DetailPanelProps {
  selectedId: string | null;
  onForceClose: () => void;
  onExpire: () => void;
  onRecategorize: () => void;
  isMutating: boolean;
}

function DetailPanel({ selectedId, onForceClose, onExpire, onRecategorize, isMutating }: DetailPanelProps) {
  const { data: detail, isLoading: dLoading } = useDemandeDetail(selectedId);
  const { data: scores, isLoading: sLoading } = useDemandeScores(selectedId);

  if (!selectedId) return null;

  const isOpen = detail?.status === 'OPEN';

  return (
    <div className="flex flex-col h-full">
      {/* ── Sheet header ── */}
      <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60 shrink-0">
        {dLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              {detail && <StatusBadge status={detail.status} />}
              <span className="text-[10px] text-muted-foreground font-mono">
                #{detail?.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <SheetTitle className="text-base font-bold leading-snug mt-1">
              {detail?.title ?? '…'}
            </SheetTitle>
          </>
        )}
      </SheetHeader>

      {/* ── Scrollable body ── */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-6 py-5 space-y-6">

          {/* ── Info grid ── */}
          {dLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : detail ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Tag,          label: 'Category',      value: detail.categoryName },
                  { icon: MapPin,       label: 'Wilaya',        value: detail.wilaya ?? '—' },
                  { icon: Package,      label: 'Quantity',      value: `${detail.quantity} ${detail.unit}` },
                  { icon: CalendarDays, label: 'Deadline',      value: fmtDate(detail.deadline) },
                  { icon: TrendingUp,   label: 'Quality score', value: String(detail.qualityScore) },
                  { icon: Activity,     label: 'Created',       value: fmtDate(detail.createdAt) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border/40">
                    <div className="p-1.5 rounded-md bg-background border border-border/60 shrink-0">
                      <Icon className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                      <p className="text-sm font-semibold text-foreground truncate">{value ?? '—'}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Buyer */}
              {detail.buyerCompanyName && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-medium">Buyer:</span>
                  <span>{detail.buyerCompanyName}</span>
                </div>
              )}

              {/* Description */}
              {detail.description && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg px-3 py-2.5 border border-border/40">
                    {detail.description}
                  </p>
                </div>
              )}

              {/* Attributes */}
              {detail.attributes.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Attributes ({detail.attributes.length})
                  </p>
                  <div className="rounded-lg border border-border/60 overflow-hidden">
                    {detail.attributes.map((attr, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between px-3 py-2 text-sm ${
                          i < detail.attributes.length - 1 ? 'border-b border-border/40' : ''
                        }`}
                      >
                        <span className="text-muted-foreground font-medium">{attr.key}</span>
                        <span className="font-semibold text-foreground">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}

          <Separator />

          {/* ── Score breakdown ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Supplier Score Breakdown
              </p>
              {scores && (
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {scores.length} matched
                </span>
              )}
            </div>

            {sLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-lg" />
                ))}
              </div>
            ) : !scores || scores.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center rounded-lg border border-dashed border-border/60">
                <BarChart3 className="w-6 h-6 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No scores yet</p>
                <p className="text-xs text-muted-foreground/60">Matching hasn't run or no eligible suppliers</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border/60 bg-muted/30">
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground pl-3 py-2">Supplier</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-2">Cat</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-2">Prox</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-2">Urg</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-2">Final</TableHead>
                      <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-2 pr-3">Tier</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(scores as ScoreBreakdown[]).map((s, i) => (
                      <TableRow
                        key={String(s.supplierId)}
                        className={`border-b border-border/40 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}
                      >
                        <TableCell className="pl-3 py-2">
                          <p className="text-xs font-medium text-foreground leading-none">{s.supplierName}</p>
                          {s.supplierCompany && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[100px]">{s.supplierCompany}</p>
                          )}
                        </TableCell>
                        <TableCell className="py-2">
                          <ScoreBar value={s.categoryScore} max={35} />
                        </TableCell>
                        <TableCell className="py-2">
                          <ScoreBar value={s.proximityScore} max={25} />
                        </TableCell>
                        <TableCell className="py-2">
                          <ScoreBar value={s.urgencyScore} max={20} />
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="text-sm font-bold tabular-nums">{s.finalScore}</span>
                        </TableCell>
                        <TableCell className="py-2 pr-3">
                          <TierBadge tier={s.notificationTier} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* ── Actions footer ── */}
      {isOpen && (
        <div className="shrink-0 px-6 py-4 border-t border-border/60 bg-background flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={onRecategorize}
            disabled={isMutating}
          >
            <FolderInput className="w-3.5 h-3.5" />
            Recategorize
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs text-amber-600 border-amber-200 hover:bg-amber-50"
            onClick={onExpire}
            disabled={isMutating}
          >
            <Clock className="w-3.5 h-3.5" />
            Expire
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50"
            onClick={onForceClose}
            disabled={isMutating}
          >
            <XCircle className="w-3.5 h-3.5" />
            Force Close
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function DemandesPage() {
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState<DemandeStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'force-close' | 'expire' | null>(null);
  const [recatOpen, setRecatOpen] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');

  const statusFilter = activeTab === 'ALL' ? undefined : activeTab;

  const { data: stats, isLoading: statsLoading } = useDemandeStats();
  const { data, isLoading, refetch, isFetching } = useDemandes({
    status: statusFilter,
    page,
    size: 20,
    sort: 'createdAt,desc',
  });
  const { data: leafCats } = useCategorySearch({ nodeType: 'LEAF', size: 200, active: true });

  const forceClose  = useForceClose();
  const expire      = useExpireDemande();
  const recategorize = useRecategorize();

  const isMutating = forceClose.isPending || expire.isPending || recategorize.isPending;

  const openDetail = (id: string) => {
    setSelectedId(id);
    setSheetOpen(true);
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val as DemandeStatus | 'ALL');
    setPage(0);
  };

  const handleForceClose = async () => {
    if (!selectedId) return;
    try {
      await forceClose.mutateAsync(selectedId);
      toast.success('Demande force closed');
      setPendingAction(null);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed';
      toast.error(msg);
    }
  };

  const handleExpire = async () => {
    if (!selectedId) return;
    try {
      await expire.mutateAsync(selectedId);
      toast.success('Demande marked as expired');
      setPendingAction(null);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed';
      toast.error(msg);
    }
  };

  const handleRecategorize = async () => {
    if (!selectedId || !newCategoryId) return;
    try {
      await recategorize.mutateAsync({ id: selectedId, newCategoryId: Number(newCategoryId) });
      toast.success('Demande recategorized — matching re-running');
      setRecatOpen(false);
      setNewCategoryId('');
      setCatSearch('');
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed';
      toast.error(msg);
    }
  };

  const filtered = (data?.content ?? []).filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.categoryName.toLowerCase().includes(q) ||
      (d.buyerWilaya ?? '').toLowerCase().includes(q)
    );
  });

  const statCards = [
    { label: 'Total',     value: stats?.totalAll      ?? '—', icon: FileText,    color: 'text-foreground',     bg: 'bg-muted'       },
    { label: 'Open',      value: stats?.totalOpen     ?? '—', icon: Activity,    color: 'text-emerald-600',    bg: 'bg-emerald-50'  },
    { label: 'Closed',    value: stats?.totalClosed   ?? '—', icon: CheckCircle2,color: 'text-blue-600',       bg: 'bg-blue-50'     },
    { label: 'Cancelled', value: stats?.totalCancelled?? '—', icon: XCircle,     color: 'text-red-600',        bg: 'bg-red-50'      },
    { label: 'Expired',   value: stats?.totalExpired  ?? '—', icon: Clock,       color: 'text-orange-600',     bg: 'bg-orange-50'   },
  ];

  const filteredLeafCats = (leafCats?.content ?? []).filter(
    (c) => !catSearch || c.name.toLowerCase().includes(catSearch.toLowerCase()),
  );

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show">

      {/* ── Header ── */}
      <motion.div variants={fadeUp} custom={0} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Demandes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stats?.totalAll ?? 0} total requests on the platform
          </p>
        </div>
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
      </motion.div>

      {/* ── Stats cards ── */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-5 gap-3"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
      >
        {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -2, transition: { duration: 0.18 } }}
          >
            <Card className="border-border/60">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                    {statsLoading
                      ? <Skeleton className="h-7 w-10 mt-1" />
                      : <p className={`text-2xl font-bold mt-0.5 tabular-nums ${color}`}>{value}</p>
                    }
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

      {/* ── Table card ── */}
      <motion.div variants={fadeUp} custom={5}>
        <Card className="border-border/60">
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold">All Demandes</CardTitle>
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
                  placeholder="Search title, category, wilaya…"
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

            {/* Status tabs */}
            <div className="flex gap-1 mt-4 flex-wrap">
              {STATUS_TABS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => handleTabChange(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === value
                      ? 'bg-[#FFC107] text-[#111111]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  {label}
                  {value !== 'ALL' && stats && (
                    <span className="ml-1 opacity-60">
                      ({value === 'OPEN' ? stats.totalOpen
                        : value === 'CLOSED' ? stats.totalClosed
                        : value === 'CANCELLED' ? stats.totalCancelled
                        : stats.totalExpired})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </CardHeader>

          <Separator className="mt-4" />

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/60">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pl-6">Demande</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wilaya</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Responses</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deadline</TableHead>
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
                              <div className="space-y-1.5">
                                <Skeleton className="h-3.5 w-44" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            </TableCell>
                            <TableCell><Skeleton className="h-3.5 w-28" /></TableCell>
                            <TableCell><Skeleton className="h-3.5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-3.5 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-3.5 w-20" /></TableCell>
                            <TableCell className="pr-6 text-right"><Skeleton className="h-7 w-7 ml-auto rounded-md" /></TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-16 text-center">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-2"
                          >
                            <FileText className="w-8 h-8 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">No demandes found</p>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((d: DemandeSummary, i) => (
                        <motion.tr
                          key={d.id}
                          variants={rowVariant}
                          initial="hidden"
                          animate="show"
                          custom={i}
                          className="border-b border-border/40 hover:bg-muted/40 transition-colors cursor-pointer"
                          onClick={() => openDetail(d.id)}
                        >
                          {/* Demande title */}
                          <TableCell className="pl-6 py-3">
                            <div className="flex items-center gap-2">
                              <QualityDot score={d.qualityScore} />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate max-w-[200px] leading-none">
                                  {d.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {d.quantity} {d.unit}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Category */}
                          <TableCell className="text-sm text-muted-foreground max-w-[140px]">
                            <span className="truncate block">{d.categoryName}</span>
                          </TableCell>

                          {/* Wilaya */}
                          <TableCell className="text-sm text-muted-foreground">
                            {d.buyerWilaya ?? <span className="text-muted-foreground/40">—</span>}
                          </TableCell>

                          {/* Responses */}
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-emerald-600">{d.disponibleCount}</span>
                              <span className="text-muted-foreground/60 text-xs">/</span>
                              <span className="text-sm text-muted-foreground">{d.totalReponses}</span>
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <StatusBadge status={d.status} />
                          </TableCell>

                          {/* Deadline */}
                          <TableCell>
                            {d.deadline ? (
                              <div>
                                <p className="text-xs font-medium">{fmtDate(d.deadline)}</p>
                                {d.status === 'OPEN' && (
                                  <p className={`text-[10px] font-semibold ${daysColor(d.daysUntilDeadline)}`}>
                                    {d.daysUntilDeadline > 0
                                      ? `${d.daysUntilDeadline}d left`
                                      : 'Overdue'}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground/40 text-sm">—</span>
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell
                            className="pr-6 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onClick={() => openDetail(d.id)}>
                                  <FileText className="w-3.5 h-3.5 mr-2" />
                                  View detail
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openDetail(d.id)}>
                                  <BarChart3 className="w-3.5 h-3.5 mr-2" />
                                  Score breakdown
                                </DropdownMenuItem>
                                {d.status === 'OPEN' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => { setSelectedId(d.id); setSheetOpen(false); setRecatOpen(true); }}
                                    >
                                      <FolderInput className="w-3.5 h-3.5 mr-2 text-blue-500" />
                                      Recategorize
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => { setSelectedId(d.id); setSheetOpen(false); setPendingAction('expire'); }}
                                      className="text-amber-600 focus:text-amber-700"
                                    >
                                      <Clock className="w-3.5 h-3.5 mr-2" />
                                      Expire
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => { setSelectedId(d.id); setSheetOpen(false); setPendingAction('force-close'); }}
                                      className="text-red-600 focus:text-red-700"
                                    >
                                      <XCircle className="w-3.5 h-3.5 mr-2" />
                                      Force close
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                    variant="outline" size="sm"
                    className="h-7 px-2.5 gap-1 text-xs"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </Button>
                  <span className="text-xs font-medium text-foreground px-1 tabular-nums">
                    {page + 1} / {data?.totalPages}
                  </span>
                  <Button
                    variant="outline" size="sm"
                    className="h-7 px-2.5 gap-1 text-xs"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= (data?.totalPages ?? 1) - 1}
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Detail Sheet ── */}
      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setTimeout(() => setSelectedId(null), 300);
        }}
      >
        <SheetContent side="right" className="p-0 flex flex-col w-full sm:max-w-2xl">
          <DetailPanel
            selectedId={selectedId}
            onForceClose={() => setPendingAction('force-close')}
            onExpire={() => setPendingAction('expire')}
            onRecategorize={() => { setSheetOpen(false); setRecatOpen(true); }}
            isMutating={isMutating}
          />
        </SheetContent>
      </Sheet>

      {/* ── Confirm dialogs ── */}
      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {pendingAction === 'force-close' ? (
                <><XCircle className="w-4 h-4 text-red-500" /> Force Close Demande</>
              ) : (
                <><Clock className="w-4 h-4 text-amber-500" /> Expire Demande</>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === 'force-close'
                ? 'This will immediately close the demande regardless of its current state. This action cannot be undone.'
                : 'This will mark the demande as EXPIRED. Only OPEN demandes can be expired.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={pendingAction === 'force-close' ? handleForceClose : handleExpire}
              className={pendingAction === 'force-close'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'}
            >
              {isMutating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : pendingAction === 'force-close' ? (
                'Force Close'
              ) : (
                'Expire'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Recategorize Dialog ── */}
      <Dialog open={recatOpen} onOpenChange={setRecatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderInput className="w-4 h-4 text-blue-500" />
              Recategorize Demande
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground -mt-1">
            Select a new leaf category. Supplier matching will be re-run automatically.
          </p>

          {/* Search input */}
          <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-background">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search categories…"
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
            />
          </div>

          {/* Category list */}
          <ScrollArea className="h-56 border border-border/60 rounded-lg overflow-hidden">
            {filteredLeafCats.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No categories found
              </div>
            ) : (
              filteredLeafCats.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setNewCategoryId(String(cat.id))}
                  className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0 ${
                    newCategoryId === String(cat.id) ? 'bg-[#FFC107]/10' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{cat.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{cat.path}</p>
                  </div>
                  {newCategoryId === String(cat.id) && (
                    <CheckCircle2 className="w-4 h-4 text-[#FFC107] shrink-0 ml-2" />
                  )}
                </button>
              ))
            )}
          </ScrollArea>

          {newCategoryId && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700">
              <Tag className="w-3.5 h-3.5 shrink-0" />
              Selected: <span className="font-semibold">
                {filteredLeafCats.find((c) => String(c.id) === newCategoryId)?.name ?? newCategoryId}
              </span>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => { setRecatOpen(false); setNewCategoryId(''); setCatSearch(''); }}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRecategorize}
              disabled={!newCategoryId || isMutating}
              className="bg-[#111111] text-white hover:bg-[#222] gap-1.5"
            >
              {recategorize.isPending
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Saving…</>
                : <><FolderInput className="w-3.5 h-3.5" />Recategorize</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
}
