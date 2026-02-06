'use strict';

const TypedArrayPrototype = Object.getPrototypeOf(Uint8Array.prototype);
const BIGINT_TYPES = new Set(['BigInt64Array', 'BigUint64Array']);
const NOT_FOUND = Symbol('not-found');

function isTypedArray(value) {
  try {
    Object.getOwnPropertyDescriptor(TypedArrayPrototype, 'buffer').get.call(value);
    return true;
  } catch {
    return false;
  }
}

function isBufferDetached(ta) {
  try {
    new DataView(ta.buffer, 0, 0);
    return false;
  } catch {
    return true;
  }
}

function validateTypedArray(O) {
  if (!isTypedArray(O)) {
    throw new TypeError('this is not a TypedArray');
  }
  if (isBufferDetached(O)) {
    throw new TypeError('cannot perform operation on a TypedArray with a detached ArrayBuffer');
  }
  return O;
}

function typedArrayLength(taRecord) {
  return taRecord.length;
}

function isBigIntElementType(ta) {
  return BIGINT_TYPES.has(ta.constructor.name);
}

function validateIntegralNumber(value, defaultValue) {
  if (value === undefined) return defaultValue;
  if (typeof value !== 'number') {
    throw new TypeError('position must be a number');
  }
  if (Number.isNaN(value)) {
    throw new RangeError('position must not be NaN');
  }
  if (Math.trunc(value) !== value) {
    throw new RangeError('position must be an integral number');
  }
  return value;
}

function sameValueZero(a, b) {
  if (a === b) return true;
  return a !== a && b !== b;
}

function sequenceMatch(ta, offset, needle) {
  for (let i = 0; i < needle.length; i++) {
    if (!sameValueZero(ta[offset + i], needle[i])) return false;
  }
  return true;
}

function toCompatibleTypedArrayElementList(O, needle) {
  if (needle === null || (typeof needle !== 'object' && typeof needle !== 'function')) {
    throw new TypeError('needle must be an iterable object');
  }

  const iteratorMethod = needle[Symbol.iterator];

  if (iteratorMethod === undefined || iteratorMethod === null) {
    throw new TypeError('needle must be iterable');
  }
  if (typeof iteratorMethod !== 'function') {
    throw new TypeError('needle[Symbol.iterator] is not a function');
  }

  const values = [...{ [Symbol.iterator]: () => iteratorMethod.call(needle) }];
  const expectBigInt = isBigIntElementType(O);

  const result = new Array(values.length);
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (expectBigInt) {
      if (typeof v !== 'bigint') return NOT_FOUND;
    } else {
      if (typeof v !== 'number') return NOT_FOUND;
    }
    result[i] = v;
  }

  return result;
}

function typedArraySearchSubsequence(O, haystackLength, needle, direction, position) {
  const needleLength = needle.length;

  if (needleLength === 0) return position;

  if (direction === 'first') {
    if (position + needleLength > haystackLength) return -1;

    // Fast path: single-element needle
    if (needleLength === 1) {
      const target = needle[0];
      for (let k = position; k < haystackLength; k++) {
        if (sameValueZero(O[k], target)) return k;
      }
      return -1;
    }

    const limit = haystackLength - needleLength;
    for (let k = position; k <= limit; k++) {
      if (sequenceMatch(O, k, needle)) return k;
    }
    return -1;
  }

  // direction === 'last'
  if (needleLength > haystackLength) return -1;

  const maxStart = Math.min(position, haystackLength - needleLength);

  // Fast path: single-element needle
  if (needleLength === 1) {
    const target = needle[0];
    for (let k = maxStart; k >= 0; k--) {
      if (sameValueZero(O[k], target)) return k;
    }
    return -1;
  }

  for (let k = maxStart; k >= 0; k--) {
    if (sequenceMatch(O, k, needle)) return k;
  }
  return -1;
}

function search(needle, position) {
  const O = this;
  const taRecord = validateTypedArray(O);
  const needleList = toCompatibleTypedArrayElementList(O, needle);
  if (needleList === NOT_FOUND) return -1;
  const haystackLength = typedArrayLength(taRecord);
  const n = validateIntegralNumber(position, 0);
  const startFrom = Math.max(0, Math.min(n, haystackLength));
  return typedArraySearchSubsequence(O, haystackLength, needleList, 'first', startFrom);
}

function searchLast(needle, position) {
  const O = this;
  const taRecord = validateTypedArray(O);
  const needleList = toCompatibleTypedArrayElementList(O, needle);
  if (needleList === NOT_FOUND) return -1;
  const haystackLength = typedArrayLength(taRecord);
  const n = validateIntegralNumber(position, haystackLength - 1);
  const startFrom = Math.max(0, Math.min(n, haystackLength - 1));
  return typedArraySearchSubsequence(O, haystackLength, needleList, 'last', startFrom);
}

function contains(needle, position) {
  const O = this;
  const taRecord = validateTypedArray(O);
  const needleList = toCompatibleTypedArrayElementList(O, needle);
  if (needleList === NOT_FOUND) return false;
  const haystackLength = typedArrayLength(taRecord);
  const n = validateIntegralNumber(position, 0);
  const startFrom = Math.max(0, Math.min(n, haystackLength));
  const index = typedArraySearchSubsequence(O, haystackLength, needleList, 'first', startFrom);
  return index !== -1;
}

// Install on load
const methods = { search, searchLast, contains };

for (const [name, fn] of Object.entries(methods)) {
  if (name in TypedArrayPrototype) continue;

  Object.defineProperty(fn, 'name', { value: name, configurable: true });
  Object.defineProperty(fn, 'length', { value: 1, configurable: true });

  Object.defineProperty(TypedArrayPrototype, name, {
    value: fn,
    writable: true,
    enumerable: false,
    configurable: true,
  });
}
