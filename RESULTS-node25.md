# Results

2026-10-10, Node v25.2.1, Apple M4 Pro (darwin arm64). One library per process, three passes in rotation, median of 27 samples. Source: `results/2026-10-10-mac-node25.json`.

Versions: ata-validator 1.48.0, ajv 8.20.0, ajv-formats 3.0.1, @exodus/schemasafe 1.3.0, @cfworker/json-schema 4.1.1, @sinclair/typebox 0.34.52, typia 15.1.0, zod 4.6.5, valibot 1.5.0

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

Formats (email, uuid, date-time) are checked by each library's own rules, which differ in strictness; every library accepts every valid document and rejects every invalid one here, which the runner checks before timing.

## verdict-valid

valid documents, the verdict only.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata | 15,163,211 ±4% | 3,037,412 ±4% | 42,239 ±2% |
| ata (compiled) | 15,005,684 ±8% | 3,044,612 ±4% | 41,085 ±1% |
| typebox | 12,662,883 ±3% | 1,659,218 ±2% | no equivalent written |
| @exodus/schemasafe | 9,988,226 ±3% | 858,732 ±2% | 30,991 ±1% |
| ajv | 8,990,805 ±5% | 1,305,254 ±2% | 27,945 ±3% |
| typia | 6,861,896 ±3% | 960,835 ±4% | no equivalent written |
| ata-validator/lite | 6,099,032 ±3% | 599,777 ±1% | 27,277 ±1% |
| typebox (Value.Check) | 5,257,974 ±2% | 291,135 ±1% | no equivalent written |
| valibot | 4,416,562 ±2% | 495,206 ±1% | no equivalent written |
| zod | 3,648,564 ±2% | 438,117 ±1% | no equivalent written |
| @cfworker/json-schema | 575,010 ±1% | 54,890 ±1% | 2,893 ±1% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 1.01x | 1.00x | 1.03x |
| typebox | 1.20x | 1.83x |  |
| @exodus/schemasafe | 1.52x | 3.54x | 1.36x |
| ajv | 1.69x | 2.33x | 1.51x |
| typia | 2.21x | 3.16x |  |
| ata-validator/lite | 2.49x | 5.06x | 1.55x |
| typebox (Value.Check) | 2.88x | 10.43x |  |
| valibot | 3.43x | 6.13x |  |
| zod | 4.16x | 6.93x |  |
| @cfworker/json-schema | 26.37x | 55.34x | 14.60x |

## verdict-invalid

invalid documents, the verdict only.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ajv | 15,919,073 ±5% | 3,338,462 ±2% | 25,895 ±1% |
| typebox | 14,039,228 ±2% | 4,254,519 ±2% | no equivalent written |
| ata (compiled) | 13,196,701 ±3% | 4,224,525 ±3% | 28,485 ±0% |
| @exodus/schemasafe | 12,912,693 ±2% | 1,863,822 ±1% | 27,950 ±0% |
| typia | 8,535,403 ±2% | 2,420,649 ±3% | no equivalent written |
| ata | 8,392,053 ±2% | 4,200,477 ±2% | 28,518 ±0% |
| typebox (Value.Check) | 7,049,608 ±2% | 782,692 ±1% | no equivalent written |
| ata-validator/lite | 4,776,935 ±1% | 1,299,884 ±3% | 65,054 ±1% |
| valibot | 1,822,302 ±1% | 439,309 ±1% | no equivalent written |
| zod | 1,537,024 ±13% | 349,799 ±2% | no equivalent written |
| @cfworker/json-schema | 450,374 ±0% | 129,645 ±1% | 6,164 ±1% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ajv | 0.53x | 1.26x | 1.10x |
| typebox | 0.60x | 0.99x |  |
| ata (compiled) | 0.64x | 0.99x | 1.00x |
| @exodus/schemasafe | 0.65x | 2.25x | 1.02x |
| typia | 0.98x | 1.74x |  |
| typebox (Value.Check) | 1.19x | 5.37x |  |
| ata-validator/lite | 1.76x | 3.23x | 0.44x |
| valibot | 4.61x | 9.56x |  |
| zod | 5.46x | 12.01x |  |
| @cfworker/json-schema | 18.63x | 32.40x | 4.63x |

## errors-invalid

invalid documents, every error produced and iterated.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata richErrors:false | 7,722,809 ±2% | 2,640,044 ±1% | 14,088 ±0% |
| ajv | 6,728,496 ±2% | 1,204,276 ±2% | 12,710 ±1% |
| @exodus/schemasafe | 5,526,095 ±2% | 624,842 ±2% | 11,895 ±1% |
| ata (compiled) | 4,064,039 ±1% | 853,221 ±2% | 10,223 ±1% |
| ata | 2,922,797 ±1% | 1,360,373 ±2% | 12,414 ±1% |
| ata-validator/lite | 2,284,044 ±1% | 327,363 ±1% | 18,314 ±1% |
| typia | 2,185,159 ±2% | 529,074 ±1% | no equivalent written |
| valibot | 1,805,643 ±0% | 440,192 ±0% | no equivalent written |
| typebox | 1,217,637 ±1% | 120,696 ±1% | no equivalent written |
| typebox (Value.Check) | 1,104,947 ±1% | 105,733 ±0% | no equivalent written |
| zod | 782,347 ±2% | 278,903 ±1% | no equivalent written |
| @cfworker/json-schema | 353,196 ±0% | 56,072 ±0% | 2,991 ±1% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata richErrors:false | 0.38x | 0.52x | 0.88x |
| ajv | 0.43x | 1.13x | 0.98x |
| @exodus/schemasafe | 0.53x | 2.18x | 1.04x |
| ata (compiled) | 0.72x | 1.59x | 1.21x |
| ata-validator/lite | 1.28x | 4.16x | 0.68x |
| typia | 1.34x | 2.57x |  |
| valibot | 1.62x | 3.09x |  |
| typebox | 2.40x | 11.27x |  |
| typebox (Value.Check) | 2.65x | 12.87x |  |
| zod | 3.74x | 4.88x |  |
| @cfworker/json-schema | 8.28x | 24.26x | 4.15x |

## blocked-verdict-valid

valid documents, the verdict, with new Function refused.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata (compiled) | 14,783,014 ±7% | 3,056,302 ±2% | 42,279 ±1% |
| typia | 6,684,016 ±3% | 977,619 ±2% | no equivalent written |
| ata-validator/lite | 6,113,313 ±2% | 591,351 ±1% | 26,845 ±3% |
| ata | 6,021,363 ±3% | 606,457 ±1% | 27,810 ±1% |
| typebox (Value.Check) | 5,189,982 ±2% | 292,434 ±1% | no equivalent written |
| valibot | 4,480,272 ±2% | 495,516 ±0% | no equivalent written |
| zod | 2,589,575 ±1% | 237,374 ±1% | no equivalent written |
| @cfworker/json-schema | 580,518 ±1% | 55,606 ±1% | 2,942 ±1% |
| ajv | EvalError | EvalError | EvalError |
| @exodus/schemasafe | EvalError | EvalError | EvalError |
| typebox | EvalError | EvalError | no equivalent written |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.41x | 0.20x | 0.66x |
| typia | 0.90x | 0.62x |  |
| ata-validator/lite | 0.98x | 1.03x | 1.04x |
| typebox (Value.Check) | 1.16x | 2.07x |  |
| valibot | 1.34x | 1.22x |  |
| zod | 2.33x | 2.55x |  |
| @cfworker/json-schema | 10.37x | 10.91x | 9.45x |
| ajv |  |  |  |
| @exodus/schemasafe |  |  |  |
| typebox |  |  |  |
