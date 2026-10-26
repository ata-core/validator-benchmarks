// results/<file>.json to RESULTS.md: one table per scene, bodies as columns,
// documents a second, and the ratio to ata's runtime row.
//   node report.mjs results/2026-10-10-host.json [RESULTS.md]
import { readFileSync, writeFileSync } from 'node:fs'
const file = process.argv[2]
const r = JSON.parse(readFileSync(file, 'utf8'))
const fmt = (n) => n ? Math.round(n).toLocaleString('en-US') : ''
const lines = []
lines.push(`# Results`, '', `${r.date}, Node ${r.node}, ${r.cpu} (${r.platform}). One library per process, three passes in rotation, median of 27 samples. Source: \`${file}\`.`, '')
lines.push('Versions: ' + Object.entries(r.versions).map(([k, v]) => `${k} ${v}`).join(', '), '')
lines.push('Each cell is the median documents a second, with ± half the interquartile range of the 27 samples as a percentage of the median. Two numbers whose ranges overlap are not a result.', '')
lines.push('What each library does per document in the verdict scenes, which is not the same work:', '')
lines.push('| library | verdict call | does beyond the yes/no |', '|---|---|---|')
for (const [lib, call, extra] of [
  ['ata, ata (compiled), ata-validator/lite', '`validate(d).valid`, `isValid(d)`', 'nothing; errors are built only when read'],
  ['ajv', 'the compiled function', 'stops at the first error and builds it'],
  ['@exodus/schemasafe', 'the compiled function, `includeErrors: false`', 'nothing'],
  ['@cfworker/json-schema', '`validate(d).valid`, short-circuit on', 'builds the first error'],
  ['typebox', '`Check(d)`', 'nothing'],
  ['typia', '`is` / `equals`', 'nothing'],
  ['zod', '`safeParse(d).success`', 'returns a parsed copy of the data, unknown keys stripped'],
  ['valibot', '`safeParse(schema, d).success`', 'returns a parsed copy of the data'],
  ['fastest-validator', 'the compiled function `=== true`', 'builds the array of errors on a refusal'],
]) lines.push(`| ${lib} | ${call} | ${extra} |`)
lines.push('', 'Formats (email, uuid, date-time) are checked by each library\'s own rules, which differ in strictness; every library accepts every valid document and rejects every invalid one here, which the runner checks before timing.', '')
for (const [sceneName, sc] of Object.entries(r.scenes)) {
  const bodyNames = Object.keys(sc.bodies)
  lines.push(`## ${sceneName}`, '', sc.about + '.', '')
  lines.push('| library | ' + bodyNames.map((b) => `${b} (${sc.bodies[b].about}) /s`).join(' | ') + ' |')
  lines.push('|---|' + bodyNames.map(() => '---:').join('|') + '|')
  const libs = new Set(); for (const b of bodyNames) for (const row of sc.bodies[b].rows) libs.add(row.name)
  const first = sc.bodies[bodyNames[0]].rows
  const order = [...libs].sort((a, b) => (first.find((x) => x.name === b)?.ops || 0) - (first.find((x) => x.name === a)?.ops || 0))
  for (const lib of order) {
    // The median, and the spread of the middle half of the samples as a
    // percentage of it, so a reader can tell a gap from noise.
    const cells = bodyNames.map((b) => { const row = sc.bodies[b].rows.find((x) => x.name === lib); if (!row) return 'no equivalent written'; if (!row.ops) return row.note ? row.note.split(':')[0] : '-'; const spread = row.p25 && row.p75 ? ` ±${((row.p75 - row.p25) / 2 / row.ops * 100).toFixed(0)}%` : ''; return fmt(row.ops) + spread + (row.note ? ` (${row.note})` : '') })
    lines.push(`| ${lib} | ${cells.join(' | ')} |`)
  }
  lines.push('')
  // ratio to ata
  const ata = (b) => sc.bodies[b].rows.find((x) => x.name === 'ata')
  lines.push('Relative to `ata` (above 1 means slower than ata):', '')
  lines.push('| library | ' + bodyNames.join(' | ') + ' |', '|---|' + bodyNames.map(() => '---:').join('|') + '|')
  for (const lib of order) {
    if (lib === 'ata') continue
    const cells = bodyNames.map((b) => { const row = sc.bodies[b].rows.find((x) => x.name === lib); const base = ata(b); if (!row || !base || !row.ops) return ''; return (base.ops / row.ops).toFixed(2) + 'x' })
    lines.push(`| ${lib} | ${cells.join(' | ')} |`)
  }
  lines.push('')
}
const outFile = process.argv[3] || 'RESULTS.md'
writeFileSync(outFile, lines.join('\n'))
console.log('wrote', outFile)
