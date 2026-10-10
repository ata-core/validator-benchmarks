# Results

2026-10-10, Node v24.21.0, AMD EPYC 7763 64-Core Processor (linux x64). One library per process, three passes in rotation, median of 27 samples. Source: `results/2026-10-10-github-linux-node24.json`.

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
| ata (compiled) | 8,106,883 ±1% | 1,306,990 ±2% | 13,434 ±1% |
| ata | 7,246,300 ±4% | 1,267,184 ±2% | 13,641 ±2% |
| typebox | 6,149,267 ±3% | 566,133 ±1% | no equivalent written |
| @exodus/schemasafe | 5,064,521 ±5% | 345,537 ±1% | 9,450 ±1% |
| ajv | 4,518,857 ±5% | 469,324 ±1% | 9,366 ±1% |
| typia | 3,075,782 ±5% | 379,665 ±1% | no equivalent written |
| ata-validator/lite | 2,582,960 ±2% | 271,107 ±1% | 10,802 ±1% |
| typebox (Value.Check) | 2,102,342 ±2% | 113,629 ±1% | no equivalent written |
| valibot | 1,789,787 ±2% | 197,930 ±2% | no equivalent written |
| zod | 1,537,278 ±1% | 164,797 ±3% | no equivalent written |
| @cfworker/json-schema | 220,077 ±1% | 21,438 ±0% | 1,223 ±0% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.89x | 0.97x | 1.02x |
| typebox | 1.18x | 2.24x |  |
| @exodus/schemasafe | 1.43x | 3.67x | 1.44x |
| ajv | 1.60x | 2.70x | 1.46x |
| typia | 2.36x | 3.34x |  |
| ata-validator/lite | 2.81x | 4.67x | 1.26x |
| typebox (Value.Check) | 3.45x | 11.15x |  |
| valibot | 4.05x | 6.40x |  |
| zod | 4.71x | 7.69x |  |
| @cfworker/json-schema | 32.93x | 59.11x | 11.15x |

## verdict-invalid

invalid documents, the verdict only.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata (compiled) | 7,362,836 ±1% | 2,135,223 ±3% | 12,117 ±3% |
| ajv | 6,706,306 ±4% | 1,336,710 ±5% | 10,900 ±3% |
| typebox | 6,431,349 ±3% | 1,672,224 ±1% | no equivalent written |
| @exodus/schemasafe | 5,772,302 ±6% | 745,660 ±2% | 11,454 ±2% |
| typia | 3,828,956 ±1% | 969,358 ±1% | no equivalent written |
| ata | 3,347,924 ±2% | 2,075,632 ±2% | 11,780 ±2% |
| typebox (Value.Check) | 2,872,818 ±3% | 311,511 ±1% | no equivalent written |
| ata-validator/lite | 1,753,041 ±2% | 585,614 ±3% | 34,061 ±4% |
| valibot | 541,528 ±12% | 168,730 ±4% | no equivalent written |
| zod | 497,499 ±11% | 122,781 ±2% | no equivalent written |
| @cfworker/json-schema | 132,690 ±5% | 49,730 ±1% | 2,505 ±1% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.45x | 0.97x | 0.97x |
| ajv | 0.50x | 1.55x | 1.08x |
| typebox | 0.52x | 1.24x |  |
| @exodus/schemasafe | 0.58x | 2.78x | 1.03x |
| typia | 0.87x | 2.14x |  |
| typebox (Value.Check) | 1.17x | 6.66x |  |
| ata-validator/lite | 1.91x | 3.54x | 0.35x |
| valibot | 6.18x | 12.30x |  |
| zod | 6.73x | 16.91x |  |
| @cfworker/json-schema | 25.23x | 41.74x | 4.70x |

## errors-invalid

invalid documents, every error produced and iterated.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata richErrors:false | 3,011,397 ±2% | 1,038,224 ±1% | 5,952 ±1% |
| ajv | 2,864,368 ±3% | 445,563 ±1% | 5,245 ±1% |
| @exodus/schemasafe | 2,132,516 ±3% | 252,495 ±2% | 4,451 ±1% |
| ata (compiled) | 1,792,258 ±1% | 360,946 ±1% | 4,022 ±0% |
| typia | 955,337 ±1% | 201,542 ±1% | no equivalent written |
| ata | 898,089 ±1% | 489,815 ±1% | 4,813 ±1% |
| ata-validator/lite | 700,669 ±4% | 131,387 ±2% | 8,594 ±2% |
| valibot | 515,592 ±10% | 168,238 ±2% | no equivalent written |
| typebox | 453,297 ±1% | 43,802 ±1% | no equivalent written |
| typebox (Value.Check) | 400,340 ±1% | 38,358 ±1% | no equivalent written |
| zod | 254,468 ±3% | 97,654 ±2% | no equivalent written |
| @cfworker/json-schema | 107,026 ±4% | 21,626 ±1% | 1,227 ±1% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata richErrors:false | 0.30x | 0.47x | 0.81x |
| ajv | 0.31x | 1.10x | 0.92x |
| @exodus/schemasafe | 0.42x | 1.94x | 1.08x |
| ata (compiled) | 0.50x | 1.36x | 1.20x |
| typia | 0.94x | 2.43x |  |
| ata-validator/lite | 1.28x | 3.73x | 0.56x |
| valibot | 1.74x | 2.91x |  |
| typebox | 1.98x | 11.18x |  |
| typebox (Value.Check) | 2.24x | 12.77x |  |
| zod | 3.53x | 5.02x |  |
| @cfworker/json-schema | 8.39x | 22.65x | 3.92x |

## blocked-verdict-valid

valid documents, the verdict, with new Function refused.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata (compiled) | 8,105,506 ±1% | 1,287,155 ±2% | 14,304 ±1% |
| typia | 3,166,392 ±1% | 374,712 ±1% | no equivalent written |
| ata | 2,604,778 ±2% | 270,267 ±2% | 11,953 ±3% |
| ata-validator/lite | 2,581,151 ±3% | 277,592 ±1% | 12,137 ±2% |
| typebox (Value.Check) | 2,196,334 ±2% | 117,537 ±0% | no equivalent written |
| valibot | 1,795,877 ±1% | 200,666 ±1% | no equivalent written |
| zod | 1,001,017 ±1% | 92,362 ±1% | no equivalent written |
| @cfworker/json-schema | 220,034 ±0% | 21,618 ±1% | 1,222 ±1% |
| ajv | EvalError | EvalError | EvalError |
| @exodus/schemasafe | EvalError | EvalError | EvalError |
| typebox | EvalError | EvalError | no equivalent written |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.32x | 0.21x | 0.84x |
| typia | 0.82x | 0.72x |  |
| ata-validator/lite | 1.01x | 0.97x | 0.98x |
| typebox (Value.Check) | 1.19x | 2.30x |  |
| valibot | 1.45x | 1.35x |  |
| zod | 2.60x | 2.93x |  |
| @cfworker/json-schema | 11.84x | 12.50x | 9.78x |
| ajv |  |  |  |
| @exodus/schemasafe |  |  |  |
| typebox |  |  |  |
