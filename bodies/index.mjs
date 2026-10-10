// The bodies every scene runs on. Each has the JSON Schema, the documents
// (valid and invalid sets, parsed once), and where one was written, the same
// schema as a zod, valibot and typebox user would write it. A body without an
// equivalent is simply not run for that library, and the report says so.
import { readFileSync } from 'node:fs'
import { z } from 'zod'
import * as v from 'valibot'
import { Type } from '@sinclair/typebox'
import { JsonOrder, ZodOrder } from './order.schemas.mjs'
import { TbOrder } from './order.typebox.mjs'
import { VbOrder } from './order.valibot.mjs'

const here = (f) => new URL(f, import.meta.url)
const json = (f) => JSON.parse(readFileSync(here(f), 'utf8'))

// A deterministic generator: the same documents on every machine.
let seed = 0x9e3779b9
const rnd = (n) => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) % n }
const pick = (a) => a[rnd(a.length)]

// user: the four-field body of the Hono starter. Small, the shape of a
// sign-up form or a query string.
const userSchema = json('./user.schema.json')
const names = ['Ada', 'Grace', 'Linus', 'Mert', 'Yusuke', 'Barbara', 'Dennis', 'Ken', 'Radia', 'Margaret']
const domains = ['example.com', 'mail.test', 'company.org', 'uni.edu']
const users = { valid: [], invalid: [] }
for (let i = 0; i < 900; i++) {
  const d = { email: `${pick(names).toLowerCase()}.${rnd(10000)}@${pick(domains)}`, name: pick(names) + (rnd(3) ? ' ' + pick(names) : ''), age: 13 + rnd(80) }
  if (rnd(2)) d.newsletter = rnd(2) === 1
  users.valid.push(d)
  const bad = structuredClone(d)
  switch (i % 4) { case 0: bad.email = 'not-an-email'; break; case 1: bad.age = 7; break; case 2: delete bad.name; break; default: bad.extra = 1 }
  users.invalid.push(bad)
}
const ZodUser = z.object({ email: z.email().max(128), name: z.string().min(1).max(80), age: z.number().int().min(13).max(130), newsletter: z.boolean().optional() }).strict()
const VbUser = v.strictObject({ email: v.pipe(v.string(), v.email(), v.maxLength(128)), name: v.pipe(v.string(), v.minLength(1), v.maxLength(80)), age: v.pipe(v.number(), v.integer(), v.minValue(13), v.maxValue(130)), newsletter: v.optional(v.boolean()) })
const TbUser = Type.Object({ email: Type.String({ format: 'email', maxLength: 128 }), name: Type.String({ minLength: 1, maxLength: 80 }), age: Type.Integer({ minimum: 13, maximum: 130 }), newsletter: Type.Optional(Type.Boolean()) }, { additionalProperties: false })

// order: customer, items with a sku pattern, address, uuid/email/date-time.
// The corpus marks 100 of its 1000 orders invalid; the valid set is the other
// 900 and the invalid set breaks each of those in one of three places.
const orderCorpus = json('./order.corpus.json').filter((c) => c.valid !== false).map((c) => JSON.parse(c.text))
const orders = {
  valid: orderCorpus,
  invalid: orderCorpus.map((d, i) => { const x = structuredClone(d); if (i % 3 === 0) x.customer.email = 'not-an-email'; else if (i % 3 === 1 && x.items.length) x.items[0].quantity = 0; else delete x.shippingAddress.city; return x }),
}

// config: a 25-section configuration document, 30 KB of schema and 10 KB of
// document, the shape of a service or tool configuration (sections of 20 to
// 40 keys, shared definitions, additionalProperties false). JSON Schema
// libraries only: no zod, valibot or typebox version was written for it.
const configSchema = json('./config.schema.json')
const configValid = json('./config.valid.json')
function breakConfig (doc, i) {
  const x = structuredClone(doc); const keys = Object.keys(x); const sec = x[keys[i % keys.length]]
  const k = Object.keys(sec)[(i * 7) % Object.keys(sec).length]
  const val = sec[k]
  if (typeof val === 'number') sec[k] = 'twelve'; else if (typeof val === 'string') sec[k] = 12.5; else if (typeof val === 'boolean') sec[k] = 'yes'; else sec.unknownKey = 1
  return x
}
const configs = { valid: Array.from({ length: 120 }, () => structuredClone(configValid)), invalid: Array.from({ length: 120 }, (_, i) => breakConfig(configValid, i)) }

export const bodies = {
  user: { schema: userSchema, zod: ZodUser, valibot: VbUser, typebox: TbUser, docs: users, about: '4 fields, a sign-up form' },
  order: { schema: JsonOrder, zod: ZodOrder, valibot: VbOrder, typebox: TbOrder, docs: orders, about: 'customer, items, address, formats and a pattern' },
  config: { schema: configSchema, docs: configs, about: '25 sections, 30 KB schema, 10 KB document' },
}

for (const [name, b] of Object.entries(bodies)) b.name = name
