# Comprehensive Test Cases

Test cases for `%TypedArray%.prototype.search` and `%TypedArray%.prototype.searchLast`.

### Identifier Convention

Each checkbox line has a unique identifier in the form `[section.subsection.number]`, e.g. `[2.1.1]`.

Where a test case is preceded by a "For each ..." qualifier (e.g. "For each method" or "For each TypedArray type"), each variation is referenced by appending a lowercase letter suffix: `[1.1.1a]` for `search`, `[1.1.1b]` for `searchLast`, etc. The letter ordering follows the order in which the items appear in the qualifier list.

---

## 1. Receiver Validation (`ValidateTypedArray`)

### 1.1 Invalid `this` value

For each method (`search`, `searchLast`):

- [ ] [1.1.1] `this` = `undefined` → TypeError
- [ ] [1.1.2] `this` = `null` → TypeError
- [ ] [1.1.3] `this` = plain object `{}` → TypeError
- [ ] [1.1.4] `this` = a number → TypeError
- [ ] [1.1.5] `this` = a regular Array → TypeError

### 1.2 Detached buffer

For each method (`search`, `searchLast`):

For each TypedArray type (`Int8Array`, `Uint8Array`, `Uint8ClampedArray`, `Int16Array`, `Uint16Array`, `Int32Array`, `Uint32Array`, `Float16Array`, `Float32Array`, `Float64Array`, `BigInt64Array`, `BigUint64Array`):

- [ ] [1.2.1] Calling the method on a TypedArray with a detached ArrayBuffer → TypeError

---

## 2. Needle Validation (`TypedArraySubsequenceFromTypedArray`)

### 2.1 Same-type TypedArray (read from buffer via `TypedArraySubsequenceFromTypedArray`)

For each method (`search`, `searchLast`):

- [ ] [2.1.1] `new Int8Array([1,2,3]).search(new Int8Array([2,3]))` → 1
- [ ] [2.1.2] `new Uint8Array([1,2,3]).search(new Uint8Array([2,3]))` → 1
- [ ] [2.1.3] `new Uint8ClampedArray([1,2,3]).search(new Uint8ClampedArray([2,3]))` → 1
- [ ] [2.1.4] `new Int16Array([1,2,3]).search(new Int16Array([2,3]))` → 1
- [ ] [2.1.5] `new Uint16Array([1,2,3]).search(new Uint16Array([2,3]))` → 1
- [ ] [2.1.6] `new Int32Array([1,2,3]).search(new Int32Array([2,3]))` → 1
- [ ] [2.1.7] `new Uint32Array([1,2,3]).search(new Uint32Array([2,3]))` → 1
- [ ] [2.1.8] `new Float16Array([1,2,3]).search(new Float16Array([2,3]))` → 1
- [ ] [2.1.9] `new Float32Array([1,2,3]).search(new Float32Array([2,3]))` → 1
- [ ] [2.1.10] `new Float64Array([1.5,2.5]).search(new Float64Array([1.5,2.5]))` → 0
- [ ] [2.1.11] `new BigInt64Array([1n,2n,3n]).search(new BigInt64Array([2n,3n]))` → 1
- [ ] [2.1.12] `new BigUint64Array([1n,2n]).search(new BigUint64Array([1n,2n]))` → 0

### 2.2 Different-type TypedArray (read from buffer via `TypedArraySubsequenceFromTypedArray`)

For each method (`search`, `searchLast`):

- [ ] [2.2.1] `new Uint8Array([1,2,3]).search(new Int16Array([2,3]))` → 1
- [ ] [2.2.2] `new Float64Array([1,2,3]).search(new Float32Array([2,3]))` → 1
- [ ] [2.2.3] `new Uint8Array([1,2,3]).search(new Uint32Array([2,3]))` → 1
- [ ] [2.2.4] `new Int16Array([1,2,3]).search(new Uint8Array([2,3]))` → 1

### 2.3 Different-type TypedArray — precision loss

For each method (`search`, `searchLast`):

- [ ] [2.3.1] Searching a `Float64Array` containing `1.1` (native Float64) with a `Float32Array` needle `[1.1]` → -1 (the needle element is read from the Float32 buffer via GetValueFromBuffer, yielding `1.100000023841858` as a Number, which does not SameValueZero-match the Float64 `1.1`)

### 2.4 BigInt / Number type mismatch → -1 (not TypeError)

The mismatch is detected via `[[ContentType]]` check in `TypedArraySubsequenceFromTypedArray`.

- [ ] [2.4.1] `new BigInt64Array([1n,2n]).search(new Uint8Array([1,2]))` → -1 (`[[ContentType]]` mismatch: ~bigint~ vs ~number~)
- [ ] [2.4.2] `new Uint8Array([1,2]).search(new BigInt64Array([1n,2n]))` → -1 (`[[ContentType]]` mismatch: ~number~ vs ~bigint~)
- [ ] [2.4.3] `new BigInt64Array([1n,2n]).searchLast(new Uint8Array([1,2]))` → -1

### 2.5 Non-TypedArray needle → TypeError

For each method (`search`, `searchLast`):

- [ ] [2.5.1] Plain Array: `new Uint8Array([1,2,3]).search([2,3])` → TypeError
- [ ] [2.5.2] String: `new Uint8Array([1,2,3]).search('hello')` → TypeError
- [ ] [2.5.3] Empty string: `new Uint8Array([]).search('')` → TypeError
- [ ] [2.5.4] Plain object: `new Uint8Array([1,2,3]).search({})` → TypeError
- [ ] [2.5.5] Array-like object: `new Uint8Array([1,2,3]).search({ length: 2, 0: 2, 1: 3 })` → TypeError
- [ ] [2.5.6] Number: `new Uint8Array([1,2,3]).search(42)` → TypeError
- [ ] [2.5.7] Boolean true: `new Uint8Array([1,2,3]).search(true)` → TypeError
- [ ] [2.5.8] Boolean false: `new Uint8Array([1,2,3]).search(false)` → TypeError
- [ ] [2.5.9] undefined: `new Uint8Array([1,2,3]).search(undefined)` → TypeError
- [ ] [2.5.10] null: `new Uint8Array([1,2,3]).search(null)` → TypeError
- [ ] [2.5.11] Symbol: `new Uint8Array([1,2,3]).search(Symbol())` → TypeError
- [ ] [2.5.12] BigInt: `new Uint8Array([1,2,3]).search(42n)` → TypeError
- [ ] [2.5.13] No argument: `new Uint8Array([1,2,3]).search()` → TypeError (needle is undefined)
- [ ] [2.5.14] No argument searchLast: `new Uint8Array([1,2,3]).searchLast()` → TypeError

### 2.6 TypedArray needle — `Symbol.iterator` is NOT called

Since TypedArray needles are handled by `TypedArraySubsequenceFromTypedArray`, which reads directly from the underlying buffer, the `@@iterator` method is not called. Overriding `Symbol.iterator` on a TypedArray needle has no effect. This is consistent with how `%TypedArray%.prototype.set` handles TypedArray sources via `SetTypedArrayFromTypedArray`.

For each method (`search`, `searchLast`):

- [ ] [2.6.1] Needle TypedArray with `Symbol.iterator` overridden — override is ignored:
  ```js
  const needle = new Uint8Array([3, 4]);
  needle[Symbol.iterator] = function*() { yield 99; yield 99; };
  new Uint8Array([1, 2, 3, 4, 5]).search(needle) // → 2 (searches for [3,4] from buffer, ignores override)
  ```
- [ ] [2.6.2] Needle TypedArray with `Symbol.iterator` deleted — still works:
  ```js
  const needle = new Uint8Array([2, 3]);
  delete needle[Symbol.iterator];
  // Even with prototype's @@iterator deleted:
  const saved = Uint8Array.prototype[Symbol.iterator];
  delete Uint8Array.prototype[Symbol.iterator];
  try {
    new Uint8Array([1, 2, 3]).search(needle) // → 1 (reads from buffer, @@iterator not needed)
  } finally {
    Uint8Array.prototype[Symbol.iterator] = saved;
  }
  ```
- [ ] [2.6.3] Verify @@iterator is not called (no observable side effect):
  ```js
  let called = false;
  const needle = new Uint8Array([2, 3]);
  needle[Symbol.iterator] = function() { called = true; return [][Symbol.iterator](); };
  new Uint8Array([1, 2, 3]).search(needle); // → 1
  assert(called === false); // @@iterator was not invoked
  ```

### 2.7 Detached TypedArray needle

TypedArray needles are handled by `TypedArraySubsequenceFromTypedArray`, which calls `MakeTypedArrayWithBufferWitnessRecord` and `IsTypedArrayOutOfBounds`. A detached buffer causes `IsTypedArrayOutOfBounds` to return *true*, resulting in a TypeError.

For each method (`search`, `searchLast`):

- [ ] [2.7.1] Same-type, detached: needle is a same-type TypedArray with a detached buffer → TypeError
- [ ] [2.7.2] Different-type, detached: needle is a different-type TypedArray with a detached buffer → TypeError

---

## 3. Position Validation (`ValidateIntegralNumber`)

### 3.1 Default position

- [ ] [3.1.1] `search` with no position argument → defaults to 0
- [ ] [3.1.2] `searchLast` with no position argument → defaults to `haystackLength - 1`

### 3.2 Explicit `undefined` → uses default

- [ ] [3.2.1] `new Uint8Array([1,2,3]).search(new Uint8Array([2,3]), undefined)` → 1 (default 0)
- [ ] [3.2.2] `new Uint8Array([1,2,3]).searchLast(new Uint8Array([2,3]), undefined)` → 1 (default haystackLength - 1)

### 3.3 Non-Number position → TypeError

For each method (`search`, `searchLast`):

- [ ] [3.3.1] `new Uint8Array([1,2,3]).search(new Uint8Array([2,3]), 'hello')` → TypeError
- [ ] [3.3.2] `new Uint8Array([1,2,3]).search(new Uint8Array([2,3]), {})` → TypeError
- [ ] [3.3.3] `new Uint8Array([1,2,3]).search(new Uint8Array([2,3]), true)` → TypeError
- [ ] [3.3.4] `new Uint8Array([1,2,3]).search(new Uint8Array([2,3]), null)` → TypeError
- [ ] [3.3.5] `new Uint8Array([1,2,3]).search(new Uint8Array([2,3]), Symbol())` → TypeError
- [ ] [3.3.6] `new Uint8Array([1,2,3]).search(new Uint8Array([2,3]), 1n)` → TypeError (BigInt is not a Number)

### 3.4 NaN position → RangeError

For each method (`search`, `searchLast`):

- [ ] [3.4.1] `new Uint8Array([1,2,3]).search(new Uint8Array([2,3]), NaN)` → RangeError

### 3.5 Non-integral number → RangeError

For each method (`search`, `searchLast`):

- [ ] [3.5.1] `new Uint8Array([1,2,3]).search(new Uint8Array([2,3]), 1.5)` → RangeError
- [ ] [3.5.2] `new Uint8Array([1,2,3]).search(new Uint8Array([2,3]), 0.1)` → RangeError

### 3.6 Infinity → RangeError

For each method (`search`, `searchLast`):

- [ ] [3.6.1] `new Uint8Array([1,2,3]).search(new Uint8Array([2,3]), Infinity)` → RangeError
- [ ] [3.6.2] `new Uint8Array([1,2,3]).search(new Uint8Array([2,3]), -Infinity)` → RangeError

### 3.7 Negative position (clamped to 0)

- [ ] [3.7.1] `new Uint8Array([1,2,3]).search(new Uint8Array([1,2]), -5)` → 0 (clamped to 0)
- [ ] [3.7.2] `new Uint8Array([1,2,3]).searchLast(new Uint8Array([1,2]), -1)` → 0 (clamped to 0)

### 3.8 Position beyond length (clamped)

- [ ] [3.8.1] `new Uint8Array([1,2,3,4,5]).search(new Uint8Array([3,4]), 100)` → -1 (clamped to 5, can't match from index 5)
- [ ] [3.8.2] `new Uint8Array([1,2,3,4,5]).searchLast(new Uint8Array([3,4]), 100)` → 2 (clamped to 4)

### 3.9 Valid integral positions

- [ ] [3.9.1] `new Uint8Array([1,2,3]).search(new Uint8Array([2,3]), 0)` → 1
- [ ] [3.9.2] `new Uint8Array([1,2,3]).search(new Uint8Array([2,3]), 1)` → 1
- [ ] [3.9.3] `new Uint8Array([1,2,3]).search(new Uint8Array([2,3]), 2)` → -1 (not enough room)
- [ ] [3.9.4] `new Uint8Array([1,2,3]).search(new Uint8Array([1,2]), -0)` → 0 (ℝ(-0) is 0)

---

## 4. `search` (Forward Search)

### 4.1 Basic matching

For each TypedArray type (`Int8Array`, `Uint8Array`, `Uint8ClampedArray`, `Int16Array`, `Uint16Array`, `Int32Array`, `Uint32Array`, `Float16Array`, `Float32Array`, `Float64Array`):

- [ ] [4.1.1] `new <Type>([1,2,3,4,5]).search(new <Type>([3,4]))` → 2
- [ ] [4.1.2] Match at beginning: `new <Type>([1,2,3]).search(new <Type>([1,2]))` → 0
- [ ] [4.1.3] Match at end: `new <Type>([1,2,3]).search(new <Type>([2,3]))` → 1
- [ ] [4.1.4] Entire array as needle: `new <Type>([1,2,3]).search(new <Type>([1,2,3]))` → 0

For BigInt types (`BigInt64Array`, `BigUint64Array`):

- [ ] [4.1.5] `new <Type>([1n,2n,3n,4n,5n]).search(new <Type>([3n,4n]))` → 2
- [ ] [4.1.6] Match at beginning: `new <Type>([1n,2n,3n]).search(new <Type>([1n,2n]))` → 0
- [ ] [4.1.7] Match at end: `new <Type>([1n,2n,3n]).search(new <Type>([2n,3n]))` → 1
- [ ] [4.1.8] Entire array as needle: `new <Type>([1n,2n,3n]).search(new <Type>([1n,2n,3n]))` → 0

### 4.2 No match

- [ ] [4.2.1] `new Uint8Array([1,2,3]).search(new Uint8Array([4,5]))` → -1
- [ ] [4.2.2] Partial overlap but not full match: `new Uint8Array([1,2,3]).search(new Uint8Array([2,4]))` → -1

### 4.3 Empty needle

- [ ] [4.3.1] `new Uint8Array([1,2,3]).search(new Uint8Array([]))` → 0 (returns position, which defaults to 0)
- [ ] [4.3.2] `new Uint8Array([1,2,3]).search(new Uint8Array([]), 2)` → 2 (returns position)
- [ ] [4.3.3] `new Uint8Array([]).search(new Uint8Array([]))` → 0

### 4.4 Empty haystack

- [ ] [4.4.1] `new Uint8Array([]).search(new Uint8Array([1]))` → -1
- [ ] [4.4.2] `new Uint8Array([]).search(new Uint8Array([]))` → 0

### 4.5 Needle longer than haystack

- [ ] [4.5.1] `new Uint8Array([1,2]).search(new Uint8Array([1,2,3]))` → -1

### 4.6 Needle longer than remaining elements from position

- [ ] [4.6.1] `new Uint8Array([1,2,3,4]).search(new Uint8Array([3,4,5]), 2)` → -1 (position + needleLength > haystackLength)
- [ ] [4.6.2] `new Uint8Array([1,2,3,4]).search(new Uint8Array([3,4]), 3)` → -1

### 4.7 Position skips earlier matches

- [ ] [4.7.1] `new Uint8Array([1,2,1,2]).search(new Uint8Array([1,2]), 1)` → 2 (skips match at 0)
- [ ] [4.7.2] `new Uint8Array([1,2,1,2,1,2]).search(new Uint8Array([1,2]), 2)` → 2
- [ ] [4.7.3] `new Uint8Array([1,2,1,2,1,2]).search(new Uint8Array([1,2]), 3)` → 4

### 4.8 Multiple occurrences — returns first from position

- [ ] [4.8.1] `new Uint8Array([1,2,3,1,2,3,1,2,3]).search(new Uint8Array([2,3]))` → 1
- [ ] [4.8.2] `new Uint8Array([1,2,3,1,2,3,1,2,3]).search(new Uint8Array([2,3]), 2)` → 4
- [ ] [4.8.3] `new Uint8Array([1,2,3,1,2,3,1,2,3]).search(new Uint8Array([2,3]), 5)` → 7

### 4.9 Single-element needle

- [ ] [4.9.1] `new Uint8Array([1,2,3]).search(new Uint8Array([2]))` → 1
- [ ] [4.9.2] `new Uint8Array([1,2,3]).search(new Uint8Array([4]))` → -1

---

## 5. `searchLast` (Backward Search)

### 5.1 Basic matching

For each TypedArray type (`Int8Array`, `Uint8Array`, `Uint8ClampedArray`, `Int16Array`, `Uint16Array`, `Int32Array`, `Uint32Array`, `Float16Array`, `Float32Array`, `Float64Array`):

- [ ] [5.1.1] `new <Type>([1,2,3,4,5]).searchLast(new <Type>([3,4]))` → 2
- [ ] [5.1.2] `new <Type>([1,2,3,1,2,3]).searchLast(new <Type>([1,2,3]))` → 3

For BigInt types (`BigInt64Array`, `BigUint64Array`):

- [ ] [5.1.3] `new <Type>([1n,2n,3n,4n,5n]).searchLast(new <Type>([3n,4n]))` → 2
- [ ] [5.1.4] `new <Type>([1n,2n,3n,1n,2n,3n]).searchLast(new <Type>([1n,2n,3n]))` → 3

### 5.2 No match

- [ ] [5.2.1] `new Uint8Array([1,2,3]).searchLast(new Uint8Array([4,5]))` → -1

### 5.3 Empty needle

- [ ] [5.3.1] `new Uint8Array([1,2,3]).searchLast(new Uint8Array([]))` → 2 (returns position, default is haystackLength - 1)
- [ ] [5.3.2] `new Uint8Array([1,2,3]).searchLast(new Uint8Array([]), 1)` → 1

### 5.4 Empty haystack

- [ ] [5.4.1] `new Uint8Array([]).searchLast(new Uint8Array([1]))` → -1

### 5.5 Needle longer than haystack

- [ ] [5.5.1] `new Uint8Array([1,2]).searchLast(new Uint8Array([1,2,3]))` → -1

### 5.6 Position constrains search

- [ ] [5.6.1] `new Uint8Array([1,2,3,1,2,3,1,2,3]).searchLast(new Uint8Array([2,3]))` → 7
- [ ] [5.6.2] `new Uint8Array([1,2,3,1,2,3,1,2,3]).searchLast(new Uint8Array([2,3]), 5)` → 4
- [ ] [5.6.3] `new Uint8Array([1,2,3,1,2,3,1,2,3]).searchLast(new Uint8Array([2,3]), 3)` → 1
- [ ] [5.6.4] `new Uint8Array([1,2,3,1,2,3,1,2,3]).searchLast(new Uint8Array([2,3]), 0)` → -1

### 5.7 Position at exact match start

- [ ] [5.7.1] `new Uint8Array([1,2,3,1,2,3]).searchLast(new Uint8Array([1,2,3]), 3)` → 3
- [ ] [5.7.2] `new Uint8Array([1,2,3,1,2,3]).searchLast(new Uint8Array([1,2,3]), 2)` → 0

### 5.8 Single-element needle

- [ ] [5.8.1] `new Uint8Array([1,2,3,2,1]).searchLast(new Uint8Array([2]))` → 3
- [ ] [5.8.2] `new Uint8Array([1,2,3,2,1]).searchLast(new Uint8Array([2]), 2)` → 1

### 5.9 Match must start at or before position (not end at or before)

- [ ] [5.9.1] `new Uint8Array([1,2,3,4,5]).searchLast(new Uint8Array([3,4,5]), 2)` → 2 (match starts at 2, which is ≤ position 2)
- [ ] [5.9.2] `new Uint8Array([1,2,3,4,5]).searchLast(new Uint8Array([3,4,5]), 1)` → -1 (match would start at 2, which is > position 1)

### 5.10 Position near end with multi-element needle (`k + needleLength ≤ haystackLength` constraint)

- [ ] [5.10.1] `new Uint8Array([1,2,3,4,5]).searchLast(new Uint8Array([4,5]), 4)` → 3 (position is 4, but k + 2 ≤ 5 means k ≤ 3)
- [ ] [5.10.2] `new Uint8Array([1,2,3,4,5]).searchLast(new Uint8Array([3,4,5]), 4)` → 2 (position is 4, but k + 3 ≤ 5 means k ≤ 2)
- [ ] [5.10.3] `new Uint8Array([1,2,3,4,5]).searchLast(new Uint8Array([1,2,3,4,5]), 4)` → 0 (only one possible start index)
- [ ] [5.10.4] `new Uint8Array([1,2,3,4,5]).searchLast(new Uint8Array([1,2,3,4,5]), 0)` → 0

### 5.11 Empty haystack with empty needle

- [ ] [5.11.1] `new Uint8Array([]).searchLast(new Uint8Array([]))` → 0 (position defaults to haystackLength - 1 = -1, clamped to 0; empty needle returns position)

Note: the clamping range for `searchLast` is `[0, haystackLength - 1]`. When haystackLength is 0, this is `[0, -1]`, a degenerate range. The spec's clamping definition produces `lower` (0) when `x < lower`, so `clamp(-1, 0, -1)` → 0. This edge case may warrant spec clarification.

---

## 6. SameValueZero Equality Semantics

### 6.1 NaN matching

For each floating-point type (`Float16Array`, `Float32Array`, `Float64Array`):

- [ ] [6.1.1] `new <Type>([1, NaN, 3]).search(new <Type>([NaN]))` → 1
- [ ] [6.1.2] `new <Type>([NaN, NaN]).search(new <Type>([NaN, NaN]))` → 0
- [ ] [6.1.3] `new <Type>([NaN, 1, NaN]).searchLast(new <Type>([NaN]))` → 2

### 6.2 +0 / -0 equivalence

For each floating-point type (`Float16Array`, `Float32Array`, `Float64Array`) and each method (`search`, `searchLast`):

- [ ] [6.2.1] `new <Type>([1, -0, 3]).search(new <Type>([0]))` → 1
- [ ] [6.2.2] `new <Type>([1, 0, 3]).search(new <Type>([-0]))` → 1
- [ ] [6.2.3] `new <Type>([-0]).search(new <Type>([0]))` → 0
- [ ] [6.2.4] `new <Type>([0]).search(new <Type>([-0]))` → 0

### 6.3 NaN in subsequence

For each floating-point type (`Float16Array`, `Float32Array`, `Float64Array`) and each method (`search`, `searchLast`):

- [ ] [6.3.1] `new <Type>([1, NaN, 3, 4]).search(new <Type>([NaN, 3]))` → 1

### 6.4 Integer TypedArrays (no NaN / -0 concerns)

For each method (`search`, `searchLast`):

- [ ] [6.4.1] `new Int32Array([-1, 0, 1]).search(new Int32Array([0, 1]))` → 1

---

## 7. TypedArray Type Coverage

### 7.1 Basic search/searchLast per type

For each non-BigInt type (`Int8Array`, `Uint8Array`, `Uint8ClampedArray`, `Int16Array`, `Uint16Array`, `Int32Array`, `Uint32Array`, `Float16Array`, `Float32Array`, `Float64Array`):

- [ ] [7.1.1] `new <Type>([1,2,3]).search(new <Type>([2,3]))` → 1
- [ ] [7.1.2] `new <Type>([1,2,3]).searchLast(new <Type>([2,3]))` → 1

For each BigInt type (`BigInt64Array`, `BigUint64Array`):

- [ ] [7.1.3] `new <Type>([1n,2n,3n]).search(new <Type>([2n,3n]))` → 1
- [ ] [7.1.4] `new <Type>([1n,2n,3n]).searchLast(new <Type>([2n,3n]))` → 1

### 7.2 Cross-type with BigInt

- [ ] [7.2.1] `new BigInt64Array([1n, 2n]).search(new BigUint64Array([1n, 2n]))` → 0 (both have BigInt content type)
- [ ] [7.2.2] `new BigInt64Array([1n, 2n]).search(new Uint8Array([1, 2]))` → -1 (content type mismatch: BigInt vs Number)

---

## 8. Evaluation Order and Observable Side Effects

### 8.1 ValidateTypedArray before needle validation

For each method (`search`, `searchLast`):

- [ ] [8.1.1] Detached buffer with a TypedArray needle → TypeError from haystack validation, needle's buffer not accessed

### 8.2 Needle validation before ValidateIntegralNumber

For each method (`search`, `searchLast`):

- [ ] [8.2.1] Valid TypedArray, invalid needle type, invalid position → TypeError from needle validation (position never validated)
  ```js
  new Uint8Array([1,2,3]).search(42, 'bad') // → TypeError (from needle, not position)
  ```

### 8.3 ValidateIntegralNumber after needle validation

For each method (`search`, `searchLast`):

- [ ] [8.3.1] Valid TypedArray, valid TypedArray needle, invalid position → error from position validation
  ```js
  new Uint8Array([1,2,3]).search(new Uint8Array([1,2]), NaN) // → RangeError
  new Uint8Array([1,2,3]).search(new Uint8Array([1,2]), 'bad') // → TypeError
  ```

---

## 9. Property and Prototype

### 9.1 Method existence

- [ ] [9.1.1] `typeof Uint8Array.prototype.search` → `'function'`
- [ ] [9.1.2] `typeof Uint8Array.prototype.searchLast` → `'function'`

### 9.2 Method `.length` property

- [ ] [9.2.1] `Uint8Array.prototype.search.length` → 1
- [ ] [9.2.2] `Uint8Array.prototype.searchLast.length` → 1

### 9.3 Method `.name` property

- [ ] [9.3.1] `Uint8Array.prototype.search.name` → `'search'`
- [ ] [9.3.2] `Uint8Array.prototype.searchLast.name` → `'searchLast'`

### 9.4 Methods are on %TypedArray%.prototype

- [ ] [9.4.1] `Uint8Array.prototype.search === Int32Array.prototype.search` → true
- [ ] [9.4.2] `Uint8Array.prototype.searchLast === Float64Array.prototype.searchLast` → true

### 9.5 Not enumerable

- [ ] [9.5.1] `Object.getOwnPropertyDescriptor(Uint8Array.prototype, 'search').enumerable` → false
- [ ] [9.5.2] `Object.getOwnPropertyDescriptor(Uint8Array.prototype, 'searchLast').enumerable` → false

---

## 10. Boundary and Stress Cases

### 10.1 Single-element haystack

- [ ] [10.1.1] `new Uint8Array([5]).search(new Uint8Array([5]))` → 0
- [ ] [10.1.2] `new Uint8Array([5]).search(new Uint8Array([6]))` → -1
- [ ] [10.1.3] `new Uint8Array([5]).searchLast(new Uint8Array([5]))` → 0

### 10.2 Needle same length as haystack

- [ ] [10.2.1] `new Uint8Array([1,2,3]).search(new Uint8Array([1,2,3]))` → 0
- [ ] [10.2.2] `new Uint8Array([1,2,3]).search(new Uint8Array([1,2,4]))` → -1
- [ ] [10.2.3] `new Uint8Array([1,2,3]).searchLast(new Uint8Array([1,2,3]))` → 0

### 10.3 Overlapping pattern in haystack

- [ ] [10.3.1] `new Uint8Array([1,1,1,2]).search(new Uint8Array([1,1,2]))` → 1
- [ ] [10.3.2] `new Uint8Array([1,1,1,1]).search(new Uint8Array([1,1]))` → 0
- [ ] [10.3.3] `new Uint8Array([1,1,1,1]).searchLast(new Uint8Array([1,1]))` → 2

### 10.4 Repeated single value

- [ ] [10.4.1] `new Uint8Array([0,0,0,0,0]).search(new Uint8Array([0,0]))` → 0
- [ ] [10.4.2] `new Uint8Array([0,0,0,0,0]).searchLast(new Uint8Array([0,0]))` → 3
- [ ] [10.4.3] `new Uint8Array([0,0,0,0,0]).search(new Uint8Array([0,0]), 2)` → 2
- [ ] [10.4.4] `new Uint8Array([0,0,0,0,0]).searchLast(new Uint8Array([0,0]), 2)` → 2

### 10.5 Large TypedArrays

- [ ] [10.5.1] Search in a large TypedArray (e.g., 10,000+ elements) with needle at the end → correct index
- [ ] [10.5.2] Search in a large TypedArray with no match → -1
- [ ] [10.5.3] searchLast in a large TypedArray with needle at the beginning → correct index

### 10.6 Position equals haystack length

- [ ] [10.6.1] `new Uint8Array([1,2,3]).search(new Uint8Array([]), 3)` → 3 (empty needle returns position)
- [ ] [10.6.2] `new Uint8Array([1,2,3]).search(new Uint8Array([1]), 3)` → -1 (position + needleLength > haystackLength)

### 10.7 Uint8ClampedArray behaviour

- [ ] [10.7.1] `new Uint8ClampedArray([255, 0]).search(new Uint8ClampedArray([255]))` → 0
- [ ] [10.7.2] `new Uint8ClampedArray([255, 0]).search(new Uint8ClampedArray([128]))` → -1

### 10.8 Typed integer overflow boundaries

- [ ] [10.8.1] `new Uint8Array([255, 0, 1]).search(new Uint8Array([255, 0]))` → 0
- [ ] [10.8.2] `new Int8Array([-128, 127]).search(new Int8Array([-128, 127]))` → 0
- [ ] [10.8.3] `new Uint16Array([65535, 0]).search(new Uint16Array([65535, 0]))` → 0
- [ ] [10.8.4] `new Int32Array([-2147483648, 2147483647]).search(new Int32Array([-2147483648]))` → 0

### 10.9 Methods called via `.call()` on different TypedArray subtypes

- [ ] [10.9.1] `Uint8Array.prototype.search.call(new Int32Array([1,2,3]), new Int32Array([2,3]))` → 1 (this is Int32Array, needle is same-type relative to this)
- [ ] [10.9.2] `Uint8Array.prototype.search.call(new Int32Array([1,2,3]), new Uint8Array([2,3]))` → 1 (needle is different-type, read from buffer)

### 10.10 Empty haystack with non-empty needle (both directions)

- [ ] [10.10.1] `new Uint8Array([]).search(new Uint8Array([1]))` → -1
- [ ] [10.10.2] `new Uint8Array([]).searchLast(new Uint8Array([1]))` → -1

---

## 11. SharedArrayBuffer Considerations

TypedArray needles are read directly from their underlying buffer via `TypedArraySubsequenceFromTypedArray` using `GetValueFromBuffer` with ~unordered~ ordering. Each element is read individually, so for SAB-backed needles, another agent may modify elements between reads. The haystack is *not* snapshotted — its elements are read directly during the search, consistent with `indexOf` and `lastIndexOf`.

### 11.1 TypedArray needle backed by SharedArrayBuffer (not snapshotted)

- [ ] [11.1.1] TypedArray needle elements are read individually from the SAB via `GetValueFromBuffer`. Another agent may modify needle elements between reads, potentially yielding an incoherent needle List.
- [ ] [11.1.2] Example: needle starts as `[2, 3]`; another agent changes element 0 to `9` after it is read but before element 1 is read. The search proceeds with the needle List `[2, 3]` or `[9, 3]` depending on timing.

### 11.2 Haystack backed by SharedArrayBuffer (not snapshotted)

- [ ] [11.2.1] Haystack elements are read individually during the search (via Get). Another agent may modify elements of the haystack concurrently. This is the same behaviour as `%TypedArray%.prototype.indexOf` and `%TypedArray%.prototype.lastIndexOf`.
- [ ] [11.2.2] A search may return `-1` even if the needle was present at the start of the search, if another agent modifies the haystack during the search.
- [ ] [11.2.3] A search may return an index where the needle no longer exists by the time the result is observed, if another agent modifies the haystack after the match is found.

### 11.3 Both haystack and needle backed by SharedArrayBuffer

- [ ] [11.3.1] Both needle and haystack elements are read live (neither is snapshotted). Another agent may modify either during the search. Users must synchronize access externally.

---

## 12. Resizable ArrayBuffer Considerations

TypedArrays can be backed by resizable ArrayBuffers (created via `new ArrayBuffer(n, { maxByteLength: m })`). These buffers can be grown or shrunk via `resize()`, which can cause a TypedArray to go out of bounds. Auto-length TypedArrays (created without an explicit length) track the buffer size; fixed-length TypedArrays over resizable buffers have a fixed element count but can go out of bounds if the buffer shrinks.

### 12.1 Haystack backed by a resizable ArrayBuffer (basic operation)

For each method (`search`, `searchLast`):

- [ ] [12.1.1] Auto-length haystack, no resize during operation → normal search behaviour, length tracks the buffer
  ```js
  const rab = new ArrayBuffer(5, { maxByteLength: 10 });
  const u8 = new Uint8Array(rab);
  u8.set([1, 2, 3, 4, 5]);
  u8.search(new Uint8Array([3, 4])) // → 2
  ```
- [ ] [12.1.2] Fixed-length haystack over resizable buffer, no resize → normal search behaviour
  ```js
  const rab = new ArrayBuffer(8, { maxByteLength: 16 });
  const u8 = new Uint8Array(rab, 0, 5);
  u8.set([1, 2, 3, 4, 5]);
  u8.search(new Uint8Array([3, 4])) // → 2
  ```
- [ ] [12.1.3] Auto-length haystack, buffer grown before calling `search` → search sees the new length
- [ ] [12.1.4] Fixed-length haystack, buffer shrunk below the fixed length before calling `search` → `ValidateTypedArray` throws TypeError (TypedArray is out of bounds)

### 12.2 Needle backed by a resizable ArrayBuffer (basic operation)

For each method (`search`, `searchLast`):

- [ ] [12.2.1] Auto-length needle TypedArray over resizable buffer, no resize → produces correct element List
- [ ] [12.2.2] Fixed-length needle TypedArray over resizable buffer, no resize → produces correct element List

### 12.3 Needle TypedArray's own buffer shrunk or detached before read

Since TypedArray needles are read via `TypedArraySubsequenceFromTypedArray`, `IsTypedArrayOutOfBounds` is checked once at the start. If the needle is already out of bounds or detached, a TypeError is thrown. Since no user code runs during the buffer reads, the buffer cannot be shrunk or detached *during* the read.

For each method (`search`, `searchLast`):

- [ ] [12.3.1] Needle is auto-length over a resizable buffer; buffer shrunk below the needle's range before calling the method → TypeError from `IsTypedArrayOutOfBounds`
- [ ] [12.3.2] Needle is fixed-length over a resizable buffer; buffer shrunk below `byteOffset + length * elementSize` before calling the method → TypeError from `IsTypedArrayOutOfBounds`
- [ ] [12.3.3] Needle TypedArray's buffer is detached before calling the method → TypeError from `IsTypedArrayOutOfBounds`

### 12.4 Needle TypedArray's buffer grown (auto-length needle)

Since TypedArray needles are read via `TypedArraySubsequenceFromTypedArray`, `TypedArrayLength` is computed once from the buffer witness record created by `MakeTypedArrayWithBufferWitnessRecord`. If the buffer is grown before the method is called, the auto-length needle reflects the new size. The buffer cannot be grown *during* the read since no user code runs.

For each method (`search`, `searchLast`):

- [ ] [12.4.1] Auto-length needle over a resizable buffer; buffer is grown before calling the method → needle length reflects the new buffer size; search uses all elements

### 12.5 Both haystack and needle backed by resizable ArrayBuffers

For each method (`search`, `searchLast`):

- [ ] [12.5.1] Both are auto-length over separate resizable buffers, no resize during operation → normal behaviour
- [ ] [12.5.2] Both share the same resizable ArrayBuffer (different views); no resize → needle is read from buffer, search proceeds normally

---

## 13. Self-Search and Overlapping Views

### 13.1 Self-search (searching a TypedArray for itself)

The needle elements are read from the buffer via `TypedArraySubsequenceFromTypedArray` into a List before the search begins. The search then compares this List against the live haystack elements read via `! Get`. Since both read from the same buffer and the method does not modify the buffer, self-search is safe.

- [ ] [13.1.1] `const u8 = new Uint8Array([1,2,3]); u8.search(u8)` → 0 (entire array matches at index 0)
- [ ] [13.1.2] `const u8 = new Uint8Array([1,2,3]); u8.searchLast(u8)` → 0 (only one possible match position)
- [ ] [13.1.3] `const u8 = new Uint8Array([1,2,3]); u8.search(u8, 1)` → -1 (needle length 3, only 2 elements from position 1)
- [ ] [13.1.4] Self-search on empty TypedArray: `const u8 = new Uint8Array([]); u8.search(u8)` → 0 (empty needle returns position)
- [ ] [13.1.5] Self-search on single-element TypedArray: `const u8 = new Uint8Array([42]); u8.search(u8)` → 0
- [ ] [13.1.6] Self-search with BigInt TypedArray: `const b = new BigInt64Array([1n,2n]); b.search(b)` → 0

### 13.2 Needle and haystack sharing the same underlying ArrayBuffer (overlapping views)

Two TypedArrays backed by the same ArrayBuffer but with different byte offsets or lengths. The needle elements are read from the buffer into a List before the search begins, so the search is safe regardless of overlap.

For each method (`search`, `searchLast`):

- [ ] [13.2.1] Overlapping views, needle is a subview of the haystack:
  ```js
  const ab = new ArrayBuffer(5);
  const haystack = new Uint8Array(ab); // [1,2,3,4,5]
  haystack.set([1, 2, 3, 4, 5]);
  const needle = new Uint8Array(ab, 2, 2); // [3,4]
  haystack.search(needle) // → 2
  ```
- [ ] [13.2.2] Overlapping views, haystack is a subview:
  ```js
  const ab = new ArrayBuffer(5);
  const full = new Uint8Array(ab);
  full.set([1, 2, 3, 4, 5]);
  const haystack = new Uint8Array(ab, 1, 3); // [2,3,4]
  const needle = new Uint8Array(ab, 0, 2); // [1,2]
  haystack.search(needle) // → -1 (haystack is [2,3,4], needle is [1,2])
  ```
- [ ] [13.2.3] Same buffer, same offset, different element types:
  ```js
  const ab = new ArrayBuffer(8);
  const u8 = new Uint8Array(ab);
  u8.set([1, 0, 2, 0, 3, 0, 4, 0]);
  const u16 = new Uint16Array(ab); // [1, 2, 3, 4] on little-endian
  u16.search(new Uint16Array([2, 3])) // → 1
  ```
