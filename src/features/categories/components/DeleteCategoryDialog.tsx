/**
 * DeleteCategoryDialog — type-to-confirm delete with business-rule checks.
 */
import { useState } from 'react';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogFooter, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { useCategoryStore } from '../hooks/useCategoryStore';
import { useDeleteCategory } from '../hooks/useCategoryQueries';
import { useToast } from '@/components/ui/Toast';

/** Confirms deletion. Checks for children and demandes. Requires typing node name. */
export function DeleteCategoryDialog() {
  const { dialog, closeDialog, setSelectedId } = useCategoryStore();
  const { showToast } = useToast();
  const deleteCategory = useDeleteCategory();
  const [typed, setTyped] = useState('');

  const open = dialog?.type === 'delete';
  const node = dialog?.type === 'delete' ? dialog.node : null;

  const hasChildren = (node?.children.length ?? 0) > 0;
  const hasDemandes = (node?.demandeCount ?? 0) > 0;
  const canDelete = !hasChildren && !hasDemandes;
  const confirmed = typed === node?.name;

  const handleDelete = async () => {
    if (!node || !canDelete || !confirmed) return;
    try {
      await deleteCategory.mutateAsync(node.id);
      showToast(`"${node.name}" deleted`);
      setSelectedId(null);
      setTyped('');
      closeDialog();
    } catch (e: unknown) {
      showToast(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Delete failed',
        'error',
      );
    }
  };

  const handleClose = () => {
    setTyped('');
    closeDialog();
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-4 h-4" />
            Delete category
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4 py-1">
          {/* Node name display */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Category</p>
            <p className="font-semibold text-foreground">{node?.name}</p>
          </div>

          {/* Business rule errors */}
          {hasChildren && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Cannot delete — this category has{' '}
                <strong>{node?.children.length} children</strong>. Move or delete all
                subcategories first.
              </span>
            </div>
          )}

          {hasDemandes && !hasChildren && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Cannot delete — <strong>{node?.demandeCount} demandes</strong> reference this
                category.
              </span>
            </div>
          )}

          {/* Type-to-confirm */}
          {canDelete && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This action <strong className="text-foreground">cannot be undone</strong>. Type the
                category name to confirm:
              </p>
              <Input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={node?.name}
                className={
                  typed && !confirmed
                    ? 'border-destructive focus-visible:ring-destructive'
                    : ''
                }
                autoFocus
              />
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete || !confirmed || deleteCategory.isPending}
          >
            {deleteCategory.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
