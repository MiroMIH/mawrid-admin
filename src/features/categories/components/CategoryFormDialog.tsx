/**
 * CategoryFormDialog — handles both "Add category" and "Rename category" in one dialog.
 * Uses shadcn Dialog + Form + react-hook-form + Zod.
 */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useCategoryStore } from '../hooks/useCategoryStore';
import { useCreateCategory, useRenameCategory } from '../hooks/useCategoryQueries';
import { useToast } from '@/components/ui/Toast';

const schema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .refine((v) => !v.includes('.'), 'Name must not contain dots'),
});

type FormValues = z.infer<typeof schema>;

/** Dialog for creating a child category or renaming an existing one. */
export function CategoryFormDialog() {
  const { dialog, closeDialog, setSelectedId } = useCategoryStore();
  const { showToast } = useToast();
  const createCategory = useCreateCategory();
  const renameCategory = useRenameCategory();

  const isAdd = dialog?.type === 'addChild';
  const isRename = dialog?.type === 'rename';
  const open = isAdd || isRename;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });

  // Pre-fill name on rename
  useEffect(() => {
    if (isRename && dialog.type === 'rename') {
      form.reset({ name: dialog.node.name });
    } else {
      form.reset({ name: '' });
    }
  }, [dialog, isRename, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isAdd && dialog.type === 'addChild') {
        const created = await createCategory.mutateAsync({
          name: values.name.trim(),
          parentId: dialog.parentId,
        });
        showToast(
          dialog.parentId
            ? `Added "${values.name}" under "${dialog.parentName}"`
            : `Root category "${values.name}" created`,
        );
        setSelectedId(created.id);
        closeDialog();
      } else if (isRename && dialog.type === 'rename') {
        await renameCategory.mutateAsync({
          id: dialog.node.id,
          payload: {
            name: values.name.trim(),
            forceRename: dialog.node.nodeType === 'SEEDED',
          },
        });
        showToast(`Renamed to "${values.name.trim()}"`);
        closeDialog();
      }
    } catch (e: unknown) {
      showToast(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Operation failed',
        'error',
      );
    }
  };

  const isPending = createCategory.isPending || renameCategory.isPending;
  const isSeeded = isRename && dialog?.type === 'rename' && dialog.node.nodeType === 'SEEDED';
  const title = isAdd
    ? dialog?.type === 'addChild' && dialog.parentId
      ? `Add child under "${dialog.parentName}"`
      : 'New root category'
    : `Rename "${dialog?.type === 'rename' ? dialog.node.name : ''}"`;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeDialog()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
        </DialogHeader>

        {isSeeded && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              This is a <strong>seeded</strong> category. Renaming may affect existing data.
              Proceed with caution.
            </span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Équipements Industriels"
                      autoFocus
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-[#FFC107] text-[#111111] hover:bg-[#e6ac00] font-semibold"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isAdd ? 'Create' : 'Rename'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
