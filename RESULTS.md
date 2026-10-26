# Results

2026-10-26, Node v24.19.0, Apple M4 Pro (darwin arm64). One library per process, three passes in rotation, median of 27 samples. Source: `results/2026-10-26-merts-macbook-pro-node24.json`.

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
| ata (compiled) | 14,346,090 ±2% | 3,461,715 ±2% | 14,708 ±4% |
| ata | 12,447,288 ±3% | 3,317,787 ±2% | 13,871 ±5% |
| typebox | 11,635,362 ±3% | 1,653,496 ±1% | no equivalent written |
| fastest-validator | 10,552,025 ±2% | 1,722,007 ±1% | no equivalent written |
| @exodus/schemasafe | 9,598,255 ±2% | 853,451 ±1% | 13,557 ±4% |
| ajv | 8,464,099 ±3% | 1,284,793 ±2% | 13,049 ±3% |
| typia | 6,546,987 ±1% | 979,099 ±2% | no equivalent written |
| ata-validator/lite | 6,499,439 ±1% | 1,137,686 ±2% | 48,316 ±5% |
| typebox (Value.Check) | 5,256,637 ±1% | 291,076 ±1% | no equivalent written |
| valibot | 4,345,917 ±2% | 489,021 ±0% | no equivalent written |
| zod | 3,599,836 ±1% | 443,548 ±1% | no equivalent written |
| @cfworker/json-schema | 567,831 ±3% | 55,933 ±1% | 1,471 ±96% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.87x | 0.96x | 0.94x |
| typebox | 1.07x | 2.01x |  |
| fastest-validator | 1.18x | 1.93x |  |
| @exodus/schemasafe | 1.30x | 3.89x | 1.02x |
| ajv | 1.47x | 2.58x | 1.06x |
| typia | 1.90x | 3.39x |  |
| ata-validator/lite | 1.92x | 2.92x | 0.29x |
| typebox (Value.Check) | 2.37x | 11.40x |  |
| valibot | 2.86x | 6.78x |  |
| zod | 3.46x | 7.48x |  |
| @cfworker/json-schema | 21.92x | 59.32x | 9.43x |

## verdict-invalid

invalid documents, the verdict only.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ajv | 16,909,232 ±7% | 3,720,960 ±3% | 27,022 ±2% |
| typebox | 14,506,823 ±33% | 4,827,502 ±3% | no equivalent written |
| ata (compiled) | 14,170,277 ±1% | 5,967,150 ±3% | 30,545 ±5% |
| @exodus/schemasafe | 13,381,398 ±4% | 2,016,550 ±1% | 30,063 ±2% |
| ata | 11,156,237 ±8% | 5,900,906 ±3% | 30,841 ±1% |
| typia | 8,566,945 ±5% | 2,844,674 ±2% | no equivalent written |
| ata-validator/lite | 8,040,338 ±2% | 2,649,996 ±1% | 97,733 ±10% |
| typebox (Value.Check) | 7,383,354 ±6% | 835,708 ±1% | no equivalent written |
| valibot | 3,909,438 ±2% | 462,102 ±1% | no equivalent written |
| fastest-validator | 2,950,435 ±1% | 1,232,078 ±3% | no equivalent written |
| zod | 1,663,557 ±14% | 385,174 ±3% | no equivalent written |
| @cfworker/json-schema | 809,347 ±1% | 142,059 ±2% | 6,559 ±46% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ajv | 0.66x | 1.59x | 1.14x |
| typebox | 0.77x | 1.22x |  |
| ata (compiled) | 0.79x | 0.99x | 1.01x |
| @exodus/schemasafe | 0.83x | 2.93x | 1.03x |
| typia | 1.30x | 2.07x |  |
| ata-validator/lite | 1.39x | 2.23x | 0.32x |
| typebox (Value.Check) | 1.51x | 7.06x |  |
| valibot | 2.85x | 12.77x |  |
| fastest-validator | 3.78x | 4.79x |  |
| zod | 6.71x | 15.32x |  |
| @cfworker/json-schema | 13.78x | 41.54x | 4.70x |

## errors-invalid

invalid documents, every error produced and iterated.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ajv | 7,629,811 ±2% | 1,274,767 ±2% | 12,303 ±2% |
| @exodus/schemasafe | 6,029,308 ±1% | 675,572 ±1% | 11,982 ±1% |
| ata (compiled) | 5,870,509 ±2% | 1,747,431 ±3% | 11,440 ±1% |
| ata richErrors:false | 5,494,086 ±1% | 3,290,563 ±2% | 13,622 ±2% |
| ata | 3,771,818 ±1% | 1,869,071 ±1% | 12,702 ±2% |
| valibot | 3,739,848 ±1% | 436,109 ±1% | no equivalent written |
| fastest-validator | 2,747,806 ±1% | 1,166,943 ±1% | no equivalent written |
| typia | 2,188,309 ±3% | 560,863 ±1% | no equivalent written |
| ata-validator/lite | 2,179,407 ±2% | 464,211 ±1% | 22,700 ±1% |
| typebox | 1,240,997 ±1% | 118,060 ±1% | no equivalent written |
| typebox (Value.Check) | 1,129,457 ±1% | 102,229 ±1% | no equivalent written |
| zod | 841,884 ±1% | 292,399 ±2% | no equivalent written |
| @cfworker/json-schema | 595,592 ±1% | 57,350 ±1% | 3,003 ±2% |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ajv | 0.49x | 1.47x | 1.03x |
| @exodus/schemasafe | 0.63x | 2.77x | 1.06x |
| ata (compiled) | 0.64x | 1.07x | 1.11x |
| ata richErrors:false | 0.69x | 0.57x | 0.93x |
| valibot | 1.01x | 4.29x |  |
| fastest-validator | 1.37x | 1.60x |  |
| typia | 1.72x | 3.33x |  |
| ata-validator/lite | 1.73x | 4.03x | 0.56x |
| typebox | 3.04x | 15.83x |  |
| typebox (Value.Check) | 3.34x | 18.28x |  |
| zod | 4.48x | 6.39x |  |
| @cfworker/json-schema | 6.33x | 32.59x | 4.23x |

## blocked-verdict-valid

valid documents, the verdict, with new Function refused.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata (compiled) | 14,145,808 ±5% | 3,491,473 ±3% | 13,819 ±2% |
| typia | 6,680,254 ±3% | 980,388 ±2% | no equivalent written |
| ata-validator/lite | 6,536,632 ±3% | 1,131,534 ±2% | 42,609 ±6% |
| ata | 6,523,172 ±1% | 1,136,383 ±1% | 44,939 ±3% |
| typebox (Value.Check) | 5,340,767 ±1% | 294,701 ±1% | no equivalent written |
| valibot | 4,378,069 ±3% | 485,709 ±1% | no equivalent written |
| zod | 2,592,514 ±1% | 240,179 ±2% | no equivalent written |
| @cfworker/json-schema | 583,940 ±1% | 56,677 ±1% | 2,949 ±1% |
| ajv | EvalError | EvalError | EvalError |
| @exodus/schemasafe | EvalError | EvalError | EvalError |
| typebox | EvalError | EvalError | no equivalent written |
| fastest-validator | EvalError | EvalError | no equivalent written |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.46x | 0.33x | 3.25x |
| typia | 0.98x | 1.16x |  |
| ata-validator/lite | 1.00x | 1.00x | 1.05x |
| typebox (Value.Check) | 1.22x | 3.86x |  |
| valibot | 1.49x | 2.34x |  |
| zod | 2.52x | 4.73x |  |
| @cfworker/json-schema | 11.17x | 20.05x | 15.24x |
| ajv |  |  |  |
| @exodus/schemasafe |  |  |  |
| typebox |  |  |  |
| fastest-validator |  |  |  |
