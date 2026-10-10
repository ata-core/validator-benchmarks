// Validations per second of one realistic API body (an order: customer, items,
// address, uuid/email/date-time formats, a sku pattern) across validators.
// Every library sees the same 1000 orders, parsed once; rounds are interleaved
// and the median of 9 is kept. Output: results.json for the race page.
//   node bench.mjs [valid|invalid]
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { validator as schemasafe } from '@exodus/schemasafe'
import { Validator as CfWorker } from '@cfworker/json-schema'
import { z } from 'zod'
import * as v from 'valibot'
import { Type, FormatRegistry } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
const require = createRequire(import.meta.url)
const { Validator } = require('ata-validator')
const { toStandaloneModule } = require('ata-validator/aot')

const { JsonOrder, ZodOrder } = await import('./schemas.mjs')
const mode = process.argv[2] || 'valid'
// Only the orders the corpus marks valid, so every library agrees on every
// document; the invalid set breaks each of them in one of three places.
const corpus = JSON.parse(readFileSync(new URL('./corpus.json', import.meta.url), 'utf8')).filter((c) => c.valid !== false).map((c) => JSON.parse(c.text))
const docs = mode === 'valid' ? corpus : corpus.map((d, i) => { const x = structuredClone(d); if (i % 3 === 0) x.customer.email = 'not-an-email'; else if (i % 3 === 1 && x.items.length) x.items[0].quantity = 0; else delete x.shippingAddress.city; return x })

// TypeBox formats from the same checkers ajv-formats uses.
const ff = require('ajv-formats/dist/formats.js').fullFormats
for (const name of ['uuid', 'email', 'date-time']) { const f = ff[name]; FormatRegistry.Set(name, f instanceof RegExp ? (s) => f.test(s) : typeof f === 'function' ? f : f.validate) }
const TbOrder = Type.Object({
  id: Type.String({ format: 'uuid' }),
  customer: Type.Object({ id: Type.Integer({ minimum: 1 }), email: Type.String({ format: 'email' }), name: Type.String({ minLength: 1, maxLength: 100 }), phone: Type.Optional(Type.String({ maxLength: 20 })) }),
  items: Type.Array(Type.Object({ sku: Type.String({ pattern: '^[A-Z]{3}-\\d{4}$' }), name: Type.String({ minLength: 1, maxLength: 200 }), quantity: Type.Integer({ minimum: 1, maximum: 1000 }), unitPrice: Type.Number({ minimum: 0 }), currency: Type.Union([Type.Literal('USD'), Type.Literal('EUR'), Type.Literal('TRY')]) }), { minItems: 1, maxItems: 50 }),
  shippingAddress: Type.Object({ street: Type.String({ minLength: 1 }), city: Type.String({ minLength: 1 }), postalCode: Type.String({ minLength: 3, maxLength: 10 }), country: Type.String({ minLength: 2, maxLength: 2 }) }),
  createdAt: Type.String({ format: 'date-time' }),
  notes: Type.Optional(Type.String({ maxLength: 500 })),
  coupon: Type.Optional(Type.String()),
})
const VbOrder = v.object({
  id: v.pipe(v.string(), v.uuid()),
  customer: v.object({ id: v.pipe(v.number(), v.integer(), v.minValue(1)), email: v.pipe(v.string(), v.email()), name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)), phone: v.optional(v.pipe(v.string(), v.maxLength(20))) }),
  items: v.pipe(v.array(v.object({ sku: v.pipe(v.string(), v.regex(/^[A-Z]{3}-\d{4}$/)), name: v.pipe(v.string(), v.minLength(1), v.maxLength(200)), quantity: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(1000)), unitPrice: v.pipe(v.number(), v.minValue(0)), currency: v.picklist(['USD', 'EUR', 'TRY']) })), v.minLength(1), v.maxLength(50)),
  shippingAddress: v.object({ street: v.pipe(v.string(), v.minLength(1)), city: v.pipe(v.string(), v.minLength(1)), postalCode: v.pipe(v.string(), v.minLength(3), v.maxLength(10)), country: v.pipe(v.string(), v.length(2)) }),
  createdAt: v.pipe(v.string(), v.isoTimestamp()),
  notes: v.optional(v.pipe(v.string(), v.maxLength(500))),
  coupon: v.optional(v.string()),
})

const ata = new Validator(JsonOrder)
writeFileSync('./order.compiled.mjs', toStandaloneModule(ata, { format: 'esm' }))
const compiled = await import('./order.compiled.mjs')
const ajv = new Ajv2020({ allErrors: false }); addFormats(ajv); const af = ajv.compile(JsonOrder)
const ss = schemasafe(JsonOrder, { includeErrors: false })
const cf = new CfWorker(JsonOrder, '2020-12', false)
const tb = TypeCompiler.Compile(TbOrder)

const impls = {
  'ata (compiled)': (d) => compiled.isValid(d),
  ata: (d) => ata.validate(d).valid,
  ajv: (d) => af(d),
  '@exodus/schemasafe': (d) => ss(d),
  typebox: (d) => tb.Check(d),
  zod: (d) => ZodOrder.safeParse(d).success,
  valibot: (d) => v.safeParse(VbOrder, d).success,
  '@cfworker/json-schema': (d) => cf.validate(d).valid,
}
// agreement on every document
const expect = mode === 'valid'
for (const [name, fn] of Object.entries(impls)) { let bad = 0; for (const d of docs) if (fn(d) !== expect) bad++; if (bad) console.error(`${name}: ${bad} of ${docs.length} documents answered ${!expect}`) }

// One library per process: eight validators in one loop share the JIT's
// feedback and the heap, and the order they were warmed in showed in the
// numbers. The driver (no third argument) spawns this file once per library,
// three passes in rotation, and keeps each library's median.
const only = process.argv[3]
const N = 20
const R = 9
if (only) {
  const fn = impls[only]
  for (let i = 0; i < 5; i++) for (const d of docs) fn(d)
  const samples = []
  for (let r = 0; r < R; r++) {
    const t0 = process.hrtime.bigint(); let ok = 0
    for (let i = 0; i < N; i++) for (const d of docs) if (fn(d)) ok++
    samples.push(N * docs.length / (Number(process.hrtime.bigint() - t0) / 1e9))
  }
  process.stdout.write(JSON.stringify(samples))
} else {
  const { spawnSync } = await import('node:child_process')
  const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]
  const all = Object.fromEntries(Object.keys(impls).map((k) => [k, []]))
  for (let pass = 0; pass < 3; pass++) {
    for (const name of Object.keys(impls)) {
      const out = spawnSync(process.execPath, [new URL(import.meta.url).pathname, mode, name], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] })
      all[name].push(...JSON.parse(out.stdout))
    }
  }
  const rows = Object.entries(all).map(([name, a]) => ({ name, ops: med(a) })).sort((a, b) => b.ops - a.ops)
  console.log(`| validator | ${mode} orders per second | ns per order |`); console.log('|---|---|---|')
  for (const r of rows) console.log(`| ${r.name} | ${Math.round(r.ops).toLocaleString('en-US')} | ${(1e9 / r.ops).toFixed(0)} |`)
  writeFileSync(`results-${mode}.json`, JSON.stringify({ mode, node: process.version, ata: require('ata-validator/package.json').version + ' (master)', date: new Date().toISOString().slice(0, 10), docs: docs.length, rows }, null, 1))
}
