// results/<file>.json to RESULTS.md: one table per scene, bodies as columns,
// documents a second, and the ratio to ata's runtime row.
//   node report.mjs results/2026-10-10-host.json
import { readFileSync, writeFileSync } from 'node:fs'
const file = process.argv[2]
const r = JSON.parse(readFileSync(file, 'utf8'))
const fmt = (n) => n ? Math.round(n).toLocaleString('en-US') : ''
const lines = []
lines.push(`# Results`, '', `${r.date}, Node ${r.node}, ${r.cpu} (${r.platform}). One library per process, three passes in rotation, median of 27 samples. Source: \`${file}\`.`, '')
lines.push('Versions: ' + Object.entries(r.versions).map(([k, v]) => `${k} ${v}`).join(', '), '')
for (const [sceneName, sc] of Object.entries(r.scenes)) {
  const bodyNames = Object.keys(sc.bodies)
  lines.push(`## ${sceneName}`, '', sc.about + '.', '')
  lines.push('| library | ' + bodyNames.map((b) => `${b} (${sc.bodies[b].about}) /s`).join(' | ') + ' |')
  lines.push('|---|' + bodyNames.map(() => '---:').join('|') + '|')
  const libs = new Set(); for (const b of bodyNames) for (const row of sc.bodies[b].rows) libs.add(row.name)
  const first = sc.bodies[bodyNames[0]].rows
  const order = [...libs].sort((a, b) => (first.find((x) => x.name === b)?.ops || 0) - (first.find((x) => x.name === a)?.ops || 0))
  for (const lib of order) {
    const cells = bodyNames.map((b) => { const row = sc.bodies[b].rows.find((x) => x.name === lib); if (!row) return 'no equivalent written'; if (!row.ops) return row.note ? row.note.split(':')[0] : '-'; return fmt(row.ops) + (row.note ? ` (${row.note})` : '') })
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
writeFileSync('RESULTS.md', lines.join('\n'))
console.log('wrote RESULTS.md')
