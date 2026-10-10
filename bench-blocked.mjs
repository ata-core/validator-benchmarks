// The Workers scene: the same order body, with code generation from strings
// refused the way Cloudflare Workers refuse it. Run under
//   node --disallow-code-generation-from-strings bench-blocked.mjs [valid|invalid] [impl]
// A library that compiles with new Function throws EvalError here and is
// shown as such. One library per process, three passes, median of 27.
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const mode = process.argv[2] || 'valid'
const only = process.argv[3]
const corpus = JSON.parse(readFileSync(new URL('./corpus.json', import.meta.url), 'utf8')).filter((c) => c.valid !== false).map((c) => JSON.parse(c.text))
const docs = mode === 'valid' ? corpus : corpus.map((d, i) => { const x = structuredClone(d); if (i % 3 === 0) x.customer.email = 'not-an-email'; else if (i % 3 === 1 && x.items.length) x.items[0].quantity = 0; else delete x.shippingAddress.city; return x })
const { JsonOrder, ZodOrder } = await import('./schemas.mjs')

const makers = {
  'ata (compiled)': async () => { const m = await import('./order.compiled.mjs'); return (d) => m.isValid(d) },
  ata: async () => { const { Validator } = require('ata-validator'); const v = new Validator(JsonOrder); return (d) => v.validate(d).valid },
  'ata-validator/lite': async () => { const { Validator } = require('ata-validator/lite'); const v = new Validator(JsonOrder); return (d) => v.validate(d).valid },
  '@cfworker/json-schema': async () => { const { Validator } = await import('@cfworker/json-schema'); const v = new Validator(JsonOrder, '2020-12', false); return (d) => v.validate(d).valid },
  zod: async () => (d) => ZodOrder.safeParse(d).success,
  valibot: async () => { const v = await import('valibot'); const { VbOrder } = await import('./vb.mjs'); return (d) => v.safeParse(VbOrder, d).success },
  'typebox (Value.Check)': async () => { const { Value } = await import('@sinclair/typebox/value'); const { TbOrder } = await import('./tb.mjs'); return (d) => Value.Check(TbOrder, d) },
  ajv: async () => { const Ajv2020 = (await import('ajv/dist/2020.js')).default; const addFormats = (await import('ajv-formats')).default; const ajv = new Ajv2020(); addFormats(ajv); const f = ajv.compile(JsonOrder); return (d) => f(d) },
  '@exodus/schemasafe': async () => { const { validator } = await import('@exodus/schemasafe'); const f = validator(JsonOrder, { includeErrors: false }); return (d) => f(d) },
  'typebox (TypeCompiler)': async () => { const { TypeCompiler } = await import('@sinclair/typebox/compiler'); const { TbOrder } = await import('./tb.mjs'); const c = TypeCompiler.Compile(TbOrder); return (d) => c.Check(d) },
}
const N = 20, R = 9
if (only) {
  let fn
  try { fn = await makers[only]() ; fn(docs[0]) } catch (e) { process.stdout.write(JSON.stringify({ throws: e.name + ': ' + e.message.slice(0, 60) })); process.exit(0) }
  const expect = mode === 'valid'; let bad = 0; for (const d of docs) if (fn(d) !== expect) bad++
  for (let i = 0; i < 5; i++) for (const d of docs) fn(d)
  const samples = []
  for (let r = 0; r < R; r++) { const t0 = process.hrtime.bigint(); for (let i = 0; i < N; i++) for (const d of docs) fn(d); samples.push(N * docs.length / (Number(process.hrtime.bigint() - t0) / 1e9)) }
  process.stdout.write(JSON.stringify({ samples, bad }))
} else {
  const { spawnSync } = await import('node:child_process')
  const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]
  const all = {}
  for (let pass = 0; pass < 3; pass++) for (const name of Object.keys(makers)) {
    const out = spawnSync(process.execPath, ['--disallow-code-generation-from-strings', new URL(import.meta.url).pathname, mode, name], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] })
    const r = JSON.parse(out.stdout); const a = (all[name] ||= { samples: [], throws: null, bad: 0 }); if (r.throws) a.throws = r.throws; else { a.samples.push(...r.samples); a.bad = r.bad }
  }
  const rows = Object.entries(all).map(([name, a]) => ({ name, ops: a.throws ? 0 : med(a.samples), note: a.throws || (a.bad ? `${a.bad} docs disagree` : undefined) })).sort((a, b) => b.ops - a.ops)
  console.log(`| validator | ${mode} orders per second, code generation blocked | note |`); console.log('|---|---|---|')
  for (const r of rows) console.log(`| ${r.name} | ${r.ops ? Math.round(r.ops).toLocaleString('en-US') : '-'} | ${r.note || ''} |`)
  writeFileSync(`results-blocked-${mode}.json`, JSON.stringify({ mode, scene: 'blocked', node: process.version, ata: require('ata-validator/package.json').version + ' (master)', date: new Date().toISOString().slice(0, 10), docs: docs.length, rows }, null, 1))
}
