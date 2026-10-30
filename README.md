# validator-benchmarks

JSON Schema validators and their TypeScript-first equivalents on realistic API
bodies: documents a second, per scene, one library per process. Numbers in
[RESULTS.md](RESULTS.md) (Node 24 LTS), [RESULTS-node25.md](RESULTS-node25.md),
and from a GitHub Actions Linux runner in [RESULTS-linux.md](RESULTS-linux.md);
the raw samples, versions and machine in `results/`.

Maintained by the ata-validator project, so read it as such. Every library is
run from its published package at a pinned version, every schema is in the
repository, and a scene where ata is behind is in the table like the others.

**If you maintain one of these libraries**, please check its adapter in
`impls/index.mjs` and its schemas in `bodies/` and `typia/src`: an option we
should set, a faster API for the verdict, a schema written the way your users
would not write it. An issue or a pull request is welcome, and the next run
uses it.

## Bodies

| body | what it is | zod, valibot, typebox, fastest-validator versions |
|---|---|---|
| user | 4 fields, a sign-up form (`bodies/user.schema.json`) | written by hand in `bodies/index.mjs` and `bodies/fv.mjs`; typia in `typia/src` |
| order | customer, items with a sku pattern, address, uuid/email/date-time formats (`bodies/order.schemas.mjs`) | `bodies/order.*.mjs` and `bodies/fv.mjs`; typia in `typia/src` |
| config | 25 sections, 30 KB of schema, 10 KB of document, shared definitions, `additionalProperties: false` | not written; JSON Schema libraries only |

Documents are generated deterministically or come from a committed corpus, so
every machine sees the same ones: 900 valid and 900 invalid users and orders,
120 of each config. The config documents differ from each other in values and in
which optional keys they carry: an earlier version repeated one document 120
times, which let every engine learn a single shape, and ata's lead on that body
fell from 4.6x to 1.5x when it was fixed.

Every document reaches the libraries as a server receives it, parsed from JSON
text (since 2026-10-26). The sets are built with structuredClone and `delete`,
and V8 keeps an object it has deleted a key from in dictionary mode, which no
request body is in; before the round trip, an invalid user missing its name
and most config documents were. On the config body every compiled validator's
verdict on valid documents fell to between a third and a half with the change,
the same for all of them; the interpreted rows rose.

## Scenes

| scene | what is timed |
|---|---|
| verdict-valid | does the document pass; the boolean API where the library has one, `safeParse().success` otherwise |
| verdict-invalid | the same on documents that fail in one place |
| errors-invalid | every error of an invalid document produced and iterated, all errors on everywhere |
| blocked-verdict-valid | verdict-valid under `node --disallow-code-generation-from-strings`, the rule Cloudflare Workers and strict-CSP pages enforce; a library that compiles with `new Function` throws `EvalError` and is listed as such |

## Libraries

ata-validator (runtime, the compiled module of `ata compile`, the `/lite` entry
without the code generator, and `richErrors: false` in the errors scene), ajv
with ajv-formats, @exodus/schemasafe, @cfworker/json-schema, typebox
(TypeCompiler and Value.Check), typia, zod, valibot, fastest-validator. Formats are asserted
everywhere; typebox takes ajv-formats' checkers through its FormatRegistry.

typia validates TypeScript types, compiled at build time: `typia/src/validators.ts`
holds the user and order bodies as tagged types, and `npm run typia` (ttsc, the
TypeScript-Go plugin host typia 15 requires) turns them into plain functions in
`typia/dist`. The user body closes its object, so it uses `createEquals` and
`createValidateEquals`; the order body does not, so `createIs` and
`createValidate`. Up to typia 15.2.1 the generated code constructed a `pattern`'s
RegExp on every call and counted string lengths in code points by iterating the
string, about half of its time on the order body; typia 15.2.2 reuses the RegExp
and accepts a string by its UTF-16 length where that already decides, after a
report from this benchmark (samchon/typia#2504). The runs below use 15.2.2.

## SchemaStore: every schema with sample documents

The bodies above are three. [SchemaStore](https://github.com/SchemaStore/schemastore) holds
about a thousand real schemas, the configuration files of editors, build tools and services,
and for 446 of them the samples their own authors wrote. `schemastore/run.cjs` builds ajv and
ata for each schema and times both on the samples both accept, microseconds per document, the
median of five windows after warm-up, each engine in turn. ata runs with `useDefaults: false`,
the contract ajv has by default. Node 24, ata-validator 1.61.3, ajv 8.20.0, corpus pinned at
ce64da2; the full tables, including every schema where ata is slower, are in
[RESULTS-schemastore.md](RESULTS-schemastore.md) and [RESULTS-schemastore-node25.md](RESULTS-schemastore-node25.md).

| schema size | schemas | ajv time / ata time, median | ata slower on |
|---|---|---|---|
| under 10 KB | 264 | 1.69x | 10 |
| 10 to 50 KB | 142 | 2.43x | 5 |
| 50 to 200 KB | 35 | 2.82x | 1 |
| over 200 KB | 5 | 1.59x | 0 |
| all | 446 | 1.83x | 16 |

The 16 where ata is slower are all between 0.74x and 1.00x, most of them documents under a
microsecond where the call itself is the cost; the worst is `now` at 0.74x. The largest
generated program on the ajv side is 5.2 MB of source for one schema (utcm-monitor); ata splits
a large schema into functions the engine can optimize, which is where the 50 to 200 KB bucket's
2.82x comes from. One schema is left out because the two validators disagree on a sample
(webjob-publish-settings, a draft-07 `$ref` with siblings, which ata reads as the draft says).

```bash
sh schemastore/fetch.sh      # the corpus, shallow, at the pinned commit
npm run schemastore          # RESULTS-schemastore.md, about ten minutes
```

## What this does not measure

Parsing the JSON text, cold start, the time to compile a schema, and bundle
size: every scene starts from parsed objects in a warm process. It also does not
make the libraries do the same work: zod and valibot return a parsed copy of the
data, ajv builds the first error, and formats are checked by each library's own
rules. RESULTS.md has a table of what each one does in the verdict scenes.

## Method

`run.mjs` spawns one Node process per scene, body and library. The child
builds its adapter, checks that it answers every document the way the scene
expects (a mismatch is reported next to the number), warms up for 400 ms, then
takes 9 samples of about 20,000 documents each. The parent rotates through the
libraries three times, so 27 samples per cell, and reports the median with half
the interquartile range; two cells whose ranges overlap are not a result. Libraries
never share a heap or JIT feedback; in an earlier version that ran all of them
in one loop, the order they were warmed in showed in the numbers.

## Run it

```sh
npm ci
npm run typia                                  # build typia's validators
node run.mjs                                   # results/<date>-<host>.json
node report.mjs results/<date>-<host>.json     # RESULTS.md
node run.mjs --scene verdict-valid --body order
```

A GitHub Actions workflow runs the same on demand and monthly and attaches the
results; a runner's numbers are noisier than a desktop's and are not the ones
in RESULTS.md.

## MCP tool output on workerd

`workerd/` validates an MCP tool's structured output (N search results, each
with an id, title, uri, score, snippet, tags and a date-time) the way the MCP
client does on every `tools/call`, inside a Worker on `workerd` through
`wrangler dev`. cfworker is constructed as the MCP SDK constructs it
(`shortcircuit` on); ata is `ata-validator/lite`, the engine that runs where
`new Function` is refused. The clock is frozen inside a Worker request, so each
request validates 20 times and is timed from outside; the cost per validation
is the difference from a request that validates nothing, divided by 20.

2026-10-10, wrangler 4.149.0, Apple M4 Pro, median of 31 requests, two runs:

| tool output | cfworker | ata |
|---|---:|---:|
| 100 results, 34 KB | 0.20 ms | under 0.03 ms |
| 500 results, 169 KB | 1.11 ms | 0.11 to 0.13 ms |
| 1000 results, 338 KB | 2.21 ms | 0.23 ms |

Cloudflare's servers are not an M4, so on the edge both columns are larger;
the ratio is what carries over. The workerd version matters: with wrangler
4.69 the cfworker column was about 70% higher. `node workerd/measure.mjs`
reruns it.

## The video

`node video/render.cjs results/<file>.json verdict-valid order out.mp4` renders
a scene and body as a bouncing-ball list (each ball crosses its lane at a rate
proportional to the row's throughput), 1920x1600, 60 fps, 10 s, through
Playwright and ffmpeg-static. `NAMES=a,b` keeps only those rows.

![order, valid, the verdict](media/race-order-verdict-valid.gif)

![order, valid, the verdict, with new Function refused](media/race-order-blocked-verdict-valid.gif)

Full quality in `media/`: the two above, the order body with every error read (where ata's
default errors are behind ajv on the small body), and the config body. Logos are the projects' own, from their repositories
and sites; the Cloudflare Workers mark is from simple-icons.

## Adding a library or a body

An adapter is one `if` block in `impls/index.mjs` with a `verdict` and an
`errors` form and a `blocked` flag. A body is a JSON Schema, a documents
generator or corpus, and optionally the zod, valibot and typebox versions, in
`bodies/`. If a schema here is not what you would write, open an issue with the
version you would.
