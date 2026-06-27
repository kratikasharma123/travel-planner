import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().email('Please enter a valid email').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
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
