/**
 * CategoryTree — left panel: search, tree, legend, skeleton loading.
 */
import { useMemo, useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useCategoryTree } from '../hooks/useCategoryQueries';
import { useCategoryStore } from '../hooks/useCategoryStore';
import CategoryTreeNode from './CategoryTreeNode';
import type { CategoryTreeNode as NodeType } from '../types/category.types';

/** Recursively collect all node ids that match the query string. */
function findMatchingIds(nodes: NodeType[], query: string): Set<number> {
  const result = new Set<number>();
  const q = query.toLowerCase();
  const walk = (n: NodeType) => {
    if (n.name.toLowerCase().includes(q)) result.add(n.id);
    n.children.forEach(walk);
  };
  nodes.forEach(walk);
  return result;
}

/** Find all ancestor ids for a set of target ids. */
function findAncestorIds(
  nodes: NodeType[],
  targetIds: Set<number>,
  path: number[] = [],
): Set<number> {
  const result = new Set<number>();
  const walk = (n: NodeType, ancestors: number[]) => {
    if (targetIds.has(n.id)) {
      ancestors.forEach((id) => result.add(id));
    }
    n.children.forEach((child) => walk(child, [...ancestors, n.id]));
  };
  nodes.forEach((n) => walk(n, path));
  return result;
}

function TreeSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-1">
          <Skeleton className="h-7 w-full rounded-md" />
          <div className="pl-6 space-y-1">
            <Skeleton className="h-7 w-[90%] rounded-md" />
            <Skeleton className="h-7 w-[80%] rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Left panel containing the category tree, search, and legend. */
export function CategoryTree() {
  const { data: tree, isLoading } = useCategoryTree();
  const { openDialog } = useCategoryStore();
  const [search, setSearch] = useState('');

  const matchingIds = useMemo(() => {
    if (!search || !tree) return new Set<number>();
    return findMatchingIds(tree, search);
  }, [tree, search]);

  const ancestorIds = useMemo(() => {
    if (!search || !tree || matchingIds.size === 0) return new Set<number>();
    return findAncestorIds(tree, matchingIds);
  }, [tree, search, matchingIds]);

  const hasSearch = search.length > 0;

  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex flex-col h-full bg-card border-r border-border">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <h2 className="text-sm font-semibold text-foreground">Category Tree</h2>
          <Button
            size="sm"
            onClick={() => openDialog({ type: 'addChild', parentId: null, parentName: 'Root' })}
            className="h-7 px-3 text-xs bg-[#FFC107] text-[#111111] hover:bg-[#e6ac00] font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Root
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-border shrink-0">
          <div className="flex items-center gap-2 bg-muted rounded-md px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories…"
              className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none flex-1 min-w-0"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          {hasSearch && (
            <p className="text-[10px] text-muted-foreground mt-1.5 px-0.5">
              {matchingIds.size} match{matchingIds.size !== 1 ? 'es' : ''}
            </p>
          )}
        </div>

        {/* Tree */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <TreeSkeleton />
          ) : !tree || tree.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <p>No categories yet.</p>
              <button
                onClick={() => openDialog({ type: 'addChild', parentId: null, parentName: 'Root' })}
                className="mt-2 text-xs text-[#FFC107] hover:underline"
              >
                Create the first category →
              </button>
            </div>
          ) : (
            <div className="p-2">
              {tree.map((node) => (
                <CategoryTreeNode
                  key={node.id}
                  node={node}
                  matchingIds={matchingIds}
                  ancestorIds={ancestorIds}
                  hasSearch={hasSearch}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Legend */}
        <div className="px-4 py-2.5 border-t border-border shrink-0">
          <div className="flex items-center gap-4">
            {[
              { color: 'bg-blue-500', label: 'Seeded' },
              { color: 'bg-[#FFC107]', label: 'Admin' },
              { color: 'bg-emerald-500', label: 'Leaf' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
