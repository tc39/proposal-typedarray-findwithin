---
theme: default
title: TypedArray Find Within
info: |
  TC39 Proposal — Stage 2 Advancement
  James M Snell
highlighter: shiki
transition: slide-left
mdc: true
---

# TypedArray Find Within

Subsequence search for TypedArrays

Proposing advancement to **Stage 2**

James M Snell

---

# Recap: The Problem

TypedArrays have `indexOf` for single elements, but no way to search for a **subsequence**.

```js
// The current approach — manual linear search
function findSubsequence(haystack, needle) {
  if (needle.length === 0) return 0;
  if (needle.length > haystack.length) return -1;
  outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}
```

- No built-in subsequence search for TypedArrays
- Userland implementations cannot use optimized algorithms (Boyer-Moore, etc.)
- Common need in streams, protocol parsing, binary format handling
- Node.js `Buffer.indexOf` supports this, but it is non-standard

---

# The Solution: Three Prototype Methods

| Method | Returns | Searches |
|--------|---------|----------|
| `.search(needle [, position])` | Index of first match | Forward from `position` |
| `.searchLast(needle [, position])` | Index of last match | Backward from `position` |
| `.contains(needle [, position])` | `true` / `false` | Forward from `position` |

```js
const enc = new TextEncoder();
const u8 = enc.encode('Hello TC39, Hello TC39');

u8.search(enc.encode('TC39'));         // 6
u8.search(enc.encode('TC39'), 7);      // 17
u8.searchLast(enc.encode('TC39'));      // 17
u8.searchLast(enc.encode('TC39'), 16); // 6
u8.contains(enc.encode('TC39'));        // true
u8.contains(enc.encode('TC39'), 18);   // false
```

---

# Needle Types

The `needle` is any **iterable object** (except String). Elements are type-checked against the haystack.

```js
const u8 = new Uint8Array([1, 2, 3, 4, 5]);

u8.search(new Uint8Array([3, 4]));  // 2  — same-type TypedArray
u8.search(new Int16Array([3, 4]));  // 2  — different-type TypedArray (iterated)
u8.search([3, 4]);                  // 2  — plain Array (iterable)
u8.search('hello');                 // TypeError — strings rejected
u8.search(42);                      // TypeError — non-iterable rejected
```

**Type checking:** If the iterable yields values of the wrong type (e.g., BigInt for a non-BigInt haystack), the search returns `-1` rather than throwing -- the needle can never match.

**Snapshot semantics:** The needle is always collected into a List via `@@iterator` before the search begins, ensuring correctness when the needle is backed by a SharedArrayBuffer.

---

# Spec Text Status

Full spec text covers all three methods plus supporting abstract operations.

**Abstract Operations:**
- `ToCompatibleTypedArrayElementList` — validates and snapshots the needle
- `TypedArraySearchSubsequence` — the core search (shared by all three methods)
- `SequenceSameValueZeroEqual` — element-wise comparison
- `ValidateIntegralNumber` — validates the position argument

**Implementation freedom** is explicit in the spec:

> *"Implementations may use any technique to search for the subsequence, such as naive search, Boyer-Moore, or other matching algorithms, provided the observable result is correct."*

---

# Design Decisions Since Stage 1

Feedback from the November 2025 plenary and subsequent discussion:

1. **`searchLast` added** — reverse search support ([#2](https://github.com/tc39/proposal-typedarray-findwithin/issues/2))
2. **`position` parameter** on all three methods ([#4](https://github.com/tc39/proposal-typedarray-findwithin/issues/4))
3. **Needle accepts any iterable**, not just same-type TypedArrays ([#1](https://github.com/tc39/proposal-typedarray-findwithin/issues/1))
4. **String needles throw TypeError** — code point iteration is unlikely to be intended
5. **Needle is snapshotted** via `@@iterator` — handles SharedArrayBuffer-backed needles correctly ([#8](https://github.com/tc39/proposal-typedarray-findwithin/issues/8))
6. **Search algorithm is implementation-defined** — spec defines the expected result, not the technique ([#3](https://github.com/tc39/proposal-typedarray-findwithin/issues/3))
7. **Wrong-type needle elements return `-1`** (current spec) rather than throwing ([#7](https://github.com/tc39/proposal-typedarray-findwithin/issues/7))

---
layout: section
---

# Open Issues

---

# Open: Is `contains` Justified?
[#6](https://github.com/tc39/proposal-typedarray-findwithin/issues/6) — @michaelficarra

**Why not just `search(needle) !== -1`?**

Arguments for keeping `contains`:
- Mirrors `indexOf` / `includes` pattern already in the language
- Clearer intent — boolean result is self-documenting
- Potential for implementation to short-circuit (no need to track index)

Arguments for dropping it:
- `search(needle) !== -1` is trivial and well-understood
- Reduces API surface area
- `indexOf` / `includes` exist as separate methods, but they predate each other

**Current spec includes `contains` with an editor's note flagging this as open.** Seeking committee guidance.

---

# Open: Throw or Return `-1` for Wrong Types?
[#7](https://github.com/tc39/proposal-typedarray-findwithin/issues/7) — @jasnell

**When the needle contains wrong-type elements, should we throw or return `-1`/`false`?**

```js
const u8 = new Uint8Array([1, 2, 3]);
// Needle yields BigInts — can never match a Uint8Array
u8.search(new BigInt64Array([1n, 2n]));  // -1 or TypeError?
```

| | Return `-1` | Throw `TypeError` |
|---|---|---|
| **Rationale** | Values can never match, so `-1` is correct | Wrong types are likely a bug |
| **Precedent** | `indexOf` returns `-1` for non-matching types | Stricter APIs throw early |
| **Current spec** | Returns `-1` (via `~not-found~`) | Alternative noted in spec |

**Seeking committee preference.** This also affects `contains` (return `false` vs throw).

---

# Open: SharedArrayBuffer-backed Needles
[#8](https://github.com/tc39/proposal-typedarray-findwithin/issues/8) — @bakkot

**Should same-type TypedArray needles be copyable without iteration?**

The current spec always iterates the needle via `@@iterator` to create a snapshot. This is necessary for correctness when the needle is backed by a SharedArrayBuffer (another agent could mutate elements mid-search).

```js
// Worker could change needle from [2,3] to [3,2] mid-search
let needle = new Uint8Array(sharedBuffer);
Uint8Array.of(2, 2, 3, 3, 2).search(needle); // could return -1 without snapshot
```

Trade-off:
- **Always snapshot** (current) — correct, but no fast path for same-type non-shared needles
- **Optimize non-shared case** — skip iteration when needle's buffer is not shared; still snapshot for SAB

**Current spec snapshots always.** Open to optimizing the non-shared path.

---

# Other Open Issues (Addressed in Spec)

**Needle type** ([#1](https://github.com/tc39/proposal-typedarray-findwithin/issues/1)) — @mhofman
- Should needle accept any array-like, not just same-type TypedArrays?
- **Addressed:** needle accepts any iterable object; type-checked per element

**Find from end** ([#2](https://github.com/tc39/proposal-typedarray-findwithin/issues/2)) — @mhofman
- **Addressed:** `searchLast` method added

**Implementation-defined algorithm** ([#3](https://github.com/tc39/proposal-typedarray-findwithin/issues/3)) — @jasnell
- **Addressed:** spec defines expected result; algorithm is implementation-defined

**Find from offset** ([#4](https://github.com/tc39/proposal-typedarray-findwithin/issues/4)) — @bakkot
- **Addressed:** `position` parameter on all three methods

---

# Summary

| Issue | Status | Seeking |
|-------|--------|---------|
| Is `contains` justified? | Open | Committee guidance |
| Throw vs `-1` for wrong types | Open | Committee preference |
| SAB-backed needle optimization | Open | Committee input |
| Needle type (accept iterables) | Addressed in spec | -- |
| Find from end (`searchLast`) | Addressed in spec | -- |
| Implementation-defined algorithm | Addressed in spec | -- |
| Find from offset (`position`) | Addressed in spec | -- |

---

# Asking for Stage 2

**Stage 2 entrance criteria:**

- Initial spec text covering all major semantics
- Committee expectation that the feature will be developed and eventually included
- Identified open issues are appropriate for Stage 2 resolution

**What we have:**

- Complete spec text for `search`, `searchLast`, and `contains`
- Shared abstract operations (`ToCompatibleTypedArrayElementList`, `TypedArraySearchSubsequence`)
- Explicit affordance for implementation-defined search algorithms
- Clear set of open questions suitable for stage 2 refinement

**Requesting advancement to Stage 2.**
