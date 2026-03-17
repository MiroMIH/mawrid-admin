/**
 * MoveCategoryDialog — lets the admin pick a new parent from a mini tree picker.
 * Grays out the node being moved, all its descendants, and LEAF nodes.
 */
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, ChevronRight, ChevronDown, Loader2, FolderOpen } from 'lucide-react';
import { useCategoryStore } from '../hooks/useCategoryStore';
import { useCategoryTree, useMoveCategory } from '../hooks/useCategoryQueries';
import { useToast } from '@/components/ui/Toast';
import type { CategoryTreeNode } from '../types/category.types';
import { cn } from '@/lib/utils';

/** Recursively collect all descendant ids of a node. */
function collectDescendantIds(node: CategoryTreeNode): Set<number> {
  const ids = new Set<number>();
  const walk = (n: CategoryTreeNode) => {
    ids.add(n.id);
    n.children.forEach(walk);
  };
  node.children.forEach(walk);
  return ids;
}

interface MiniNodeProps {
  node: CategoryTreeNode;
  disabledIds: Set<number>;
  selectedId: number | null;
  onSelect: (id: number) => void;
  depth: number;
}

function MiniNode({ node, disabledIds, selectedId, onSelect, depth }: MiniNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isDisabled = disabledIds.has(node.id);
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        className={cn(
          'flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer text-sm transition-colors',
          isDisabled && 'opacity-40 cursor-not-allowed',
          !isDisabled && isSelected && 'bg-[#FFC107]/20 text-[#111111] font-medium',
          !isDisabled && !isSelected && 'hover:bg-muted text-foreground',
        )}
        onClick={() => {
          if (!isDisabled) onSelect(node.id);
        }}
      >
        <button
          className="shrink-0 w-4 h-4 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            if (node.children.length > 0) setExpanded((v) => !v);
          }}
        >
          {node.children.length > 0 ? (
            expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )
          ) : (
            <span className="w-3.5" />
          )}
        </button>
        <FolderOpen className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate flex-1">{node.name}</span>
        {node.demandeCount > 0 && (
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {node.demandeCount}
          </span>
        )}
      </div>
      {expanded &&
        node.children.map((child) => (
          <MiniNode
            key={child.id}
            node={child}
            disabledIds={disabledIds}
            selectedId={selectedId}
            onSelect={onSelect}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}

/** Dialog for moving a category subtree to a new parent. */
export function MoveCategoryDialog() {
  const { dialog, closeDialog } = useCategoryStore();
  const { showToast } = useToast();
  const { data: tree } = useCategoryTree();
  const moveCategory = useMoveCategory();
  const [newParentId, setNewParentId] = useState<number | null>(null);

  const open = dialog?.type === 'move';
  const node = dialog?.type === 'move' ? dialog.node : null;

  // Collect disabled ids: the node itself + all its descendants + LEAF nodes
  const disabledIds: Set<number> = (() => {
    if (!node || !tree) return new Set<number>();
    const descendants = collectDescendantIds(node);
    descendants.add(node.id);
    // Also disable LEAF nodes (can't be parents)
    const leafIds = new Set<number>();
    const walkLeafs = (n: CategoryTreeNode) => {
      if (n.nodeType === 'LEAF') leafIds.add(n.id);
      n.children.forEach(walkLeafs);
    };
    tree.forEach(walkLeafs);
    return new Set([...descendants, ...leafIds]);
  })();

  const handleMove = async () => {
    if (!node || newParentId === null) return;
    try {
      await moveCategory.mutateAsync({ id: node.id, newParentId });
      showToast(`"${node.name}" moved successfully`);
      setNewParentId(null);
      closeDialog();
    } catch (e: unknown) {
      showToast(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Move failed',
        'error',
      );
    }
  };

  const handleClose = () => {
    setNewParentId(null);
    closeDialog();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Move "{node?.name}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Moving this category will rewrite paths for all descendants. Grayed-out nodes
              cannot be selected as targets.
            </span>
          </div>

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Select new parent
          </p>

          <ScrollArea className="h-72 rounded-lg border border-border">
            <div className="p-2">
              {/* Root-level option */}
              <div
                className={cn(
                  'flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer text-sm transition-colors mb-1',
                  newParentId === -1
                    ? 'bg-[#FFC107]/20 text-[#111111] font-medium'
                    : 'hover:bg-muted text-muted-foreground',
                )}
                onClick={() => setNewParentId(-1)}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span className="italic">Move to root level</span>
              </div>
              <div className="border-t border-border my-1" />
              {tree?.map((n) => (
                <MiniNode
                  key={n.id}
                  node={n}
                  disabledIds={disabledIds}
                  selectedId={newParentId}
                  onSelect={setNewParentId}
                  depth={0}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            disabled={newParentId === null || moveCategory.isPending}
            onClick={handleMove}
            className="bg-[#FFC107] text-[#111111] hover:bg-[#e6ac00] font-semibold"
          >
            {moveCategory.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
