import { Node } from "./parser";
import { length, indexOf, lastIndexOf } from "./util";

type Value
  = string
  | number
  | boolean
  | null
  | undefined
  | ValueArray
  | ValueRecord
  | FunctionValue;

interface ValueArray {
  type: "array";
  values: Value[];
  length: number;
};

interface ValueRecord {
  type: "object";
  values: Value[];
  keys: string[];
};

interface FunctionValue {
  type: "function",
  parameters: string[];
  body: AstInterplet[];
}

export interface Frame {
  locals: string[];
  values: Value[];
  ret: Value;
  globals: Frame | null;
}

interface AstInterplet {
  interpret(self: AstInterplet, frame: Frame): Value;
}

interface LiteralStringInterplet extends AstInterplet {
  value: string;
  interpret(self: LiteralStringInterplet, frame: Frame): Value;
}

let LiteralStringInterplet = function(v: string): LiteralStringInterplet {
  return {
    value: v,
    interpret: function(self) {
      return self.value;
    }
  };
}

interface LiteralNumberInterplet extends AstInterplet {
  value: number;
  interpret(self: LiteralNumberInterplet, frame: Frame): Value;
}

let LiteralNumberInterplet = function(v: number): LiteralNumberInterplet {
  return {
    value: v,
    interpret: function(self) {
      return self.value;
    }
  };
}

interface LiteralBooleanInterplet extends AstInterplet {
  value: boolean;
  interpret(self: LiteralBooleanInterplet, frame: Frame): Value;
}

let LiteralBooleanInterplet = function(v: boolean): LiteralBooleanInterplet {
  return {
    value: v,
    interpret: function(self) {
      return self.value;
    }
  };
}

interface LiteralNullInterplet extends AstInterplet {
  interpret(self: LiteralNullInterplet, frame: Frame): Value;
}

let LiteralNullInterplet = function(): LiteralNullInterplet {
  return {
    interpret: function(self) {
      return null;
    }
  };
}

interface LiteralUndefinedInterplet extends AstInterplet {
  interpret(self: LiteralUndefinedInterplet, frame: Frame): Value;
}

let LiteralUndefinedInterplet = function(): LiteralUndefinedInterplet {
  return {
    interpret: function(self) {
      return undefined;
    }
  };
}

interface LiteralArrayInterplet extends AstInterplet {
  expressions: Array<AstInterplet>;
  interpret(self: LiteralArrayInterplet, frame: Frame): Value;
}

let LiteralArrayInterplet = function(v: Array<AstInterplet>): LiteralArrayInterplet {
  return {
    expressions: v,
    interpret: function(self, frame) {
      let result: Value[] = [];
      let i = 0;
      while (i < length(self.expressions)) {
        let expr = self.expressions[i];
        let value = expr.interpret(expr, frame);
        result = [...result, value];
        i = i + 1;
      }
      return {
        type: "array",
        values: result,
        length: length(self.expressions)
      };
    }
  };
}

interface LiteralObjectInterplet extends AstInterplet {
  keys: Array<string>;
  values: Array<AstInterplet>;
  interpret(self: LiteralObjectInterplet, frame: Frame): Value;
}

let LiteralObjectInterplet = function(keys: Array<string>, values: Array<AstInterplet>): LiteralObjectInterplet {
  return {
    keys: keys,
    values: values,
    interpret: function(self, frame) {
      let keys: string[] = [];
      let values: Value[] = [];
      let i = 0;
      while (i < length(self.keys)) {
        let key = self.keys[i];
        let value = self.values[i].interpret(self.values[i], frame);
        if (typeof key !== "string") {
          throw Error("Invalid object key");
        }
        keys = [...keys, key];
        values = [...values, value];
        i = i + 1;
      }
      return {
        type: "object",
        values: values,
        keys: keys
      };
    }
  };
}

interface AssignmentInterplet extends AstInterplet {
  name: string;
  value: AstInterplet;
  interpret(self: AssignmentInterplet, frame: Frame): Value;
}

let AssignmentInterplet = function(name: string, value: AstInterplet): AssignmentInterplet {
  return {
    name: name,
    value: value,
    interpret: function(self, frame) {
      let v = self.value.interpret(self.value, frame);

      let index = lastIndexOf(frame.locals, self.name);
      if (index === -1) {
        let globals = frame.globals;
        if (globals !== null) {
          index = lastIndexOf(globals.locals, self.name);
          globals.values[index] = v;
          return v;
        }
        throw Error("Assignment to undeclared variable");
      }
      frame.values[index] = v;

      return v;
    }
  }
}

interface LetInterplet extends AstInterplet {
  name: string;
  value: AstInterplet;
  interpret(self: LetInterplet, frame: Frame): Value;
}

let LetInterplet = function(name: string, value: AstInterplet): LetInterplet {
  return {
    name: name,
    value: value,
    interpret: function(self, frame) {
      let v = self.value.interpret(self.value, frame);

      frame.locals = [...frame.locals, self.name];
      frame.values = [...frame.values, v];

      return v;
    }
  }
}

interface NameInterplet extends AstInterplet {
  name: string;
  interpret(self: NameInterplet, frame: Frame): Value;
}

let NameInterplet = function(name: string): NameInterplet {
  return {
    name: name,
    interpret: function(self, frame) {
      let index = lastIndexOf(frame.locals, self.name);
      if (index >= 0) {
        return frame.values[index];
      }

      throw Error("Variable " + "'" + self.name + "'" + " does not exist");
    }
  }
}

let operators = ["+", "-", "/", "*", "**", ">", ">=", "<", "<=", "&&", "||", "===", "!=="];

interface OperatorInterplet extends AstInterplet {
  operator: string,
  left: AstInterplet,
  right: AstInterplet,
  interpret(self: OperatorInterplet, frame: Frame): Value;
}

let OperatorInterplet = function(operator: string, left: AstInterplet, right: AstInterplet): OperatorInterplet {
  return {
    operator: operator,
    left: left,
    right: right,
    interpret: function(self, frame) {
      let left = self.left.interpret(self.left, frame);
      let right = self.right.interpret(self.right, frame);

      if (self.operator === "&&" || self.operator === "||") {
        if (typeof left !== "boolean" || typeof right !== "boolean") {
          throw Error("&& or || values must be boolean");
        }

        if (self.operator === "&&") {
          return left && right;
        } else {
          return left || right;
        }
      } else if (self.operator === "===") {
        return left === right;
      } else if (self.operator === "!==") {
        return left !== right;
      } else {
        if (typeof left !== "number" || typeof right !== "number") {
          throw Error("Arithmetic can only be performed on numbers");
        }

        if (self.operator === "+") {
          return left + right;
        } else if (self.operator === '-') {
          return left - right;
        } else if (self.operator === "/") {
          return left / right;
        } else if (self.operator === "*") {
          return left * right;
        } else if (self.operator === "**") {
          return left ** right;
        } else if (self.operator === ">") {
          return left > right;
        } else if (self.operator === ">=") {
          return left >= right;
        } else if (self.operator === "<") {
          return left < right;
        } else if (self.operator === "<=") {
          return left <= right;
        }
      }
    }
  }
}

interface FunctionInterplet extends AstInterplet {
  parameters: string[];
  body: AstInterplet[];
  interpret(self: FunctionInterplet, frame: Frame): Value;
}

let FunctionInterplet = function(parameters: string[], body: AstInterplet[]): FunctionInterplet {
  return {
    parameters: parameters,
    body: body,
    interpret: function(self): FunctionValue {
      return {
        type: "function",
        parameters: self.parameters,
        body: self.body
      }
    }
  }
}

interface ReturnInterplet extends AstInterplet {
  value: AstInterplet,
  interpret(self: ReturnInterplet, frame: Frame): Value;
}

let ReturnInterplet = function(value: AstInterplet): ReturnInterplet {
  return {
    value: value,
    interpret: function(self, frame): Value {
      frame.ret = value.interpret(value, frame);
      return frame.ret;
    }
  }
}

interface CallInterplet extends AstInterplet {
  func: AstInterplet,
  args: AstInterplet[],
  interpret(self: CallInterplet, frame: Frame): Value;
}

let CallInterplet = function(func: AstInterplet, args: AstInterplet[]): CallInterplet {
  return {
    func: func,
    args: args,
    interpret: function(self, frame): Value {
      let f = self.func.interpret(self.func, frame);

      if (typeof f !== "object" || f.type !== "function") {
        throw Error("Attempt to call non-function");
      }

      let i = 0;
      let locals: string[] = [];
      let values: Value[] = [];

      while (i < length(self.args)) {
        let a = self.args[i];
        locals = [...locals, f.parameters[i]];
        values = [...values, a.interpret(a, frame)];
        i = i + 1;
      }

      let stack: Frame = {
        locals: locals,
        values: values,
        ret: undefined,
        globals: frame.globals === null ? frame : frame.globals
      }

      i = 0;

      while (i < length(f.body)) {
        let s = f.body[i];
        s.interpret(s, stack);

        i = i + 1;
      }

      return stack.ret;
    }
  }
}

interface IndexInterplet extends AstInterplet {
  target: AstInterplet;
  index: AstInterplet;
  interpret(self: IndexInterplet, frame: Frame): Value;
}

let IndexInterplet = function(target: AstInterplet, index: AstInterplet): IndexInterplet {
  return {
    target: target,
    index: index,
    interpret: function(self, frame): Value {
      let target = self.target.interpret(self.target, frame);
      let index = self.index.interpret(self.index, frame);

      if (typeof target === "object") {
        if (target.type === "array" && typeof index === "number") {
          if (index >= target.length) {
            throw Error("Out of bounds index");
          } else {
            return target.values[index];
          }
        } else if (target.type === "function") {
          throw Error("Cannot index function");
        } else if (target.type === "object") {
          if (typeof index !== "string") {
            throw Error("Objects can only be indexed by strings");
          }
          if (indexOf(target.keys, index) === -1) {
            throw Error("Key does not exist on object");
          }
          return target.values[indexOf(target.keys, index)];
        }
      }
    }
  }
}

interface DotInterplet extends AstInterplet {
  target: AstInterplet;
  key: string;
  interpret(self: DotInterplet, frame: Frame): Value;
}

let DotInterplet = function(target: AstInterplet, key: string): DotInterplet {
  return {
    target: target,
    key: key,
    interpret: function(self, frame): Value {
      let target = self.target.interpret(self.target, frame);

      if (typeof target !== "object" || target.type !== "object") {
        throw Error("Dot syntax can only be used on objects");
      }

      if (indexOf(target.keys, self.key) === -1) {
        throw Error("Key does not exist on object");
      }

      return target.values[indexOf(target.keys, self.key)];
    }
  }
}

interface WhileInterplet extends AstInterplet {
  condition: AstInterplet;
  block: AstInterplet[];
  interpret(self: WhileInterplet, frame: Frame): Value;
}

let WhileInterplet = function(condition: AstInterplet, block: AstInterplet[]): WhileInterplet {
  return {
    condition: condition,
    block: block,
    interpret: function(self, frame): Value {
      while (true) {
        let condition = self.condition.interpret(self.condition, frame);

        if (typeof condition !== "boolean") {
          throw Error("Invalid while condition");
        }

        if (condition === false) {
          break;
        }

        try {
          let i = 0;
          while (i < length(self.block)) {
            self.block[i].interpret(self.block[i], frame);
            i = i + 1;
          }
        } catch (e) {
          if (e === "break") {
            break;
          }
          if (e === "continue") {
            continue;
          }
        }
      }

      return undefined;
    }
  }
}

interface BreakInterplet extends AstInterplet {
  interpret(self: BreakInterplet, frame: Frame): Value;
}

let BreakInterplet = function(): BreakInterplet {
  return {
    interpret: function(self, frame): Value {
      throw "break";
    }
  }
}

interface ContinueInterplet extends AstInterplet {
  interpret(self: ContinueInterplet, frame: Frame): Value;
}

let ContinueInterplet = function(): ContinueInterplet {
  return {
    interpret: function(self, frame): Value {
      throw "continue";
    }
  }
}

interface TryInterplet extends AstInterplet {
  block: AstInterplet[];
  name: string;
  handler: AstInterplet[];
  interpret(self: TryInterplet, frame: Frame): Value;
}

let TryInterplet = function(block: AstInterplet[], name: string, handler: AstInterplet[]): TryInterplet {
  return {
    block: block,
    name: name,
    handler: handler,
    interpret: function(self, frame): Value {
      let i = 0;
      try {
        let block = self.block;
        while (i < length(block)) {
          block[i].interpret(block[i], frame);
          i = i + 1;
        }
        return undefined;
      } catch (err) {
        frame.locals = [...frame.locals, self.name];
        frame.values = [...frame.values, err];
        let handler = self.handler;
        i = 0;
        while (i < length(handler)) {
          handler[i].interpret(handler[i], frame);
          i = i + 1;
        }
        let locals = [];
        let values = [];
        i = 0;
        let index = lastIndexOf(frame.locals, self.name);
        while (i < length(frame.locals)) {
          let v = frame.locals[i];
          if (i === index) {
            i = i + 1;
            continue;
          } else {
            locals = [...locals, v];
            values = [...values, frame.values[i]];
            i = i + 1;
          }
        }
        frame.locals = locals;
        frame.values = values;
        return undefined;
      }
    }
  }
}

interface ThrowInterplet extends AstInterplet {
  err: AstInterplet;
  interpret(self: ThrowInterplet, frame: Frame): Value;
}

let ThrowInterplet = function(err: AstInterplet): ThrowInterplet {
  return {
    err: err,
    interpret: function(self, frame): Value {
      throw self.err.interpret(self.err, frame);
    }
  }
}

export let createAst = function(parsed: Node): AstInterplet {
  if (parsed.type === "LiteralNode") {
    let value = parsed.value;

    if (value.type === "Boolean") {
      return LiteralBooleanInterplet(value.value);
    } else if (value.type === "Null") {
      return LiteralNullInterplet();
    } else if (value.type === "Number") {
      return LiteralNumberInterplet(value.value);
    } else if (value.type === "String") {
      return LiteralStringInterplet(value.value);
    } else if (value.type === "Undefined") {
      return LiteralUndefinedInterplet();
    }
  } else if (parsed.type === "BinaryNode") {
    if (parsed.id === "=" && parsed.assignment) {
      let left = parsed.left;
      let right = createAst(parsed.right);
      
      if (left.type !== "Name") {
        throw Error("Invalid assignment name");
      }

      return AssignmentInterplet(left.value, right);
    } else if (parsed.id === "let" && parsed.assignment) {
      let left = parsed.left;
      let right = createAst(parsed.right);
      
      if (left.type !== "Name") {
        throw Error("Invalid assignment name");
      }

      return LetInterplet(left.value, right);
    } else if (indexOf(operators, parsed.id) > -1) {
      let left = createAst(parsed.left);
      let right = createAst(parsed.right);
      return OperatorInterplet(parsed.id, left, right);
    } else if (parsed.id === "(") {
      let left = createAst(parsed.left);
      let right = parsed.right;
      
      if (right.type !== "NodeList") {
        throw Error("Invalid function call");
      }

      let args: AstInterplet[] = [];
      let i = 0;

      while (i < length(right.children)) {
        let a = createAst(right.children[i]);
        args = [...args, a];

        i = i + 1;
      }

      return CallInterplet(left, args);
    } else if (parsed.id === '[') {
      let left = createAst(parsed.left);
      let right = createAst(parsed.right);

      return IndexInterplet(left, right);
    } else if (parsed.id === ".") {
      let left = createAst(parsed.left);
      let right = parsed.right;
    
      if (right.type !== "Name") {
        throw Error("Invalid dot access");
      }

      return DotInterplet(left, right.value);
    }
  } else if (parsed.type === "Name") {
    return NameInterplet(parsed.value);
  } else if (parsed.type === "UnaryNode") {
    if (parsed.id === "{") {
      let keys: string[] = [];
      let values: AstInterplet[] = [];
      let i = 0;
      let value = parsed.value;

      if (value.type !== "NodeList") {
        throw Error("Invalid object literal");
      }

      let children = value.children;

      while (i < length(children)) {
        let node = children[i];

        if (node.type !== "BinaryNode" || node.id !== ":") {
          throw Error("Invalid object key value pair");
        }

        let left = node.left;

        if (left.type !== "Name") {
          throw Error("Invalid object key");
        }

        keys = [...keys, left.value];
        values = [...values, createAst(node.right)];

        i = i + 1;
      }

      return LiteralObjectInterplet(keys, values);
    } else if (parsed.id === "[") {
      let values: AstInterplet[] = [];
      let i = 0;
      let value = parsed.value;

      if (value.type !== "NodeList") {
        throw Error("Invalid array literal");
      }

      let children = value.children;

      while (i < length(children)) {
        let node = children[i];
        values = [...values, createAst(node)];

        i = i + 1;
      }

      return LiteralArrayInterplet(values);
    }
  } else if (parsed.type === "FunctionNode") {
    let parameters: string[] = [];
    let body: AstInterplet[] = [];
    let i = 0;

    while (i < length(parsed.parameters.children)) {
      let node = parsed.parameters.children[i];

      if (node.type !== "Name") {
        throw Error("Invalid function parameter");
      }

      parameters = [...parameters, node.value];

      i = i + 1;
    }

    i = 0;

    while (i < length(parsed.body.children)) {
      let node = parsed.body.children[i];
      let interp = createAst(node);

      body = [...body, interp];

      i = i + 1;
    }

    return FunctionInterplet(parameters, body);
  } else if (parsed.type === "StatementNode") {
    if (parsed.id === "return") {
      return ReturnInterplet(createAst(parsed.value));
    } else if (parsed.id === "while") {
      let value = parsed.value;

      if (value.type !== "BinaryNode") {
        throw Error("Invalid while loop");
      }

      let left = createAst(value.left);
      let right = value.right;

      if (right.type !== "StatementNode") {
        throw Error("Invalid while block");
      }

      let body = right.value;

      if (body.type !== "NodeList") {
        throw Error("Invalid while body")
      }

      let i = 0;
      let block: AstInterplet[] = [];
      while (i < length(body.children)) {
        block = [...block, createAst(body.children[i])];
        i = i + 1;
      }

      return WhileInterplet(left, block);
    } else if (parsed.id === "break") {
      return BreakInterplet();
    } else if (parsed.id === "continue") {
      return ContinueInterplet();
    } else if (parsed.id === "throw") {
      let err = createAst(parsed.value);
      return ThrowInterplet(err);
    }
  } else if (parsed.type === "TernaryNode") {
    if (parsed.id === "try") {
      let first = parsed.first;
      if (first.type !== "StatementNode") {
        throw Error("Invalid try block");
      }
      first = first.value;
      if (first.type !== "NodeList") {
        throw Error("Invalid try block");
      }
      let second = parsed.second;
      if (second.type !== "Name") {
        throw Error("Invalid catch block variable name");
      }
      let third = parsed.third;
      if (third.type !== "StatementNode") {
        throw Error("Invalid catch block");
      }
      third = third.value;
      if (third.type !== "NodeList") {
        throw Error("Invalid catch block");
      }
      let block: AstInterplet[] = [];
      let i = 0;
      while (i < length(first.children)) {
        block = [...block, createAst(first.children[i])];
        i = i + 1;
      }
      let guard: AstInterplet[] = [];
      i = 0;
      while (i < length(third.children)) {
        guard = [...guard, createAst(third.children[i])];
        i = i + 1;
      }
      return TryInterplet(block, second.value, guard);
    }
  }
  console.error("Unhandled", parsed);
  throw Error("failed");
};