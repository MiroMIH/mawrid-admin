import { useState } from 'react';
import { useCategoryTree, useCategoryAttributes, useAddAttribute, useUpdateAttribute, useDeleteAttribute } from '../hooks/useCategories';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import type { Category, Attribute, AttributeType } from '../types';
import { Plus, Pencil, Trash2, FolderOpen, Tags, ChevronRight } from 'lucide-react';

function attrTypeBadge(type: AttributeType) {
  const map: Record<AttributeType, 'default' | 'info' | 'success'> = {
    TEXT: 'default',
    NUMBER: 'info',
    SELECT: 'success',
  };
  return <Badge variant={map[type]}>{type}</Badge>;
}

interface AttrFormState {
  key: string;
  label: string;
  type: AttributeType;
  required: boolean;
  displayOrder: number;
  options: string;
}

const defaultForm: AttrFormState = {
  key: '',
  label: '',
  type: 'TEXT',
  required: false,
  displayOrder: 1,
  options: '',
};

export function AttributesPage() {
  const { data: tree } = useCategoryTree();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const { data: attributes, isLoading: attrsLoading } = useCategoryAttributes(selectedCategoryId ?? 0);

  const addAttribute = useAddAttribute();
  const updateAttribute = useUpdateAttribute();
  const deleteAttribute = useDeleteAttribute();
  const { showToast } = useToast();

  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);
  const [form, setForm] = useState<AttrFormState>(defaultForm);

  const flattenTree = (cats: Category[], result: { cat: Category; depth: number }[] = []): typeof result => {
    for (const cat of cats) {
      result.push({ cat, depth: cat.depth });
      if (cat.children) flattenTree(cat.children, result);
    }
    return result;
  };
  const flatCategories = flattenTree(tree ?? []);

  const openAdd = () => {
    setForm(defaultForm);
    setEditingAttr(null);
    setModal('add');
  };

  const openEdit = (attr: Attribute) => {
    setEditingAttr(attr);
    setForm({
      key: attr.key,
      label: attr.label,
      type: attr.type,
      required: attr.required,
      displayOrder: attr.displayOrder,
      options: attr.options?.join(', ') ?? '',
    });
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditingAttr(null);
    setForm(defaultForm);
  };

  const buildPayload = () => ({
    key: form.key.trim(),
    label: form.label.trim(),
    type: form.type,
    required: form.required,
    displayOrder: form.displayOrder,
    options: form.type === 'SELECT'
      ? form.options.split(',').map((o) => o.trim()).filter(Boolean)
      : undefined,
  });

  const handleSave = async () => {
    if (!selectedCategoryId) return;
    try {
      if (modal === 'add') {
        await addAttribute.mutateAsync({ categoryId: selectedCategoryId, payload: buildPayload() });
        showToast('Attribute added');
      } else if (modal === 'edit' && editingAttr) {
        await updateAttribute.mutateAsync({ categoryId: selectedCategoryId, attrId: editingAttr.id, payload: buildPayload() });
        showToast('Attribute updated');
      }
      closeModal();
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed', 'error');
    }
  };

  const handleDelete = async (attr: Attribute) => {
    if (!selectedCategoryId || !confirm(`Delete attribute "${attr.label}"?`)) return;
    try {
      await deleteAttribute.mutateAsync({ categoryId: selectedCategoryId, attrId: attr.id });
      showToast('Attribute deleted');
    } catch (e: unknown) {
      showToast((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed — attribute may be in use', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Category Attributes</h1>
        <p className="text-sm text-gray-500 mt-1">Manage attributes for each category. Child categories inherit parent attributes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category selector */}
        <Card padding={false} className="lg:col-span-1">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Select Category</h2>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {flatCategories.map(({ cat, depth }) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors
                  ${selectedCategoryId === cat.id ? 'bg-[#FFC107]/10 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                style={{ paddingLeft: `${depth * 16 + 16}px` }}
              >
                {depth > 0 && <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />}
                <FolderOpen className="w-4 h-4 text-[#FFC107] flex-shrink-0" />
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
            {flatCategories.length === 0 && (
              <p className="text-sm text-gray-400 p-4">No categories available</p>
            )}
          </div>
        </Card>

        {/* Attributes panel */}
        <div className="lg:col-span-2">
          <Card padding={false}>
            <CardHeader
              title={selectedCategoryId
                ? `Attributes — ${flatCategories.find((f) => f.cat.id === selectedCategoryId)?.cat.name ?? ''}`
                : 'Select a category'}
              description={selectedCategoryId ? 'Direct and inherited attributes' : 'Choose a category from the left panel'}
              action={selectedCategoryId ? (
                <Button size="sm" onClick={openAdd} icon={<Plus className="w-4 h-4" />}>
                  Add Attribute
                </Button>
              ) : undefined}
            />

            {!selectedCategoryId ? (
              <div className="py-16 text-center text-gray-400">
                <Tags className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Select a category to manage its attributes</p>
              </div>
            ) : attrsLoading ? (
              <div className="py-12 text-center">
                <div className="w-5 h-5 border-2 border-[#FFC107] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : !attributes || attributes.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <p className="mb-3">No attributes defined for this category</p>
                <Button size="sm" onClick={openAdd} icon={<Plus className="w-4 h-4" />}>Add first attribute</Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {attributes.map((attr) => (
                  <div
                    key={attr.id}
                    className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors
                      ${attr.inherited ? 'opacity-70' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">{attr.label}</span>
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-600">{attr.key}</code>
                        {attrTypeBadge(attr.type)}
                        {attr.required && <Badge variant="warning">Required</Badge>}
                        {attr.inherited && <Badge variant="info">Inherited</Badge>}
                      </div>
                      {attr.type === 'SELECT' && attr.options && (
                        <p className="text-xs text-gray-400 mt-1">
                          Options: {attr.options.join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">Order: {attr.displayOrder}</p>
                    </div>
                    {!attr.inherited && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(attr)}
                          className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(attr)}
                          className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add / Edit Attribute Modal */}
      <Modal
        open={modal !== null}
        onClose={closeModal}
        title={modal === 'add' ? 'Add Attribute' : 'Edit Attribute'}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Key"
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              placeholder="e.g. marque"
              hint="Lowercase letters and underscores only"
              disabled={modal === 'edit'}
            />
            <Input
              label="Label"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="e.g. Brand name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AttributeType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
              >
                <option value="TEXT">TEXT</option>
                <option value="NUMBER">NUMBER</option>
                <option value="SELECT">SELECT</option>
              </select>
            </div>
            <Input
              label="Display Order"
              type="number"
              value={form.displayOrder}
              onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))}
              min={1}
            />
          </div>

          {form.type === 'SELECT' && (
            <Input
              label="Options (comma separated)"
              value={form.options}
              onChange={(e) => setForm((f) => ({ ...f, options: e.target.value }))}
              placeholder="Neuf, Occasion, Reconditionné"
            />
          )}

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.required}
              onChange={(e) => setForm((f) => ({ ...f, required: e.target.checked }))}
              className="rounded"
            />
            Required field
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button
              onClick={handleSave}
              loading={addAttribute.isPending || updateAttribute.isPending}
              disabled={!form.key || !form.label}
            >
              {modal === 'add' ? 'Add Attribute' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
