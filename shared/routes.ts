import { z } from 'zod';
import { insertMerchantSchema, insertApiKeySchema, merchants, apiKeys, transactions, insertTransactionSchema } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  merchants: {
    me: {
      method: 'GET' as const,
      path: '/api/merchants/me',
      responses: {
        200: z.custom<typeof merchants.$inferSelect>(),
        404: errorSchemas.notFound, // Not found means user hasn't created a merchant profile yet
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/merchants',
      input: insertMerchantSchema,
      responses: {
        201: z.custom<typeof merchants.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  apiKeys: {
    list: {
      method: 'GET' as const,
      path: '/api/keys',
      responses: {
        200: z.array(z.custom<typeof apiKeys.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/keys',
      input: insertApiKeySchema,
      responses: {
        201: z.custom<typeof apiKeys.$inferSelect & { rawKey: string }>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/keys/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  transactions: {
    list: {
      method: 'GET' as const,
      path: '/api/transactions',
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect>()),
      },
    },
    // Public API for creating a transaction (requires API key header)
    create: {
      method: 'POST' as const,
      path: '/api/public/transactions',
      input: insertTransactionSchema,
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    // Public API for fetching transaction details (for checkout page)
    getPublic: {
      method: 'GET' as const,
      path: '/api/public/transactions/:id',
      responses: {
        200: z.custom<typeof transactions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    // Public API for processing payment (simulated)
    process: {
      method: 'POST' as const,
      path: '/api/public/process/:id',
      input: z.object({
        cardNumber: z.string(),
        cvv: z.string(),
        expiry: z.string(),
      }),
      responses: {
        200: z.custom<typeof transactions.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
};

// ============================================
// BUILD URL HELPER
// ============================================
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
