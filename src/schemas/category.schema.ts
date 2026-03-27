import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  parentId: z.number().optional(),
});

export const renameCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  forceRename: z.boolean().default(false),
});

export const moveCategorySchema = z.object({
  newParentId: z.number({ message: 'Please select a parent category' }),
});

export const attributeSchema = z.object({
  key: z.string().min(1, 'Key is required').regex(/^[a-z_]+$/, 'Only lowercase letters and underscores'),
  label: z.string().min(1, 'Label is required'),
  type: z.enum(['TEXT', 'SELECT', 'NUMBER']),
  required: z.boolean().default(false),
  displayOrder: z.number().min(1).default(1),
  options: z.string().optional(),
});

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type RenameCategoryFormData = z.infer<typeof renameCategorySchema>;
export type MoveCategoryFormData = z.infer<typeof moveCategorySchema>;
export type AttributeFormData = z.infer<typeof attributeSchema>;
