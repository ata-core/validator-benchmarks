# Results

2026-10-30, Node v24.19.0, Apple M4 Pro (darwin arm64). One library per process, three passes in rotation, median of 27 samples. Source: `results/2026-10-30-merts-macbook-pro-node24.json`.

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
| ata (compiled) | 13,807,936 ±6% | 3,270,947 ±2% | 13,742 ±1% |
| typia | 12,472,441 ±3% | 1,957,392 ±1% | no equivalent written |
| ata | 12,024,902 ±2% | 3,274,803 ±1% | 13,734 ±1% |
| typebox | 11,422,802 ±3% | 1,615,239 ±2% | no equivalent written |
| fastest-validator | 10,549,687 ±3% | 1,716,546 ±1% | no equivalent written |
| @exodus/schemasafe | 9,112,351 ±3% | 828,299 ±3% | 13,316 ±1% |
| ajv | 7,884,520 ±4% | 1,245,508 ±1% | 12,207 ±1% |
| ata-validator/lite | 6,500,952 ±1% | 1,105,849 ±1% | 44,937 ±2% |
| typebox (Value.Check) | 5,238,961 ±2% | 288,827 ±1% | no equivalent written |
| valibot | 4,220,624 ±2% | 478,599 ±1% | no equivalent written |
| zod | 3,466,235 ±2% | 436,632 ±2% | no equivalent written |
| @cfworker/json-schema | 534,250 ±1% | 53,504 ±2% | 2,978 ±1% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.87x | 1.00x | 1.00x |
| typia | 0.96x | 1.67x |  |
| typebox | 1.05x | 2.03x |  |
| fastest-validator | 1.14x | 1.91x |  |
| @exodus/schemasafe | 1.32x | 3.95x | 1.03x |
| ajv | 1.53x | 2.63x | 1.13x |
| ata-validator/lite | 1.85x | 2.96x | 0.31x |
| typebox (Value.Check) | 2.30x | 11.34x |  |
| valibot | 2.85x | 6.84x |  |
| zod | 3.47x | 7.50x |  |
| @cfworker/json-schema | 22.51x | 61.21x | 4.61x |

## verdict-invalid

invalid documents, the verdict only.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ajv | 15,456,180 ±6% | 3,383,338 ±2% | 24,674 ±0% |
| typia | 13,726,170 ±4% | 4,858,350 ±3% | no equivalent written |
| typebox | 13,239,347 ±3% | 4,501,621 ±7% | no equivalent written |
| ata (compiled) | 13,098,487 ±2% | 5,417,114 ±3% | 27,917 ±0% |
| @exodus/schemasafe | 12,314,076 ±2% | 1,849,891 ±1% | 27,687 ±0% |
| ata | 10,426,310 ±4% | 5,336,507 ±4% | 28,045 ±0% |
| ata-validator/lite | 7,400,140 ±2% | 2,421,808 ±2% | 96,740 ±1% |
| typebox (Value.Check) | 6,919,448 ±2% | 775,395 ±1% | no equivalent written |
| valibot | 3,586,361 ±1% | 424,191 ±1% | no equivalent written |
| fastest-validator | 2,688,680 ±1% | 1,148,364 ±1% | no equivalent written |
| zod | 1,570,893 ±5% | 359,570 ±1% | no equivalent written |
| @cfworker/json-schema | 713,277 ±3% | 132,377 ±1% | 6,150 ±1% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ajv | 0.67x | 1.58x | 1.14x |
| typia | 0.76x | 1.10x |  |
| typebox | 0.79x | 1.19x |  |
| ata (compiled) | 0.80x | 0.99x | 1.00x |
| @exodus/schemasafe | 0.85x | 2.88x | 1.01x |
| ata-validator/lite | 1.41x | 2.20x | 0.29x |
| typebox (Value.Check) | 1.51x | 6.88x |  |
| valibot | 2.91x | 12.58x |  |
| fastest-validator | 3.88x | 4.65x |  |
| zod | 6.64x | 14.84x |  |
| @cfworker/json-schema | 14.62x | 40.31x | 4.56x |

## errors-invalid

invalid documents, every error produced and iterated.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ajv | 7,089,575 ±3% | 1,231,085 ±1% | 11,891 ±2% |
| @exodus/schemasafe | 5,750,381 ±2% | 627,184 ±1% | 11,716 ±3% |
| ata (compiled) | 5,624,867 ±2% | 1,735,605 ±2% | 10,733 ±2% |
| ata richErrors:false | 5,213,326 ±1% | 3,256,825 ±3% | 13,005 ±2% |
| typia | 3,649,265 ±1% | 936,227 ±2% | no equivalent written |
| ata | 3,566,496 ±1% | 1,775,486 ±2% | 12,169 ±2% |
| valibot | 3,555,130 ±1% | 427,912 ±2% | no equivalent written |
| fastest-validator | 2,668,404 ±1% | 1,112,716 ±1% | no equivalent written |
| ata-validator/lite | 2,078,958 ±1% | 445,067 ±1% | 21,711 ±2% |
| typebox | 1,196,266 ±0% | 113,667 ±1% | no equivalent written |
| typebox (Value.Check) | 1,096,933 ±1% | 100,715 ±1% | no equivalent written |
| zod | 806,398 ±1% | 277,042 ±1% | no equivalent written |
| @cfworker/json-schema | 582,641 ±2% | 53,956 ±1% | 2,907 ±1% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ajv | 0.50x | 1.44x | 1.02x |
| @exodus/schemasafe | 0.62x | 2.83x | 1.04x |
| ata (compiled) | 0.63x | 1.02x | 1.13x |
| ata richErrors:false | 0.68x | 0.55x | 0.94x |
| typia | 0.98x | 1.90x |  |
| valibot | 1.00x | 4.15x |  |
| fastest-validator | 1.34x | 1.60x |  |
| ata-validator/lite | 1.72x | 3.99x | 0.56x |
| typebox | 2.98x | 15.62x |  |
| typebox (Value.Check) | 3.25x | 17.63x |  |
| zod | 4.42x | 6.41x |  |
| @cfworker/json-schema | 6.12x | 32.91x | 4.19x |

## blocked-verdict-valid

valid documents, the verdict, with new Function refused.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata (compiled) | 14,023,080 ±4% | 3,353,351 ±3% | 13,704 ±2% |
| typia | 12,759,450 ±2% | 1,931,134 ±2% | no equivalent written |
| ata-validator/lite | 6,575,070 ±1% | 1,109,886 ±1% | 44,146 ±3% |
| ata | 6,461,700 ±10% | 1,109,881 ±1% | 43,772 ±1% |
| typebox (Value.Check) | 5,245,670 ±2% | 287,645 ±1% | no equivalent written |
| valibot | 4,361,474 ±1% | 480,800 ±1% | no equivalent written |
| zod | 2,552,382 ±1% | 230,808 ±2% | no equivalent written |
| @cfworker/json-schema | 565,387 ±1% | 54,926 ±2% | 2,945 ±1% |
| ajv | EvalError | EvalError | EvalError |
| @exodus/schemasafe | EvalError | EvalError | EvalError |
| typebox | EvalError | EvalError | no equivalent written |
| fastest-validator | EvalError | EvalError | no equivalent written |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.46x | 0.33x | 3.19x |
| typia | 0.51x | 0.57x |  |
| ata-validator/lite | 0.98x | 1.00x | 0.99x |
| typebox (Value.Check) | 1.23x | 3.86x |  |
| valibot | 1.48x | 2.31x |  |
| zod | 2.53x | 4.81x |  |
| @cfworker/json-schema | 11.43x | 20.21x | 14.86x |
| ajv |  |  |  |
| @exodus/schemasafe |  |  |  |
| typebox |  |  |  |
| fastest-validator |  |  |  |
