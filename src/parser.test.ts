import { test, expect } from 'bun:test'
import { parse } from './parser'
import { tokenize } from './lexer'

test('parse literals', () => {
  expect(parse(tokenize('true;', [], [], console.log))).toEqual([{
    id: "(literal)", line: 1, type: 'LiteralNode', value: {
      type: 'Boolean',
      value: true
    }
  }])
  expect(parse(tokenize('false;', [], [], console.log))).toEqual([{
    id: "(literal)", line: 1, type: 'LiteralNode', value: {
      type: 'Boolean',
      value: false
    }
  }])
  expect(parse(tokenize('null;', [], [], console.log))).toEqual([{
    id: "(literal)", line: 1, type: 'LiteralNode', value: {
      type: 'Null'
    }
  }])
  expect(parse(tokenize('"hello";', [], [], console.log))).toEqual([{
    id: "(literal)", line: 1, type: 'LiteralNode', value: {
      type: 'String',
      value: "hello"
    }
  }])
  expect(parse(tokenize('3.14;', [], [], console.log))).toEqual([{
    id: "(literal)", line: 1, type: 'LiteralNode', value: {
      type: 'Number',
      value: 3.14
    }
  }])
})

test('parse binary operations', () => {
  const tokens = tokenize('2 + 3;', [], [], console.log)
  expect(parse(tokens)).toEqual([{
    type: 'BinaryNode',
    left: { type: 'LiteralNode', value: 2 },
    right: { type: 'LiteralNode', value: 3 },
    id: '+',
    assignment: false
  }])

  const tokens2 = tokenize('2 * 3 + 4;', [], [], console.log)
  expect(parse(tokens2)).toEqual([{
    type: 'BinaryNode',
    left: {
      type: 'BinaryNode',
      left: { type: 'LiteralNode', value: 2 },
      right: { type: 'LiteralNode', value: 3 },
      id: '*',
      assignment: false
    },
    right: { type: 'LiteralNode', value: 4 },
    id: '+',
    assignment: false
  }])
})

test('parse function definitions', () => {
  const tokens = tokenize('function add(a, b) { return a + b; };', [], [], console.log)
  expect(parse(tokens)).toEqual([{
    type: 'FunctionNode',
    name: 'add',
    parameters: {
      type: 'NodeList',
      children: [
        { type: 'Name', id: 'a' },
        { type: 'Name', id: 'b' }
      ]
    },
    body: {
      type: 'NodeList',
      children: [{
        type: 'StatementNode',
        id: 'return',
        value: {
          type: 'BinaryNode',
          left: { type: 'Name', id: 'a' },
          right: { type: 'Name', id: 'b' },
          id: '+',
          assignment: false
        }
      }]
    }
  }])
})

test('parse if statements', () => {
  const tokens = tokenize('if (x > 0) { return x; } else { return -x; };', [], [], console.log)
  expect(parse(tokens)).toEqual([{
    type: 'TernaryNode',
    id: 'if',
    first: {
      type: 'BinaryNode',
      left: { type: 'Name', id: 'x' },
      right: { type: 'LiteralNode', value: 0 },
      id: '>',
      assignment: false
    },
    second: {
      type: 'StatementNode',
      id: '{',
      value: {
        type: 'NodeList',
        children: [{
          type: 'StatementNode',
          id: 'return',
          value: { type: 'Name', id: 'x' }
        }]
      }
    },
    third: {
      type: 'StatementNode',
      id: '{',
      value: {
        type: 'NodeList',
        children: [{
          type: 'StatementNode',
          id: 'return',
          value: {
            type: 'UnaryNode',
            id: '-',
            value: { type: 'Name', id: 'x' }
          }
        }]
      }
    }
  }])
})