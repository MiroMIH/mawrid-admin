/**
 * CategoryPage — two-column categories management page.
 * Left: 280px tree panel. Right: node detail panel.
 * Collapses to a Sheet drawer on mobile (<900px).
 */
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FolderTree, PanelLeft } from 'lucide-react';
import { CategoryTree } from './CategoryTree';
import { CategoryNodeDetail } from './CategoryNodeDetail';
import { CategoryFormDialog } from './CategoryFormDialog';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';
import { MoveCategoryDialog } from './MoveCategoryDialog';
import { useCategoryStore, findAncestorIds } from '../hooks/useCategoryStore';
import { useCategoryTree } from '../hooks/useCategoryQueries';
import { motion } from 'framer-motion';

/**
 * Main categories management page with tree + detail two-column layout.
 * All dialogs are rendered here so they have access to the full Zustand store.
 */
export function CategoryPage() {
  const selectedId = useCategoryStore((s) => s.selectedId);
  const { expandIds } = useCategoryStore();
  const { data: tree } = useCategoryTree();

  // Auto-expand path to selected node when tree loads
  useEffect(() => {
    if (!selectedId || !tree) return;
    const ancestors = findAncestorIds(tree, selectedId);
    if (ancestors && ancestors.length > 0) expandIds(ancestors);
  }, [selectedId, tree, expandIds]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-[calc(100vh-4rem)] -mx-6 -my-6 overflow-hidden"
    >
      {/* ── Left panel — desktop (≥900px) ── */}
      <div className="hidden lg:flex w-[280px] shrink-0 flex-col">
        <CategoryTree />
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
                <PanelLeft className="w-3.5 h-3.5" />
                Tree
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <CategoryTree />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FolderTree className="w-4 h-4" />
            <span>Categories</span>
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <CategoryNodeDetail />
        </div>
      </div>

      {/* ── Global dialogs ── */}
      <CategoryFormDialog />
      <DeleteCategoryDialog />
      <MoveCategoryDialog />
    </motion.div>
  );
}
