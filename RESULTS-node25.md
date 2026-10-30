# Results

2026-10-30, Node v25.2.1, Apple M4 Pro (darwin arm64). One library per process, three passes in rotation, median of 27 samples. Source: `results/2026-10-30-merts-macbook-pro-node25.json`.

Versions: ata-validator 1.61.3, ajv 8.20.0, ajv-formats 3.0.1, @exodus/schemasafe 1.3.0, @cfworker/json-schema 4.1.1, @sinclair/typebox 0.34.52, typia 15.2.2, zod 4.6.5, valibot 1.5.0, fastest-validator 1.19.1

Each cell is the median documents a second, with ± half the interquartile range of the 27 samples as a percentage of the median. Two numbers whose ranges overlap are not a result.

What each library does per document in the verdict scenes, which is not the same work:

| library | verdict call | does beyond the yes/no |
|---|---|---|
| ata, ata (compiled), ata-validator/lite | `validate(d).valid`, `isValid(d)` | nothing; errors are built only when read |
| ajv | the compiled function | stops at the first error and builds it |
| @exodus/schemasafe | the compiled function, `includeErrors: false` | nothing |
| @cfworker/json-schema | `validate(d).valid`, short-circuit on | builds the first error |
| typebox | `Check(d)` | nothing |
| typia | `is` / `equals` | nothing |
| zod | `safeParse(d).success` | returns a parsed copy of the data, unknown keys stripped |
| valibot | `safeParse(schema, d).success` | returns a parsed copy of the data |
| fastest-validator | the compiled function `=== true` | builds the array of errors on a refusal |

Formats (email, uuid, date-time) are checked by each library's own rules, which differ in strictness; every library accepts every valid document and rejects every invalid one here, which the runner checks before timing.

## verdict-valid

valid documents, the verdict only.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata (compiled) | 14,207,124 ±4% | 3,305,532 ±7% | 14,771 ±1% |
| ata | 13,261,525 ±5% | 3,140,863 ±2% | 14,894 ±2% |
| typia | 12,588,413 ±5% | 2,008,657 ±2% | no equivalent written |
| typebox | 11,822,074 ±3% | 1,689,726 ±1% | no equivalent written |
| fastest-validator | 10,722,502 ±1% | 1,749,819 ±1% | no equivalent written |
| @exodus/schemasafe | 9,507,803 ±3% | 860,594 ±1% | 13,871 ±2% |
| ajv | 8,494,362 ±3% | 1,342,255 ±1% | 13,154 ±2% |
| ata-validator/lite | 6,515,657 ±1% | 1,127,263 ±1% | 43,462 ±1% |
| typebox (Value.Check) | 5,215,274 ±1% | 296,519 ±1% | no equivalent written |
| valibot | 4,527,352 ±1% | 502,881 ±0% | no equivalent written |
| zod | 3,594,445 ±1% | 442,530 ±1% | no equivalent written |
| @cfworker/json-schema | 570,753 ±1% | 57,127 ±1% | 2,956 ±2% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.93x | 0.95x | 1.01x |
| typia | 1.05x | 1.56x |  |
| typebox | 1.12x | 1.86x |  |
| fastest-validator | 1.24x | 1.79x |  |
| @exodus/schemasafe | 1.39x | 3.65x | 1.07x |
| ajv | 1.56x | 2.34x | 1.13x |
| ata-validator/lite | 2.04x | 2.79x | 0.34x |
| typebox (Value.Check) | 2.54x | 10.59x |  |
| valibot | 2.93x | 6.25x |  |
| zod | 3.69x | 7.10x |  |
| @cfworker/json-schema | 23.24x | 54.98x | 5.04x |

## verdict-invalid

invalid documents, the verdict only.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ajv | 15,827,870 ±5% | 3,466,716 ±3% | 25,518 ±4% |
| typia | 14,050,435 ±2% | 4,925,628 ±2% | no equivalent written |
| typebox | 13,793,103 ±1% | 4,358,473 ±4% | no equivalent written |
| ata (compiled) | 12,959,175 ±3% | 4,710,267 ±2% | 28,896 ±5% |
| @exodus/schemasafe | 12,456,426 ±2% | 1,896,083 ±2% | 28,054 ±3% |
| ata | 10,458,665 ±4% | 4,744,125 ±4% | 29,577 ±3% |
| ata-validator/lite | 7,446,758 ±1% | 2,327,506 ±1% | 89,782 ±4% |
| typebox (Value.Check) | 6,905,971 ±1% | 777,906 ±1% | no equivalent written |
| valibot | 3,694,403 ±1% | 439,037 ±0% | no equivalent written |
| fastest-validator | 2,550,492 ±2% | 1,159,842 ±1% | no equivalent written |
| zod | 1,576,193 ±16% | 359,965 ±2% | no equivalent written |
| @cfworker/json-schema | 734,776 ±1% | 132,220 ±2% | 5,776 ±3% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ajv | 0.66x | 1.37x | 1.16x |
| typia | 0.74x | 0.96x |  |
| typebox | 0.76x | 1.09x |  |
| ata (compiled) | 0.81x | 1.01x | 1.02x |
| @exodus/schemasafe | 0.84x | 2.50x | 1.05x |
| ata-validator/lite | 1.40x | 2.04x | 0.33x |
| typebox (Value.Check) | 1.51x | 6.10x |  |
| valibot | 2.83x | 10.81x |  |
| fastest-validator | 4.10x | 4.09x |  |
| zod | 6.64x | 13.18x |  |
| @cfworker/json-schema | 14.23x | 35.88x | 5.12x |

## errors-invalid

invalid documents, every error produced and iterated.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ajv | 7,199,673 ±3% | 1,269,424 ±2% | 13,234 ±1% |
| @exodus/schemasafe | 5,798,022 ±2% | 663,556 ±4% | 12,313 ±1% |
| ata (compiled) | 5,609,397 ±2% | 1,522,140 ±3% | 11,983 ±0% |
| ata richErrors:false | 5,364,522 ±2% | 2,975,803 ±2% | 14,409 ±1% |
| ata | 3,716,652 ±1% | 1,630,916 ±2% | 13,253 ±1% |
| valibot | 3,675,942 ±1% | 443,287 ±1% | no equivalent written |
| typia | 3,648,144 ±1% | 941,147 ±1% | no equivalent written |
| fastest-validator | 2,565,515 ±1% | 1,144,285 ±1% | no equivalent written |
| ata-validator/lite | 2,088,819 ±2% | 445,141 ±1% | 22,060 ±2% |
| typebox | 1,241,211 ±2% | 120,614 ±2% | no equivalent written |
| typebox (Value.Check) | 1,134,421 ±1% | 105,163 ±1% | no equivalent written |
| zod | 787,605 ±3% | 281,764 ±1% | no equivalent written |
| @cfworker/json-schema | 560,623 ±1% | 55,626 ±1% | 3,010 ±2% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ajv | 0.52x | 1.28x | 1.00x |
| @exodus/schemasafe | 0.64x | 2.46x | 1.08x |
| ata (compiled) | 0.66x | 1.07x | 1.11x |
| ata richErrors:false | 0.69x | 0.55x | 0.92x |
| valibot | 1.01x | 3.68x |  |
| typia | 1.02x | 1.73x |  |
| fastest-validator | 1.45x | 1.43x |  |
| ata-validator/lite | 1.78x | 3.66x | 0.60x |
| typebox | 2.99x | 13.52x |  |
| typebox (Value.Check) | 3.28x | 15.51x |  |
| zod | 4.72x | 5.79x |  |
| @cfworker/json-schema | 6.63x | 29.32x | 4.40x |

## blocked-verdict-valid

valid documents, the verdict, with new Function refused.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata (compiled) | 14,534,777 ±5% | 3,061,935 ±1% | 13,017 ±6% |
| typia | 12,756,705 ±6% | 1,953,265 ±2% | no equivalent written |
| ata | 6,597,526 ±2% | 1,102,662 ±1% | 39,385 ±9% |
| ata-validator/lite | 6,306,568 ±3% | 1,109,915 ±3% | 36,645 ±5% |
| typebox (Value.Check) | 5,090,737 ±2% | 277,065 ±2% | no equivalent written |
| valibot | 4,196,026 ±17% | 478,420 ±1% | no equivalent written |
| zod | 2,546,296 ±1% | 230,686 ±2% | no equivalent written |
| @cfworker/json-schema | 555,813 ±2% | 53,193 ±2% | 2,851 ±2% |
| ajv | EvalError | EvalError | EvalError |
| @exodus/schemasafe | EvalError | EvalError | EvalError |
| typebox | EvalError | EvalError | no equivalent written |
| fastest-validator | EvalError | EvalError | no equivalent written |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.45x | 0.36x | 3.03x |
| typia | 0.52x | 0.56x |  |
| ata-validator/lite | 1.05x | 0.99x | 1.07x |
| typebox (Value.Check) | 1.30x | 3.98x |  |
| valibot | 1.57x | 2.30x |  |
| zod | 2.59x | 4.78x |  |
| @cfworker/json-schema | 11.87x | 20.73x | 13.81x |
| ajv |  |  |  |
| @exodus/schemasafe |  |  |  |
| typebox |  |  |  |
| fastest-validator |  |  |  |
