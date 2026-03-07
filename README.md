# TypedArray Find Within

ECMAScript Proposal for searching for subsequences within TypedArrays

This proposal is currently [stage 1](https://github.com/tc39/proposals/blob/master/README.md) of the [process](https://tc39.github.io/process-document/).

## Problem

ECMAScript should provide a native indexOf-type method for TypedArrays that searches for subsequences of elements.

Today with TypedArrays, it is possible to get the index of a specific single element but there is no mechanism to efficiently locate a sequence of elements. Subsequence searches have been common in server-side applications like Node.js for quite some time via the `Buffer` object's override of the `Uint8Array.prototype.indexOf` method, but this is not supported in general for TypedArrays on the Web, which has forced applications to implement slow alternatives that typically rely on non-optimized linear searches of the array.

```js
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

// Works with any TypedArray
const uint8 = new Uint8Array([1, 2, 3, 4, 5]);
const int16 = new Int16Array([1, 2, 3, 4, 5]);
console.log(findSubsequence(uint8, new Uint8Array([3, 4]))); // 2
console.log(findSubsequence(int16, new Int16Array([3, 4]))); // 2
```

## The Proposal

The proposal is to add an API to `TypedArray.prototype` to enable optimized searching for subsequences in three forms: `search` returns the starting index of the first occurrence, `searchLast` returns the starting index of the last occurrence, and `contains` returns a simple boolean true/false if the subsequence exists. All three methods accept an optional `position` parameter to control where the search begins. For `search` and `contains`, only matches starting at `position` or later are considered. For `searchLast`, only matches starting at `position` or earlier are considered.

```js
const enc = new TextEncoder();
const u8 = enc.encode('Hello TC39, Hello TC39');

console.log(u8.search(enc.encode('TC39'))); // 6
console.log(u8.search(enc.encode('TC39'), 7)); // 17
console.log(u8.searchLast(enc.encode('TC39'))); // 17
console.log(u8.searchLast(enc.encode('TC39'), 16)); // 6
console.log(u8.contains(enc.encode('TC39'))); // true
console.log(u8.contains(enc.encode('TC39'), 18)); // false
```

Exactly how to implement the subsequence search algorithm is intended to be left as an implementation specific detail.

### Needle types

The `needle` argument can be:

* A **TypedArray** (same or different element type) — elements are read directly from the needle's underlying buffer via `GetValueFromBuffer`, without calling `@@iterator`. This is consistent with how `%TypedArray%.prototype.set` handles TypedArray sources. The needle and haystack must have compatible content types (both Number-typed or both BigInt-typed); if not, the search returns `-1`.
* An **iterable object** (other than a String) — iterated via the `@@iterator` protocol. Each yielded value is type-checked against the haystack's element type (Number for non-BigInt TypedArrays, BigInt for BigInt TypedArrays); if any value is the wrong type, the search returns `-1`.
* A **String** — throws a `TypeError`. Although strings are iterable, their iteration yields code points, which is unlikely to be the intended behaviour when searching a TypedArray.
* Any other value — throws a `TypeError`.

```js
const u8 = new Uint8Array([1, 2, 3, 4, 5]);

// Same-type TypedArray
u8.search(new Uint8Array([3, 4])); // 2

// Iterable (e.g. plain Array)
u8.search([3, 4]); // 2

// Different-type TypedArray (read from buffer)
u8.search(new Int16Array([3, 4])); // 2

// String throws
u8.search('hello'); // TypeError

// Non-iterable throws
u8.search(42); // TypeError
```

### Cross-type floating-point precision

When a needle TypedArray has a narrower floating-point type than the haystack, precision loss can cause matches to fail. Needle elements are read from the buffer as the needle's element type and converted to JavaScript Numbers via `GetValueFromBuffer`. A value that was rounded when stored in a `Float32Array` will not SameValueZero-match the higher-precision representation in a `Float64Array`.

```js
const f64 = new Float64Array([0.3]);

// Float32 cannot represent 0.3 exactly — it rounds to ≈0.30000001192092896
f64.search(new Float32Array([0.3]));  // -1 (no match)

// Values that are exact in Float32 (integers, powers of two, etc.) work fine
const f64b = new Float64Array([0.25, 0.5, 42]);
f64b.search(new Float32Array([0.25]));  // 0
f64b.search(new Float32Array([42]));    // 2
```

This is not specific to this proposal — it is an inherent property of IEEE 754 floating-point arithmetic and applies equally to any cross-type element comparison.

## Why just `TypedArray`? Why not all `Iterables`

This proposal could generally address the same problem of searching for subsequences within any iterable. That's something the committee should decide. There are a few issues there however:

* It will be easier to optimize the performance of searching for the `needle` in the `haystack` `TypedArray` specifically than it will be dealing with the iterable protocol in general. While it might make sense for this proposal to tackle iterables, there are a different set of performance and optimization path considerations in that approach.
* TypedArrays are homogenous in their member elements, as are strings. However, other types of iterables may yield any variety of types. While it is most common for iterables to always yield the same type of value, they are not required to do so. This also makes it difficult to optimize for the general case.

