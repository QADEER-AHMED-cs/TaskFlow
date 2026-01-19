import { z } from 'zod';
import { insertUserSchema, insertTaskSchema, tasks, users, aiPrioritySchema, aiSummarizeSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    sendOtp: {
      method: 'POST' as const,
      path: '/api/send-otp',
      input: z.object({
        email: z.string().email(),
        password: z.string(),
        name: z.string(),
      }),
      responses: {
        200: z.object({ message: z.string() }),
        400: errorSchemas.validation,
      },
    },
    verifyOtp: {
      method: 'POST' as const,
      path: '/api/verify-otp',
      input: z.object({
        email: z.string().email(),
        otp: z.string(),
        password: z.string(),
        name: z.string(),
      }),
      responses: {
        201: z.custom<UserWithoutPassword>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<UserWithoutPassword>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<UserWithoutPassword>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks',
      responses: {
        200: z.array(z.custom<typeof tasks.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tasks/:id',
      responses: {
        200: z.custom<typeof tasks.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tasks',
      input: insertTaskSchema,
      responses: {
        201: z.custom<typeof tasks.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/tasks/:id',
      input: insertTaskSchema.partial(),
      responses: {
        200: z.custom<typeof tasks.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tasks/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  ai: {
    prioritize: {
      method: 'POST' as const,
      path: '/api/ai/prioritize',
      input: aiPrioritySchema,
      responses: {
        200: z.object({ priority: z.enum(['low', 'medium', 'high']), reason: z.string() }),
        500: errorSchemas.internal,
      },
    },
    summarize: {
      method: 'POST' as const,
      path: '/api/ai/summarize',
      input: aiSummarizeSchema,
      responses: {
        200: z.object({ summary: z.string() }),
        500: errorSchemas.internal,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// Helper type to exclude password from user response
type UserWithoutPassword = Omit<typeof users.$inferSelect, 'password'>;
