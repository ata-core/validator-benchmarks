// Renders race.html to an MP4: serves the folder, steps render(t) at 30 fps
// for DURATION seconds, screenshots each frame, encodes with ffmpeg-static.
//   node video/render.cjs results/<file>.json verdict-valid order out.mp4
// NAMES=a,b keeps only those rows.
const path = require('path')
const fs = require('fs')
const http = require('http')
const { spawnSync } = require('child_process')
const { chromium } = require('playwright')
const ffmpeg = require('ffmpeg-static')

const results = process.argv[2] || 'results/latest.json'
const sceneName = process.argv[3] || 'verdict-valid'
const bodyName = process.argv[4] || 'order'
const out = process.argv[5] || `race-${bodyName}-${sceneName}.mp4`
const FPS = +(process.env.FPS || 60)
const DURATION = +(process.env.DURATION || 10)
// 1.6x gives 1920x1600, the largest X plays without downscaling the width.
const SCALE = +(process.env.SCALE || 1.6)
const dir = path.join(__dirname, '..')

const types = { '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' }
const server = http.createServer((req, res) => {
  const p = path.join(dir, decodeURIComponent(req.url.split('?')[0]))
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end() }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' })
  fs.createReadStream(p).pipe(res)
})

;(async () => {
  await new Promise((r) => server.listen(0, r))
  const port = server.address().port
  const frames = path.join(dir, 'video', 'frames')
  fs.rmSync(frames, { recursive: true, force: true }); fs.mkdirSync(frames)
  const browser = await chromium.launch({ channel: 'chrome' })
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 }, deviceScaleFactor: SCALE })
  const names = process.env.NAMES ? '&names=' + encodeURIComponent(process.env.NAMES) : ''
  await page.goto(`http://localhost:${port}/video/race.html?results=${encodeURIComponent('../' + results)}&scene=${sceneName}&body=${bodyName}${names}`)
  await page.waitForFunction(() => document.getElementById('ball0') !== null)
  await page.waitForTimeout(300)
  // Clip to the stage, which shrinks for a short list; even height for yuv420p.
  const H = Math.ceil((await page.evaluate(() => document.getElementById('stage').getBoundingClientRect().height)) / 2) * 2
  await page.setViewportSize({ width: 1200, height: H })
  const n = FPS * DURATION
  for (let i = 0; i < n; i++) {
    await page.evaluate((t) => window.__render(t), i / FPS)
    await page.screenshot({ path: path.join(frames, `f${String(i).padStart(4, '0')}.png`), clip: { x: 0, y: 0, width: 1200, height: H } })
  }
  await browser.close()
  server.close()
  const r = spawnSync(ffmpeg, ['-y', '-framerate', String(FPS), '-i', path.join(frames, 'f%04d.png'), '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-preset', 'slow', '-profile:v', 'high', '-level', '4.2', '-movflags', '+faststart', path.join(dir, out)], { encoding: 'utf8' })
  if (r.status !== 0) { console.error(r.stderr.slice(-800)); process.exit(1) }
  console.log('wrote', out, (fs.statSync(path.join(dir, out)).size / 1e6).toFixed(1), 'MB,', n, 'frames')
})()
