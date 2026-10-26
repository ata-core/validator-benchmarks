# Results

2026-10-26, Node v25.2.1, Apple M4 Pro (darwin arm64). One library per process, three passes in rotation, median of 27 samples. Source: `results/2026-10-26-merts-macbook-pro-node25.json`.

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
| ata (compiled) | 16,313,630 ±4% | 3,127,653 ±1% | 43,812 ±2% |
| ata | 15,000,466 ±3% | 3,209,813 ±2% | 44,993 ±1% |
| typebox | 13,449,177 ±3% | 1,716,075 ±1% | no equivalent written |
| fastest-validator | 11,772,575 ±2% | 1,761,037 ±1% | no equivalent written |
| @exodus/schemasafe | 10,415,571 ±4% | 887,848 ±2% | 31,715 ±1% |
| ajv | 9,376,483 ±4% | 1,347,424 ±1% | 28,999 ±2% |
| typia | 7,618,195 ±2% | 998,775 ±2% | no equivalent written |
| ata-validator/lite | 7,139,100 ±2% | 1,165,972 ±2% | 32,015 ±0% |
| typebox (Value.Check) | 5,385,435 ±3% | 300,501 ±1% | no equivalent written |
| valibot | 4,613,771 ±2% | 504,746 ±1% | no equivalent written |
| zod | 3,836,962 ±1% | 449,383 ±1% | no equivalent written |
| @cfworker/json-schema | 583,218 ±2% | 55,838 ±1% | 2,879 ±2% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.92x | 1.03x | 1.03x |
| typebox | 1.12x | 1.87x |  |
| fastest-validator | 1.27x | 1.82x |  |
| @exodus/schemasafe | 1.44x | 3.62x | 1.42x |
| ajv | 1.60x | 2.38x | 1.55x |
| typia | 1.97x | 3.21x |  |
| ata-validator/lite | 2.10x | 2.75x | 1.41x |
| typebox (Value.Check) | 2.79x | 10.68x |  |
| valibot | 3.25x | 6.36x |  |
| zod | 3.91x | 7.14x |  |
| @cfworker/json-schema | 25.72x | 57.48x | 15.63x |

## verdict-invalid

invalid documents, the verdict only.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ajv | 15,981,700 ±5% | 3,395,013 ±2% | 26,389 ±0% |
| typebox | 14,020,588 ±1% | 4,134,294 ±2% | no equivalent written |
| ata (compiled) | 13,576,755 ±2% | 4,275,304 ±2% | 29,635 ±0% |
| @exodus/schemasafe | 12,868,281 ±4% | 1,894,843 ±1% | 28,353 ±1% |
| ata | 11,486,584 ±4% | 4,359,274 ±2% | 29,689 ±0% |
| typia | 8,441,999 ±2% | 2,511,416 ±2% | no equivalent written |
| ata-validator/lite | 7,074,059 ±3% | 2,313,445 ±1% | 91,154 ±1% |
| typebox (Value.Check) | 6,914,212 ±2% | 797,884 ±1% | no equivalent written |
| fastest-validator | 2,587,714 ±2% | 1,128,615 ±0% | no equivalent written |
| valibot | 1,790,174 ±2% | 442,048 ±1% | no equivalent written |
| zod | 1,514,263 ±16% | 360,472 ±1% | no equivalent written |
| @cfworker/json-schema | 449,907 ±1% | 131,075 ±1% | 6,191 ±1% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ajv | 0.72x | 1.28x | 1.13x |
| typebox | 0.82x | 1.05x |  |
| ata (compiled) | 0.85x | 1.02x | 1.00x |
| @exodus/schemasafe | 0.89x | 2.30x | 1.05x |
| typia | 1.36x | 1.74x |  |
| ata-validator/lite | 1.62x | 1.88x | 0.33x |
| typebox (Value.Check) | 1.66x | 5.46x |  |
| fastest-validator | 4.44x | 3.86x |  |
| valibot | 6.42x | 9.86x |  |
| zod | 7.59x | 12.09x |  |
| @cfworker/json-schema | 25.53x | 33.26x | 4.80x |

## errors-invalid

invalid documents, every error produced and iterated.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ajv | 6,714,425 ±2% | 1,233,091 ±1% | 12,364 ±4% |
| @exodus/schemasafe | 5,602,320 ±1% | 618,875 ±5% | 11,510 ±3% |
| ata richErrors:false | 4,657,180 ±2% | 2,607,794 ±3% | 12,712 ±7% |
| ata (compiled) | 3,859,273 ±1% | 835,110 ±2% | 9,365 ±7% |
| fastest-validator | 2,607,107 ±1% | 1,112,823 ±1% | no equivalent written |
| ata | 2,276,854 ±1% | 1,367,817 ±1% | 12,200 ±8% |
| typia | 2,150,830 ±1% | 536,038 ±1% | no equivalent written |
| valibot | 1,812,723 ±1% | 436,633 ±0% | no equivalent written |
| ata-validator/lite | 1,748,660 ±1% | 428,655 ±3% | 19,507 ±8% |
| typebox | 1,231,225 ±1% | 122,600 ±1% | no equivalent written |
| typebox (Value.Check) | 1,084,439 ±1% | 103,484 ±1% | no equivalent written |
| zod | 786,935 ±1% | 276,132 ±1% | no equivalent written |
| @cfworker/json-schema | 359,803 ±1% | 56,643 ±1% | 2,793 ±4% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ajv | 0.34x | 1.11x | 0.99x |
| @exodus/schemasafe | 0.41x | 2.21x | 1.06x |
| ata richErrors:false | 0.49x | 0.52x | 0.96x |
| ata (compiled) | 0.59x | 1.64x | 1.30x |
| fastest-validator | 0.87x | 1.23x |  |
| typia | 1.06x | 2.55x |  |
| valibot | 1.26x | 3.13x |  |
| ata-validator/lite | 1.30x | 3.19x | 0.63x |
| typebox | 1.85x | 11.16x |  |
| typebox (Value.Check) | 2.10x | 13.22x |  |
| zod | 2.89x | 4.95x |  |
| @cfworker/json-schema | 6.33x | 24.15x | 4.37x |

## blocked-verdict-valid

valid documents, the verdict, with new Function refused.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata (compiled) | 14,971,645 ±4% | 3,152,093 ±4% | 43,221 ±1% |
| ata | 6,805,585 ±2% | 1,149,976 ±2% | 33,984 ±4% |
| typia | 6,747,604 ±3% | 1,010,193 ±2% | no equivalent written |
| ata-validator/lite | 6,747,510 ±2% | 1,142,269 ±1% | 33,634 ±2% |
| typebox (Value.Check) | 5,169,487 ±2% | 294,719 ±1% | no equivalent written |
| valibot | 4,521,495 ±1% | 503,888 ±0% | no equivalent written |
| zod | 2,587,094 ±1% | 243,248 ±1% | no equivalent written |
| @cfworker/json-schema | 585,838 ±1% | 55,910 ±1% | 2,974 ±1% |
| ajv | EvalError | EvalError | EvalError |
| @exodus/schemasafe | EvalError | EvalError | EvalError |
| typebox | EvalError | EvalError | no equivalent written |
| fastest-validator | EvalError | EvalError | no equivalent written |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.45x | 0.36x | 0.79x |
| typia | 1.01x | 1.14x |  |
| ata-validator/lite | 1.01x | 1.01x | 1.01x |
| typebox (Value.Check) | 1.32x | 3.90x |  |
| valibot | 1.51x | 2.28x |  |
| zod | 2.63x | 4.73x |  |
| @cfworker/json-schema | 11.62x | 20.57x | 11.43x |
| ajv |  |  |  |
| @exodus/schemasafe |  |  |  |
| typebox |  |  |  |
| fastest-validator |  |  |  |
