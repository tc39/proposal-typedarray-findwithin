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

The proposal is to add an API to `TypedArray.prototype` to enable optimized searching for subsequences in three forms: `search` returns the starting index of the first occurrence, `searchLast` returns the starting index of the last occurrence, and `contains` returns a simple boolean true/false if the subsequence exists.

```js
const enc = new TextEncoder();
const u8 = enc.encode('Hello TC39');
console.log(u8.search(enc.encode('TC39'))); // 6
console.log(u8.searchLast(enc.encode('TC39'))); // 6
console.log(u8.contains(enc.encode('TC39'))); // true
```

Exactly how to implement the subsequence search algorithm is intended to be left as an implementation specific detail. The key caveat is that the `needle` (the subsequence being searched for) must be of the same element-type as the `haystack` (the `TypedArray` that is being searched).

## Why just `TypedArray`? Why not all `Iterables`

This proposal could generally address the same problem of searching for subsequences within any iterable. That's something the committee should decide. There are a few issues there however:

* It will be easier to optimize the performance of searching for the `needle` in the `haystack` `TypedArray` specifically than it will be dealing with the iterable protocol in general. While it might make sense for this proposal to tackle iterables, there are a different set of performance and optimization path considerations in that approach.
* TypedArrays are homogenous in their member elements, as are strings. However, other types of iterables may yield any variety of types. While it is most common for iterables to always yield the same type of value, they are not required to do so. This also makes it difficult to optimize for the general case.

