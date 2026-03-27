/**
 * CategoryNodeDetail — right panel showing full node details, stats,
 * attributes, and children when a tree node is selected.
 */
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogFooter, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  ChevronDown, Plus, Pencil, Trash2, MoveRight,
  Eye, EyeOff, Leaf, Loader2, FolderTree,
} from 'lucide-react';
import { useCategoryStore } from '../hooks/useCategoryStore';
import {
  useCategoryDetail, useCategoryTree, useToggleActive, useMarkLeaf, useUnmarkLeaf,
} from '../hooks/useCategoryQueries';
import { CategoryStatsCards } from './CategoryStatsCards';
import { CategoryAttributeTable } from './CategoryAttributeTable';
import { useToast } from '@/components/ui/Toast';
import type { NodeType, CategoryTreeNode } from '../types/category.types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const nodeTypeBadge: Record<NodeType, { label: string; className: string }> = {
  SEEDED:        { label: 'Seeded',  className: 'bg-blue-100 text-blue-700 border-blue-200' },
  ADMIN_CREATED: { label: 'Admin',   className: 'bg-[#FFC107]/20 text-[#111111] border-[#FFC107]/30' },
  LEAF:          { label: 'Leaf',    className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

function DetailSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  );
}

/** Full detail panel for a selected category node. */
export function CategoryNodeDetail() {
  const selectedId = useCategoryStore((s) => s.selectedId);
  const { openDialog } = useCategoryStore();
  const { data: detail, isLoading } = useCategoryDetail(selectedId);
  const { data: tree } = useCategoryTree();
  const toggleActive = useToggleActive();
  const markLeaf = useMarkLeaf();
  const unmarkLeaf = useUnmarkLeaf();
  const { showToast } = useToast();
  const [toggleDialog, setToggleDialog] = useState(false);
  const [childrenOpen, setChildrenOpen] = useState(true);

  const handleToggleActive = async () => {
    if (!detail) return;
    try {
      await toggleActive.mutateAsync(detail.id);
      showToast(`"${detail.name}" ${detail.active ? 'deactivated' : 'activated'}`);
      setToggleDialog(false);
    } catch (e: unknown) {
      showToast(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Failed',
        'error',
      );
    }
  };

  const handleMarkLeaf = async () => {
    if (!detail) return;
    try {
      if (detail.nodeType === 'LEAF') {
        await unmarkLeaf.mutateAsync(detail.id);
        showToast(`"${detail.name}" unmarked as leaf`);
      } else {
        await markLeaf.mutateAsync(detail.id);
        showToast(`"${detail.name}" marked as leaf`);
      }
    } catch (e: unknown) {
      showToast(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Failed',
        'error',
      );
    }
  };

  // Build breadcrumb from path
  const buildBreadcrumb = (): string[] => {
    if (!detail || !tree) return [];
    const parts: string[] = [];
    const ids = detail.path.split('.').map(Number).filter(Boolean);
    const findNode = (nodes: typeof tree, id: number): string | null => {
      for (const n of nodes) {
        if (n.id === id) return n.name;
        const found = findNode(n.children, id);
        if (found) return found;
      }
      return null;
    };
    for (const id of ids) {
      const name = findNode(tree, id);
      if (name) parts.push(name);
    }
    return parts;
  };

  const breadcrumb = buildBreadcrumb();

  // Find children nodes from tree
  const findNode = (nodes: CategoryTreeNode[] | undefined, id: number): CategoryTreeNode | null => {
    if (!nodes) return null;
    for (const n of nodes) {
      if (n.id === id) return n;
      const found = findNode(n.children, id);
      if (found) return found;
    }
    return null;
  };

  const treeNode = selectedId ? findNode(tree ?? [], selectedId) : null;

  if (!selectedId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-3"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <FolderTree className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Select a node</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click any category in the tree to view details
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isLoading) return <DetailSkeleton />;
  if (!detail) return null;

  const nt = nodeTypeBadge[detail.nodeType];

  return (
    <ScrollArea className="flex-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedId}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6 space-y-6"
        >
          {/* ── Section 1: Header ── */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 min-w-0">
                <h1 className="text-xl font-bold text-foreground tracking-tight truncate">
                  {detail.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn('text-[10px] font-semibold px-2.5 py-1 rounded-full border', nt.className)}>
                    {nt.label}
                  </span>
                  <span className={cn(
                    'text-[10px] font-semibold px-2.5 py-1 rounded-full border',
                    detail.active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-600 border-red-200',
                  )}>
                    {detail.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-[10px] text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-full">
                    Depth {detail.depth}
                  </span>
                </div>

                {/* Breadcrumb */}
                {breadcrumb.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {breadcrumb.map((crumb, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{crumb}</span>
                        {i < breadcrumb.length - 1 && (
                          <span className="text-muted-foreground/40 text-xs">›</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {/* Materialized path */}
                <code className="text-[10px] font-mono bg-muted border border-border px-2 py-0.5 rounded text-muted-foreground">
                  {detail.path || String(detail.id)}
                </code>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="h-7 px-3 text-xs bg-[#FFC107] text-[#111111] hover:bg-[#e6ac00] font-semibold"
                onClick={() => openDialog({ type: 'addChild', parentId: detail.id, parentName: detail.name })}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Child
              </Button>
              <Button
                size="sm" variant="outline"
                className="h-7 px-3 text-xs"
                onClick={() => openDialog({ type: 'rename', node: treeNode! })}
                disabled={!treeNode}
              >
                <Pencil className="w-3.5 h-3.5" />
                Rename
              </Button>
              <Button
                size="sm" variant="outline"
                className="h-7 px-3 text-xs"
                onClick={() => setToggleDialog(true)}
              >
                {detail.active
                  ? <><EyeOff className="w-3.5 h-3.5" />Deactivate</>
                  : <><Eye className="w-3.5 h-3.5" />Activate</>
                }
              </Button>
              <Button
                size="sm" variant="outline"
                className="h-7 px-3 text-xs"
                onClick={handleMarkLeaf}
                disabled={markLeaf.isPending || unmarkLeaf.isPending}
              >
                {markLeaf.isPending || unmarkLeaf.isPending
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Leaf className="w-3.5 h-3.5" />
                }
                {detail.nodeType === 'LEAF' ? 'Unmark LEAF' : 'Mark LEAF'}
              </Button>
              <Button
                size="sm" variant="outline"
                className="h-7 px-3 text-xs"
                onClick={() => treeNode && openDialog({ type: 'move', node: treeNode })}
                disabled={!treeNode}
              >
                <MoveRight className="w-3.5 h-3.5" />
                Move
              </Button>
              <Button
                size="sm" variant="outline"
                className="h-7 px-3 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                onClick={() => treeNode && openDialog({ type: 'delete', node: treeNode })}
                disabled={!treeNode}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            </div>
          </div>

          <Separator />

          {/* ── Section 2: Stats ── */}
          <CategoryStatsCards categoryId={detail.id} />

          <Separator />

          {/* ── Section 3: Attributes ── */}
          <CategoryAttributeTable categoryId={detail.id} />

          <Separator />

          {/* ── Section 4: Children preview ── */}
          <Collapsible open={childrenOpen} onOpenChange={setChildrenOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 group w-full">
              <h3 className="text-sm font-semibold text-foreground">
                Direct Children ({detail.childrenCount})
              </h3>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-muted-foreground transition-transform',
                  !childrenOpen && '-rotate-90',
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              {!treeNode?.children.length ? (
                <div className="py-6 text-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
                  {detail.nodeType === 'LEAF'
                    ? 'This is a leaf node — no children allowed'
                    : 'No subcategories yet — click Add Child to create one'}
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        {['Name', 'Type', 'Demandes', 'Status'].map((h) => (
                          <th key={h} className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {treeNode.children.map((child: CategoryTreeNode, i: number) => {
                        const cnb = nodeTypeBadge[child.nodeType];
                        return (
                          <tr
                            key={child.id}
                            className={cn(
                              'hover:bg-muted/40 cursor-pointer transition-colors',
                              i < treeNode.children.length - 1 && 'border-b border-border/40',
                            )}
                            onClick={() => useCategoryStore.getState().setSelectedId(child.id)}
                          >
                            <td className="px-4 py-2.5 font-medium text-foreground">{child.name}</td>
                            <td className="px-4 py-2.5">
                              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', cnb.className)}>
                                {cnb.label}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                              {child.demandeCount}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={cn(
                                'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                                child.active ? 'text-emerald-600' : 'text-red-500',
                              )}>
                                {child.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {/* Add child row */}
                      <tr
                        className="hover:bg-[#FFC107]/5 cursor-pointer transition-colors border-t border-border/40"
                        onClick={() => openDialog({ type: 'addChild', parentId: detail.id, parentName: detail.name })}
                      >
                        <td colSpan={4} className="px-4 py-2.5 text-[#FFC107] font-medium text-xs">
                          <div className="flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5" />
                            Add child here
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </motion.div>
      </AnimatePresence>

      {/* Toggle Active confirmation */}
      <AlertDialog open={toggleDialog} onOpenChange={setToggleDialog}>
        <AlertDialogContent className="sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">
              {detail.active ? 'Deactivate' : 'Activate'} "{detail.name}"?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-muted-foreground">
            {detail.active
              ? `Deactivating will also deactivate all descendants. Buyers won't be able to post demandes in this category or any of its subcategories.`
              : `This will reactivate the category. Make sure the parent is active first.`}
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              size="sm"
              onClick={handleToggleActive}
              disabled={toggleActive.isPending}
              className={detail.active
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }
            >
              {toggleActive.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {detail.active ? 'Deactivate' : 'Activate'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollArea>
  );
}
