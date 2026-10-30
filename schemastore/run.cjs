// Every SchemaStore schema that ships sample documents, validated by ajv and by
// ata on those samples: microseconds per document, per schema, bucketed by
// schema size. The samples a schema's authors wrote are what its users send,
// so this is the closest thing to real traffic a public corpus offers.
//   sh schemastore/fetch.sh && node schemastore/run.cjs > RESULTS-schemastore.md
// Both validators are built once per schema. Only documents both accept are
// timed: a sample one rejects is a disagreement, counted and left out. Each
// engine warms for 300 ms on the schema (ata answers the first calls of a
// large schema on its interpreted engine and compiles after), then five 40 ms
// windows each, interleaved; the median window is the figure. ata runs with
// useDefaults: false, the contract ajv has by default, so neither fills
// defaults. Pure JavaScript on both sides; the native addon is not involved
// in validating a parsed object.
const fs = require('fs'), path = require('path'), os = require('os')
const ROOT = process.argv[2] || path.join(__dirname, '..', 'schemastore-corpus')
const SD = path.join(ROOT, 'src/schemas/json')
if (!fs.existsSync(SD)) { console.error('no corpus at ' + ROOT + '; run sh schemastore/fetch.sh'); process.exit(1) }
const { Validator } = require('ata-validator')
const Ajv07 = require('ajv').default, Ajv2019 = require('ajv/dist/2019').default, Ajv2020 = require('ajv/dist/2020').default
const addFormats = require('ajv-formats')
const versions = { 'ata-validator': require('ata-validator/package.json').version, ajv: require('ajv/package.json').version, 'ajv-formats': require('ajv-formats/package.json').version }
const corpus = (() => { try { return require('child_process').execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim() } catch { return 'unknown' } })()
function ajvFor (schema) {
  const d = String(schema.$schema || '')
  const Cls = d.includes('2020-12') ? Ajv2020 : d.includes('2019-09') ? Ajv2019 : d.includes('draft-04') ? null : Ajv07
  if (!Cls) return null
  const ajv = new Cls({ strict: false, allErrors: false, validateFormats: true, code: { source: true } })
  addFormats(ajv)
  return ajv
}
const rows = []; let noSamples = 0, ajvFail = 0, ataFail = 0; const disagreed = []; let timed = 0
const files = fs.readdirSync(SD).filter((f) => f.endsWith('.json')).sort()
for (const f of files) {
  let schema; try { schema = JSON.parse(fs.readFileSync(path.join(SD, f), 'utf8')) } catch { continue }
  const base = f.replace(/\.json$/, ''); const dir = path.join(ROOT, 'src/test', base)
  if (!fs.existsSync(dir)) { noSamples++; continue }
  const docs = []
  for (const t of fs.readdirSync(dir)) { if (!t.endsWith('.json')) continue; try { docs.push(JSON.parse(fs.readFileSync(path.join(dir, t), 'utf8'))) } catch {} }
  if (!docs.length) { noSamples++; continue }
  let af, src = 0
  try { const ajv = ajvFor(schema); if (!ajv) { ajvFail++; continue }; af = ajv.compile(schema); src = (af.source && (af.source.validateCode || af.source.code) || '').length } catch { ajvFail++; continue }
  let v; try { v = new Validator(schema, { useDefaults: false }) } catch { ataFail++; continue }
  const agreed = []; let bad = false
  for (const d of docs) { let a, b; try { a = af(d); b = v.validate(d).valid } catch { bad = true; break }; if (a !== b) { bad = true; break }; if (a) agreed.push(d) }
  if (bad) { disagreed.push(base); continue }
  if (!agreed.length) continue
  const run = (fn) => { const t0 = process.hrtime.bigint(); let n = 0; while (Number(process.hrtime.bigint() - t0) < 40e6) { for (const d of agreed) fn(d); n += agreed.length }; return Number(process.hrtime.bigint() - t0) / n / 1000 }
  for (const fn of [(d) => af(d), (d) => v.validate(d).valid]) { const t0 = process.hrtime.bigint(); while (Number(process.hrtime.bigint() - t0) < 300e6) for (const d of agreed) fn(d) }
  const A = [], B = []
  for (let r = 0; r < 5; r++) { A.push(run((d) => af(d))); B.push(run((d) => v.validate(d).valid)) }
  const med = (a) => [...a].sort((x, y) => x - y)[2]
  rows.push({ name: base, size: JSON.stringify(schema).length, docs: agreed.length, ajvSrc: src, ajv: med(A), ata: med(B), engine: v.engine ? v.engine() : '' })
  timed++
  process.stderr.write(`\r${timed} ${base.slice(0, 40).padEnd(40)}`)
}
process.stderr.write('\n')
const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))] }
const buckets = [['under 10 KB', 0, 10e3], ['10 to 50 KB', 10e3, 50e3], ['50 to 200 KB', 50e3, 200e3], ['over 200 KB', 200e3, Infinity]]
const out = []
out.push(`# SchemaStore, every schema with sample documents`)
out.push('')
out.push(`${new Date().toISOString().slice(0, 10)}, Node ${process.version}, ${os.cpus()[0].model} (${os.platform()} ${os.arch()}). ata-validator ${versions['ata-validator']} (useDefaults: false, pure JavaScript), ajv ${versions.ajv} with ajv-formats ${versions['ajv-formats']}. Corpus: SchemaStore at ${corpus}. \`schemastore/run.cjs\`: both validators built once per schema, the samples both accept run through each for five 40 ms windows after 300 ms of warm-up, the median window kept. Microseconds per document.`)
out.push('')
out.push(`Schemas with samples timed: ${timed}. Left out: ${noSamples} schemas without usable JSON samples, ${ajvFail} ajv could not compile (draft-04 and schemas it rejects), ${ataFail} ata could not compile, ${disagreed.length} where the two disagreed on a sample's verdict${disagreed.length ? ' (' + disagreed.join(', ') + ')' : ''}.`)
out.push('')
out.push('| schema size | schemas | ajv time / ata time, median | p25 | p75 | ata slower on |')
out.push('|---|---|---|---|---|---|')
for (const [label, lo, hi] of buckets) {
  const rs = rows.filter((r) => r.size >= lo && r.size < hi); if (!rs.length) continue
  const ratios = rs.map((r) => r.ajv / r.ata)
  out.push(`| ${label} | ${rs.length} | ${q(ratios, 0.5).toFixed(2)}x | ${q(ratios, 0.25).toFixed(2)}x | ${q(ratios, 0.75).toFixed(2)}x | ${ratios.filter((x) => x < 1).length} |`)
}
const all = rows.map((r) => r.ajv / r.ata)
out.push(`| all | ${rows.length} | ${q(all, 0.5).toFixed(2)}x | ${q(all, 0.25).toFixed(2)}x | ${q(all, 0.75).toFixed(2)}x | ${all.filter((x) => x < 1).length} |`)
out.push('')
out.push('A ratio above 1 is ata ahead. Two numbers within a few percent are not a result: the windows are short and the documents few for many schemas.')
out.push('')
const losers = [...rows].filter((r) => r.ajv / r.ata < 1).sort((a, b) => a.ajv / a.ata - b.ajv / b.ata)
out.push(`## Every schema where ata is slower (${losers.length})`)
out.push('')
out.push('| schema | schema KB | documents | ajv µs/doc | ata µs/doc | ratio | ata engine |')
out.push('|---|---|---|---|---|---|---|')
for (const r of losers) out.push(`| ${r.name} | ${(r.size / 1000).toFixed(0)} | ${r.docs} | ${r.ajv.toFixed(2)} | ${r.ata.toFixed(2)} | ${(r.ajv / r.ata).toFixed(2)}x | ${r.engine} |`)
out.push('')
out.push('## The largest generated programs')
out.push('')
out.push('ajv compiles a schema to one function; the column is its source size. ata splits a large schema into functions the engine can optimize.')
out.push('')
out.push('| schema | schema KB | ajv source KB | ajv µs/doc | ata µs/doc | ratio |')
out.push('|---|---|---|---|---|---|')
for (const r of [...rows].sort((a, b) => b.ajvSrc - a.ajvSrc).slice(0, 15)) out.push(`| ${r.name} | ${(r.size / 1000).toFixed(0)} | ${(r.ajvSrc / 1000).toFixed(0)} | ${r.ajv.toFixed(1)} | ${r.ata.toFixed(1)} | ${(r.ajv / r.ata).toFixed(1)}x |`)
out.push('')
out.push('## Every schema')
out.push('')
out.push('| schema | schema KB | documents | ajv µs/doc | ata µs/doc | ratio | ata engine |')
out.push('|---|---|---|---|---|---|---|')
for (const r of [...rows].sort((a, b) => a.name.localeCompare(b.name))) out.push(`| ${r.name} | ${(r.size / 1000).toFixed(0)} | ${r.docs} | ${r.ajv.toFixed(2)} | ${r.ata.toFixed(2)} | ${(r.ajv / r.ata).toFixed(2)}x | ${r.engine} |`)
console.log(out.join('\n'))
const jsonOut = process.env.OUT_JSON || path.join(__dirname, '..', 'results', `schemastore-${new Date().toISOString().slice(0, 10)}-node${process.versions.node.split('.')[0]}.json`)
fs.writeFileSync(jsonOut, JSON.stringify({ date: new Date().toISOString(), node: process.version, cpu: os.cpus()[0].model, versions, corpus, rows }, null, 1))
