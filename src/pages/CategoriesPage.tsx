import { useState } from 'react';
import {
  useCategoryTree,
  useCreateCategory,
  useRenameCategory,
  useMarkAsLeaf,
  useUnmarkLeaf,
  useMoveCategory,
  useToggleCategoryActive,
  useDeleteCategory,
} from '../hooks/useCategories';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import type { Category } from '../types';
import {
  Plus, ChevronRight, ChevronDown, Pencil, Trash2,
  Leaf, FolderOpen, RefreshCw, MoveRight, MoreHorizontal,
  Eye, EyeOff
} from 'lucide-react';

function nodeTypeBadge(nodeType: string) {
  if (nodeType === 'LEAF') return <Badge variant="success">LEAF</Badge>;
  if (nodeType === 'SEEDED') return <Badge variant="info">SEEDED</Badge>;
  return <Badge variant="default">ADMIN</Badge>;
}

interface TreeNodeProps {
  node: Category;
  depth: number;
  onAction: (action: string, node: Category) => void;
}

function TreeNode({ node, depth, onAction }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = (node.children?.length ?? 0) > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 group transition-colors
          ${!node.active ? 'opacity-50' : ''}`}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-5 h-5 flex items-center justify-center text-gray-400 flex-shrink-0"
        >
          {hasChildren ? (
            expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            <span className="w-4 h-4 border border-gray-200 rounded-sm block" />
          )}
        </button>

        {/* Icon */}
        {node.nodeType === 'LEAF' ? (
          <Leaf className="w-4 h-4 text-green-500 flex-shrink-0" />
        ) : (
          <FolderOpen className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
        )}

        {/* Name */}
        <span className="text-sm font-medium text-gray-800 flex-1 truncate">{node.name}</span>

        {/* Badges */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {nodeTypeBadge(node.nodeType)}
          {!node.active && <Badge variant="danger">Inactive</Badge>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAction('addChild', node)}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            title="Add child"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onAction('rename', node)}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            title="Rename"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onAction('move', node)}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            title="Move"
          >
            <MoveRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onAction('toggle', node)}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            title={node.active ? 'Deactivate' : 'Reactivate'}
          >
            {node.active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          {node.nodeType !== 'LEAF' ? (
            <button
              onClick={() => onAction('markLeaf', node)}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-green-600"
              title="Mark as leaf"
            >
              <Leaf className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onAction('unmarkLeaf', node)}
              className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
              title="Unmark leaf"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onAction('delete', node)}
            className="p-1.5 rounded hover:bg-red-100 text-gray-500 hover:text-red-600"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onAction('more', node)}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            title="Details"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} onAction={onAction} />
          ))}
        </div>
      )}
    </div>
  );
}

type ActiveModal =
  | { type: 'createRoot' }
  | { type: 'addChild'; parent: Category }
  | { type: 'rename'; node: Category }
  | { type: 'move'; node: Category }
  | { type: 'delete'; node: Category }
  | null;

export function CategoriesPage() {
  const { data: tree, isLoading, refetch } = useCategoryTree();
  const createCategory = useCreateCategory();
  const renameCategory = useRenameCategory();
  const markAsLeaf = useMarkAsLeaf();
  const unmarkLeaf = useUnmarkLeaf();
  const moveCategory = useMoveCategory();
  const toggleActive = useToggleCategoryActive();
  const deleteCategory = useDeleteCategory();
  const { showToast } = useToast();

  const [modal, setModal] = useState<ActiveModal>(null);
  const [formName, setFormName] = useState('');
  const [forceRename, setForceRename] = useState(false);
  const [newParentId, setNewParentId] = useState('');

  const closeModal = () => {
    setModal(null);
    setFormName('');
    setForceRename(false);
    setNewParentId('');
  };

  const handleAction = async (action: string, node: Category) => {
    if (action === 'addChild') {
      setModal({ type: 'addChild', parent: node });
    } else if (action === 'rename') {
      setFormName(node.name);
      setModal({ type: 'rename', node });
    } else if (action === 'move') {
      setModal({ type: 'move', node });
    } else if (action === 'delete') {
      setModal({ type: 'delete', node });
    } else if (action === 'markLeaf') {
      try {
        await markAsLeaf.mutateAsync(node.id);
        showToast(`"${node.name}" marked as leaf`);
      } catch (e: unknown) {
        showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed', 'error');
      }
    } else if (action === 'unmarkLeaf') {
      try {
        await unmarkLeaf.mutateAsync(node.id);
        showToast(`"${node.name}" unmarked as leaf`);
      } catch (e: unknown) {
        showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed', 'error');
      }
    } else if (action === 'toggle') {
      try {
        await toggleActive.mutateAsync(node.id);
        showToast(`"${node.name}" ${node.active ? 'deactivated' : 'reactivated'}`);
      } catch (e: unknown) {
        showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed', 'error');
      }
    }
  };

  const handleSubmitCreate = async () => {
    if (!formName.trim()) return;
    try {
      if (modal?.type === 'createRoot') {
        await createCategory.mutateAsync({ name: formName.trim() });
        showToast('Root category created');
      } else if (modal?.type === 'addChild') {
        await createCategory.mutateAsync({ name: formName.trim(), parentId: modal.parent.id });
        showToast(`Child category added under "${modal.parent.name}"`);
      }
      closeModal();
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create', 'error');
    }
  };

  const handleSubmitRename = async () => {
    if (!formName.trim() || modal?.type !== 'rename') return;
    try {
      await renameCategory.mutateAsync({ id: modal.node.id, payload: { name: formName.trim(), forceRename } });
      showToast(`Renamed to "${formName.trim()}"`);
      closeModal();
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to rename', 'error');
    }
  };

  const handleSubmitMove = async () => {
    if (!newParentId || modal?.type !== 'move') return;
    try {
      await moveCategory.mutateAsync({ id: modal.node.id, newParentId: Number(newParentId) });
      showToast(`"${modal.node.name}" moved successfully`);
      closeModal();
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to move', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (modal?.type !== 'delete') return;
    try {
      await deleteCategory.mutateAsync(modal.node.id);
      showToast(`"${modal.node.name}" deleted`);
      closeModal();
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete', 'error');
    }
  };

  // Flatten tree for move dropdown
  const flattenTree = (cats: Category[], result: Category[] = []): Category[] => {
    for (const cat of cats) {
      result.push(cat);
      if (cat.children) flattenTree(cat.children, result);
    }
    return result;
  };
  const allCategories = flattenTree(tree ?? []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Tree</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the hierarchical category structure</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          <Button onClick={() => setModal({ type: 'createRoot' })} icon={<Plus className="w-4 h-4" />}>
            New Root Category
          </Button>
        </div>
      </div>

      <Card padding={false}>
        <CardHeader
          title="Category Hierarchy"
          description="Click the arrow to expand. Hover a row for actions."
        />
        <div className="px-2 pb-4">
          {isLoading ? (
            <div className="py-12 text-center text-gray-400">
              <div className="w-6 h-6 border-2 border-[#FFC107] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading categories...
            </div>
          ) : !tree || tree.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No categories found.</p>
              <Button className="mt-4" onClick={() => setModal({ type: 'createRoot' })} icon={<Plus className="w-4 h-4" />}>
                Create first category
              </Button>
            </div>
          ) : (
            tree.map((node) => (
              <TreeNode key={node.id} node={node} depth={0} onAction={handleAction} />
            ))
          )}
        </div>
      </Card>

      {/* Create Root / Add Child Modal */}
      <Modal
        open={modal?.type === 'createRoot' || modal?.type === 'addChild'}
        onClose={closeModal}
        title={modal?.type === 'createRoot' ? 'New Root Category' : `Add Child under "${(modal as { parent?: Category })?.parent?.name}"`}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. Équipements Industriels"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button
              onClick={handleSubmitCreate}
              loading={createCategory.isPending}
              disabled={!formName.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rename Modal */}
      <Modal open={modal?.type === 'rename'} onClose={closeModal} title="Rename Category" size="sm">
        <div className="space-y-4">
          <Input
            label="New Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            autoFocus
          />
          {(modal as { node?: Category })?.node?.nodeType === 'SEEDED' && (
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={forceRename}
                onChange={(e) => setForceRename(e.target.checked)}
                className="rounded"
              />
              Force rename (SEEDED node — requires SUPERADMIN)
            </label>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmitRename} loading={renameCategory.isPending} disabled={!formName.trim()}>
              Rename
            </Button>
          </div>
        </div>
      </Modal>

      {/* Move Modal */}
      <Modal open={modal?.type === 'move'} onClose={closeModal} title={`Move "${(modal as { node?: Category })?.node?.name}"`} size="sm">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">New Parent Category</label>
            <select
              value={newParentId}
              onChange={(e) => setNewParentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
            >
              <option value="">Select parent…</option>
              {allCategories
                .filter((c) => c.id !== (modal as { node?: Category })?.node?.id && c.nodeType !== 'LEAF')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {'  '.repeat(c.depth)}
                    {c.depth > 0 ? '└ ' : ''}
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmitMove} loading={moveCategory.isPending} disabled={!newParentId}>
              Move
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={modal?.type === 'delete'} onClose={closeModal} title="Delete Category" size="sm">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Are you sure you want to delete <strong>"{(modal as { node?: Category })?.node?.name}"</strong>?
              This cannot be undone. The category must have no children and no demandes.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmDelete} loading={deleteCategory.isPending}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
