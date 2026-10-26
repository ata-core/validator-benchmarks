# Results

2026-10-26, Node v24.19.0, Apple M4 Pro (darwin arm64). One library per process, three passes in rotation, median of 27 samples. Source: `results/2026-10-26-merts-macbook-pro-node24.json`.

Versions: ata-validator 1.60.0, ajv 8.20.0, ajv-formats 3.0.1, @exodus/schemasafe 1.3.0, @cfworker/json-schema 4.1.1, @sinclair/typebox 0.34.52, typia 15.1.0, zod 4.6.5, valibot 1.5.0, fastest-validator 1.19.1

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
| ata (compiled) | 14,741,740 ±1% | 3,428,794 ±3% | 43,185 ±1% |
| ata | 13,545,019 ±3% | 3,269,777 ±2% | 43,271 ±2% |
| typebox | 12,327,485 ±1% | 1,682,559 ±1% | no equivalent written |
| fastest-validator | 10,962,951 ±2% | 1,727,334 ±1% | no equivalent written |
| @exodus/schemasafe | 9,889,492 ±2% | 837,264 ±2% | 30,682 ±2% |
| ajv | 8,809,138 ±2% | 1,278,082 ±3% | 27,856 ±2% |
| ata-validator/lite | 6,713,287 ±2% | 1,137,166 ±1% | 32,167 ±2% |
| typia | 6,668,726 ±4% | 983,749 ±1% | no equivalent written |
| typebox (Value.Check) | 5,287,109 ±1% | 292,530 ±2% | no equivalent written |
| valibot | 4,379,925 ±1% | 486,543 ±1% | no equivalent written |
| zod | 3,668,931 ±1% | 440,417 ±1% | no equivalent written |
| @cfworker/json-schema | 573,759 ±1% | 55,700 ±1% | 2,908 ±3% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.92x | 0.95x | 1.00x |
| typebox | 1.10x | 1.94x |  |
| fastest-validator | 1.24x | 1.89x |  |
| @exodus/schemasafe | 1.37x | 3.91x | 1.41x |
| ajv | 1.54x | 2.56x | 1.55x |
| ata-validator/lite | 2.02x | 2.88x | 1.35x |
| typia | 2.03x | 3.32x |  |
| typebox (Value.Check) | 2.56x | 11.18x |  |
| valibot | 3.09x | 6.72x |  |
| zod | 3.69x | 7.42x |  |
| @cfworker/json-schema | 23.61x | 58.70x | 14.88x |

## verdict-invalid

invalid documents, the verdict only.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ajv | 15,436,586 ±7% | 3,319,154 ±2% | 24,120 ±0% |
| typebox | 14,254,860 ±2% | 4,245,701 ±1% | no equivalent written |
| ata (compiled) | 13,786,698 ±2% | 4,804,368 ±3% | 27,315 ±0% |
| @exodus/schemasafe | 12,608,783 ±4% | 1,788,517 ±1% | 27,081 ±1% |
| ata | 11,214,953 ±4% | 4,820,205 ±2% | 27,370 ±0% |
| typia | 7,635,819 ±3% | 2,406,039 ±1% | no equivalent written |
| typebox (Value.Check) | 7,022,833 ±2% | 765,640 ±2% | no equivalent written |
| ata-validator/lite | 6,973,262 ±2% | 2,400,061 ±1% | 92,479 ±1% |
| fastest-validator | 2,691,299 ±1% | 1,121,834 ±1% | no equivalent written |
| valibot | 1,772,413 ±1% | 427,054 ±1% | no equivalent written |
| zod | 1,541,941 ±13% | 355,908 ±2% | no equivalent written |
| @cfworker/json-schema | 446,753 ±1% | 130,378 ±3% | 6,155 ±3% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ajv | 0.73x | 1.45x | 1.13x |
| typebox | 0.79x | 1.14x |  |
| ata (compiled) | 0.81x | 1.00x | 1.00x |
| @exodus/schemasafe | 0.89x | 2.70x | 1.01x |
| typia | 1.47x | 2.00x |  |
| typebox (Value.Check) | 1.60x | 6.30x |  |
| ata-validator/lite | 1.61x | 2.01x | 0.30x |
| fastest-validator | 4.17x | 4.30x |  |
| valibot | 6.33x | 11.29x |  |
| zod | 7.27x | 13.54x |  |
| @cfworker/json-schema | 25.10x | 36.97x | 4.45x |

## errors-invalid

invalid documents, every error produced and iterated.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ajv | 6,845,389 ±2% | 1,216,319 ±1% | 11,945 ±0% |
| @exodus/schemasafe | 5,519,228 ±3% | 625,080 ±1% | 11,552 ±1% |
| ata richErrors:false | 4,767,399 ±2% | 2,824,637 ±2% | 13,212 ±1% |
| ata (compiled) | 4,105,151 ±3% | 936,759 ±1% | 9,876 ±1% |
| fastest-validator | 2,772,494 ±1% | 1,135,091 ±0% | no equivalent written |
| ata | 2,246,872 ±2% | 1,550,312 ±1% | 12,054 ±3% |
| typia | 2,134,896 ±1% | 546,278 ±1% | no equivalent written |
| ata-validator/lite | 1,811,155 ±1% | 436,828 ±1% | 22,460 ±2% |
| valibot | 1,790,134 ±1% | 436,994 ±1% | no equivalent written |
| typebox | 1,202,520 ±1% | 116,192 ±1% | no equivalent written |
| typebox (Value.Check) | 1,103,661 ±1% | 102,070 ±1% | no equivalent written |
| zod | 812,463 ±2% | 282,627 ±1% | no equivalent written |
| @cfworker/json-schema | 360,715 ±1% | 57,050 ±2% | 2,952 ±2% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ajv | 0.33x | 1.27x | 1.01x |
| @exodus/schemasafe | 0.41x | 2.48x | 1.04x |
| ata richErrors:false | 0.47x | 0.55x | 0.91x |
| ata (compiled) | 0.55x | 1.65x | 1.22x |
| fastest-validator | 0.81x | 1.37x |  |
| typia | 1.05x | 2.84x |  |
| ata-validator/lite | 1.24x | 3.55x | 0.54x |
| valibot | 1.26x | 3.55x |  |
| typebox | 1.87x | 13.34x |  |
| typebox (Value.Check) | 2.04x | 15.19x |  |
| zod | 2.77x | 5.49x |  |
| @cfworker/json-schema | 6.23x | 27.17x | 4.08x |

## blocked-verdict-valid

valid documents, the verdict, with new Function refused.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata (compiled) | 14,865,334 ±3% | 3,437,998 ±4% | 44,871 ±3% |
| ata | 6,730,305 ±1% | 1,143,231 ±2% | 35,324 ±5% |
| ata-validator/lite | 6,714,140 ±5% | 1,143,630 ±3% | 33,363 ±1% |
| typia | 6,585,091 ±6% | 969,193 ±1% | no equivalent written |
| typebox (Value.Check) | 5,265,375 ±1% | 298,605 ±2% | no equivalent written |
| valibot | 4,339,409 ±1% | 492,910 ±2% | no equivalent written |
| zod | 2,543,353 ±1% | 240,653 ±4% | no equivalent written |
| @cfworker/json-schema | 582,877 ±2% | 56,765 ±2% | 3,009 ±3% |
| ajv | EvalError | EvalError | EvalError |
| @exodus/schemasafe | EvalError | EvalError | EvalError |
| typebox | EvalError | EvalError | no equivalent written |
| fastest-validator | EvalError | EvalError | no equivalent written |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.45x | 0.33x | 0.79x |
| ata-validator/lite | 1.00x | 1.00x | 1.06x |
| typia | 1.02x | 1.18x |  |
| typebox (Value.Check) | 1.28x | 3.83x |  |
| valibot | 1.55x | 2.32x |  |
| zod | 2.65x | 4.75x |  |
| @cfworker/json-schema | 11.55x | 20.14x | 11.74x |
| ajv |  |  |  |
| @exodus/schemasafe |  |  |  |
| typebox |  |  |  |
| fastest-validator |  |  |  |
