# Results

2026-10-10, Node v25.2.1, Apple M4 Pro (darwin arm64). One library per process, three passes in rotation, median of 27 samples. Source: `results/2026-10-10-merts-macbook-pro.json`.

Versions: ata-validator 1.48.0, ajv 8.20.0, ajv-formats 3.0.1, @exodus/schemasafe 1.3.0, @cfworker/json-schema 4.1.1, @sinclair/typebox 0.34.52, zod 4.6.5, valibot 1.5.0

## verdict-valid

valid documents, the verdict only.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata (compiled) | 16,242,262 | 3,393,558 | 296,694 |
| ata | 15,927,602 | 3,261,205 | 399,432 |
| typebox | 13,268,919 | 1,774,518 | no equivalent written |
| @exodus/schemasafe | 11,001,277 | 911,782 | 55,733 |
| ajv | 9,315,639 | 1,361,507 | 88,254 |
| ata-validator/lite | 6,460,296 | 623,762 | 34,367 |
| typebox (Value.Check) | 5,573,148 | 305,728 | no equivalent written |
| valibot | 4,719,952 | 515,530 | no equivalent written |
| zod | 3,671,482 | 451,321 | no equivalent written |
| @cfworker/json-schema | 601,127 | 57,004 | 2,701 |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.98x | 0.96x | 1.35x |
| typebox | 1.20x | 1.84x |  |
| @exodus/schemasafe | 1.45x | 3.58x | 7.17x |
| ajv | 1.71x | 2.40x | 4.53x |
| ata-validator/lite | 2.47x | 5.23x | 11.62x |
| typebox (Value.Check) | 2.86x | 10.67x |  |
| valibot | 3.37x | 6.33x |  |
| zod | 4.34x | 7.23x |  |
| @cfworker/json-schema | 26.50x | 57.21x | 147.90x |

## verdict-invalid

invalid documents, the verdict only.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ajv | 17,260,543 | 3,671,908 | 172,185 |
| ata (compiled) | 14,679,813 | 4,956,505 | 680,092 |
| typebox | 14,666,210 | 4,497,274 | no equivalent written |
| @exodus/schemasafe | 14,193,548 | 1,945,301 | 113,526 |
| ata | 9,004,773 | 4,713,818 | 808,785 |
| typebox (Value.Check) | 7,444,423 | 822,774 | no equivalent written |
| ata-validator/lite | 4,789,985 | 1,420,212 | 69,869 |
| valibot | 1,948,627 | 458,464 | no equivalent written |
| zod | 1,611,421 | 368,121 | no equivalent written |
| @cfworker/json-schema | 383,874 | 58,982 | 2,679 |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ajv | 0.52x | 1.28x | 4.70x |
| ata (compiled) | 0.61x | 0.95x | 1.19x |
| typebox | 0.61x | 1.05x |  |
| @exodus/schemasafe | 0.63x | 2.42x | 7.12x |
| typebox (Value.Check) | 1.21x | 5.73x |  |
| ata-validator/lite | 1.88x | 3.32x | 11.58x |
| valibot | 4.62x | 10.28x |  |
| zod | 5.59x | 12.81x |  |
| @cfworker/json-schema | 23.46x | 79.92x | 301.87x |

## errors-invalid

invalid documents, every error produced and iterated.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata richErrors:false | 7,370,870 | 2,599,306 | 222,056 |
| ajv | 7,154,903 | 1,249,606 | 77,444 |
| @exodus/schemasafe | 5,630,732 | 631,277 | 38,479 |
| ata (compiled) | 4,078,480 | 871,786 | 90,191 |
| ata | 2,981,573 | 1,389,051 | 148,567 |
| ata-validator/lite | 2,301,333 | 333,553 | 18,851 |
| valibot | 1,843,690 | 415,793 | no equivalent written |
| typebox | 1,217,893 | 121,012 | no equivalent written |
| typebox (Value.Check) | 1,077,764 | 106,189 | no equivalent written |
| zod | 809,748 | 268,104 | no equivalent written |
| @cfworker/json-schema | 363,781 | 55,587 | 2,506 |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata richErrors:false | 0.40x | 0.53x | 0.67x |
| ajv | 0.42x | 1.11x | 1.92x |
| @exodus/schemasafe | 0.53x | 2.20x | 3.86x |
| ata (compiled) | 0.73x | 1.59x | 1.65x |
| ata-validator/lite | 1.30x | 4.16x | 7.88x |
| valibot | 1.62x | 3.34x |  |
| typebox | 2.45x | 11.48x |  |
| typebox (Value.Check) | 2.77x | 13.08x |  |
| zod | 3.68x | 5.18x |  |
| @cfworker/json-schema | 8.20x | 24.99x | 59.29x |

## blocked-verdict-valid

valid documents, the verdict, with new Function refused.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata (compiled) | 14,870,447 | 3,162,560 | 274,146 |
| ata | 6,203,979 | 599,333 | 32,014 |
| ata-validator/lite | 6,193,388 | 594,268 | 31,037 |
| typebox (Value.Check) | 5,079,202 | 290,402 | no equivalent written |
| valibot | 4,463,606 | 455,699 | no equivalent written |
| zod | 2,536,280 | 236,497 | no equivalent written |
| @cfworker/json-schema | 555,699 | 53,261 | 2,540 |
| ajv | EvalError | EvalError | EvalError |
| @exodus/schemasafe | EvalError | EvalError | EvalError |
| typebox | EvalError | EvalError | no equivalent written |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.42x | 0.19x | 0.12x |
| ata-validator/lite | 1.00x | 1.01x | 1.03x |
| typebox (Value.Check) | 1.22x | 2.06x |  |
| valibot | 1.39x | 1.32x |  |
| zod | 2.45x | 2.53x |  |
| @cfworker/json-schema | 11.16x | 11.25x | 12.60x |
| ajv |  |  |  |
| @exodus/schemasafe |  |  |  |
| typebox |  |  |  |
