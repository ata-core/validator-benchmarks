// One adapter per library. make(lib, body, scene) returns the function the
// runner times for one document, or null when the library has no version of
// that body or no API for that scene. Each adapter is built in its own process.
// Scenes: verdict (does the document pass; the boolean API where there is
// one) and errors (every error of an invalid document produced and iterated).
// `blocked`: runs with code generation from strings refused, the rule
// Cloudflare Workers enforce; the others throw EvalError there.
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

export const libs = {
  ata: { blocked: true, kind: 'json-schema' },
  'ata (compiled)': { blocked: true, kind: 'json-schema' },
  'ata-validator/lite': { blocked: true, kind: 'json-schema' },
  'ata richErrors:false': { blocked: true, kind: 'json-schema', scenes: ['errors'] },
  ajv: { blocked: false, kind: 'json-schema' },
  '@exodus/schemasafe': { blocked: false, kind: 'json-schema' },
  '@cfworker/json-schema': { blocked: true, kind: 'json-schema' },
  typia: { blocked: true, kind: 'equivalent', bodies: ['user', 'order'] },
  typebox: { blocked: false, kind: 'equivalent' },
  'typebox (Value.Check)': { blocked: true, kind: 'equivalent' },
  zod: { blocked: true, kind: 'equivalent' },
  valibot: { blocked: true, kind: 'equivalent' },
}

export function versions () {
  // Read from node_modules directly: not every package exports its package.json.
  const fs = require('node:fs')
  const v = (p) => JSON.parse(fs.readFileSync(new URL(`../node_modules/${p}/package.json`, import.meta.url), 'utf8')).version
  const out = {}
  for (const p of ['ata-validator', 'ajv', 'ajv-formats', '@exodus/schemasafe', '@cfworker/json-schema', '@sinclair/typebox', 'typia', 'zod', 'valibot']) out[p] = v(p)
  return out
}

// `ata compile` for every body, into a temporary directory; returns it.
export function compileBodies (bodies) {
  const { toStandaloneModule } = require('ata-validator/aot')
  const { Validator } = require('ata-validator')
  const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path')
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ata-race-'))
  for (const [name, body] of Object.entries(bodies)) fs.writeFileSync(path.join(dir, name + '.compiled.mjs'), toStandaloneModule(new Validator(body.schema), { format: 'esm' }))
  return dir
}

const count = (list) => { let n = 0; if (list) for (const _ of list) n++; return n }
const verdictOrErrors = (scene, run) => scene === 'verdict' ? (d) => run(d).valid : (d) => { const r = run(d); return r.valid ? 0 : count(r.errors) }

export async function make (lib, body, scene) {
  const meta = libs[lib]
  if (meta.scenes && !meta.scenes.includes(scene)) return null
  if (meta.kind === 'equivalent' && !body.zod) return null
  if (meta.bodies && !meta.bodies.includes(body.name)) return null
  const schema = body.schema
  if (lib === 'ata' || lib === 'ata richErrors:false') {
    const { Validator } = require('ata-validator')
    const v = new Validator(schema, lib.endsWith('false') ? { richErrors: false } : undefined)
    return verdictOrErrors(scene, (d) => v.validate(d))
  }
  if (lib === 'ata (compiled)') {
    // The module the runner compiled for this body (compileBodies), imported
    // the way a deployed Worker imports its build output.
    const path = await import('node:path')
    const m = await import(path.join(process.env.ATA_RACE_COMPILED, body.name + '.compiled.mjs'))
    return scene === 'verdict' ? (d) => m.isValid(d) : verdictOrErrors(scene, (d) => m.validate(d))
  }
  if (lib === 'ata-validator/lite') {
    const { Validator } = require('ata-validator/lite')
    const v = new Validator(schema)
    return verdictOrErrors(scene, (d) => v.validate(d))
  }
  if (lib === 'ajv') {
    const Ajv2020 = require('ajv/dist/2020.js').default
    const addFormats = require('ajv-formats').default
    const ajv = new Ajv2020({ allErrors: scene === 'errors', logger: false }); addFormats(ajv)
    const f = ajv.compile(schema)
    return scene === 'verdict' ? (d) => f(d) : (d) => (f(d) ? 0 : count(f.errors))
  }
  if (lib === '@exodus/schemasafe') {
    const { validator } = require('@exodus/schemasafe')
    const f = validator(schema, scene === 'errors' ? { includeErrors: true, allErrors: true } : { includeErrors: false })
    return scene === 'verdict' ? (d) => f(d) : (d) => (f(d) ? 0 : count(f.errors))
  }
  if (lib === '@cfworker/json-schema') {
    const { Validator } = require('@cfworker/json-schema')
    // Short-circuit on for the verdict (stop at the first failure), off for
    // the errors scene (collect them all).
    const v = new Validator(schema, '2020-12', scene === 'verdict')
    return verdictOrErrors(scene, (d) => v.validate(d))
  }
  if (lib === 'typia') {
    // Compiled at build time from TypeScript types by `npx ttsc -p typia`
    // (typia/src/validators.ts); the runtime holds plain functions.
    const t = await import('../typia/dist/validators.js')
    const is = body.name === 'user' ? t.isUser : t.isOrder
    const validate = body.name === 'user' ? t.validateUser : t.validateOrder
    return scene === 'verdict' ? (d) => is(d) : (d) => { const r = validate(d); return r.success ? 0 : count(r.errors) }
  }
  if (lib === 'typebox') {
    // ESM, as bodies/index.mjs imports typebox: a CommonJS copy has its own
    // FormatRegistry and sees none of the formats the bodies registered.
    const { TypeCompiler } = await import('@sinclair/typebox/compiler')
    const c = TypeCompiler.Compile(body.typebox)
    return scene === 'verdict' ? (d) => c.Check(d) : (d) => (c.Check(d) ? 0 : count(c.Errors(d)))
  }
  if (lib === 'typebox (Value.Check)') {
    const { Value } = await import('@sinclair/typebox/value')
    const t = body.typebox
    return scene === 'verdict' ? (d) => Value.Check(t, d) : (d) => (Value.Check(t, d) ? 0 : count(Value.Errors(t, d)))
  }
  if (lib === 'zod') {
    const s = body.zod
    return scene === 'verdict' ? (d) => s.safeParse(d).success : (d) => { const r = s.safeParse(d); return r.success ? 0 : count(r.error.issues) }
  }
  if (lib === 'valibot') {
    const v = await import('valibot')
    const s = body.valibot
    return scene === 'verdict' ? (d) => v.safeParse(s, d).success : (d) => { const r = v.safeParse(s, d, { abortEarly: false }); return r.success ? 0 : count(r.issues) }
  }
  throw new Error('unknown lib ' + lib)
}
