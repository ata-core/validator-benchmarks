// An MCP tool's structured output (N search results), validated the way the
// MCP client does on every tools/call: once per request here, `reps` times,
// so the request time measured from outside carries the validation cost.
// The clock is frozen inside a Worker request, hence the outside timing.
// cfworker is constructed as the SDK constructs it (shortcircuit on).
import { Validator as Cf } from '@cfworker/json-schema'
import { Validator } from 'ata-validator/lite'
const schema = { type: 'object', required: ['results', 'total'], properties: {
  total: { type: 'integer', minimum: 0 },
  results: { type: 'array', items: { type: 'object', required: ['id', 'title', 'url', 'score'], additionalProperties: false, properties: {
    id: { type: 'string', minLength: 1 }, title: { type: 'string', maxLength: 300 }, url: { type: 'string', format: 'uri' },
    score: { type: 'number', minimum: 0, maximum: 1 }, snippet: { type: 'string', maxLength: 2000 },
    tags: { type: 'array', items: { type: 'string' }, maxItems: 20 }, updated: { type: 'string', format: 'date-time' } } } } } }
const make = (n) => ({ total: n, results: Array.from({ length: n }, (_, i) => ({ id: 'doc-' + i, title: 'Result number ' + i + ' about validation', url: 'https://example.com/docs/' + i, score: (i % 100) / 100, snippet: 'Lorem ipsum dolor sit amet, '.repeat(6), tags: ['a', 'b', 'c'], updated: '2026-10-10T12:00:00Z' })) })
const docs = { 100: make(100), 500: make(500), 1000: make(1000) }
const cf = new Cf(schema, '2020-12', true), ata = new Validator(schema)
export default {
  fetch (req) {
    const u = new URL(req.url); const n = u.searchParams.get('n') || '500'; const which = u.searchParams.get('v'); const reps = +(u.searchParams.get('reps') || 20)
    const doc = docs[n]; let ok = 0
    for (let i = 0; i < reps; i++) ok += (which === 'ata' ? ata.validate(doc).valid : which === 'cf' ? cf.validate(doc).valid : true) ? 1 : 0
    return new Response(String(ok))
  }
}
