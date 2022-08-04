import { Token } from './lexer';
import { indexOf, length } from './util';

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
  read: function(self: any, key: string): ParseLet {
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

let advance = function (id?: string): ParseLet {
  if (id && node.id !== id) {
    throw Error("Expected '" + id + "', got '" + node.id + "'");
  }
  if (token_nr >= length(tokens)) {
    node = symbol_table.read(symbol_table, "(end)");
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
        nud: function(parselet) {
          let value = parselet.value;
          if (value.type !== "Symbol") {
            throw Error("Unreachable");
          }
          return { type: "Name", value: value.value, id: "(name)" };
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
      throw Error("Unknown operator.");
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
      value: StringLiteral(v),
      nud: function(parselet) {
        let value = parselet.value;
        if (value.type !== "String") {
          throw Error("Unreachable");
        }
        return {
          type: "LiteralNode",
          id: "(literal)",
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
      value: NumberLiteral(v),
      nud: function(parselet) {
        let value = parselet.value;
        if (value.type !== "Number") {
          throw Error("Unreachable");
        }
        return {
          type: "LiteralNode",
          id: "(literal)",
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
  node = advance();
  let left = t.nud(t);
  while (rbp < node.lbp) {
    t = node;
    node = advance();
    left = t.led(t, left);
  }
  return left;
};

let statement = function () {
  let n = node;

  if (n.type === "StatementNode") {
    node = advance();
    return n.std(n);
  }

  let v = expression(0);

  if ((v.type !== "BinaryNode" || v.assignment === false) && v.id !== "(") {
    throw Error("Bad expression statement.");
  }

  node = advance(";");
  return v;
};

let statements = function () {
  let a: Node[] = [];
  let s: Node;
  while (node.id !== "}" && node.id !== "(end)") {
    s = statement();

    if (s) {
      a = [...a, s];
    }
  }

  return a;
};

let block = function () {
  let t = node;
  node = advance("{");

  if (t.type === "StatementNode") {
    return t.std(t);
  } else {
    throw Error("Invalid block");
  }
};

let symbol = function (id: Id, bp?: number): ParseLet {
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
      value: SymbolLiteral(id),
      nud: function (parselet) {
        console.log(parselet, line);
        throw Error("Undefined.");
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
  let x = symbol(s);
  x.value = v;
  x.nud = function(parselet) {
    return {
      type: "LiteralNode",
      value: parselet.value,
      id: parselet.id
    }
  }

  return x;
};

let infix = function (id: Id, bp: number, led?: ParseLet["led"]): ParseLet {
  let s = symbol(id, bp);
  s.type = "BinaryNode";
  if (led !== undefined) {
    s.led = led;
  } else {
    s.led = function (parselet, left) {
      return {
        type: "BinaryNode",
        left: left,
        right: expression(parselet.lbp),
        assignment: false,
        id: parselet.id
      }
    };
  }
  return s;
};

let infixr = function (id: Id, bp: number, led?: ParseLet["led"]) {
  let s = symbol(id, bp);
  if (led !== undefined) {
    s.led = led;
  } else {
    s.led = function (parselet, left) {
      return {
        type: "BinaryNode",
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
      id: parselet.id,
      left: left,
      right: expression(0),
      assignment: true
    }
  });
};

let prefix = function (id: Id, nud?: ParseLet["nud"]) {
  let s = symbol(id);
  if (nud !== undefined) {
    s.nud = nud;
  } else {
    s.nud = function (parselet) {
      return {
        type: "UnaryNode",
        id: parselet.id,
        value: expression(70)
      }
    };
  }
  return s;
};

let stmt = function (s: Id, f: ParseLet["std"]) {
  let x = symbol(s);
  x.type = "StatementNode";
  x.std = f;
  return x;
};

symbol("(end)");
symbol("(name)");
symbol(":");
symbol(";");
symbol(")");
symbol("]");
symbol("}");
symbol(",");
symbol("else");
symbol("catch");
symbol("...");

constant("true", TRUE);
constant("false", FALSE);
constant("null", NULL);
constant("undefined", UNDEFINED);

symbol("(literal)");

assignment("=");

infix("?", 20, function (parselet, left) {
  let first = left;
  let second = expression(0);
  node = advance(":");
  let third = expression(0);
  return {
    type: "TernaryNode",
    id: '?',
    first: first,
    second: second,
    third: third
  };
});

infixr("&&", 30);
infixr("||", 30);

infixr("===", 40);
infixr("!==", 40);
infixr("<", 40);
infixr("<=", 40);
infixr(">", 40);
infixr(">=", 40);

infix("+", 50);
infix("-", 50);

infix("*", 60);
infix("/", 60);

infix("**", 70);

infix(".", 80, function (parselet, left) {
  if (node.type !== "Name") {
    throw Error("Expected a property name.");
  }
  let n = node;
  node = advance();
  return {
    type: "BinaryNode",
    id: ".",
    left: left,
    right: n.nud(n),
    assignment: false
  }
});

infix("[", 80, function (parselet, left) {
  let n: BinaryNode = {
    type: "BinaryNode",
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
    id: "(",
    children: []
  };
  let n: Node;
  if ((left.id === "." || left.id === "[") && left.type === "BinaryNode") {
    n = {
      type: "TernaryNode",
      id: "(",
      first: left.left,
      second: left.right,
      third: a
    }
  } else {
    n = {
      type: "BinaryNode",
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

prefix("-");
prefix("typeof");

prefix("(", function () {
  let e = expression(0);
  node = advance(")");
  return e;
});

prefix("function", function () {
  let n: Node = {
    type: "FunctionNode",
    id: "function",
    name: "",
    parameters: {
      type: "NodeList",
      id: "parameters",
      children: []
    },
    body: {
      type: "NodeList",
      id: "body",
      children: []
    }
  }
  if (node.type === "Name") {
    n.name = node.id;
    node = advance();
  }
  node = advance("(");
  if (node.id !== ")") {
    while (true) {
      if (node.type !== "Name") {
        throw Error("Expected a parameter name.");
      }
      n.parameters.children = [...n.parameters.children, node.nud(node)];
      node = advance();
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
      id: "return",
      value: {
        type: "LiteralNode",
        id: "undefined",
        value: UNDEFINED
      }
    }]
  }
  n.body.children = children;
  node = advance("}");
  return n;
});

prefix("[", function () {
  let a: NodeList = {
    type: "NodeList",
    id: "[",
    children: []
  };
  if (node.id !== "]") {
    while (true) {
      if (node.id === "...") {
        node = advance("...");
        let v = expression(0);
        node = advance(",");
        a.children = [...a.children, {
          type: "UnaryNode",
          id: "...",
          value: v
        }];
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
    id: "[",
    value: a
  };
});

prefix("{", function () {
  let a: NodeList = { type: "NodeList", children: [], id: '{' };
  if (node.id !== "}") {
    while (true) {
      let n = node;
      let v: Node;
      if (n.id === "...") {
        node = advance('...');
        v = expression(0);
        node = advance(",");
        a.children = [...a.children, {
          type: "UnaryNode",
          id: "...",
          value: v
        }];
        continue;
      }
      if (n.type !== "Name" && n.type !== "LiteralNode") {
        throw Error("Bad property name.");
      }
      let kn = n.nud(n);
      node = advance();
      node = advance(":");
      v = expression(0);
      a.children = [...a.children, {
        type: "BinaryNode",
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
    id: "{",
    value: a
  };
});

stmt("{", function () {
  let n: NodeList = {
    type: "NodeList",
    id: "{",
    children: statements()
  };
  node = advance("}");
  return {
    type: "StatementNode",
    id: "{",
    value: n
  };
});

stmt("throw", function() {
  let n: StatementNode = {
    type: "StatementNode",
    id: "throw",
    value: expression(0)
  };
  node = advance(';');
  return n;
});

stmt("let", function () {
  let n = node.nud(node);
  if (n.type !== "Name") {
    throw Error("Expected a new variable name.");
  }
  node = advance();
  
  if (node.id === ";") {
    node = advance(";");
    return {
      type: "BinaryNode",
      assignment: true,
      id: "let",
      left: n,
      right: {
        type: "LiteralNode",
        id: "undefined",
        value: UNDEFINED
      }
    }
  }

  node = advance("=");
  let assignment: BinaryNode = {
    type: "BinaryNode",
    assignment: true,
    id: "let",
    left: n,
    right: expression(0)
  };
  node = advance(";");
  return assignment;
});

stmt("if", function () {
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
      id: '{',
      value: {
        type: 'NodeList',
        id: '{',
        children: []
      }
    };
  }
  return {
    type: "TernaryNode",
    id: "if",
    first: first,
    second: second,
    third: third
  }
});

stmt("try", function () {
  let first = block();
  node = advance("catch");
  node = advance("(");
  let second = expression(0);
  node = advance(")");
  let third = block();
  return {
    type: "TernaryNode",
    id: "try",
    first: first,
    second: second,
    third: third
  }
});

stmt("return", function () {
  let n: Node;

  if (node.id !== ";") {
    n = {
      type: "StatementNode",
      id: "return",
      value: expression(0)
    }
    node = advance(';');
  } else {
    n = {
      type: "StatementNode",
      id: "return",
      value: {
        type: "LiteralNode",
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

stmt("break", function () {
  node = advance(";");
  if (node.id !== "}") {
    throw Error("Unreachable statement.");
  }
  return {
    type: "StatementNode",
    id: "break",
    value: {
      type: "Name",
      id: "break",
      value: "break"
    }
  };
});

stmt("continue", function () {
  node = advance(";");
  if (node.id !== "}") {
    throw Error("Unreachable statement.");
  }
  return {
    type: "StatementNode",
    id: "continue",
    value: {
      type: "Name",
      id: "continue",
      value: "continue"
    }
  };
});

stmt("while", function () {
  node = advance("(");
  let left = expression(0);
  node = advance(")");
  let right = block();
  return {
    type: "StatementNode",
    id: "while",
    value: {
      type: "BinaryNode",
      id: "while",
      left: left,
      right: right,
      assignment: false
    }
  };
});

let parse = function (tokenized: Token[]) {
  tokens = tokenized;
  token_nr = 0;
  node = advance();
  let s = statements();
  node = advance("(end)");
  return s;
};

export default parse;