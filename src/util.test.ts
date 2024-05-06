import { length, indexOf, lastIndexOf, parseInt, parseFloat, isFinite, charcode, codechar, numberToString } from './util.js';
import { describe, it, expect } from 'bun:test';

// Test for `length` function
describe('length', () => {
  it('returns correct length of array', () => {
    expect(length([1, 2, 3])).toBe(3);
    expect(length([1, 2, 3])).toBe([1, 2, 3].length);
  });

  it('returns correct length of string', () => {
    expect(length("hello")).toBe(5);
    expect(length("hello")).toBe("hello".length);
  });

  it('returns 0 for empty array', () => {
    expect(length([])).toBe(0);
    expect(length([])).toBe([].length);
  });

  it('returns 0 for empty string', () => {
    expect(length("")).toBe(0);
    expect(length("")).toBe("".length)
  });
});

// Test for `indexOf` function
describe('indexOf', () => {
  it('finds element in array', () => {
    expect(indexOf([1, 2, 3], 2)).toBe(1);
    expect(indexOf([1, 2, 3], 2)).toBe([1, 2, 3].indexOf(2));
  });

  it('finds character in string', () => {
    expect(indexOf("hello", "e")).toBe(1);
    expect(indexOf("hello", "e")).toBe("hello".indexOf("e"));
  });

  it('returns -1 if element not found', () => {
    expect(indexOf([1, 2, 3], 4)).toBe(-1);
    expect(indexOf([1, 2, 3], 4)).toBe([1, 2, 3].indexOf(4));
  });
});

// Test for `lastIndexOf` function
describe('lastIndexOf', () => {
  it('finds last index of element in array', () => {
    expect(lastIndexOf([1, 2, 3, 2], 2)).toBe(3);
    expect(lastIndexOf([1, 2, 3, 2], 2)).toBe([1, 2, 3, 2].lastIndexOf(2));
  });

  it('returns -1 if element not found', () => {
    expect(lastIndexOf([1, 2, 3], 4)).toBe(-1);
    expect(lastIndexOf([1, 2, 3], 4)).toBe([1, 2, 3].lastIndexOf(4));
  });
});

// Test for `parseInt`
describe('parseInt', () => {
  it('parses string to integer', () => {
    expect(parseInt("123")).toBe(123);
    expect(parseInt("123")).toBe(globalThis.parseInt("123"));
  });

  it('parses string with leading zeros', () => {
    expect(parseInt("007")).toBe(7);
    expect(parseInt("007")).toBe(globalThis.parseInt("007"));
  });

  it('returns NaN for non-numeric string', () => {
    expect(parseInt("abc")).toBe(NaN);
    expect(parseInt("abc")).toBe(globalThis.parseInt("abc"));
  });
});

// Test for `parseFloat`
describe('parseFloat', () => {
  it('parses floating point numbers correctly', () => {
    expect(parseFloat("123.456")).toBeCloseTo(123.456);
    expect(parseFloat("123.456")).toBeCloseTo(globalThis.parseFloat("123.456"));
  });

  it('parses integers as floats', () => {
    expect(parseFloat("123")).toBe(123.0);
    expect(parseFloat("123")).toBe(globalThis.parseFloat("123"));
  });
});

// Test for `isFinite`
describe('isFinite', () => {
  it('returns true for finite numbers', () => {
    expect(isFinite(123)).toBe(true);
    expect(isFinite(123)).toBe(globalThis.isFinite(123));
  });

  it('returns false for Infinity', () => {
    expect(isFinite(Infinity)).toBe(false);
    expect(isFinite(Infinity)).toBe(globalThis.isFinite(Infinity));
  });
});

// Test for `charcode` and `codechar`
describe('ASCII functions', () => {
  it('correctly encodes character to ASCII code', () => {
    expect(charcode("A")).toBe(65); // Assuming ASCII index starts at 0 for "\b"
    expect(charcode("A")).toBe("A".charCodeAt(0));
  });

  it('correctly decodes ASCII code to character', () => {
    expect(codechar(65)).toBe("A");
    expect(codechar(65)).toBe(String.fromCharCode(65));
  });
});

// Test for `numberToString`
describe('numberToString', () => {
  it('converts number to string', () => {
    expect(numberToString(123)).toBe("123");
    expect(numberToString(123)).toBe((123).toString());
  });

  it('handles negative numbers', () => {
    expect(numberToString(-123)).toBe("-123");
    expect(numberToString(-123)).toBe((-123).toString());
  });

  it('returns "0" for 0', () => {
    expect(numberToString(0)).toBe("0");
    expect(numberToString(0)).toBe((0).toString());
  });
});
