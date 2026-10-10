# Results

2026-10-10, Node v25.2.1, Apple M4 Pro (darwin arm64). One library per process, three passes in rotation, median of 27 samples. Source: `results/2026-10-10-mac.json`.

Versions: ata-validator 1.48.0, ajv 8.20.0, ajv-formats 3.0.1, @exodus/schemasafe 1.3.0, @cfworker/json-schema 4.1.1, @sinclair/typebox 0.34.52, typia 15.1.0, zod 4.6.5, valibot 1.5.0

## verdict-valid

valid documents, the verdict only.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata (compiled) | 15,183,083 | 3,099,804 | 273,346 |
| ata | 15,077,570 | 3,110,518 | 365,878 |
| typebox | 12,597,087 | 1,663,376 | no equivalent written |
| @exodus/schemasafe | 10,155,362 | 835,596 | 50,135 |
| ajv | 9,135,648 | 1,295,868 | 79,821 |
| typia | 7,179,009 | 966,347 | no equivalent written |
| ata-validator/lite | 6,198,235 | 591,253 | 29,575 |
| typebox (Value.Check) | 5,212,755 | 287,833 | no equivalent written |
| valibot | 4,581,964 | 481,603 | no equivalent written |
| zod | 3,631,472 | 425,388 | no equivalent written |
| @cfworker/json-schema | 571,545 | 52,574 | 2,499 |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.99x | 1.00x | 1.34x |
| typebox | 1.20x | 1.87x |  |
| @exodus/schemasafe | 1.48x | 3.72x | 7.30x |
| ajv | 1.65x | 2.40x | 4.58x |
| typia | 2.10x | 3.22x |  |
| ata-validator/lite | 2.43x | 5.26x | 12.37x |
| typebox (Value.Check) | 2.89x | 10.81x |  |
| valibot | 3.29x | 6.46x |  |
| zod | 4.15x | 7.31x |  |
| @cfworker/json-schema | 26.38x | 59.16x | 146.39x |

## verdict-invalid

invalid documents, the verdict only.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ajv | 15,396,579 | 3,341,114 | 161,122 |
| typebox | 13,826,816 | 4,020,951 | no equivalent written |
| ata (compiled) | 13,388,184 | 4,198,362 | 633,449 |
| @exodus/schemasafe | 12,464,919 | 1,777,266 | 104,073 |
| typia | 8,361,045 | 2,395,451 | no equivalent written |
| ata | 8,002,965 | 4,231,937 | 736,975 |
| typebox (Value.Check) | 6,927,316 | 763,136 | no equivalent written |
| ata-validator/lite | 4,393,938 | 1,285,426 | 66,101 |
| valibot | 1,800,539 | 424,129 | no equivalent written |
| zod | 1,499,886 | 301,834 | no equivalent written |
| @cfworker/json-schema | 349,421 | 52,592 | 2,516 |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ajv | 0.52x | 1.27x | 4.57x |
| typebox | 0.58x | 1.05x |  |
| ata (compiled) | 0.60x | 1.01x | 1.16x |
| @exodus/schemasafe | 0.64x | 2.38x | 7.08x |
| typia | 0.96x | 1.77x |  |
| typebox (Value.Check) | 1.16x | 5.55x |  |
| ata-validator/lite | 1.82x | 3.29x | 11.15x |
| valibot | 4.44x | 9.98x |  |
| zod | 5.34x | 14.02x |  |
| @cfworker/json-schema | 22.90x | 80.47x | 292.87x |

## errors-invalid

invalid documents, every error produced and iterated.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata richErrors:false | 7,768,895 | 2,594,821 | 220,169 |
| ajv | 6,638,819 | 1,206,367 | 78,089 |
| @exodus/schemasafe | 5,555,686 | 620,732 | 38,610 |
| ata (compiled) | 3,902,022 | 836,860 | 92,600 |
| ata | 2,938,194 | 1,385,499 | 145,540 |
| ata-validator/lite | 2,280,274 | 329,121 | 19,037 |
| typia | 2,154,985 | 530,528 | no equivalent written |
| valibot | 1,784,836 | 406,356 | no equivalent written |
| typebox | 1,142,291 | 119,228 | no equivalent written |
| typebox (Value.Check) | 1,046,855 | 104,540 | no equivalent written |
| zod | 730,614 | 272,670 | no equivalent written |
| @cfworker/json-schema | 357,379 | 55,897 | 2,513 |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata richErrors:false | 0.38x | 0.53x | 0.66x |
| ajv | 0.44x | 1.15x | 1.86x |
| @exodus/schemasafe | 0.53x | 2.23x | 3.77x |
| ata (compiled) | 0.75x | 1.66x | 1.57x |
| ata-validator/lite | 1.29x | 4.21x | 7.65x |
| typia | 1.36x | 2.61x |  |
| valibot | 1.65x | 3.41x |  |
| typebox | 2.57x | 11.62x |  |
| typebox (Value.Check) | 2.81x | 13.25x |  |
| zod | 4.02x | 5.08x |  |
| @cfworker/json-schema | 8.22x | 24.79x | 57.91x |

## blocked-verdict-valid

valid documents, the verdict, with new Function refused.

| library | user (4 fields, a sign-up form) /s | order (customer, items, address, formats and a pattern) /s | config (25 sections, 30 KB schema, 10 KB document) /s |
|---|---:|---:|---:|
| ata (compiled) | 15,313,225 | 3,079,635 | 276,337 |
| typia | 6,735,649 | 986,588 | no equivalent written |
| ata-validator/lite | 6,259,302 | 598,497 | 31,326 |
| ata | 6,145,490 | 597,204 | 32,730 |
| typebox (Value.Check) | 5,121,407 | 292,938 | no equivalent written |
| valibot | 4,434,366 | 504,217 | no equivalent written |
| zod | 2,488,727 | 242,860 | no equivalent written |
| @cfworker/json-schema | 566,289 | 54,634 | 2,558 |
| ajv | EvalError | EvalError | EvalError |
| @exodus/schemasafe | EvalError | EvalError | EvalError |
| typebox | EvalError | EvalError | no equivalent written |

Relative to `ata` (above 1 means slower than ata):

| library | user | order | config |
|---|---:|---:|---:|
| ata (compiled) | 0.40x | 0.19x | 0.12x |
| typia | 0.91x | 0.61x |  |
| ata-validator/lite | 0.98x | 1.00x | 1.04x |
| typebox (Value.Check) | 1.20x | 2.04x |  |
| valibot | 1.39x | 1.18x |  |
| zod | 2.47x | 2.46x |  |
| @cfworker/json-schema | 10.85x | 10.93x | 12.79x |
| ajv |  |  |  |
| @exodus/schemasafe |  |  |  |
| typebox |  |  |  |
