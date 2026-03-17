/**
 * CategoryAttributeTable — tabbed attribute schema viewer + inline add/edit form.
 */
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogFooter, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useCategoryAttributes, useDeleteAttribute } from '../hooks/useCategoryQueries';
import { CategoryAttributeForm } from './CategoryAttributeForm';
import { useToast } from '@/components/ui/Toast';
import type { CategoryAttributeResponse, AttributeType } from '../types/category.types';
import { motion, AnimatePresence } from 'framer-motion';

const typeColors: Record<AttributeType, string> = {
  TEXT:    'bg-blue-100 text-blue-700 border-blue-200',
  NUMBER:  'bg-violet-100 text-violet-700 border-violet-200',
  SELECT:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  BOOLEAN: 'bg-orange-100 text-orange-700 border-orange-200',
};

interface Props {
  categoryId: number;
}

/** Attribute schema section with Effective / Own tabs and inline add/edit. */
export function CategoryAttributeTable({ categoryId }: Props) {
  const { data: attrs, isLoading } = useCategoryAttributes(categoryId);
  const deleteAttr = useDeleteAttribute();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CategoryAttributeResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryAttributeResponse | null>(null);

  const effective = attrs ?? [];
  const own = effective.filter((a) => !a.inherited);

  const handleEdit = (attr: CategoryAttributeResponse) => {
    setEditing(attr);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleFormDone = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAttr.mutateAsync({ categoryId, attrId: deleteTarget.id });
      showToast(`Attribute "${deleteTarget.key}" deleted`);
      setDeleteTarget(null);
    } catch (e: unknown) {
      showToast(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Delete failed',
        'error',
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Attribute Schema</h3>
        {!showForm && (
          <Button
            size="sm"
            onClick={handleAddNew}
            className="h-7 px-3 text-xs bg-[#FFC107] text-[#111111] hover:bg-[#e6ac00] font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Attribute
          </Button>
        )}
      </div>

      <Tabs defaultValue="effective">
        <TabsList className="h-8">
          <TabsTrigger value="effective" className="text-xs h-7 px-3">
            Effective ({effective.length})
          </TabsTrigger>
          <TabsTrigger value="own" className="text-xs h-7 px-3">
            Own only ({own.length})
          </TabsTrigger>
        </TabsList>

        {(['effective', 'own'] as const).map((tab) => {
          const list = tab === 'effective' ? effective : own;
          return (
            <TabsContent key={tab} value={tab} className="mt-2">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                  ))}
                </div>
              ) : list.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                  {tab === 'own'
                    ? 'No own attributes — click Add Attribute to define the schema buyers see when posting in this category'
                    : 'No attributes defined'}
                </div>
              ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-border/60">
                        {['Key', 'Label', 'Type', 'Required', 'Order', 'Options', 'Source', ''].map((h) => (
                          <TableHead key={h} className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-2 first:pl-4 last:pr-4">
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {list.map((attr, i) => (
                          <motion.tr
                            key={attr.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="border-b border-border/40 hover:bg-muted/40 transition-colors"
                          >
                            {/* Key */}
                            <TableCell className="pl-4 py-2.5">
                              <span className="font-mono text-[11px] bg-[#FFC107]/10 text-[#111111] px-2 py-0.5 rounded border border-[#FFC107]/30">
                                {attr.key}
                              </span>
                            </TableCell>
                            {/* Label */}
                            <TableCell className="text-xs text-foreground py-2.5">
                              {attr.label}
                            </TableCell>
                            {/* Type */}
                            <TableCell className="py-2.5">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeColors[attr.type]}`}>
                                {attr.type}
                              </span>
                            </TableCell>
                            {/* Required */}
                            <TableCell className="py-2.5">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                attr.required
                                  ? 'bg-red-100 text-red-700 border-red-200'
                                  : 'bg-muted text-muted-foreground border-border'
                              }`}>
                                {attr.required ? 'Yes' : 'No'}
                              </span>
                            </TableCell>
                            {/* Order */}
                            <TableCell className="text-xs text-muted-foreground py-2.5 tabular-nums">
                              {attr.displayOrder}
                            </TableCell>
                            {/* Options */}
                            <TableCell className="py-2.5">
                              {attr.options?.length ? (
                                <div className="flex flex-wrap gap-1">
                                  {attr.options.slice(0, 3).map((o) => (
                                    <Badge key={o} variant="secondary" className="text-[10px] px-1.5 py-0">
                                      {o}
                                    </Badge>
                                  ))}
                                  {attr.options.length > 3 && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                      +{attr.options.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground/40 text-xs">—</span>
                              )}
                            </TableCell>
                            {/* Source */}
                            <TableCell className="py-2.5">
                              {attr.inherited ? (
                                <span className="text-[10px] text-muted-foreground">
                                  ↑ {attr.inheritedFrom ?? 'ancestor'}
                                  {attr.overrides && (
                                    <span className="ml-1 text-[#FFC107] font-semibold">override</span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-[#FFC107]">own</span>
                              )}
                            </TableCell>
                            {/* Actions */}
                            <TableCell className="pr-4 py-2.5 text-right">
                              <div className="flex items-center gap-1 justify-end">
                                <button
                                  onClick={() => handleEdit(attr)}
                                  disabled={attr.inherited}
                                  className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(attr)}
                                  disabled={attr.inherited}
                                  className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Inline form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <CategoryAttributeForm
              categoryId={categoryId}
              editing={editing}
              onDone={handleFormDone}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent className="sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">
              Delete attribute "{deleteTarget?.key}"?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-muted-foreground">
            This will remove the attribute from this category's schema. Existing demandes that
            used this attribute may be affected.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteAttr.isPending}
            >
              {deleteAttr.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
