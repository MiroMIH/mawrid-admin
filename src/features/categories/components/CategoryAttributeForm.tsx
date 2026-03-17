/**
 * CategoryAttributeForm — inline form for adding or editing an attribute.
 */
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, Plus } from 'lucide-react';
import { useAddAttribute, useUpdateAttribute } from '../hooks/useCategoryQueries';
import { useToast } from '@/components/ui/Toast';
import type { CategoryAttributeResponse, AttributeType } from '../types/category.types';
import { cn } from '@/lib/utils';

const schema = z.object({
  key: z
    .string()
    .min(1, 'Key required')
    .regex(/^[a-z][a-z0-9_]*$/, 'Lowercase letters, digits, and underscores only'),
  label: z.string().min(1, 'Label required'),
  type: z.enum(['TEXT', 'NUMBER', 'SELECT', 'BOOLEAN']),
  required: z.boolean(),
  displayOrder: z.number().int().min(0),
});

type FormValues = z.infer<typeof schema>;

const TYPES: AttributeType[] = ['TEXT', 'NUMBER', 'SELECT', 'BOOLEAN'];

const typeColors: Record<AttributeType, string> = {
  TEXT: 'bg-blue-100 text-blue-700 border-blue-200',
  NUMBER: 'bg-violet-100 text-violet-700 border-violet-200',
  SELECT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  BOOLEAN: 'bg-orange-100 text-orange-700 border-orange-200',
};

interface CategoryAttributeFormProps {
  categoryId: number;
  editing?: CategoryAttributeResponse | null;
  onDone: () => void;
}

/** Inline form rendered below the attribute table. */
export function CategoryAttributeForm({ categoryId, editing, onDone }: CategoryAttributeFormProps) {
  const { showToast } = useToast();
  const addAttr = useAddAttribute();
  const updateAttr = useUpdateAttribute();
  const [options, setOptions] = useState<string[]>([]);
  const [optionInput, setOptionInput] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      key: '',
      label: '',
      type: 'TEXT',
      required: false,
      displayOrder: 0,
    },
  });

  const watchType = form.watch('type');

  useEffect(() => {
    if (editing) {
      form.reset({
        key: editing.key,
        label: editing.label,
        type: editing.type,
        required: editing.required,
        displayOrder: editing.displayOrder,
      });
      setOptions(editing.options ?? []);
    } else {
      form.reset({ key: '', label: '', type: 'TEXT', required: false, displayOrder: 0 });
      setOptions([]);
    }
  }, [editing, form]);

  const addOption = () => {
    const trimmed = optionInput.trim();
    if (trimmed && !options.includes(trimmed)) {
      setOptions((prev) => [...prev, trimmed]);
    }
    setOptionInput('');
  };

  const removeOption = (opt: string) => setOptions((prev) => prev.filter((o) => o !== opt));

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      options: values.type === 'SELECT' ? options : undefined,
    };
    try {
      if (editing) {
        await updateAttr.mutateAsync({ categoryId, attrId: editing.id, payload });
        showToast(`Attribute "${values.key}" updated`);
      } else {
        await addAttr.mutateAsync({ categoryId, payload });
        showToast(`Attribute "${values.key}" added`);
      }
      onDone();
    } catch (e: unknown) {
      showToast(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Failed',
        'error',
      );
    }
  };

  const isPending = addAttr.isPending || updateAttr.isPending;

  return (
    <div className="border border-[#FFC107]/40 rounded-lg bg-[#FFC107]/5 p-4">
      <p className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
        {editing ? 'Edit attribute' : 'Add attribute'}
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Key</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. material_type" className="h-8 text-xs font-mono" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Label (FR)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Type de matériau" className="h-8 text-xs" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Type selector */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Type</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-1.5">
                      {TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => field.onChange(t)}
                          className={cn(
                            'text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all',
                            field.value === t
                              ? typeColors[t]
                              : 'bg-muted text-muted-foreground border-border hover:border-foreground',
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Required toggle */}
            <FormField
              control={form.control}
              name="required"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Required</FormLabel>
                  <FormControl>
                    <button
                      type="button"
                      onClick={() => field.onChange(!field.value)}
                      className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all',
                        field.value
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : 'bg-muted text-muted-foreground border-border',
                      )}
                    >
                      {field.value ? 'Yes' : 'No'}
                    </button>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Display order */}
            <FormField
              control={form.control}
              name="displayOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="h-8 text-xs w-20"
                      min={0}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Options (SELECT only) */}
          {watchType === 'SELECT' && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-foreground">Options</p>
              <div className="flex flex-wrap gap-1.5 min-h-7">
                {options.map((opt) => (
                  <Badge
                    key={opt}
                    variant="secondary"
                    className="text-xs gap-1 pr-1 cursor-default"
                  >
                    {opt}
                    <button type="button" onClick={() => removeOption(opt)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addOption();
                    }
                  }}
                  placeholder="Type option and press Enter"
                  className="h-8 text-xs flex-1"
                />
                <Button type="button" variant="outline" size="sm" className="h-8" onClick={addOption}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={onDone}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="h-8 text-xs bg-[#FFC107] text-[#111111] hover:bg-[#e6ac00] font-semibold"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editing ? 'Save' : 'Add'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
