import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh Token is required'),
  }),
});
