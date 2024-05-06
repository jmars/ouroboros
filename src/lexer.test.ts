import { tokenize } from './lexer.js';
import { describe, it, expect } from 'bun:test';

describe('tokenize', () => {
  it('should return an empty array for an empty string', () => {
    const result = tokenize("", [], [], console.log);
    expect(result).toEqual([]);
  });

  it('should tokenize identifiers', () => {
    const result = tokenize("hello world", [], [], console.log);
    expect(result).toEqual([
      { type: "name", value: "hello", from: 0, to: 5, line: 1 },
      { type: "name", value: "world", from: 6, to: 11, line: 1 }
    ]);
  });

  it('should tokenize numbers', () => {
    const result = tokenize("123 456.78 9e10", [], [], console.log);
    expect(result).toEqual([
      { type: "number", value: 123, from: 0, to: 3, line: 1 },
      { type: "number", value: 456.78, from: 4, to: 10, line: 1 },
      { type: "number", value: 9e10, from: 11, to: 15, line: 1 }
    ]);
  });

  it('should tokenize strings', () => {
    const result = tokenize("'string' \"another\"", [], [], console.log);
    expect(result).toEqual([
      { type: "string", value: "string", from: 0, to: 8, line: 1 },
      { type: "string", value: "another", from: 9, to: 18, line: 1 }
    ]);
  });

  it('should handle escaped characters in strings', () => {
    const result = tokenize("'str\\'ing' \"ano\\\"ther\"", [], [], console.log);
    expect(result).toEqual([
      { type: "string", value: "str'ing", from: 0, to: 10, line: 1 },
      { type: "string", value: "ano\"ther", from: 11, to: 22, line: 1 }
    ]);
  });

  it('should tokenize operators', () => {
    const result = tokenize("+ - * /", [], [], console.log);
    expect(result).toEqual([
      { type: "operator", value: "+", from: 0, to: 1, line: 1 },
      { type: "operator", value: "-", from: 2, to: 3, line: 1 },
      { type: "operator", value: "*", from: 4, to: 5, line: 1 },
      { type: "operator", value: "/", from: 6, to: 7, line: 1 }
    ]);
  });

  it('should throw an error for bad numbers', () => {
    expect(() => tokenize("123e", [], [], console.log)).toThrow("Bad exponent");
  });

  it('should throw an error for unterminated strings', () => {
    expect(() => tokenize("'string", [], [], console.log)).toThrow("Unterminated string");
  });

  it('should ignore comments', () => {
    const result = tokenize("123 // comment\n456", [], [], console.log);
    expect(result).toEqual([
      { type: "number", value: 123, from: 0, to: 3, line: 1 },
      { type: "number", value: 456, from: 15, to: 18, line: 2 }
    ]);
  });
});
