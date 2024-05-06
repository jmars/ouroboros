import { Token } from './lexer.js';
import { indexOf, length, numberToString } from './util-native.js';

type Id
  = "(name)"
  | "(literal)"
  | "{"
  | "("
  | "["
  | "(end)"
  | "}"
  | "."
  | ":"
  | ";"
  | ")"
  | "]"
  | ","
  | "else"
  | "catch"
  | "..."
  | "true"
  | "false"
  | "null"
  | "="
  | "?"
  | "&&"
  | "||"
  | "==="
  | "!=="
  | "<"
  | "<="
  | ">"
  | ">="
  | "+"
  | "-"
  | "*"
  | "/"
  | "**"
  | "function"
  | "typeof"
  | "parameters"
  | "body"
  | "return"
  | "undefined"
  | "throw"
  | "let"
  | "if"
  | "try"
  | "break"
  | "continue"
  | "while";

type Literal
 = { type: "String", value: string }
 | { type: "Number", value: number }
 | { type: "Boolean", value: boolean }
 | { type: "Null" }
 | { type: "Undefined" }
 | { type: "Symbol", value: string }

interface ParseLet {
  id: Id,
  lbp: number,
  type: Node["type"],
  value: Literal,
  line: number,
  nud: (parselet: ParseLet) => Node,
  led: (parselet: ParseLet, left: Node) => Node,
  std: null | ((parselet: ParseLet) => Node),
}

let NULL: Literal = { type: "Null" };
let UNDEFINED: Literal = { type: "Undefined" };
let TRUE: Literal = { type: "Boolean", value: true };
let FALSE: Literal = { type: "Boolean", value: false };

let StringLiteral = function(value: string): Literal {
  return { type: "String", value: value };
};

let NumberLiteral = function(value: number): Literal {
  return { type: "Number", value: value };
};

let SymbolLiteral = function(value: string): Literal {
  return { type: "Symbol", value: value };
};

interface BaseNode {
  id: Id,
  line: number
}

interface LiteralNode extends BaseNode {
  type: "LiteralNode",
  value: Literal,
}

interface BinaryNode extends BaseNode {
  type: "BinaryNode",
  left: Node,
  right: Node,
  assignment: boolean,
}

interface UnaryNode extends BaseNode {
  type: "UnaryNode",
  value: Node
}

interface NameNode extends BaseNode {
  type: "Name",
  value: string,
}

interface TernaryNode extends BaseNode {
  type: "TernaryNode",
  first: Node,
  second: Node,
  third: Node
}

interface FunctionNode extends BaseNode {
  type: "FunctionNode",
  parameters: NodeList,
  body: NodeList,
  name: string
}

interface StatementNode extends BaseNode {
  type: "StatementNode",
  value: Node,
}

interface NodeList extends BaseNode {
  type: "NodeList",
  children: Node[],
}

interface EndNode extends BaseNode {
  type: "End",
}

export type Node
  = LiteralNode
  | BinaryNode
  | UnaryNode
  | TernaryNode
  | FunctionNode
  | StatementNode
  | NameNode
  | NodeList
  | EndNode

let symbol_table = {
  keys: [],
  values: [],
  update: function(self: any, key: string, value: ParseLet): ParseLet {
    let index = indexOf(self.keys, key);
    if (index !== -1) {
      self.values[index] = value;
    } else {
      self.keys = [...self.keys, key];
      self.values = [...self.values, value];
    }
    return value;
  },
  read: function(self: any, key: string): ParseLet | undefined {
    let index = indexOf(self.keys, key);
    if (index !== -1) {
      return self.values[index];
    } else {
      return undefined;
    }
  }
};

let tokens: Token[];
let token_nr: number = 0;
let node: ParseLet;
let line: number = 1;

let advance = function (id: string | undefined): ParseLet {
  if (id !== undefined && node.id !== id) {
    throw Error("Line:  " + numberToString(line) + " | Expected '" + id + "', got '" + node.id + "'");
  }
  if (token_nr >= length(tokens)) {
    let n = symbol_table.read(symbol_table, "(end)");
    if (n === undefined) {
      throw Error("No end token in symbol table")
    }
    node = n;
    return node;
  }
  let t = tokens[token_nr];
  line = t.line;
  token_nr = token_nr + 1;
  let v = t.value;
  let a = t.type;
  if (a === "name") {
    if (typeof v !== "string") {
      throw Error("Invalid name.");
    }
    let s = symbol_table.read(symbol_table, v);
    if (s !== undefined && typeof s !== "function") {
      return s;
    } else {
      return {
        id: "(name)",
        type: "Name",
        lbp: 0,
        value: SymbolLiteral(v),
        line: line,
        nud: function(parselet: ParseLet) {
          let value = parselet.value;
          if (value.type !== "Symbol") {
            throw Error("Unreachable");
          }
          return { type: "Name", value: value.value, id: "(name)", line: parselet.line };
        },
        led: function() {
          throw Error("Invalid name token");
        },
        std: null
      };
    }
  } else if (a === "operator") {
    if (typeof v !== "string") {
      throw Error("Invalid operator.");
    }
    let o = symbol_table.read(symbol_table, v);
    if (o === undefined) {
      throw Error("Line: " + numberToString(line) + " | Unknown operator.");
    }
    return o;
  } else if (a === "string") {
    if (typeof v !== "string") {
      throw Error("Invalid string");
    }
    return {
      id: "(literal)",
      type: "LiteralNode",
      lbp: 0,
      line: line,
      value: StringLiteral(v),
      nud: function(parselet: ParseLet) {
        let value = parselet.value;
        if (value.type !== "String") {
          throw Error("Unreachable");
        }
        return {
          type: "LiteralNode",
          id: "(literal)",
          line: parselet.line,
          value: {
            type: "String",
            value: value.value
          }
        }
      },
      led: function () {
        throw Error("Missing operator.");
      },
      std: null
    };
  } else if (a === "number") {
    if (typeof v !== "number") {
      throw Error("Invalid number");
    }
    return {
      id: "(literal)",
      type: "LiteralNode",
      lbp: 0,
      line: line,
      value: NumberLiteral(v),
      nud: function(parselet: ParseLet) {
        let value = parselet.value;
        if (value.type !== "Number") {
          throw Error("Unreachable");
        }
        return {
          type: "LiteralNode",
          id: "(literal)",
          line: parselet.line,
          value: {
            type: "Number",
            value: value.value
          }
        }
      },
      led: function () {
        throw Error("Missing operator.");
      },
      std: null
    };
  } else {
    throw Error("unexpected token");
  }
};

let expression = function (rbp: number) {
  let t = node;
  node = advance(undefined);
  let left = t.nud(t);
  while (rbp < node.lbp) {
    t = node;
    node = advance(undefined);
    left = t.led(t, left);
  }
  return left;
};

let statement = function () {
  let n = node;

  if (n.type === "StatementNode") {
    node = advance(undefined);
    if (n.std === null) {
      throw Error("Statement without handler");
    }
    return n.std(n);
  }

  let v = expression(0);

  /*
  if ((v.type !== "BinaryNode" || v.assignment === false) && v.id !== "(") {
    debugger;
    throw Error("Bad expression statement.");
  }
  */

  node = advance(";");
  return v;
};

let statements = function () {
  let a: Node[] = [];
  let s: Node;
  while (node.id !== "}" && node.id !== "(end)") {
    s = statement();

    if (s !== undefined) {
      a = [...a, s];
    }
  }

  return a;
};

let block = function () {
  let t = node;
  node = advance("{");

  if (t.type === "StatementNode") {
    if (t.std === null) {
      throw Error('Statement without handler');
    }
    return t.std(t);
  } else {
    throw Error("Invalid block");
  }
};

let symbol = function (id: Id, bp: number | undefined): ParseLet {
  bp = bp === undefined ? 0 : bp;
  let s = symbol_table.read(symbol_table, id);

  if (s !== undefined) {
    if (bp >= s.lbp) {
      s.lbp = bp;
    }
    return s;
  } else {
    s = {
      type: "LiteralNode",
      id: id,
      lbp: bp,
      line: line,
      value: SymbolLiteral(id),
      nud: function (parselet: ParseLet) {
        throw Error(parselet.id + ": Undefined.");
      },
      led: function (ignore) {
        throw Error("Missing operator.");
      },
      std: null
    }
    symbol_table.update(symbol_table, id, s);
    return s;
  }
};

let constant = function (s: Id, v: Literal): ParseLet {
  let x = symbol(s, undefined);
  x.value = v;
  x.id = "(literal)";
  x.nud = function(parselet: ParseLet) {
    return {
      type: "LiteralNode",
      line: parselet.line,
      value: parselet.value,
      id: parselet.id
    }
  }

  return x;
};

let infix = function (id: Id, bp: number, led: ParseLet["led"] | undefined): ParseLet {
  let s = symbol(id, bp);
  s.type = "BinaryNode";
  if (led !== undefined) {
    s.led = led;
  } else {
    s.led = function (parselet, left) {
      return {
        type: "BinaryNode",
        line: parselet.line,
        left: left,
        right: expression(parselet.lbp),
        assignment: false,
        id: parselet.id
      }
    };
  }
  return s;
};

let infixr = function (id: Id, bp: number, led: ParseLet["led"] | undefined) {
  let s = symbol(id, bp);
  if (led !== undefined) {
    s.led = led;
  } else {
    s.led = function (parselet, left) {
      return {
        type: "BinaryNode",
        line: parselet.line,
        left: left,
        right: expression(parselet.lbp - 1),
        assignment: false,
        id: parselet.id
      }
    };
  }
  return s;
};

let assignment = function (id: Id) {
  return infixr(id, 10, function (parselet, left) {
    if (
      left.id !== "."
      && left.id !== "["
      && left.type !== "Name"
    ) {
      throw Error("Bad lvalue.");
    }
    return {
      type: "BinaryNode",
      line: parselet.line,
      id: parselet.id,
      left: left,
      right: expression(0),
      assignment: true
    }
  });
};

let prefix = function (id: Id, nud: ParseLet["nud"] | undefined) {
  let s = symbol(id, undefined);
  if (nud !== undefined) {
    s.nud = nud;
  } else {
    s.nud = function (parselet: ParseLet) {
      return {
        type: "UnaryNode",
        line: parselet.line,
        id: parselet.id,
        value: expression(70)
      }
    };
  }
  return s;
};

let stmt = function (s: Id, f: ParseLet["std"]) {
  let x = symbol(s, undefined);
  x.type = "StatementNode";
  x.std = f;
  return x;
};

symbol("(end)", undefined);
symbol("(name)", undefined);
symbol(":", undefined);
symbol(";", undefined);
symbol(")", undefined);
symbol("]", undefined);
symbol("}", undefined);
symbol(",", undefined);
symbol("else", undefined);
symbol("catch", undefined);
symbol("...", undefined);

constant("true", TRUE);
constant("false", FALSE);
constant("null", NULL);
constant("undefined", UNDEFINED);

symbol("(literal)", undefined);

assignment("=");

infix("?", 20, function (parselet, left) {
  let first = left;
  let second = expression(0);
  node = advance(":");
  let third = expression(0);
  return {
    type: "TernaryNode",
    line: parselet.line,
    id: '?',
    first: first,
    second: second,
    third: third
  };
});

infixr("&&", 30, undefined);
infixr("||", 30, undefined);

infixr("===", 40, undefined);
infixr("!==", 40, undefined);
infixr("<", 40, undefined);
infixr("<=", 40, undefined);
infixr(">", 40, undefined);
infixr(">=", 40, undefined);

infix("+", 50, undefined);
infix("-", 50, undefined);

infix("*", 60, undefined);
infix("/", 60, undefined);

infix("**", 70, undefined);

infix(".", 80, function (parselet, left) {
  if (node.type !== "Name") {
    throw Error("Expected a property name.");
  }
  let n = node;
  node = advance(undefined);
  return {
    type: "BinaryNode",
    line: parselet.line,
    id: ".",
    left: left,
    right: n.nud(n),
    assignment: false
  }
});

infix("[", 80, function (parselet, left) {
  let n: BinaryNode = {
    type: "BinaryNode",
    line: parselet.line,
    id: "[",
    left: left,
    right: expression(0),
    assignment: false
  }
  node = advance("]");
  return n;
});

infix("(", 80, function (parselet, left) {
  let a: NodeList = {
    type: "NodeList",
    line: parselet.line,
    id: "(",
    children: []
  };
  let n: Node;
  if ((left.id === "." || left.id === "[") && left.type === "BinaryNode") {
    n = {
      type: "TernaryNode",
      line: parselet.line,
      id: "(",
      first: left.left,
      second: left.right,
      third: a
    }
  } else {
    n = {
      type: "BinaryNode",
      line: parselet.line,
      id: "(",
      left: left,
      right: a,
      assignment: false
    }
    if (
      (left.type !== "UnaryNode" || left.id !== "function")
      && left.type !== "Name"
      && left.id !== "("
      && left.id !== "&&"
      && left.id !== "||"
      && left.id !== "?"
    ) {
      throw Error("Expected a variable name.");
    }
  }
  // TODO: get rid of the while true?
  if (node.id !== ")") {
    while (true) {
      a.children = [...a.children, expression(0)];
      if (node.id !== ",") {
        break;
      }
      node = advance(",");
    }
  }
  node = advance(")");
  return n;
});

prefix("-", undefined);
prefix("typeof", undefined);

prefix("(", function (parselet: ParseLet) {
  let e = expression(0);
  node = advance(")");
  return e;
});

prefix("function", function (parselet: ParseLet) {
  let n: Node = {
    type: "FunctionNode",
    line: parselet.line,
    id: "function",
    name: "",
    parameters: {
      type: "NodeList",
      line: parselet.line,
      id: "parameters",
      children: []
    },
    body: {
      type: "NodeList",
      line: parselet.line,
      id: "body",
      children: []
    }
  }
  if (node.type === "Name") {
    n.name = node.id;
    node = advance(undefined);
  }
  node = advance("(");
  if (node.id !== ")") {
    while (true) {
      if (node.type !== "Name") {
        throw Error("Expected a parameter name.");
      }
      n.parameters.children = [...n.parameters.children, node.nud(node)];
      node = advance(undefined);
      if (node.id !== ",") {
        break;
      }
      node = advance(",");
    }
  }
  node = advance(")");
  node = advance("{");
  let children = statements();
  if (length(children) === 0 || children[length(children) - 1].id !== "return") {
    children = [...children, {
      type: "StatementNode",
      line: parselet.line,
      id: "return",
      value: {
        type: "LiteralNode",
        line: parselet.line,
        id: "undefined",
        value: UNDEFINED
      }
    }]
  }
  n.body.children = children;
  node = advance("}");
  return n;
});

prefix("[", function (parselet: ParseLet) {
  let a: NodeList = {
    type: "NodeList",
    line: parselet.line,
    id: "[",
    children: []
  };
  if (node.id !== "]") {
    while (true) {
      if (node.id === "...") {
        node = advance("...");
        let v = expression(0);
        a.children = [...a.children, {
          type: "UnaryNode",
          line: parselet.line,
          id: "...",
          value: v
        }];
        if (node.id !== ",") {
          break;
        }
        node = advance(",");
        continue;
      }
      a.children = [...a.children, expression(0)];
      if (node.id !== ",") {
        break;
      }
      node = advance(",");
    }
  }
  node = advance("]");
  return {
    type: "UnaryNode",
    line: parselet.line,
    id: "[",
    value: a
  };
});

prefix("{", function (parselet: ParseLet) {
  let a: NodeList = { type: "NodeList", children: [], id: '{', line: parselet.line };
  if (node.id !== "}") {
    while (true) {
      let n = node;
      let v: Node;
      if (n.id === "...") {
        node = advance('...');
        v = expression(0);
        a.children = [...a.children, {
          type: "UnaryNode",
          line: parselet.line,
          id: "...",
          value: v
        }];
        if (node.id !== ",") {
          break;
        }
        node = advance(",");
        continue;
      }
      if (n.type !== "Name" && n.type !== "LiteralNode") {
        throw Error("Bad property name.");
      }
      let kn = n.nud(n);
      node = advance(undefined);
      node = advance(":");
      v = expression(0);
      a.children = [...a.children, {
        type: "BinaryNode",
        line: parselet.line,
        assignment: false,
        id: ":",
        left: kn,
        right: v
      }];
      if (node.id !== ",") {
        break;
      }
      node = advance(",");
    }
  }
  node = advance("}");
  return {
    type: "UnaryNode",
    line: parselet.line,
    id: "{",
    value: a
  };
});

stmt("{", function (parselet: ParseLet) {
  let n: NodeList = {
    type: "NodeList",
    line: parselet.line,
    id: "{",
    children: statements()
  };
  node = advance("}");
  return {
    type: "StatementNode",
    line: parselet.line,
    id: "{",
    value: n
  };
});

stmt("throw", function(parselet: ParseLet) {
  let n: StatementNode = {
    type: "StatementNode",
    line: parselet.line,
    id: "throw",
    value: expression(0)
  };
  node = advance(';');
  return n;
});

stmt("let", function (parselet: ParseLet) {
  let n = node.nud(node);
  if (n.type !== "Name") {
    throw Error("Expected a new variable name.");
  }
  node = advance(undefined);
  
  if (node.id === ";") {
    node = advance(";");
    return {
      type: "BinaryNode",
      line: parselet.line,
      assignment: true,
      id: "let",
      left: n,
      right: {
        type: "LiteralNode",
        line: parselet.line,
        id: "undefined",
        value: UNDEFINED
      }
    }
  }

  node = advance("=");
  let assignment: BinaryNode = {
    type: "BinaryNode",
    line: parselet.line,
    assignment: true,
    id: "let",
    left: n,
    right: expression(0)
  };
  node = advance(";");
  return assignment;
});

stmt("if", function (parselet: ParseLet) {
  node = advance("(");
  let first = expression(0);
  node = advance(")");
  let second = block();
  let third: Node;
  if (node.id === "else") {
    node = advance("else");
    if (node.id === "if") {
      third = statement();
    } else {
      third = block();
    }
  } else {
    third = {
      type: "StatementNode",
      line: parselet.line,
      id: '{',
      value: {
        line: parselet.line,
        type: 'NodeList',
        id: '{',
        children: []
      }
    };
  }
  return {
    type: "TernaryNode",
    line: parselet.line,
    id: "if",
    first: first,
    second: second,
    third: third
  }
});

stmt("try", function (parselet: ParseLet) {
  let first = block();
  node = advance("catch");
  node = advance("(");
  let second = expression(0);
  node = advance(")");
  let third = block();
  return {
    type: "TernaryNode",
    line: parselet.line,
    id: "try",
    first: first,
    second: second,
    third: third
  }
});

stmt("return", function (parselet: ParseLet) {
  let n: Node;

  if (node.id !== ";") {
    n = {
      type: "StatementNode",
      line: parselet.line,
      id: "return",
      value: expression(0)
    }
    node = advance(';');
  } else {
    n = {
      type: "StatementNode",
      line: parselet.line,
      id: "return",
      value: {
        type: "LiteralNode",
        line: parselet.line,
        id: "undefined",
        value: UNDEFINED
      }
    };
    node = advance(";");
    if (node.id !== "}") {
      throw Error("Unreachable statement.");
    }
  }

  return n;
});

stmt("break", function (parselet: ParseLet) {
  node = advance(";");
  if (node.id !== "}") {
    throw Error("Unreachable statement.");
  }
  return {
    type: "StatementNode",
    line: parselet.line,
    id: "break",
    value: {
      type: "Name",
      line: parselet.line,
      id: "break",
      value: "break"
    }
  };
});

stmt("continue", function (parselet: ParseLet) {
  node = advance(";");
  if (node.id !== "}") {
    throw Error("Unreachable statement.");
  }
  return {
    type: "StatementNode",
    line: parselet.line,
    id: "continue",
    value: {
      type: "Name",
      line: parselet.line,
      id: "continue",
      value: "continue"
    }
  };
});

stmt("while", function (parselet: ParseLet) {
  node = advance("(");
  let left = expression(0);
  node = advance(")");
  let right = block();
  return {
    type: "StatementNode",
    line: parselet.line,
    id: "while",
    value: {
      type: "BinaryNode",
      line: parselet.line,
      id: "while",
      left: left,
      right: right,
      assignment: false
    }
  };
});

export let parse = function (tokenized: Token[]) {
  tokens = tokenized;
  token_nr = 0;
  node = advance(undefined);
  let s = statements();
  node = advance("(end)");
  return s;
};