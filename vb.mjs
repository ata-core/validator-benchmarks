import * as v from 'valibot'
export const VbOrder = v.object({
  id: v.pipe(v.string(), v.uuid()),
  customer: v.object({ id: v.pipe(v.number(), v.integer(), v.minValue(1)), email: v.pipe(v.string(), v.email()), name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)), phone: v.optional(v.pipe(v.string(), v.maxLength(20))) }),
  items: v.pipe(v.array(v.object({ sku: v.pipe(v.string(), v.regex(/^[A-Z]{3}-\d{4}$/)), name: v.pipe(v.string(), v.minLength(1), v.maxLength(200)), quantity: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(1000)), unitPrice: v.pipe(v.number(), v.minValue(0)), currency: v.picklist(['USD', 'EUR', 'TRY']) })), v.minLength(1), v.maxLength(50)),
  shippingAddress: v.object({ street: v.pipe(v.string(), v.minLength(1)), city: v.pipe(v.string(), v.minLength(1)), postalCode: v.pipe(v.string(), v.minLength(3), v.maxLength(10)), country: v.pipe(v.string(), v.length(2)) }),
  createdAt: v.pipe(v.string(), v.isoTimestamp()),
  notes: v.optional(v.pipe(v.string(), v.maxLength(500))),
  coupon: v.optional(v.string()),
})
