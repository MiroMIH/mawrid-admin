import { create } from 'zustand';
import type { DialogState, CategoryTreeNode } from '../types/category.types';

interface CategoryStoreState {
  /** Currently selected node id in the right panel. */
  selectedId: number | null;
  /** Set of expanded node ids in the tree. */
  expandedIds: Set<number>;
  /** Active dialog and its payload. */
  dialog: DialogState | null;

  setSelectedId: (id: number | null) => void;
  toggleExpanded: (id: number) => void;
  /** Expand all ids in the given array (used to reveal a path). */
  expandIds: (ids: number[]) => void;
  openDialog: (state: DialogState) => void;
  closeDialog: () => void;
}

export const useCategoryStore = create<CategoryStoreState>((set) => ({
  selectedId: null,
  expandedIds: new Set(),
  dialog: null,

  setSelectedId: (id) => set({ selectedId: id }),

  toggleExpanded: (id) =>
    set((s) => {
      const next = new Set(s.expandedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { expandedIds: next };
    }),

  expandIds: (ids) =>
    set((s) => {
      const next = new Set(s.expandedIds);
      ids.forEach((id) => next.add(id));
      return { expandedIds: next };
    }),

  openDialog: (state) => set({ dialog: state }),
  closeDialog: () => set({ dialog: null }),
}));

/* ── Helpers for computing ancestor paths from tree ── */

/** Returns the ordered list of ancestor ids (root → parent) for a given target id. */
export function findAncestorIds(
  nodes: CategoryTreeNode[],
  targetId: number,
  path: number[] = [],
): number[] | null {
  for (const node of nodes) {
    if (node.id === targetId) return path;
    if (node.children.length > 0) {
      const found = findAncestorIds(node.children, targetId, [...path, node.id]);
      if (found) return found;
    }
  }
  return null;
}
