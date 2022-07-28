import { Node } from "./parser";
import { length, indexOf, parseFloat, isFinite} from "./util";

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
};

interface ValueRecord {
  type: "object";
  values: Record<string, Value>;
};

interface FunctionValue {
  type: "function",
  parameters: string[];
  body: AstInterplet[];
}

export interface Context {
  globals: Record<string, Value>;
}

export interface Frame {
  caller: Frame;
  locals: Record<string, Value>;
  ret: Value;
}

interface AstInterplet {
  interpret(self: AstInterplet, context: Context, frame: Frame | null): Value;
}

interface LiteralStringInterplet extends AstInterplet {
  value: string;
  interpret(self: LiteralStringInterplet, context: Context, frame: Frame): Value;
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
  interpret(self: LiteralNumberInterplet, context: Context, frame: Frame): Value;
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
  interpret(self: LiteralBooleanInterplet, context: Context, frame: Frame): Value;
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
  interpret(self: LiteralNullInterplet, context: Context, frame: Frame): Value;
}

let LiteralNullInterplet = function(): LiteralNullInterplet {
  return {
    interpret: function(self) {
      return null;
    }
  };
}

interface LiteralUndefinedInterplet extends AstInterplet {
  interpret(self: LiteralUndefinedInterplet, context: Context, frame: Frame): Value;
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
  interpret(self: LiteralArrayInterplet, context: Context, frame: Frame): Value;
}

let LiteralArrayInterplet = function(v: Array<AstInterplet>): LiteralArrayInterplet {
  return {
    expressions: v,
    interpret: function(self, context, frame) {
      let result: Value[] = [];
      let i = 0;
      while (i < length(self.expressions)) {
        let expr = self.expressions[i];
        let value = expr.interpret(expr, context, frame);
        result = [...result, value];
        i = i + 1;
      }
      return {
        type: "array",
        values: result
      };
    }
  };
}

interface LiteralObjectInterplet extends AstInterplet {
  keys: Array<string>;
  values: Array<AstInterplet>;
  interpret(self: LiteralObjectInterplet, context: Context, frame: Frame): Value;
}

let LiteralObjectInterplet = function(keys: Array<string>, values: Array<AstInterplet>): LiteralObjectInterplet {
  return {
    keys: keys,
    values: values,
    interpret: function(self, context, frame) {
      let result: Record<string, Value> = {};
      let i = 0;
      while (i < length(self.keys)) {
        let key = self.keys[i];
        let value = self.values[i].interpret(self.values[i], context, frame);
        if (typeof key !== "string") {
          throw Error("Invalid object key");
        }
        result = {
          [key]: value,
          ...result
        };
        i = i + 1;
      }
      return {
        type: "object",
        values: result
      };
    }
  };
}

interface AssignmentInterplet extends AstInterplet {
  name: string;
  value: AstInterplet;
  interpret(self: AssignmentInterplet, context: Context, frame: Frame): Value;
}

let AssignmentInterplet = function(name: string, value: AstInterplet): AssignmentInterplet {
  return {
    name: name,
    value: value,
    interpret: function(self, context, frame) {
      let v = self.value.interpret(self.value, context, frame);

      if (frame === null) {
        context.globals = {
          ...context.globals,
          [self.name]: v
        }
      } else {
        frame.locals = {
          ...frame.locals,
          [self.name]: v
        };
      }

      return v;
    }
  }
}

interface NameInterplet extends AstInterplet {
  name: string;
  interpret(self: NameInterplet, context: Context, frame: Frame): Value;
}

let NameInterplet = function(name: string): NameInterplet {
  return {
    name: name,
    interpret: function(self, context, frame) {
      if (frame !== null && frame.locals[self.name] !== undefined) {
        return frame.locals[self.name];
      }

      if (context.globals[self.name] !== undefined) {
        return context.globals[self.name];
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
  interpret(self: OperatorInterplet, context: Context, frame: Frame): Value;
}

let OperatorInterplet = function(operator: string, left: AstInterplet, right: AstInterplet): OperatorInterplet {
  return {
    operator: operator,
    left: left,
    right: right,
    interpret: function(self, context, frame) {
      let left = self.left.interpret(self.left, context, frame);
      let right = self.right.interpret(self.right, context, frame);

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
  interpret(self: FunctionInterplet, context: Context, frame: Frame): Value;
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
  interpret(self: ReturnInterplet, context: Context, frame: Frame): Value;
}

let ReturnInterplet = function(value: AstInterplet): ReturnInterplet {
  return {
    value: value,
    interpret: function(self, context, frame): Value {
      frame.ret = value.interpret(value, context, frame);
      return frame.ret;
    }
  }
}

interface CallInterplet extends AstInterplet {
  func: AstInterplet,
  args: AstInterplet[],
  interpret(self: CallInterplet, context: Context, frame: Frame): Value;
}

let CallInterplet = function(func: AstInterplet, args: AstInterplet[]): CallInterplet {
  return {
    func: func,
    args: args,
    interpret: function(self, context, frame): Value {
      let f = self.func.interpret(self.func, context, frame);

      if (typeof f !== "object" || f.type !== "function") {
        throw Error("Attempt to call non-function");
      }

      let locals: Record<string, Value> = {};
      let i = 0;

      while (i < length(self.args)) {
        let a = self.args[i];
        locals = {
          ...locals,
          [f.parameters[i]]: a.interpret(a, context, frame)
        }
        
        i = i + 1;
      }

      let stack: Frame = {
        caller: frame,
        locals: locals,
        ret: undefined
      }

      i = 0;

      while (i < length(f.body)) {
        let s = f.body[i];
        s.interpret(s, context, stack);

        i = i + 1;
      }

      return stack.ret;
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
    }
  }
  console.log("Unhandled", parsed);
};