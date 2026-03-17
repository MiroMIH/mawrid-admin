/**
 * CategoryStatsCards — 4 compact stat cards for a selected category node.
 */
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, GitBranch, Users, Layers } from 'lucide-react';
import { useCategoryStats } from '../hooks/useCategoryQueries';
import { motion } from 'framer-motion';

interface Props {
  categoryId: number;
}

/** Displays demande counts, suppliers, and children for a category node. */
export function CategoryStatsCards({ categoryId }: Props) {
  const { data: stats, isLoading } = useCategoryStats(categoryId);

  const cards = [
    {
      label: 'Own Demandes',
      value: stats?.totalDemandes,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Subtree Demandes',
      value: stats?.totalDemandesInSubtree,
      icon: Layers,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      label: 'Active Suppliers',
      value: stats?.activeSuppliers,
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Direct Children',
      value: stats?.childrenCount,
      icon: GitBranch,
      color: 'text-[#111111]',
      bg: 'bg-[#FFC107]/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(({ label, value, icon: Icon, color, bg }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
          className="rounded-lg border border-border/60 bg-card p-3 flex items-center gap-3"
        >
          <div className={`p-2 rounded-lg ${bg} shrink-0`}>
            <Icon className={`w-3.5 h-3.5 ${color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider leading-none">
              {label}
            </p>
            {isLoading ? (
              <Skeleton className="h-5 w-10 mt-1" />
            ) : (
              <p className={`text-lg font-bold tabular-nums mt-0.5 ${color}`}>
                {value ?? '—'}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
