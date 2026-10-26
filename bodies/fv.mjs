// The user and order bodies as a fastest-validator user would write them.
// fastest-validator has no rule for an RFC 3339 date-time string (its `date`
// rule takes Date objects), so createdAt is a string with a pattern that
// accepts the corpus's shape: a date, a time with optional fraction, Z or an
// offset. Every field is required unless marked optional, as in the JSON
// Schema. The user body is closed (`$$strict`), the order is open, as the
// JSON Schema says.
export const FvUser = {
  $$strict: true,
  email: { type: 'email', max: 128 },
  name: { type: 'string', min: 1, max: 80 },
  age: { type: 'number', integer: true, min: 13, max: 130 },
  newsletter: { type: 'boolean', optional: true },
}

export const FvOrder = {
  id: { type: 'uuid' },
  customer: {
    type: 'object',
    props: {
      id: { type: 'number', integer: true, min: 1 },
      email: { type: 'email' },
      name: { type: 'string', min: 1, max: 100 },
      phone: { type: 'string', max: 20, optional: true },
    },
  },
  items: {
    type: 'array',
    min: 1,
    max: 50,
    items: {
      type: 'object',
      props: {
        sku: { type: 'string', pattern: /^[A-Z]{3}-\d{4}$/ },
        name: { type: 'string', min: 1, max: 200 },
        quantity: { type: 'number', integer: true, min: 1, max: 1000 },
        unitPrice: { type: 'number', min: 0 },
        currency: { type: 'enum', values: ['USD', 'EUR', 'TRY'] },
      },
    },
  },
  shippingAddress: {
    type: 'object',
    props: {
      street: { type: 'string', min: 1 },
      city: { type: 'string', min: 1 },
      postalCode: { type: 'string', min: 3, max: 10 },
      country: { type: 'string', length: 2 },
    },
  },
  createdAt: { type: 'string', pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/ },
  notes: { type: 'string', max: 500, optional: true },
  coupon: { type: 'string', optional: true },
}
