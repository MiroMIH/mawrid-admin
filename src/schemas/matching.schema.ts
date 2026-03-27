import { z } from 'zod';

export const matchingSimulationSchema = z.object({
  categoryId: z.number({ message: 'Category is required' }),
  wilaya: z.string().min(1, 'Wilaya is required'),
  deadline: z.string().min(1, 'Deadline is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

export type MatchingSimulationFormData = z.infer<typeof matchingSimulationSchema>;
