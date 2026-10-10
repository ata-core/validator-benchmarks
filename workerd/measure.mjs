// Starts `wrangler dev` (which runs workerd), then times requests that each
// validate an MCP tool output 20 times, for no validator, cfworker and ata,
// three output sizes. Per-validation cost = (request - baseline) / 20.
//   node workerd/measure.mjs        writes results/<date>-workerd-mcp-output.json
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import os from 'node:os'

const port = 8791
const dev = spawn(new URL('../node_modules/.bin/wrangler', import.meta.url).pathname, ['dev', '--port', String(port)], { cwd: new URL('.', import.meta.url).pathname, stdio: 'ignore' })
const url = (q) => `http://localhost:${port}/?${q}`
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
try {
  for (let i = 0; i < 90; i++) { try { await fetch(url('v=none')); break } catch { await sleep(1000) } }
  const time = async (q) => { const t0 = performance.now(); await (await fetch(url(q))).text(); return performance.now() - t0 }
  const out = { date: new Date().toISOString().slice(0, 10), cpu: os.cpus()[0].model, reps: 20, sizes: {} }
  for (const n of [100, 500, 1000]) {
    const row = {}
    for (const v of ['none', 'cf', 'ata']) {
      for (let i = 0; i < 5; i++) await time(`v=${v}&n=${n}`)
      const t = []; for (let i = 0; i < 31; i++) t.push(await time(`v=${v}&n=${n}&reps=20`))
      t.sort((a, b) => a - b); row[v] = t[15]
    }
    const per = (v) => (row[v] - row.none) / 20
    out.sizes[n] = { requestMs: row, perValidationMs: { cfworker: per('cf'), ata: per('ata') } }
    console.log(`${n} results: cfworker ${per('cf').toFixed(3)} ms, ata ${per('ata').toFixed(3)} ms per validation`)
  }
  mkdirSync(new URL('../results/', import.meta.url), { recursive: true })
  writeFileSync(new URL(`../results/${out.date}-workerd-mcp-output.json`, import.meta.url), JSON.stringify(out, null, 1))
} finally { dev.kill() }
