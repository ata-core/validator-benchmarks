import { createRequire } from 'node:module'
import { Type, FormatRegistry } from '@sinclair/typebox'
const require = createRequire(import.meta.url)
// TypeBox formats from the same checkers ajv-formats uses.
const ff = require('ajv-formats/dist/formats.js').fullFormats
for (const name of ['uuid', 'email', 'date-time']) { const f = ff[name]; FormatRegistry.Set(name, f instanceof RegExp ? (s) => f.test(s) : typeof f === 'function' ? f : f.validate) }
export const TbOrder = Type.Object({
  id: Type.String({ format: 'uuid' }),
  customer: Type.Object({ id: Type.Integer({ minimum: 1 }), email: Type.String({ format: 'email' }), name: Type.String({ minLength: 1, maxLength: 100 }), phone: Type.Optional(Type.String({ maxLength: 20 })) }),
  items: Type.Array(Type.Object({ sku: Type.String({ pattern: '^[A-Z]{3}-\\d{4}$' }), name: Type.String({ minLength: 1, maxLength: 200 }), quantity: Type.Integer({ minimum: 1, maximum: 1000 }), unitPrice: Type.Number({ minimum: 0 }), currency: Type.Union([Type.Literal('USD'), Type.Literal('EUR'), Type.Literal('TRY')]) }), { minItems: 1, maxItems: 50 }),
  shippingAddress: Type.Object({ street: Type.String({ minLength: 1 }), city: Type.String({ minLength: 1 }), postalCode: Type.String({ minLength: 3, maxLength: 10 }), country: Type.String({ minLength: 2, maxLength: 2 }) }),
  createdAt: Type.String({ format: 'date-time' }),
  notes: Type.Optional(Type.String({ maxLength: 500 })),
  coupon: Type.Optional(Type.String()),
})
