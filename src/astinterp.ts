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

interface ValueArray extends Array<Value> {};
interface ValueRecord extends Record<string, Value> {};

interface FunctionValue {
  parameters: string[];
  body: AstInterplet;
}

interface Context {
  globals: Record<string, Value>;
}

interface Frame {
  caller: Frame;
  function: FunctionValue;
  locals: Record<string, Value>;
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
      let result: Value = [];
      let i = 0;
      while (i < length(self.expressions)) {
        let expr = self.expressions[i];
        let value = expr.interpret(expr, context, frame);
        result = [...result, value];
      }
      return result;
    }
  };
}

interface LiteralObjectInterplet extends AstInterplet {
  keys: Array<AstInterplet>;
  values: Array<AstInterplet>;
  interpret(self: LiteralObjectInterplet, context: Context, frame: Frame): Value;
}

let LiteralObjectInterplet = function(keys: Array<AstInterplet>, values: Array<AstInterplet>): LiteralObjectInterplet {
  return {
    keys: keys,
    values: values,
    interpret: function(self, context, frame) {
      let result: Value = {};
      let i = 0;
      while (i < length(self.keys)) {
        let key = self.keys[i].interpret(self.keys[i], context, frame);
        let value = self.values[i].interpret(self.values[i], context, frame);
        if (typeof key !== "string") {
          throw Error("Invalid object key");
        }
        result = {
          [key]: value,
          ...result
        };
      }
      return result;
    }
  };
}

interface AssignmentInterplet extends AstInterplet {
  name: AstInterplet;
  value: AstInterplet;
  interpret(self: AssignmentInterplet, context: Context, frame: Frame): Value;
}

let AssignmentInterplet = function(name: AstInterplet, value: AstInterplet): AssignmentInterplet {
  return {
    name: name,
    value: value,
    interpret: function(self, context, frame) {
      let n = self.name.interpret(self.name, context, frame);

      if (typeof n !== "string") {
        throw Error("Invalid variable name");
      }

      let v = self.value.interpret(self.value, context, frame);

      if (frame === null) {
        context.globals = {
          ...context.globals,
          [n]: v
        }
      } else {
        frame.locals = {
          ...frame.locals,
          [n]: v
        };
      }

      return v;
    }
  }
}

interface NameInterplet extends AstInterplet {
  name: Value;
  interpret(self: NameInterplet, context: Context, frame: Frame): Value;
}

let NameInterplet = function(name: string): NameInterplet {
  return {
    name: name,
    interpret: function(self) {
      return self.name;
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
    let left = createAst(parsed.left);
    let right = createAst(parsed.right);
    if (parsed.id === "=" && parsed.assignment) {
      return AssignmentInterplet(left, right);
    } else if (indexOf(operators, parsed.id) > -1) {
      return OperatorInterplet(parsed.id, left, right);
    }
  } else if (parsed.type === "Name") {
    return NameInterplet(parsed.value);
  }
  console.log("Unhandled", parsed);
};