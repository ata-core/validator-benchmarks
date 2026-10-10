// The runner. For every scene, body and library it spawns one Node process
// (with --disallow-code-generation-from-strings for the blocked scenes),
// which builds the adapter, checks it answers every document as expected,
// warms up, and times R samples of N passes over the documents. Three passes
// in rotation over the libraries; the median of all samples is kept.
//   node run.mjs                      everything, into results/<date>-<host>.json
//   node run.mjs --scene verdict-valid --body order
//   node run.mjs --worker <scene> <body> <lib>   (what the children run)
import { spawnSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import os from 'node:os'

export const scenes = {
  'verdict-valid': { scene: 'verdict', docs: 'valid', blocked: false, about: 'valid documents, the verdict only' },
  'verdict-invalid': { scene: 'verdict', docs: 'invalid', blocked: false, about: 'invalid documents, the verdict only' },
  'errors-invalid': { scene: 'errors', docs: 'invalid', blocked: false, about: 'invalid documents, every error produced and iterated' },
  'blocked-verdict-valid': { scene: 'verdict', docs: 'valid', blocked: true, about: 'valid documents, the verdict, with new Function refused' },
}

const argv = process.argv.slice(2)
if (argv[0] === '--worker') {
  const [, sceneName, bodyName, lib] = argv
  const { bodies } = await import('./bodies/index.mjs')
  const { make } = await import('./impls/index.mjs')
  const sc = scenes[sceneName]; const body = bodies[bodyName]; const docs = body.docs[sc.docs]
  let fn
  try { fn = await make(lib, body, sc.scene); if (fn) fn(docs[0]) } catch (e) { process.stdout.write(JSON.stringify({ throws: `${e.name}: ${e.message.slice(0, 80)}` })); process.exit(0) }
  if (!fn) { process.stdout.write(JSON.stringify({ skipped: true })); process.exit(0) }
  let disagree = 0
  for (const d of docs) { const r = fn(d); const ok = sc.scene === 'verdict' ? r === (sc.docs === 'valid') : (sc.docs === 'valid' ? r === 0 : r > 0); if (!ok) disagree++ }
  const N = Math.max(1, Math.round(20000 / docs.length)), R = 9
  // Warm for 400 ms: the engines tier up at their own pace, and five passes
  // left the first samples of the small bodies at a third of the later ones.
  const w0 = process.hrtime.bigint(); while (Number(process.hrtime.bigint() - w0) < 4e8) for (const d of docs) fn(d)
  const samples = []
  for (let r = 0; r < R; r++) { const t0 = process.hrtime.bigint(); for (let i = 0; i < N; i++) for (const d of docs) fn(d); samples.push(N * docs.length / (Number(process.hrtime.bigint() - t0) / 1e9)) }
  process.stdout.write(JSON.stringify({ samples, disagree }))
  process.exit(0)
}

const { bodies } = await import('./bodies/index.mjs')
const { libs, versions, compileBodies } = await import('./impls/index.mjs')
const want = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : null }
// The ata modules are compiled here, once per body, the way a build step
// would: a child with code generation refused could not compile its own.
const compiledDir = compileBodies(bodies)
const sceneNames = want('--scene') ? [want('--scene')] : Object.keys(scenes)
const bodyNames = want('--body') ? [want('--body')] : Object.keys(bodies)
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]
const self = new URL(import.meta.url).pathname
const out = { date: new Date().toISOString().slice(0, 10), node: process.version, cpu: os.cpus()[0].model, platform: `${os.platform()} ${os.arch()}`, versions: versions(), scenes: {} }
for (const sceneName of sceneNames) {
  const sc = scenes[sceneName]
  out.scenes[sceneName] = { about: sc.about, bodies: {} }
  for (const bodyName of bodyNames) {
    const acc = {}
    for (let pass = 0; pass < 3; pass++) {
      for (const lib of Object.keys(libs)) {
        const flags = sc.blocked ? ['--disallow-code-generation-from-strings'] : []
        const r = spawnSync(process.execPath, [...flags, self, '--worker', sceneName, bodyName, lib], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], env: { ...process.env, ATA_RACE_COMPILED: compiledDir } })
        let res; try { res = JSON.parse(r.stdout) } catch { res = { throws: 'crashed: ' + (r.stderr || '').slice(-80) } }
        const a = (acc[lib] ||= { samples: [], throws: null, skipped: false, disagree: 0 })
        if (res.skipped) a.skipped = true; else if (res.throws) a.throws = res.throws; else { a.samples.push(...res.samples); a.disagree = res.disagree }
      }
      process.stderr.write(`\r${sceneName} ${bodyName} pass ${pass + 1}/3   `)
    }
    const q = (arr, p) => { const x = [...arr].sort((m, n) => m - n); return x[Math.floor((x.length - 1) * p)] }
    const rows = Object.entries(acc).filter(([, a]) => !a.skipped).map(([name, a]) => ({ name, ops: a.throws ? 0 : med(a.samples), p25: a.throws ? 0 : q(a.samples, 0.25), p75: a.throws ? 0 : q(a.samples, 0.75), n: a.samples.length, note: a.throws || (a.disagree ? `${a.disagree} documents answered differently` : undefined) })).sort((a, b) => b.ops - a.ops)
    out.scenes[sceneName].bodies[bodyName] = { about: bodies[bodyName].about, docs: bodies[bodyName].docs[sc.docs].length, rows }
  }
}
process.stderr.write('\n')
mkdirSync('results', { recursive: true })
const file = `results/${out.date}-${os.hostname().split('.')[0].toLowerCase()}-node${process.versions.node.split('.')[0]}${want('--scene') || want('--body') ? '-partial' : ''}.json`
writeFileSync(file, JSON.stringify(out, null, 1))
console.log('wrote', file)
