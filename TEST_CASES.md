# Comprehensive Test Cases

Test cases for `%TypedArray%.prototype.search`, `%TypedArray%.prototype.searchLast`, and `%TypedArray%.prototype.contains`.

### Identifier Convention

Each checkbox line has a unique identifier in the form `[section.subsection.number]`, e.g. `[2.1.1]`.

Where a test case is preceded by a "For each ..." qualifier (e.g. "For each method" or "For each TypedArray type"), each variation is referenced by appending a lowercase letter suffix: `[1.1.1a]` for `search`, `[1.1.1b]` for `searchLast`, `[1.1.1c]` for `contains`, etc. The letter ordering follows the order in which the items appear in the qualifier list.

---

## 1. Receiver Validation (`ValidateTypedArray`)

### 1.1 Invalid `this` value

For each method (`search`, `searchLast`, `contains`):

- [ ] [1.1.1] `this` = `undefined` → TypeError
- [ ] [1.1.2] `this` = `null` → TypeError
- [ ] [1.1.3] `this` = plain object `{}` → TypeError
- [ ] [1.1.4] `this` = a number → TypeError
- [ ] [1.1.5] `this` = a regular Array → TypeError

### 1.2 Detached buffer

For each method (`search`, `searchLast`, `contains`):

For each TypedArray type (`Int8Array`, `Uint8Array`, `Uint8ClampedArray`, `Int16Array`, `Uint16Array`, `Int32Array`, `Uint32Array`, `Float16Array`, `Float32Array`, `Float64Array`, `BigInt64Array`, `BigUint64Array`):

- [ ] [1.2.1] Calling the method on a TypedArray with a detached ArrayBuffer → TypeError

---

## 2. Needle Validation (`TypedArraySubsequenceFromTypedArray` / `TypedArraySubsequenceFromIterable`)

### 2.1 Same-type TypedArray (read from buffer via `TypedArraySubsequenceFromTypedArray`)

For each method (`search`, `searchLast`, `contains`):

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

For each method (`search`, `searchLast`, `contains`):

- [ ] [2.2.1] `new Uint8Array([1,2,3]).search(new Int16Array([2,3]))` → 1
- [ ] [2.2.2] `new Float64Array([1,2,3]).search(new Float32Array([2,3]))` → 1
- [ ] [2.2.3] `new Uint8Array([1,2,3]).search(new Uint32Array([2,3]))` → 1
- [ ] [2.2.4] `new Int16Array([1,2,3]).search(new Uint8Array([2,3]))` → 1

### 2.3 Different-type TypedArray — precision loss

For each method (`search`, `searchLast`, `contains`):

- [ ] [2.3.1] Searching a `Float64Array` containing `1.1` (native Float64) with a `Float32Array` needle `[1.1]` → -1 (the needle element is read from the Float32 buffer via GetValueFromBuffer, yielding `1.100000023841858` as a Number, which does not SameValueZero-match the Float64 `1.1`)

### 2.4 BigInt / Number type mismatch → -1 (not TypeError)

For TypedArray needles, the mismatch is detected via `[[ContentType]]` check in `TypedArraySubsequenceFromTypedArray`. For iterable needles, it is detected by per-element type checking in `TypedArraySubsequenceFromIterable`.

- [ ] [2.4.1] `new BigInt64Array([1n,2n]).search(new Uint8Array([1,2]))` → -1 (`[[ContentType]]` mismatch: ~bigint~ vs ~number~)
- [ ] [2.4.2] `new Uint8Array([1,2]).search(new BigInt64Array([1n,2n]))` → -1 (`[[ContentType]]` mismatch: ~number~ vs ~bigint~)
- [ ] [2.4.3] `new BigInt64Array([1n,2n]).searchLast(new Uint8Array([1,2]))` → -1
- [ ] [2.4.4] `new Uint8Array([1,2]).contains(new BigInt64Array([1n,2n]))` → false

### 2.5 Iterable objects (non-TypedArray)

For each method (`search`, `searchLast`, `contains`):

- [ ] [2.5.1] Plain Array: `new Uint8Array([1,2,3]).search([2,3])` → 1
- [ ] [2.5.2] Generator: `new Uint8Array([1,2,3]).search(function*() { yield 2; yield 3; }())` → 1
- [ ] [2.5.3] Set: `new Uint8Array([1,2,3]).search(new Set([2,3]))` → 1
- [ ] [2.5.4] Custom iterable with `[Symbol.iterator]()`:
  ```js
  const iter = { [Symbol.iterator]() { return { i: 2, next() { return this.i <= 3 ? { value: this.i++, done: false } : { done: true }; } }; } };
  new Uint8Array([1,2,3]).search(iter) // → 1
  ```
- [ ] [2.5.5] Empty iterable: `new Uint8Array([1,2,3]).search([])` → 0 (empty needle)

### 2.6 Iterable with BigInt target

For each method (`search`, `searchLast`, `contains`):

- [ ] [2.6.1] `new BigInt64Array([1n,2n,3n]).search([1n,2n])` → 0
- [ ] [2.6.2] `new BigInt64Array([1n,2n,3n]).search([1,2])` → -1 (Numbers are not BigInts, returns ~not-found~)
- [ ] [2.6.3] `new BigInt64Array([1n,2n,3n]).search(['1','2'])` → -1 (Strings are not BigInts, returns ~not-found~)

### 2.7 Iterable with wrong-type elements → -1

For each method (`search`, `searchLast`, `contains`):

- [ ] [2.7.1] `new Uint8Array([1,2,3]).search([1n, 2n])` → -1 (BigInts are not Numbers)
- [ ] [2.7.2] `new Uint8Array([1,2,3]).search(['1', '2'])` → -1 (Strings are not Numbers)
- [ ] [2.7.3] `new Uint8Array([1,2,3]).search([{}])` → -1 (Objects are not Numbers)
- [ ] [2.7.4] `new Uint8Array([1,2,3]).search([Symbol()])` → -1 (Symbols are not Numbers)
- [ ] [2.7.5] `new BigInt64Array([1n,2n]).search([1.5])` → -1 (Numbers are not BigInts)
- [ ] [2.7.6] `new Uint8Array([1,2,3]).search([1, 2, 3n])` → -1 (first two elements are Numbers but third is a BigInt; ~not-found~ returned on encountering the wrong type partway through)
- [ ] [2.7.7] `new BigInt64Array([1n,2n,3n]).search([1n, 2n, 3])` → -1 (first two elements are BigInts but third is a Number)
- [ ] [2.7.8] `new Uint8Array([1,2,3]).search([1, undefined, 3])` → -1 (undefined is not a Number)
- [ ] [2.7.9] `new Uint8Array([1,2,3]).search([1, null, 3])` → -1 (null is not a Number)

### 2.8 Iterable that throws during iteration

For each method (`search`, `searchLast`, `contains`):

- [ ] [2.8.1] Iterator whose `next()` throws → the error propagates
- [ ] [2.8.2] Iterable whose `@@iterator` method throws → the error propagates

### 2.9 String needle → TypeError

- [ ] [2.9.1] `new Uint8Array([1,2,3]).search('hello')` → TypeError
- [ ] [2.9.2] `new Uint8Array([1,2,3]).searchLast('hello')` → TypeError
- [ ] [2.9.3] `new Uint8Array([1,2,3]).contains('hello')` → TypeError
- [ ] [2.9.4] `new Uint8Array([]).search('')` → TypeError

### 2.10 Non-iterable Object → TypeError

For each method (`search`, `searchLast`, `contains`):

- [ ] [2.10.1] `new Uint8Array([1,2,3]).search({})` → TypeError
- [ ] [2.10.2] `new Uint8Array([1,2,3]).search({ length: 2, 0: 2, 1: 3 })` → TypeError (array-like but not iterable)
- [ ] [2.10.3] `new Uint8Array([1,2,3]).search({ [Symbol.iterator]: 42 })` → TypeError (@@iterator is non-callable)
- [ ] [2.10.4] `new Uint8Array([1,2,3]).search({ [Symbol.iterator]: null })` → TypeError (GetMethod returns undefined, falls through to throw)

### 2.11 Non-Object primitives → TypeError

For each method (`search`, `searchLast`, `contains`):

- [ ] [2.11.1] `new Uint8Array([1,2,3]).search(42)` → TypeError
- [ ] [2.11.2] `new Uint8Array([1,2,3]).search(true)` → TypeError
- [ ] [2.11.3] `new Uint8Array([1,2,3]).search(false)` → TypeError
- [ ] [2.11.4] `new Uint8Array([1,2,3]).search(undefined)` → TypeError
- [ ] [2.11.5] `new Uint8Array([1,2,3]).search(null)` → TypeError
- [ ] [2.11.6] `new Uint8Array([1,2,3]).search(Symbol())` → TypeError
- [ ] [2.11.7] `new Uint8Array([1,2,3]).search(42n)` → TypeError
- [ ] [2.11.8] `new Uint8Array([1,2,3]).search()` → TypeError (no argument; needle is undefined)
- [ ] [2.11.9] `new Uint8Array([1,2,3]).searchLast()` → TypeError (no argument)
- [ ] [2.11.10] `new Uint8Array([1,2,3]).contains()` → TypeError (no argument)

### 2.12 TypedArray needle — `Symbol.iterator` is NOT called

Since TypedArray needles are handled by `TypedArraySubsequenceFromTypedArray`, which reads directly from the underlying buffer, the `@@iterator` method is not called. Overriding `Symbol.iterator` on a TypedArray needle has no effect. This is consistent with how `%TypedArray%.prototype.set` handles TypedArray sources via `SetTypedArrayFromTypedArray`.

For each method (`search`, `searchLast`, `contains`):

- [ ] [2.12.1] Needle TypedArray with `Symbol.iterator` overridden — override is ignored:
  ```js
  const needle = new Uint8Array([3, 4]);
  needle[Symbol.iterator] = function*() { yield 99; yield 99; };
  new Uint8Array([1, 2, 3, 4, 5]).search(needle) // → 2 (searches for [3,4] from buffer, ignores override)
  ```
- [ ] [2.12.2] Needle TypedArray with `Symbol.iterator` deleted — still works:
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
- [ ] [2.12.3] Verify @@iterator is not called (no observable side effect):
  ```js
  let called = false;
  const needle = new Uint8Array([2, 3]);
  needle[Symbol.iterator] = function() { called = true; return [][Symbol.iterator](); };
  new Uint8Array([1, 2, 3]).search(needle); // → 1
  assert(called === false); // @@iterator was not invoked
  ```

Note: `Symbol.iterator` overrides on non-TypedArray iterables (plain Arrays, generators, etc.) ARE respected — those go through `TypedArraySubsequenceFromIterable` which uses the iterator protocol. See sections 2.5-2.8.

### 2.13 Detached TypedArray needle

TypedArray needles are handled by `TypedArraySubsequenceFromTypedArray`, which calls `MakeTypedArrayWithBufferWitnessRecord` and `IsTypedArrayOutOfBounds`. A detached buffer causes `IsTypedArrayOutOfBounds` to return *true*, resulting in a TypeError.

For each method (`search`, `searchLast`, `contains`):

- [ ] [2.13.1] Same-type, detached: needle is a same-type TypedArray with a detached buffer → TypeError
- [ ] [2.13.2] Different-type, detached: needle is a different-type TypedArray with a detached buffer → TypeError

---

## 3. Position Validation (`ValidateIntegralNumber`)

### 3.1 Default position

- [ ] [3.1.1] `search` with no position argument → defaults to 0
- [ ] [3.1.2] `searchLast` with no position argument → defaults to `haystackLength - 1`
- [ ] [3.1.3] `contains` with no position argument → defaults to 0

### 3.2 Explicit `undefined` → uses default

- [ ] [3.2.1] `new Uint8Array([1,2,3]).search([2,3], undefined)` → 1 (default 0)
- [ ] [3.2.2] `new Uint8Array([1,2,3]).searchLast([2,3], undefined)` → 1 (default haystackLength - 1)

### 3.3 Non-Number position → TypeError

For each method (`search`, `searchLast`, `contains`):

- [ ] [3.3.1] `new Uint8Array([1,2,3]).search([2,3], 'hello')` → TypeError
- [ ] [3.3.2] `new Uint8Array([1,2,3]).search([2,3], {})` → TypeError
- [ ] [3.3.3] `new Uint8Array([1,2,3]).search([2,3], true)` → TypeError
- [ ] [3.3.4] `new Uint8Array([1,2,3]).search([2,3], null)` → TypeError
- [ ] [3.3.5] `new Uint8Array([1,2,3]).search([2,3], Symbol())` → TypeError
- [ ] [3.3.6] `new Uint8Array([1,2,3]).search([2,3], 1n)` → TypeError (BigInt is not a Number)

### 3.4 NaN position → RangeError

For each method (`search`, `searchLast`, `contains`):

- [ ] [3.4.1] `new Uint8Array([1,2,3]).search([2,3], NaN)` → RangeError

### 3.5 Non-integral number → RangeError

For each method (`search`, `searchLast`, `contains`):

- [ ] [3.5.1] `new Uint8Array([1,2,3]).search([2,3], 1.5)` → RangeError
- [ ] [3.5.2] `new Uint8Array([1,2,3]).search([2,3], 0.1)` → RangeError

### 3.6 Infinity → RangeError

For each method (`search`, `searchLast`, `contains`):

- [ ] [3.6.1] `new Uint8Array([1,2,3]).search([2,3], Infinity)` → RangeError
- [ ] [3.6.2] `new Uint8Array([1,2,3]).search([2,3], -Infinity)` → RangeError

### 3.7 Negative position (clamped to 0)

- [ ] [3.7.1] `new Uint8Array([1,2,3]).search([1,2], -5)` → 0 (clamped to 0)
- [ ] [3.7.2] `new Uint8Array([1,2,3]).searchLast([1,2], -1)` → 0 (clamped to 0)
- [ ] [3.7.3] `new Uint8Array([1,2,3]).contains([1,2], -10)` → true (clamped to 0)

### 3.8 Position beyond length (clamped)

- [ ] [3.8.1] `new Uint8Array([1,2,3,4,5]).search([3,4], 100)` → -1 (clamped to 5, can't match from index 5)
- [ ] [3.8.2] `new Uint8Array([1,2,3,4,5]).searchLast([3,4], 100)` → 2 (clamped to 4)
- [ ] [3.8.3] `new Uint8Array([1,2,3]).contains([2,3], 100)` → false (clamped to 3)

### 3.9 Valid integral positions

- [ ] [3.9.1] `new Uint8Array([1,2,3]).search([2,3], 0)` → 1
- [ ] [3.9.2] `new Uint8Array([1,2,3]).search([2,3], 1)` → 1
- [ ] [3.9.3] `new Uint8Array([1,2,3]).search([2,3], 2)` → -1 (not enough room)
- [ ] [3.9.4] `new Uint8Array([1,2,3]).search([1,2], -0)` → 0 (ℝ(-0) is 0)

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
- [ ] [4.3.2] `new Uint8Array([1,2,3]).search([], 2)` → 2 (returns position)
- [ ] [4.3.3] `new Uint8Array([]).search([])` → 0

### 4.4 Empty haystack

- [ ] [4.4.1] `new Uint8Array([]).search(new Uint8Array([1]))` → -1
- [ ] [4.4.2] `new Uint8Array([]).search(new Uint8Array([]))` → 0

### 4.5 Needle longer than haystack

- [ ] [4.5.1] `new Uint8Array([1,2]).search(new Uint8Array([1,2,3]))` → -1

### 4.6 Needle longer than remaining elements from position

- [ ] [4.6.1] `new Uint8Array([1,2,3,4]).search(new Uint8Array([3,4,5]), 2)` → -1 (position + needleLength > haystackLength)
- [ ] [4.6.2] `new Uint8Array([1,2,3,4]).search([3,4], 3)` → -1

### 4.7 Position skips earlier matches

- [ ] [4.7.1] `new Uint8Array([1,2,1,2]).search([1,2], 1)` → 2 (skips match at 0)
- [ ] [4.7.2] `new Uint8Array([1,2,1,2,1,2]).search([1,2], 2)` → 2
- [ ] [4.7.3] `new Uint8Array([1,2,1,2,1,2]).search([1,2], 3)` → 4

### 4.8 Multiple occurrences — returns first from position

- [ ] [4.8.1] `new Uint8Array([1,2,3,1,2,3,1,2,3]).search([2,3])` → 1
- [ ] [4.8.2] `new Uint8Array([1,2,3,1,2,3,1,2,3]).search([2,3], 2)` → 4
- [ ] [4.8.3] `new Uint8Array([1,2,3,1,2,3,1,2,3]).search([2,3], 5)` → 7

### 4.9 Single-element needle

- [ ] [4.9.1] `new Uint8Array([1,2,3]).search([2])` → 1
- [ ] [4.9.2] `new Uint8Array([1,2,3]).search([4])` → -1

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

- [ ] [5.3.1] `new Uint8Array([1,2,3]).searchLast([])` → 2 (returns position, default is haystackLength - 1)
- [ ] [5.3.2] `new Uint8Array([1,2,3]).searchLast([], 1)` → 1

### 5.4 Empty haystack

- [ ] [5.4.1] `new Uint8Array([]).searchLast(new Uint8Array([1]))` → -1

### 5.5 Needle longer than haystack

- [ ] [5.5.1] `new Uint8Array([1,2]).searchLast(new Uint8Array([1,2,3]))` → -1

### 5.6 Position constrains search

- [ ] [5.6.1] `new Uint8Array([1,2,3,1,2,3,1,2,3]).searchLast([2,3])` → 7
- [ ] [5.6.2] `new Uint8Array([1,2,3,1,2,3,1,2,3]).searchLast([2,3], 5)` → 4
- [ ] [5.6.3] `new Uint8Array([1,2,3,1,2,3,1,2,3]).searchLast([2,3], 3)` → 1
- [ ] [5.6.4] `new Uint8Array([1,2,3,1,2,3,1,2,3]).searchLast([2,3], 0)` → -1

### 5.7 Position at exact match start

- [ ] [5.7.1] `new Uint8Array([1,2,3,1,2,3]).searchLast([1,2,3], 3)` → 3
- [ ] [5.7.2] `new Uint8Array([1,2,3,1,2,3]).searchLast([1,2,3], 2)` → 0

### 5.8 Single-element needle

- [ ] [5.8.1] `new Uint8Array([1,2,3,2,1]).searchLast([2])` → 3
- [ ] [5.8.2] `new Uint8Array([1,2,3,2,1]).searchLast([2], 2)` → 1

### 5.9 Match must start at or before position (not end at or before)

- [ ] [5.9.1] `new Uint8Array([1,2,3,4,5]).searchLast([3,4,5], 2)` → 2 (match starts at 2, which is ≤ position 2)
- [ ] [5.9.2] `new Uint8Array([1,2,3,4,5]).searchLast([3,4,5], 1)` → -1 (match would start at 2, which is > position 1)

### 5.10 Position near end with multi-element needle (`k + needleLength ≤ haystackLength` constraint)

- [ ] [5.10.1] `new Uint8Array([1,2,3,4,5]).searchLast([4,5], 4)` → 3 (position is 4, but k + 2 ≤ 5 means k ≤ 3)
- [ ] [5.10.2] `new Uint8Array([1,2,3,4,5]).searchLast([3,4,5], 4)` → 2 (position is 4, but k + 3 ≤ 5 means k ≤ 2)
- [ ] [5.10.3] `new Uint8Array([1,2,3,4,5]).searchLast([1,2,3,4,5], 4)` → 0 (only one possible start index)
- [ ] [5.10.4] `new Uint8Array([1,2,3,4,5]).searchLast([1,2,3,4,5], 0)` → 0

### 5.11 Empty haystack with empty needle

- [ ] [5.11.1] `new Uint8Array([]).searchLast([])` → 0 (position defaults to haystackLength - 1 = -1, clamped to 0; empty needle returns position)

Note: the clamping range for `searchLast` is `[0, haystackLength - 1]`. When haystackLength is 0, this is `[0, -1]`, a degenerate range. The spec's clamping definition produces `lower` (0) when `x < lower`, so `clamp(-1, 0, -1)` → 0. This edge case may warrant spec clarification.

---

## 6. `contains` (Boolean Search)

### 6.1 Basic matching

For each TypedArray type (`Int8Array`, `Uint8Array`, `Uint8ClampedArray`, `Int16Array`, `Uint16Array`, `Int32Array`, `Uint32Array`, `Float16Array`, `Float32Array`, `Float64Array`):

- [ ] [6.1.1] `new <Type>([1,2,3,4,5]).contains(new <Type>([3,4]))` → true
- [ ] [6.1.2] `new <Type>([1,2,3]).contains(new <Type>([4,5]))` → false

For BigInt types (`BigInt64Array`, `BigUint64Array`):

- [ ] [6.1.3] `new <Type>([1n,2n,3n,4n,5n]).contains(new <Type>([3n,4n]))` → true
- [ ] [6.1.4] `new <Type>([1n,2n,3n]).contains(new <Type>([4n,5n]))` → false

### 6.2 Empty needle

- [ ] [6.2.1] `new Uint8Array([1,2,3]).contains([])` → true
- [ ] [6.2.2] `new Uint8Array([]).contains([])` → true

### 6.3 Position parameter

- [ ] [6.3.1] `new Uint8Array([1,2,3,4]).contains([3,4], 0)` → true
- [ ] [6.3.2] `new Uint8Array([1,2,3,4]).contains([3,4], 3)` → false (not enough room from position 3)

### 6.4 Return type

- [ ] [6.4.1] Verify `contains` return value is strictly `true` (not `1` or truthy) when match found
- [ ] [6.4.2] Verify `contains` return value is strictly `false` (not `0` or falsy) when no match

---

## 7. SameValueZero Equality Semantics

### 7.1 NaN matching

For each floating-point type (`Float16Array`, `Float32Array`, `Float64Array`):

- [ ] [7.1.1] `new <Type>([1, NaN, 3]).search(new <Type>([NaN]))` → 1
- [ ] [7.1.2] `new <Type>([NaN, NaN]).search(new <Type>([NaN, NaN]))` → 0
- [ ] [7.1.3] `new <Type>([NaN, 1, NaN]).searchLast(new <Type>([NaN]))` → 2
- [ ] [7.1.4] `new <Type>([1, NaN, 3]).contains(new <Type>([NaN]))` → true

### 7.2 +0 / -0 equivalence

For each floating-point type (`Float16Array`, `Float32Array`, `Float64Array`) and each method (`search`, `searchLast`, `contains`):

- [ ] [7.2.1] `new <Type>([1, -0, 3]).search(new <Type>([0]))` → 1
- [ ] [7.2.2] `new <Type>([1, 0, 3]).search(new <Type>([-0]))` → 1
- [ ] [7.2.3] `new <Type>([-0]).search(new <Type>([0]))` → 0
- [ ] [7.2.4] `new <Type>([0]).search(new <Type>([-0]))` → 0

### 7.3 NaN in subsequence

For each floating-point type (`Float16Array`, `Float32Array`, `Float64Array`) and each method (`search`, `searchLast`, `contains`):

- [ ] [7.3.1] `new <Type>([1, NaN, 3, 4]).search(new <Type>([NaN, 3]))` → 1

### 7.4 Integer TypedArrays (no NaN / -0 concerns)

For each method (`search`, `searchLast`, `contains`):

- [ ] [7.4.1] `new Int32Array([-1, 0, 1]).search(new Int32Array([0, 1]))` → 1

---

## 8. TypedArray Type Coverage

### 8.1 Basic search/searchLast/contains per type

For each non-BigInt type (`Int8Array`, `Uint8Array`, `Uint8ClampedArray`, `Int16Array`, `Uint16Array`, `Int32Array`, `Uint32Array`, `Float16Array`, `Float32Array`, `Float64Array`):

- [ ] [8.1.1] `new <Type>([1,2,3]).search(new <Type>([2,3]))` → 1
- [ ] [8.1.2] `new <Type>([1,2,3]).searchLast(new <Type>([2,3]))` → 1
- [ ] [8.1.3] `new <Type>([1,2,3]).contains(new <Type>([2,3]))` → true

For each BigInt type (`BigInt64Array`, `BigUint64Array`):

- [ ] [8.1.4] `new <Type>([1n,2n,3n]).search(new <Type>([2n,3n]))` → 1
- [ ] [8.1.5] `new <Type>([1n,2n,3n]).searchLast(new <Type>([2n,3n]))` → 1
- [ ] [8.1.6] `new <Type>([1n,2n,3n]).contains(new <Type>([2n,3n]))` → true

### 8.2 BigInt array with iterable needle

- [ ] [8.2.1] `new BigInt64Array([1n, 2n, 3n]).search([2n, 3n])` → 1
- [ ] [8.2.2] `new BigUint64Array([1n, 2n, 3n]).search([2n, 3n])` → 1

### 8.3 Cross-type with BigInt

- [ ] [8.3.1] `new BigInt64Array([1n, 2n]).search(new BigUint64Array([1n, 2n]))` → 0 (both yield BigInts)
- [ ] [8.3.2] `new BigInt64Array([1n, 2n]).search(new Uint8Array([1, 2]))` → -1 (Uint8Array yields Numbers, BigInt64Array expects BigInts)

---

## 9. Evaluation Order and Observable Side Effects

### 9.1 ValidateTypedArray before needle collection

For each method (`search`, `searchLast`, `contains`):

- [ ] [9.1.1] Detached buffer with an iterable needle that has observable side effects → TypeError from validation, iterator never called
- [ ] [9.1.2] Detached buffer with a TypedArray needle → TypeError from haystack validation, needle's buffer not accessed

### 9.2 Needle collection before ValidateIntegralNumber

For each method (`search`, `searchLast`, `contains`):

- [ ] [9.2.1] Valid TypedArray, invalid needle type, invalid position → TypeError from needle validation (position never validated)
  ```js
  new Uint8Array([1,2,3]).search(42, 'bad') // → TypeError (from needle, not position)
  ```

### 9.3 ValidateIntegralNumber after needle collection

For each method (`search`, `searchLast`, `contains`):

- [ ] [9.3.1] Valid TypedArray, valid iterable needle, invalid position → error from position validation
  ```js
  new Uint8Array([1,2,3]).search([1,2], NaN) // → RangeError
  new Uint8Array([1,2,3]).search([1,2], 'bad') // → TypeError
  ```

### 9.4 Iterator side effects (iterable path only)

For each method (`search`, `searchLast`, `contains`):

- [ ] [9.4.1] Iterable whose iterator modifies global state → verify iteration happens exactly once
- [ ] [9.4.2] Iterable whose iterator throws midway → error propagates, partial iteration observable
- [ ] [9.4.3] TypedArray needle does NOT trigger iterator side effects → @@iterator is not called (see also 2.12.3)

---

## 10. Property and Prototype

### 10.1 Method existence

- [ ] [10.1.1] `typeof Uint8Array.prototype.search` → `'function'`
- [ ] [10.1.2] `typeof Uint8Array.prototype.searchLast` → `'function'`
- [ ] [10.1.3] `typeof Uint8Array.prototype.contains` → `'function'`

### 10.2 Method `.length` property

- [ ] [10.2.1] `Uint8Array.prototype.search.length` → 1
- [ ] [10.2.2] `Uint8Array.prototype.searchLast.length` → 1
- [ ] [10.2.3] `Uint8Array.prototype.contains.length` → 1

### 10.3 Method `.name` property

- [ ] [10.3.1] `Uint8Array.prototype.search.name` → `'search'`
- [ ] [10.3.2] `Uint8Array.prototype.searchLast.name` → `'searchLast'`
- [ ] [10.3.3] `Uint8Array.prototype.contains.name` → `'contains'`

### 10.4 Methods are on %TypedArray%.prototype

- [ ] [10.4.1] `Uint8Array.prototype.search === Int32Array.prototype.search` → true
- [ ] [10.4.2] `Uint8Array.prototype.searchLast === Float64Array.prototype.searchLast` → true
- [ ] [10.4.3] `Uint8Array.prototype.contains === BigInt64Array.prototype.contains` → true

### 10.5 Not enumerable

- [ ] [10.5.1] `Object.getOwnPropertyDescriptor(Uint8Array.prototype, 'search').enumerable` → false
- [ ] [10.5.2] `Object.getOwnPropertyDescriptor(Uint8Array.prototype, 'searchLast').enumerable` → false
- [ ] [10.5.3] `Object.getOwnPropertyDescriptor(Uint8Array.prototype, 'contains').enumerable` → false

---

## 11. Boundary and Stress Cases

### 11.1 Single-element haystack

- [ ] [11.1.1] `new Uint8Array([5]).search([5])` → 0
- [ ] [11.1.2] `new Uint8Array([5]).search([6])` → -1
- [ ] [11.1.3] `new Uint8Array([5]).searchLast([5])` → 0

### 11.2 Needle same length as haystack

- [ ] [11.2.1] `new Uint8Array([1,2,3]).search([1,2,3])` → 0
- [ ] [11.2.2] `new Uint8Array([1,2,3]).search([1,2,4])` → -1
- [ ] [11.2.3] `new Uint8Array([1,2,3]).searchLast([1,2,3])` → 0

### 11.3 Overlapping pattern in haystack

- [ ] [11.3.1] `new Uint8Array([1,1,1,2]).search([1,1,2])` → 1
- [ ] [11.3.2] `new Uint8Array([1,1,1,1]).search([1,1])` → 0
- [ ] [11.3.3] `new Uint8Array([1,1,1,1]).searchLast([1,1])` → 2

### 11.4 Repeated single value

- [ ] [11.4.1] `new Uint8Array([0,0,0,0,0]).search([0,0])` → 0
- [ ] [11.4.2] `new Uint8Array([0,0,0,0,0]).searchLast([0,0])` → 3
- [ ] [11.4.3] `new Uint8Array([0,0,0,0,0]).search([0,0], 2)` → 2
- [ ] [11.4.4] `new Uint8Array([0,0,0,0,0]).searchLast([0,0], 2)` → 2

### 11.5 Large TypedArrays

- [ ] [11.5.1] Search in a large TypedArray (e.g., 10,000+ elements) with needle at the end → correct index
- [ ] [11.5.2] Search in a large TypedArray with no match → -1
- [ ] [11.5.3] searchLast in a large TypedArray with needle at the beginning → correct index

### 11.6 Position equals haystack length

- [ ] [11.6.1] `new Uint8Array([1,2,3]).search([], 3)` → 3 (empty needle returns position)
- [ ] [11.6.2] `new Uint8Array([1,2,3]).search([1], 3)` → -1 (position + needleLength > haystackLength)

### 11.7 Uint8ClampedArray behaviour

Note: `ToCompatibleTypedArrayElementList` validates that iterable elements are Numbers (for non-BigInt TypedArrays) but does not clamp them. The needle List contains the raw Number values as yielded by the iterator. A value like 300 is a valid Number, but will not SameValueZero-match any stored element (which was clamped to 255 on write).

- [ ] [11.7.1] `new Uint8ClampedArray([255, 0]).search([255])` → 0
- [ ] [11.7.2] `new Uint8ClampedArray([255, 0]).search([300])` → -1 (300 does not SameValueZero-equal 255)
- [ ] [11.7.3] `new Uint8ClampedArray([255, 0]).search(new Uint8ClampedArray([255]))` → 0 (iterated value is 255, matches stored 255)

### 11.8 Typed integer overflow boundaries

- [ ] [11.8.1] `new Uint8Array([255, 0, 1]).search([255, 0])` → 0
- [ ] [11.8.2] `new Int8Array([-128, 127]).search([-128, 127])` → 0
- [ ] [11.8.3] `new Uint16Array([65535, 0]).search([65535, 0])` → 0
- [ ] [11.8.4] `new Int32Array([-2147483648, 2147483647]).search([-2147483648])` → 0

### 11.9 Methods called via `.call()` on different TypedArray subtypes

- [ ] [11.9.1] `Uint8Array.prototype.search.call(new Int32Array([1,2,3]), new Int32Array([2,3]))` → 1 (this is Int32Array, needle is same-type relative to this)
- [ ] [11.9.2] `Uint8Array.prototype.search.call(new Int32Array([1,2,3]), new Uint8Array([2,3]))` → 1 (needle is different-type, iterated via @@iterator)

### 11.10 Empty haystack with non-empty needle (both directions)

- [ ] [11.10.1] `new Uint8Array([]).search([1])` → -1
- [ ] [11.10.2] `new Uint8Array([]).searchLast([1])` → -1
- [ ] [11.10.3] `new Uint8Array([]).contains([1])` → false

---

## 12. SharedArrayBuffer Considerations

TypedArray needles are read directly from their underlying buffer via `TypedArraySubsequenceFromTypedArray` using `GetValueFromBuffer` with ~unordered~ ordering. Each element is read individually, so for SAB-backed needles, another agent may modify elements between reads. Iterable (non-TypedArray) needles are snapshotted into a List via `@@iterator`. The haystack is *not* snapshotted — its elements are read directly during the search, consistent with `indexOf` and `lastIndexOf`.

### 12.1 TypedArray needle backed by SharedArrayBuffer (not snapshotted)

- [ ] [12.1.1] TypedArray needle elements are read individually from the SAB via `GetValueFromBuffer`. Another agent may modify needle elements between reads, potentially yielding an incoherent needle List.
- [ ] [12.1.2] Example: needle starts as `[2, 3]`; another agent changes element 0 to `9` after it is read but before element 1 is read. The search proceeds with the needle List `[2, 3]` or `[9, 3]` depending on timing.

### 12.1a Iterable needle backed by SharedArrayBuffer (snapshotted via @@iterator)

- [ ] [12.1a.1] Non-TypedArray iterable backed by a SharedArrayBuffer (e.g., a custom iterable wrapping SAB reads) — elements are snapshotted via `@@iterator` in `TypedArraySubsequenceFromIterable`. Concurrent modifications after iteration completes do not affect the search.

### 12.2 Haystack backed by SharedArrayBuffer (not snapshotted)

- [ ] [12.2.1] Haystack elements are read individually during the search (via Get). Another agent may modify elements of the haystack concurrently. This is the same behaviour as `%TypedArray%.prototype.indexOf` and `%TypedArray%.prototype.lastIndexOf`.
- [ ] [12.2.2] A search may return `-1` even if the needle was present at the start of the search, if another agent modifies the haystack during the search.
- [ ] [12.2.3] A search may return an index where the needle no longer exists by the time the result is observed, if another agent modifies the haystack after the match is found.

### 12.3 Both haystack and needle backed by SharedArrayBuffer

- [ ] [12.3.1] For TypedArray needles: both needle and haystack elements are read live (neither is snapshotted). Another agent may modify either during the search. Users must synchronize access externally.
- [ ] [12.3.2] For iterable needles: the needle is snapshotted via `@@iterator` before the search. The haystack is read live. The search compares a frozen needle List against live haystack reads.

---

## 13. Resizable ArrayBuffer Considerations

TypedArrays can be backed by resizable ArrayBuffers (created via `new ArrayBuffer(n, { maxByteLength: m })`). These buffers can be grown or shrunk via `resize()`, which can cause a TypedArray to go out of bounds. Auto-length TypedArrays (created without an explicit length) track the buffer size; fixed-length TypedArrays over resizable buffers have a fixed element count but can go out of bounds if the buffer shrinks.

The `@@iterator` for TypedArrays checks `IsTypedArrayOutOfBounds` on **every** `.next()` call and throws a `TypeError` if the TypedArray is out of bounds or detached at that point.

### 13.1 Haystack backed by a resizable ArrayBuffer (basic operation)

For each method (`search`, `searchLast`, `contains`):

- [ ] [13.1.1] Auto-length haystack, no resize during operation → normal search behaviour, length tracks the buffer
  ```js
  const rab = new ArrayBuffer(5, { maxByteLength: 10 });
  const u8 = new Uint8Array(rab);
  u8.set([1, 2, 3, 4, 5]);
  u8.search([3, 4]) // → 2
  ```
- [ ] [13.1.2] Fixed-length haystack over resizable buffer, no resize → normal search behaviour
  ```js
  const rab = new ArrayBuffer(8, { maxByteLength: 16 });
  const u8 = new Uint8Array(rab, 0, 5);
  u8.set([1, 2, 3, 4, 5]);
  u8.search([3, 4]) // → 2
  ```
- [ ] [13.1.3] Auto-length haystack, buffer grown before calling `search` → search sees the new length
- [ ] [13.1.4] Fixed-length haystack, buffer shrunk below the fixed length before calling `search` → `ValidateTypedArray` throws TypeError (TypedArray is out of bounds)

### 13.2 Needle backed by a resizable ArrayBuffer (basic operation)

For each method (`search`, `searchLast`, `contains`):

- [ ] [13.2.1] Auto-length needle TypedArray over resizable buffer, no resize → normal iteration, produces correct snapshot List
- [ ] [13.2.2] Fixed-length needle TypedArray over resizable buffer, no resize → normal iteration, produces correct snapshot List

### 13.3 Needle iteration detaches the haystack's buffer (iterable path only)

A custom iterable whose iterator detaches the haystack's `ArrayBuffer` during iteration. `ValidateTypedArray` was already called (step 2), so `_taRecord_` has a pre-detachment buffer witness. After `TypedArraySubsequenceFromIterable` returns, `TypedArrayLength(_taRecord_)` uses the stale witness. The search proceeds but element reads from the detached buffer return `undefined`, which will not SameValueZero-match any numeric needle element.

Note: This scenario cannot occur with TypedArray needles, since `TypedArraySubsequenceFromTypedArray` reads the needle's buffer directly without invoking user code that could detach the haystack's buffer.

- [ ] [13.3.1] Custom iterable that detaches the haystack's ArrayBuffer during iteration → search returns -1 (element reads return `undefined`)
  ```js
  const ab = new ArrayBuffer(5);
  const u8 = new Uint8Array(ab);
  u8.set([1, 2, 3, 4, 5]);
  const evilNeedle = {
    [Symbol.iterator]() {
      return {
        i: 0,
        next() {
          if (this.i === 0) {
            // Detach the haystack's buffer via transfer
            ab.transfer();
          }
          if (this.i < 2) return { value: this.i++ + 3, done: false };
          return { done: true };
        }
      };
    }
  };
  u8.search(evilNeedle) // → -1 (haystack buffer is now detached)
  ```
- [ ] [13.3.2] Same scenario with `contains` → false
- [ ] [13.3.3] Same scenario with `searchLast` → -1

### 13.4 Needle TypedArray's own buffer shrunk or detached before read

Since TypedArray needles are read via `TypedArraySubsequenceFromTypedArray` (not `@@iterator`), `IsTypedArrayOutOfBounds` is checked once at the start. If the needle is already out of bounds or detached, a TypeError is thrown. However, since no user code runs during the buffer reads, the buffer cannot be shrunk or detached *during* the read (unlike the `@@iterator` path).

For each method (`search`, `searchLast`, `contains`):

- [ ] [13.4.1] Needle is auto-length over a resizable buffer; buffer shrunk below the needle's range before calling the method → TypeError from `IsTypedArrayOutOfBounds`
- [ ] [13.4.2] Needle is fixed-length over a resizable buffer; buffer shrunk below `byteOffset + length * elementSize` before calling the method → TypeError from `IsTypedArrayOutOfBounds`
- [ ] [13.4.3] Needle TypedArray's buffer is detached before calling the method → TypeError from `IsTypedArrayOutOfBounds`

### 13.5 Needle TypedArray's buffer grown (auto-length needle)

Since TypedArray needles are read via `TypedArraySubsequenceFromTypedArray`, `TypedArrayLength` is computed once from the buffer witness record created by `MakeTypedArrayWithBufferWitnessRecord`. If the buffer is grown before the method is called, the auto-length needle reflects the new size. The buffer cannot be grown *during* the read since no user code runs.

For each method (`search`, `searchLast`, `contains`):

- [ ] [13.5.1] Auto-length needle over a resizable buffer; buffer is grown before calling the method → needle length reflects the new buffer size; search uses all elements

### 13.6 Haystack buffer resized during needle iteration (iterable path only)

The `_taRecord_` is created by `ValidateTypedArray` before needle collection begins. If the haystack's resizable buffer is resized during needle iteration (only possible with iterable needles, since TypedArray needle reads do not invoke user code):

For each method (`search`, `searchLast`, `contains`):

- [ ] [13.6.1] Haystack is auto-length; buffer is grown during needle iteration → `TypedArrayLength(_taRecord_)` returns the pre-growth length (witness is stale); search only scans the original range. Elements beyond the original length are not searched.
- [ ] [13.6.2] Haystack is auto-length; buffer is shrunk during needle iteration (but TypedArray remains in bounds) → `TypedArrayLength(_taRecord_)` returns the pre-shrink length (witness is stale); search may read `undefined` for elements beyond the new length. Those reads will not match, effectively returning -1 for needles that would have matched only in the now-truncated region.
- [ ] [13.6.3] Haystack is auto-length; buffer is shrunk below the haystack's byte offset during needle iteration → `TypedArrayLength(_taRecord_)` uses stale witness; search may read `undefined` for all elements. Returns -1.
- [ ] [13.6.4] Haystack is fixed-length; buffer is shrunk below the fixed range during needle iteration → same stale-witness behaviour; element reads return `undefined`.

### 13.7 Both haystack and needle backed by resizable ArrayBuffers

For each method (`search`, `searchLast`, `contains`):

- [ ] [13.7.1] Both are auto-length over separate resizable buffers, no resize during operation → normal behaviour
- [ ] [13.7.2] Both share the same resizable ArrayBuffer (different views); no resize → needle is snapshotted via iteration, search proceeds normally
- [ ] [13.7.3] Both share the same resizable ArrayBuffer; buffer is grown during needle iteration → needle snapshot may include new elements; haystack length uses stale witness

---

## 14. Self-Search and Overlapping Views

### 14.1 Self-search (searching a TypedArray for itself)

The needle elements are read from the buffer via `TypedArraySubsequenceFromTypedArray` into a List before the search begins. The search then compares this List against the live haystack elements read via `! Get`. Since both read from the same buffer and the method does not modify the buffer, self-search is safe.

- [ ] [14.1.1] `const u8 = new Uint8Array([1,2,3]); u8.search(u8)` → 0 (entire array matches at index 0)
- [ ] [14.1.2] `const u8 = new Uint8Array([1,2,3]); u8.searchLast(u8)` → 0 (only one possible match position)
- [ ] [14.1.3] `const u8 = new Uint8Array([1,2,3]); u8.contains(u8)` → true
- [ ] [14.1.4] `const u8 = new Uint8Array([1,2,3]); u8.search(u8, 1)` → -1 (needle length 3, only 2 elements from position 1)
- [ ] [14.1.5] Self-search on empty TypedArray: `const u8 = new Uint8Array([]); u8.search(u8)` → 0 (empty needle returns position)
- [ ] [14.1.6] Self-search on single-element TypedArray: `const u8 = new Uint8Array([42]); u8.search(u8)` → 0
- [ ] [14.1.7] Self-search with BigInt TypedArray: `const b = new BigInt64Array([1n,2n]); b.search(b)` → 0

### 14.2 Needle and haystack sharing the same underlying ArrayBuffer (overlapping views)

Two TypedArrays backed by the same ArrayBuffer but with different byte offsets or lengths. The needle is snapshotted via iteration, so the search is safe regardless of overlap.

For each method (`search`, `searchLast`, `contains`):

- [ ] [14.2.1] Overlapping views, needle is a subview of the haystack:
  ```js
  const ab = new ArrayBuffer(5);
  const haystack = new Uint8Array(ab); // [1,2,3,4,5]
  haystack.set([1, 2, 3, 4, 5]);
  const needle = new Uint8Array(ab, 2, 2); // [3,4]
  haystack.search(needle) // → 2
  ```
- [ ] [14.2.2] Overlapping views, haystack is a subview:
  ```js
  const ab = new ArrayBuffer(5);
  const full = new Uint8Array(ab);
  full.set([1, 2, 3, 4, 5]);
  const haystack = new Uint8Array(ab, 1, 3); // [2,3,4]
  const needle = new Uint8Array(ab, 0, 2); // [1,2]
  haystack.search(needle) // → -1 (haystack is [2,3,4], needle is [1,2])
  ```
- [ ] [14.2.3] Same buffer, same offset, different element types:
  ```js
  const ab = new ArrayBuffer(8);
  const u8 = new Uint8Array(ab);
  u8.set([1, 0, 2, 0, 3, 0, 4, 0]);
  const u16 = new Uint16Array(ab); // [1, 2, 3, 4] on little-endian
  u16.search(new Uint16Array([2, 3])) // → 1
  ```
