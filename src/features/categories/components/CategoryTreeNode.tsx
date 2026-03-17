/**
 * CategoryTreeNode — memoised single row in the category tree.
 * Reads selection/expansion from Zustand to avoid full-tree re-renders on selection.
 */
import React from 'react';
import { ChevronRight, ChevronDown, Plus, Pencil, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCategoryStore } from '../hooks/useCategoryStore';
import { useToggleActive, useMarkLeaf, useUnmarkLeaf } from '../hooks/useCategoryQueries';
import { useToast } from '@/components/ui/Toast';
import type { CategoryTreeNode as CategoryTreeNodeType, NodeType } from '../types/category.types';
import { cn } from '@/lib/utils';

const nodeTypeDot: Record<NodeType, string> = {
  SEEDED: 'bg-blue-500',
  ADMIN_CREATED: 'bg-[#FFC107]',
  LEAF: 'bg-emerald-500',
};

interface Props {
  node: CategoryTreeNodeType;
  matchingIds: Set<number>;
  ancestorIds: Set<number>;
  hasSearch: boolean;
}

/** Memoised tree node row — only re-renders when its own Zustand slice changes. */
const CategoryTreeNode = React.memo(function CategoryTreeNode({
  node,
  matchingIds,
  ancestorIds,
  hasSearch,
}: Props) {
  const isSelected = useCategoryStore((s) => s.selectedId === node.id);
  const isExpanded = useCategoryStore((s) => s.expandedIds.has(node.id));
  const { setSelectedId, toggleExpanded, openDialog } = useCategoryStore();
  const toggleActive = useToggleActive();
  const markLeaf = useMarkLeaf();
  const unmarkLeaf = useUnmarkLeaf();
  const { showToast } = useToast();

  const hasChildren = node.children.length > 0;
  const isMatching = matchingIds.has(node.id);
  const isAncestor = ancestorIds.has(node.id);
  const isDimmed = hasSearch && !isMatching && !isAncestor;

  const handleToggleActive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleActive.mutateAsync(node.id);
      showToast(`"${node.name}" ${node.active ? 'deactivated' : 'activated'}`);
    } catch (err: unknown) {
      showToast(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Failed',
        'error',
      );
    }
  };

  const handleMarkLeaf = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (node.nodeType === 'LEAF') {
        await unmarkLeaf.mutateAsync(node.id);
        showToast(`"${node.name}" unmarked as leaf`);
      } else {
        await markLeaf.mutateAsync(node.id);
        showToast(`"${node.name}" marked as leaf`);
      }
    } catch (err: unknown) {
      showToast(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Failed',
        'error',
      );
    }
  };

  return (
    <div className={cn(isDimmed && 'opacity-30 pointer-events-none')}>
      {/* Node row */}
      <div
        className={cn(
          'group flex items-center gap-1.5 py-1.5 px-2 rounded-md cursor-pointer transition-all select-none',
          isSelected
            ? 'bg-[#FFC107]/15 border-l-2 border-[#FFC107]'
            : 'hover:bg-muted border-l-2 border-transparent',
          !node.active && 'opacity-60',
          isMatching && !isSelected && 'bg-[#FFC107]/8',
        )}
        style={{ paddingLeft: `${node.depth * 14 + 8}px` }}
        onClick={() => setSelectedId(node.id)}
      >
        {/* Expand/collapse */}
        <button
          className="shrink-0 w-4 h-4 flex items-center justify-center rounded text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) toggleExpanded(node.id);
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )
          ) : (
            <span className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Color dot */}
        <span
          className={cn(
            'w-2 h-2 rounded-full shrink-0 ring-2 ring-background',
            nodeTypeDot[node.nodeType],
          )}
        />

        {/* Name */}
        <span
          className={cn(
            'text-sm flex-1 truncate leading-none',
            isSelected ? 'font-semibold text-[#111111]' : 'text-foreground',
            isMatching && 'font-medium',
          )}
        >
          {node.name}
        </span>

        {/* Demande count */}
        {node.demandeCount > 0 && (
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
            {node.demandeCount}
          </span>
        )}

        {/* Inactive badge */}
        {!node.active && (
          <span className="text-[10px] text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full shrink-0">
            off
          </span>
        )}

        {/* Hover actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  openDialog({ type: 'addChild', parentId: node.id, parentName: node.name });
                }}
              >
                <Plus className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Add child</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  openDialog({ type: 'rename', node });
                }}
              >
                <Pencil className="w-3 h-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Rename</TooltipContent>
          </Tooltip>

          {/* More menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 text-xs">
              <DropdownMenuItem
                className="text-xs cursor-pointer"
                onClick={(e) => handleToggleActive(e)}
              >
                {node.active ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs cursor-pointer"
                onClick={(e) => handleMarkLeaf(e)}
              >
                {node.nodeType === 'LEAF' ? 'Unmark as LEAF' : 'Mark as LEAF'}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  openDialog({ type: 'move', node });
                }}
              >
                Move to…
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-xs text-destructive focus:text-destructive cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  openDialog({ type: 'delete', node });
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Children */}
      {isExpanded &&
        hasChildren &&
        node.children.map((child) => (
          <CategoryTreeNode
            key={child.id}
            node={child}
            matchingIds={matchingIds}
            ancestorIds={ancestorIds}
            hasSearch={hasSearch}
          />
        ))}
    </div>
  );
});

export default CategoryTreeNode;
