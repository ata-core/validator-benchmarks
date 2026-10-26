# Results

2026-10-26, Node v25.2.1, Apple M4 Pro (darwin arm64). One library per process, three passes in rotation, median of 27 samples. Source: `results/2026-10-26-merts-macbook-pro-node25.json`.

Versions: ata-validator 1.61.0, ajv 8.20.0, ajv-formats 3.0.1, @exodus/schemasafe 1.3.0, @cfworker/json-schema 4.1.1, @sinclair/typebox 0.34.52, typia 15.1.0, zod 4.6.5, valibot 1.5.0, fastest-validator 1.19.1

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
| ata (compiled) | 15,740,833 ±3% | 3,395,304 ±5% | 15,270 ±2% |
| ata | 14,171,118 ±4% | 3,222,831 ±1% | 15,396 ±2% |
| typebox | 12,695,693 ±5% | 1,755,157 ±1% | no equivalent written |
| fastest-validator | 11,301,905 ±4% | 1,802,533 ±1% | no equivalent written |
| @exodus/schemasafe | 10,886,353 ±3% | 883,840 ±2% | 14,486 ±1% |
| ajv | 9,495,073 ±3% | 1,333,348 ±1% | 13,667 ±1% |
| typia | 6,994,922 ±4% | 1,046,811 ±2% | no equivalent written |
| ata-validator/lite | 6,941,075 ±4% | 1,164,295 ±1% | 44,676 ±2% |
| typebox (Value.Check) | 5,517,241 ±3% | 303,621 ±1% | no equivalent written |
| valibot | 4,688,702 ±3% | 512,469 ±1% | no equivalent written |
| zod | 3,831,764 ±1% | 453,900 ±1% | no equivalent written |
| @cfworker/json-schema | 596,992 ±2% | 57,022 ±2% | 3,068 ±2% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.90x | 0.95x | 1.01x |
| typebox | 1.12x | 1.84x |  |
| fastest-validator | 1.25x | 1.79x |  |
| @exodus/schemasafe | 1.30x | 3.65x | 1.06x |
| ajv | 1.49x | 2.42x | 1.13x |
| typia | 2.03x | 3.08x |  |
| ata-validator/lite | 2.04x | 2.77x | 0.34x |
| typebox (Value.Check) | 2.57x | 10.61x |  |
| valibot | 3.02x | 6.29x |  |
| zod | 3.70x | 7.10x |  |
| @cfworker/json-schema | 23.74x | 56.52x | 5.02x |

## verdict-invalid

invalid documents, the verdict only.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ajv | 15,656,295 ±6% | 3,410,265 ±3% | 27,306 ±0% |
| typebox | 13,903,674 ±3% | 4,508,881 ±3% | no equivalent written |
| ata (compiled) | 13,444,995 ±2% | 4,583,113 ±3% | 30,698 ±1% |
| @exodus/schemasafe | 12,394,692 ±3% | 1,878,291 ±1% | 29,587 ±1% |
| ata | 11,178,281 ±5% | 4,853,041 ±3% | 31,032 ±1% |
| typia | 8,494,208 ±3% | 2,467,136 ±2% | no equivalent written |
| ata-validator/lite | 7,619,781 ±3% | 2,302,537 ±1% | 95,239 ±2% |
| typebox (Value.Check) | 6,953,671 ±1% | 779,402 ±1% | no equivalent written |
| valibot | 3,664,405 ±1% | 434,794 ±1% | no equivalent written |
| fastest-validator | 2,613,416 ±2% | 1,150,915 ±0% | no equivalent written |
| zod | 1,579,519 ±16% | 359,488 ±2% | no equivalent written |
| @cfworker/json-schema | 734,514 ±3% | 128,475 ±2% | 6,243 ±1% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ajv | 0.71x | 1.42x | 1.14x |
| typebox | 0.80x | 1.08x |  |
| ata (compiled) | 0.83x | 1.06x | 1.01x |
| @exodus/schemasafe | 0.90x | 2.58x | 1.05x |
| typia | 1.32x | 1.97x |  |
| ata-validator/lite | 1.47x | 2.11x | 0.33x |
| typebox (Value.Check) | 1.61x | 6.23x |  |
| valibot | 3.05x | 11.16x |  |
| fastest-validator | 4.28x | 4.22x |  |
| zod | 7.08x | 13.50x |  |
| @cfworker/json-schema | 15.22x | 37.77x | 4.97x |

## errors-invalid

invalid documents, every error produced and iterated.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ajv | 7,297,072 ±2% | 1,319,472 ±2% | 13,159 ±2% |
| @exodus/schemasafe | 5,990,772 ±2% | 681,294 ±2% | 12,298 ±1% |
| ata (compiled) | 5,672,675 ±1% | 1,657,042 ±3% | 11,880 ±3% |
| ata richErrors:false | 5,452,856 ±1% | 3,172,102 ±5% | 14,641 ±1% |
| ata | 3,782,476 ±2% | 1,772,638 ±2% | 13,422 ±1% |
| valibot | 3,637,588 ±1% | 448,981 ±2% | no equivalent written |
| fastest-validator | 2,519,672 ±2% | 1,179,988 ±2% | no equivalent written |
| typia | 2,277,040 ±2% | 543,909 ±4% | no equivalent written |
| ata-validator/lite | 2,139,837 ±1% | 477,164 ±3% | 21,390 ±2% |
| typebox | 1,258,085 ±1% | 124,154 ±1% | no equivalent written |
| typebox (Value.Check) | 1,142,596 ±1% | 107,592 ±3% | no equivalent written |
| zod | 816,219 ±1% | 283,089 ±2% | no equivalent written |
| @cfworker/json-schema | 567,887 ±1% | 57,458 ±1% | 2,954 ±1% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ajv | 0.52x | 1.34x | 1.02x |
| @exodus/schemasafe | 0.63x | 2.60x | 1.09x |
| ata (compiled) | 0.67x | 1.07x | 1.13x |
| ata richErrors:false | 0.69x | 0.56x | 0.92x |
| valibot | 1.04x | 3.95x |  |
| fastest-validator | 1.50x | 1.50x |  |
| typia | 1.66x | 3.26x |  |
| ata-validator/lite | 1.77x | 3.71x | 0.63x |
| typebox | 3.01x | 14.28x |  |
| typebox (Value.Check) | 3.31x | 16.48x |  |
| zod | 4.63x | 6.26x |  |
| @cfworker/json-schema | 6.66x | 30.85x | 4.54x |

## blocked-verdict-valid

valid documents, the verdict, with new Function refused.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata (compiled) | 14,398,691 ±3% | 3,115,310 ±3% | 14,261 ±2% |
| ata | 6,702,209 ±1% | 1,140,600 ±1% | 41,977 ±2% |
| ata-validator/lite | 6,650,059 ±3% | 1,138,665 ±2% | 42,731 ±3% |
| typia | 6,378,095 ±8% | 1,000,349 ±2% | no equivalent written |
| typebox (Value.Check) | 5,130,309 ±3% | 296,548 ±1% | no equivalent written |
| valibot | 4,435,319 ±3% | 497,176 ±1% | no equivalent written |
| zod | 2,605,992 ±1% | 242,097 ±1% | no equivalent written |
| @cfworker/json-schema | 571,432 ±1% | 54,792 ±2% | 2,968 ±1% |
| ajv | EvalError | EvalError | EvalError |
| @exodus/schemasafe | EvalError | EvalError | EvalError |
| typebox | EvalError | EvalError | no equivalent written |
| fastest-validator | EvalError | EvalError | no equivalent written |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.47x | 0.37x | 2.94x |
| ata-validator/lite | 1.01x | 1.00x | 0.98x |
| typia | 1.05x | 1.14x |  |
| typebox (Value.Check) | 1.31x | 3.85x |  |
| valibot | 1.51x | 2.29x |  |
| zod | 2.57x | 4.71x |  |
| @cfworker/json-schema | 11.73x | 20.82x | 14.15x |
| ajv |  |  |  |
| @exodus/schemasafe |  |  |  |
| typebox |  |  |  |
| fastest-validator |  |  |  |
