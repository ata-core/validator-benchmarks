# Results

2026-10-10, Node v24.19.0, Apple M4 Pro (darwin arm64). One library per process, three passes in rotation, median of 27 samples. Source: `results/2026-10-10-mac-node24.json`.

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
| ata (compiled) | 14,626,039 ±5% | 3,319,594 ±5% | 42,517 ±1% |
| ata | 13,614,882 ±3% | 3,295,880 ±1% | 42,654 ±1% |
| typebox | 12,216,566 ±2% | 1,638,813 ±0% | no equivalent written |
| @exodus/schemasafe | 9,822,851 ±3% | 866,592 ±2% | 31,200 ±0% |
| ajv | 8,504,395 ±2% | 1,285,492 ±1% | 28,671 ±1% |
| typia | 6,631,777 ±4% | 939,572 ±1% | no equivalent written |
| ata-validator/lite | 6,055,201 ±2% | 615,692 ±1% | 26,563 ±2% |
| typebox (Value.Check) | 5,223,758 ±2% | 291,801 ±1% | no equivalent written |
| valibot | 4,400,611 ±1% | 488,297 ±1% | no equivalent written |
| zod | 3,637,505 ±1% | 440,473 ±2% | no equivalent written |
| @cfworker/json-schema | 588,207 ±3% | 55,490 ±1% | 2,882 ±2% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.93x | 0.99x | 1.00x |
| typebox | 1.11x | 2.01x |  |
| @exodus/schemasafe | 1.39x | 3.80x | 1.37x |
| ajv | 1.60x | 2.56x | 1.49x |
| typia | 2.05x | 3.51x |  |
| ata-validator/lite | 2.25x | 5.35x | 1.61x |
| typebox (Value.Check) | 2.61x | 11.29x |  |
| valibot | 3.09x | 6.75x |  |
| zod | 3.74x | 7.48x |  |
| @cfworker/json-schema | 23.15x | 59.40x | 14.80x |

## verdict-invalid

invalid documents, the verdict only.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ajv | 15,526,867 ±6% | 3,304,429 ±2% | 23,737 ±1% |
| typebox | 13,804,720 ±3% | 4,261,080 ±2% | no equivalent written |
| ata (compiled) | 13,138,329 ±2% | 4,885,019 ±2% | 26,476 ±0% |
| @exodus/schemasafe | 12,783,819 ±6% | 1,857,411 ±4% | 26,704 ±0% |
| ata | 8,398,578 ±2% | 4,713,304 ±3% | 26,365 ±0% |
| typia | 8,027,976 ±3% | 2,381,060 ±1% | no equivalent written |
| typebox (Value.Check) | 6,932,977 ±1% | 755,999 ±1% | no equivalent written |
| ata-validator/lite | 4,663,624 ±1% | 1,347,481 ±1% | 65,290 ±42% |
| valibot | 1,775,851 ±1% | 432,651 ±0% | no equivalent written |
| zod | 1,531,619 ±13% | 351,013 ±1% | no equivalent written |
| @cfworker/json-schema | 445,954 ±0% | 131,786 ±1% | 6,251 ±2% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ajv | 0.54x | 1.43x | 1.11x |
| typebox | 0.61x | 1.11x |  |
| ata (compiled) | 0.64x | 0.96x | 1.00x |
| @exodus/schemasafe | 0.66x | 2.54x | 0.99x |
| typia | 1.05x | 1.98x |  |
| typebox (Value.Check) | 1.21x | 6.23x |  |
| ata-validator/lite | 1.80x | 3.50x | 0.40x |
| valibot | 4.73x | 10.89x |  |
| zod | 5.48x | 13.43x |  |
| @cfworker/json-schema | 18.83x | 35.76x | 4.22x |

## errors-invalid

invalid documents, every error produced and iterated.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata richErrors:false | 7,565,192 ±3% | 2,777,226 ±1% | 13,119 ±1% |
| ajv | 6,617,740 ±2% | 1,224,837 ±0% | 11,941 ±1% |
| @exodus/schemasafe | 5,492,055 ±2% | 617,558 ±2% | 11,667 ±1% |
| ata (compiled) | 4,069,469 ±1% | 892,505 ±1% | 10,093 ±2% |
| ata | 2,909,198 ±3% | 1,450,678 ±1% | 11,901 ±2% |
| ata-validator/lite | 2,235,604 ±1% | 328,004 ±1% | 17,877 ±3% |
| typia | 2,017,064 ±1% | 534,951 ±1% | no equivalent written |
| valibot | 1,732,643 ±2% | 429,183 ±1% | no equivalent written |
| typebox | 1,163,645 ±1% | 115,343 ±0% | no equivalent written |
| typebox (Value.Check) | 1,066,750 ±1% | 100,692 ±0% | no equivalent written |
| zod | 779,842 ±1% | 275,267 ±1% | no equivalent written |
| @cfworker/json-schema | 353,719 ±1% | 55,032 ±1% | 2,942 ±1% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata richErrors:false | 0.38x | 0.52x | 0.91x |
| ajv | 0.44x | 1.18x | 1.00x |
| @exodus/schemasafe | 0.53x | 2.35x | 1.02x |
| ata (compiled) | 0.71x | 1.63x | 1.18x |
| ata-validator/lite | 1.30x | 4.42x | 0.67x |
| typia | 1.44x | 2.71x |  |
| valibot | 1.68x | 3.38x |  |
| typebox | 2.50x | 12.58x |  |
| typebox (Value.Check) | 2.73x | 14.41x |  |
| zod | 3.73x | 5.27x |  |
| @cfworker/json-schema | 8.22x | 26.36x | 4.05x |

## blocked-verdict-valid

valid documents, the verdict, with new Function refused.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata (compiled) | 14,722,558 ±5% | 3,344,948 ±4% | 42,967 ±1% |
| typia | 6,525,144 ±5% | 964,507 ±0% | no equivalent written |
| ata | 6,077,115 ±1% | 607,614 ±1% | 27,186 ±1% |
| ata-validator/lite | 5,947,285 ±2% | 611,590 ±1% | 27,633 ±1% |
| typebox (Value.Check) | 5,248,741 ±2% | 290,130 ±0% | no equivalent written |
| valibot | 4,398,045 ±2% | 487,254 ±1% | no equivalent written |
| zod | 2,542,019 ±1% | 237,176 ±1% | no equivalent written |
| @cfworker/json-schema | 577,939 ±3% | 54,851 ±2% | 2,879 ±0% |
| ajv | EvalError | EvalError | EvalError |
| @exodus/schemasafe | EvalError | EvalError | EvalError |
| typebox | EvalError | EvalError | no equivalent written |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.41x | 0.18x | 0.63x |
| typia | 0.93x | 0.63x |  |
| ata-validator/lite | 1.02x | 0.99x | 0.98x |
| typebox (Value.Check) | 1.16x | 2.09x |  |
| valibot | 1.38x | 1.25x |  |
| zod | 2.39x | 2.56x |  |
| @cfworker/json-schema | 10.52x | 11.08x | 9.44x |
| ajv |  |  |  |
| @exodus/schemasafe |  |  |  |
| typebox |  |  |  |
