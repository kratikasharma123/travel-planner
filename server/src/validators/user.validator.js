import { z } from 'zod';

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80).optional(),
  travelPreferences: z
    .object({
      preferredBudgetRange: z.string().trim().max(80).optional(),
      preferredTravelStyle: z.string().trim().max(80).optional(),
      interests: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
    })
    .optional(),
});

export const preferencesUpdateSchema = z.object({
  preferredBudgetRange: z.string().trim().max(80).optional(),
  preferredTravelStyle: z.string().trim().max(80).optional(),
  interests: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
});

export function validate(schema, payload) {
  const result = schema.safeParse(payload);

  if (result.success) {
    return { data: result.data, errors: null };
  }

  return {
    data: null,
    errors: result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  };
}
