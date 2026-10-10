// The same order, written the way a zod user and a JSON Schema user would each
// write it.
import { z } from 'zod'

export const ZodOrder = z.object({
  id: z.uuid(),
  customer: z.object({
    id: z.number().int().min(1),
    email: z.email(),
    name: z.string().min(1).max(100),
    phone: z.string().max(20).optional(),
  }),
  items: z.array(z.object({
    sku: z.string().regex(/^[A-Z]{3}-\d{4}$/),
    name: z.string().min(1).max(200),
    quantity: z.number().int().min(1).max(1000),
    unitPrice: z.number().min(0),
    currency: z.enum(['USD', 'EUR', 'TRY']),
  })).min(1).max(50),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().min(3).max(10),
    country: z.string().length(2),
  }),
  createdAt: z.iso.datetime({ offset: true }),
  notes: z.string().max(500).optional(),
  coupon: z.string().optional(),
})

export const JsonOrder = {
  type: 'object',
  required: ['id', 'customer', 'items', 'shippingAddress', 'createdAt'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    customer: {
      type: 'object',
      required: ['id', 'email', 'name'],
      properties: {
        id: { type: 'integer', minimum: 1 },
        email: { type: 'string', format: 'email' },
        name: { type: 'string', minLength: 1, maxLength: 100 },
        phone: { type: 'string', maxLength: 20 },
      },
    },
    items: {
      type: 'array', minItems: 1, maxItems: 50,
      items: {
        type: 'object',
        required: ['sku', 'name', 'quantity', 'unitPrice', 'currency'],
        properties: {
          sku: { type: 'string', pattern: '^[A-Z]{3}-\\d{4}$' },
          name: { type: 'string', minLength: 1, maxLength: 200 },
          quantity: { type: 'integer', minimum: 1, maximum: 1000 },
          unitPrice: { type: 'number', minimum: 0 },
          currency: { type: 'string', enum: ['USD', 'EUR', 'TRY'] },
        },
      },
    },
    shippingAddress: {
      type: 'object',
      required: ['street', 'city', 'postalCode', 'country'],
      properties: {
        street: { type: 'string', minLength: 1 },
        city: { type: 'string', minLength: 1 },
        postalCode: { type: 'string', minLength: 3, maxLength: 10 },
        country: { type: 'string', minLength: 2, maxLength: 2 },
      },
    },
    createdAt: { type: 'string', format: 'date-time' },
    notes: { type: 'string', maxLength: 500 },
    coupon: { type: 'string' },
  },
}
