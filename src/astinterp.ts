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
  | FunctionValue
  | SpreadMarker;

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
  type: "function";
  parameters: string[];
  body: AstInterplet[];
}

interface SpreadMarker {
  type: "spread";
  value: ValueArray | ValueRecord;
}

export interface Frame {
  locals: string[];
  values: Value[];
  ret: Value;
  globals: Frame | null;
  finished: boolean;
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
      let l = length(self.expressions)
      while (i < l) {
        let expr = self.expressions[i];
        let value = expr.interpret(expr, frame);
        if (value !== null && typeof value === "object" && value.type === "spread") {
          let spread = value.value;
          if (spread.type === "array") {
            result = [...result, ...spread.values];
          } else {
            throw Error("Cannot spread an object into an array");
          }
        } else {
          result = [...result, value];
        }
        i = i + 1;
      }
      return {
        type: "array",
        values: result,
        length: length(result)
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
      let l = length(self.keys);
      while (i < l) {
        let key = self.keys[i];
        let value = self.values[i].interpret(self.values[i], frame);
        if (typeof key !== "string") {
          throw Error("Invalid object key");
        }
        if (value !== null && typeof value === "object" && value.type === "spread") {
          let spread = value.value;
          if (spread.type === "object") {
            keys = [...keys, ...spread.keys];
            values = [...values, ...spread.values];
          } else {
            throw Error("Only objects can be spread into objects");
          }
        } else {
          keys = [...keys, key];
          values = [...values, value];
        }
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

interface ObjectAssignmentInterplet extends AstInterplet {
  target: AstInterplet;
  name: string;
  value: AstInterplet;
  interpret(self: ObjectAssignmentInterplet, frame: Frame): Value;
}

let ObjectAssignmentInterplet = function(target: AstInterplet, name: string, value: AstInterplet): ObjectAssignmentInterplet {
  return {
    target: target,
    name: name,
    value: value,
    interpret: function(self, frame) {
      let v = self.value.interpret(self.value, frame);
      let target = self.target.interpret(self.target, frame);

      if (target === null || typeof target !== "object" || target.type !== "object") {
        throw Error("Can only assign to objects");
      }

      let index = lastIndexOf(target.keys, self.name);
      if (index === -1) {
        throw Error("Assignment to missing key");
      }
      target.values[index] = v;

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

      let globals = frame.globals;

      if (globals !== null) {
        index = lastIndexOf(globals.locals, self.name);
      }

      if (index >= 0) {
        return globals.values[index];
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
      frame.ret = self.value.interpret(self.value, frame);
      frame.finished = true;
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
      let argI = length(self.args);
      let l = length(f.parameters);

      while (i < l) {
        if (i >= argI) {
          locals = [...locals, f.parameters[i]];
          values = [...values, undefined]; 
        } else {
          let a = self.args[i];
          locals = [...locals, f.parameters[i]];
          values = [...values, a.interpret(a, frame)];
        }
        i = i + 1;
      }

      let stack: Frame = {
        locals: locals,
        values: values,
        ret: undefined,
        globals: frame.globals === null ? frame : frame.globals,
        finished: false
      }

      i = 0;
      l = length(f.body);
      while (i < l) {
        let s = f.body[i];
        s.interpret(s, stack);

        if (stack.finished) {
          break;
        }

        i = i + 1;
      }

      return stack.ret;
    }
  }
}

interface MethodCallInterplet extends AstInterplet {
  obj: AstInterplet,
  func: string,
  args: AstInterplet[],
  interpret(self: MethodCallInterplet, frame: Frame): Value;
}

let MethodCallInterplet = function(obj: AstInterplet, func: string, args: AstInterplet[]): MethodCallInterplet {
  return {
    obj: obj,
    func: func,
    args: args,
    interpret: function(self, frame): Value {
      let obj = self.obj.interpret(self.obj, frame);
      
      if (obj === null || typeof obj !== "object" || obj.type !== "object") {
        throw Error("Method calls are only allowed on objects")
      }

      let f = obj.values[indexOf(obj.keys, self.func)];

      if (typeof f !== "object" || f.type !== "function") {
        throw Error("Attempt to call non-function");
      }

      let i = 0;
      let locals: string[] = [];
      let values: Value[] = [];
      let argI = length(self.args);
      let l = length(f.parameters);

      while (i < l) {
        if (i >= argI) {
          locals = [...locals, f.parameters[i]];
          values = [...values, undefined]; 
        } else {
          let a = self.args[i];
          locals = [...locals, f.parameters[i]];
          values = [...values, a.interpret(a, frame)];
        }
        i = i + 1;
      }

      let stack: Frame = {
        locals: locals,
        values: values,
        ret: undefined,
        globals: frame.globals === null ? frame : frame.globals,
        finished: false
      }

      i = 0;
      l = length(f.body);

      while (i < l) {
        let s = f.body[i];
        s.interpret(s, stack);

        if (stack.finished) {
          break;
        }

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
          if (index >= length(target.values)) {
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
          let l = length(self.block);
          while (i < l) {
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
          throw e;
        }
      }

      return frame.ret;
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
      let l = 0;
      try {
        let block = self.block;
        l = length(block);
        while (i < l) {
          block[i].interpret(block[i], frame);
          i = i + 1;
        }
        return frame.ret;
      } catch (err) {
        frame.locals = [...frame.locals, self.name];
        frame.values = [...frame.values, err];
        let handler = self.handler;
        i = 0;
        l = length(handler);
        while (i < l) {
          handler[i].interpret(handler[i], frame);
          i = i + 1;
        }
        let locals = [];
        let values = [];
        i = 0;
        l = length(frame.locals);
        let index = lastIndexOf(frame.locals, self.name);
        while (i < l) {
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
        return frame.ret;
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

interface IfInterplet extends AstInterplet {
  condition: AstInterplet;
  ifTrue: AstInterplet[];
  ifFalse: AstInterplet[];
  interpret(self: IfInterplet, frame: Frame): Value;
}

let IfInterplet = function(condition: AstInterplet, ifTrue: AstInterplet[], ifFalse: AstInterplet[]): IfInterplet {
  return {
    condition: condition,
    ifTrue: ifTrue,
    ifFalse: ifFalse,
    interpret: function(self, frame): Value {
      let condition = self.condition.interpret(self.condition, frame);
      if (typeof condition !== "boolean") {
        throw Error("Invalid if condition: must be boolean");
      }
      let block = self.ifFalse;
      if (condition) {
        block = self.ifTrue;
      }
      let i = 0;
      let l = length(block);
      while (i < l) {
        let n = block[i];
        n.interpret(n, frame);
        i = i + 1;
      }
      return frame.ret;
    }
  }
}

interface TernaryIfInterplet extends AstInterplet {
  condition: AstInterplet;
  ifTrue: AstInterplet;
  ifFalse: AstInterplet;
  interpret(self: TernaryIfInterplet, frame: Frame): Value;
}

let TernaryIfInterplet = function(condition: AstInterplet, ifTrue: AstInterplet, ifFalse: AstInterplet): TernaryIfInterplet {
  return {
    condition: condition,
    ifTrue: ifTrue,
    ifFalse: ifFalse,
    interpret: function(self, frame): Value {
      let condition = self.condition.interpret(self.condition, frame);
      if (typeof condition !== "boolean") {
        throw Error("Invalid if condition: must be boolean");
      }
      let expr = self.ifFalse;
      if (condition) {
        expr = self.ifTrue;
      }
      return expr.interpret(expr, frame);
    }
  }
}

interface NegativeInterplet extends AstInterplet {
  value: AstInterplet;
  interpret(self: NegativeInterplet, frame: Frame): Value;
}

let NegativeInterplet = function(value: AstInterplet): NegativeInterplet {
  return {
    value: value,
    interpret: function(self, frame): Value {
      let result = self.value.interpret(self.value, frame);
      if (typeof result !== "number") {
        throw Error("Invalid negative value: must be a number");
      }
      return -result;
    }
  }
}

interface TypeofInterplet extends AstInterplet {
  value: AstInterplet;
  interpret(self: TypeofInterplet, frame: Frame): Value;
}

let TypeofInterplet = function(value: AstInterplet): TypeofInterplet {
  return {
    value: value,
    interpret: function(self, frame): Value {
      let result = self.value.interpret(self.value, frame);
      if (typeof result === "object" && result.type === "function") {
        return "function";
      } else {
        return typeof result;
      }
    }
  }
}

interface SpreadInterplet extends AstInterplet {
  value: AstInterplet;
  interpret(self: SpreadInterplet, frame: Frame): Value;
}

let SpreadInterplet = function(value: AstInterplet): SpreadInterplet {
  return {
    value: value,
    interpret: function(self, frame): Value {
      let target = self.value.interpret(self.value, frame);
      if (typeof target !== "object" || (target.type !== "array" && target.type !== "object")) {
        throw Error("Can only spread objects and arrays");
      }
      return {
        type: "spread",
        value: target
      }
    }
  }
}

export let createInterp = function(parsed: Node): AstInterplet {
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
      let right = parsed.right;
      
      if (left.type !== "Name") {
        if (left.type !== "BinaryNode") {
          throw Error("Invalid assignment");
        }
        let name = left.right;
        if (name.type !== "Name") {
          throw Error("Invalid assignment");
        }
        let target = left.left;
        
        return ObjectAssignmentInterplet(createInterp(target), name.value, createInterp(right));
      }

      return AssignmentInterplet(left.value, createInterp(right));
    } else if (parsed.id === "let" && parsed.assignment) {
      let left = parsed.left;
      let right = createInterp(parsed.right);
      
      if (left.type !== "Name") {
        throw Error("Invalid assignment name");
      }

      return LetInterplet(left.value, right);
    } else if (indexOf(operators, parsed.id) > -1) {
      let left = createInterp(parsed.left);
      let right = createInterp(parsed.right);
      return OperatorInterplet(parsed.id, left, right);
    } else if (parsed.id === "(") {
      let left = createInterp(parsed.left);
      let right = parsed.right;
      
      if (right.type !== "NodeList") {
        throw Error("Invalid function call");
      }

      let args: AstInterplet[] = [];
      let i = 0;
      let l = length(right.children);

      while (i < l) {
        let a = createInterp(right.children[i]);
        args = [...args, a];

        i = i + 1;
      }

      return CallInterplet(left, args);
    } else if (parsed.id === '[') {
      let left = createInterp(parsed.left);
      let right = createInterp(parsed.right);

      return IndexInterplet(left, right);
    } else if (parsed.id === ".") {
      let left = createInterp(parsed.left);
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
      let l = length(children);

      while (i < l) {
        let node = children[i];

        if (node.id === "..." && node.type === "UnaryNode") {
          keys = [...keys, ""];
          values = [...values, createInterp(node)];
          i = i + 1;
          continue
        }

        if (node.type !== "BinaryNode" || node.id !== ":") {
          throw Error("Invalid object key value pair");
        }

        let left = node.left;

        if (left.type !== "Name") {
          throw Error("Invalid object key");
        }

        keys = [...keys, left.value];
        values = [...values, createInterp(node.right)];

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
      let l = length(children);

      while (i < l) {
        let node = children[i];
        values = [...values, createInterp(node)];

        i = i + 1;
      }

      return LiteralArrayInterplet(values);
    } else if (parsed.id === "-") {
      let value = createInterp(parsed.value);
      return NegativeInterplet(value);
    } else if (parsed.id === "typeof") {
      let value = createInterp(parsed.value);
      return TypeofInterplet(value);
    } else if (parsed.id === "...") {
      let value = createInterp(parsed.value);
      return SpreadInterplet(value);
    }
  } else if (parsed.type === "FunctionNode") {
    let parameters: string[] = [];
    let body: AstInterplet[] = [];
    let i = 0;
    let l = length(parsed.parameters.children);

    while (i < l) {
      let node = parsed.parameters.children[i];

      if (node.type !== "Name") {
        throw Error("Invalid function parameter");
      }

      parameters = [...parameters, node.value];

      i = i + 1;
    }

    i = 0;
    l = length(parsed.body.children);

    while (i < l) {
      let node = parsed.body.children[i];
      let interp = createInterp(node);

      body = [...body, interp];

      i = i + 1;
    }

    return FunctionInterplet(parameters, body);
  } else if (parsed.type === "StatementNode") {
    if (parsed.id === "return") {
      return ReturnInterplet(createInterp(parsed.value));
    } else if (parsed.id === "while") {
      let value = parsed.value;

      if (value.type !== "BinaryNode") {
        throw Error("Invalid while loop");
      }

      let left = createInterp(value.left);
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
      let l = length(body.children);
      while (i < l) {
        block = [...block, createInterp(body.children[i])];
        i = i + 1;
      }

      return WhileInterplet(left, block);
    } else if (parsed.id === "break") {
      return BreakInterplet();
    } else if (parsed.id === "continue") {
      return ContinueInterplet();
    } else if (parsed.id === "throw") {
      let err = createInterp(parsed.value);
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
      let l = length(first.children);
      while (i < l) {
        block = [...block, createInterp(first.children[i])];
        i = i + 1;
      }
      let guard: AstInterplet[] = [];
      i = 0;
      l = length(third.children);
      while (i < l) {
        guard = [...guard, createInterp(third.children[i])];
        i = i + 1;
      }
      return TryInterplet(block, second.value, guard);
    } else if (parsed.id === "if") {
      let expr = createInterp(parsed.first);
      let ifTrue = parsed.second;
      if (ifTrue.type !== "StatementNode") {
        throw Error("Invalid if true block");
      }
      ifTrue = ifTrue.value;
      if (ifTrue.type !== "NodeList") {
        throw Error("Invalid if true block");
      }
      let trueBlock = [];
      let i = 0;
      let l = length(ifTrue.children);
      while (i < l) {
        trueBlock = [...trueBlock, createInterp(ifTrue.children[i])];
        i = i + 1;
      }
      let ifFalse = parsed.third;
      if (ifFalse.id === "if") {
        return IfInterplet(expr, trueBlock, [createInterp(ifFalse)]);
      }
      if (ifFalse.type !== "StatementNode") {
        throw Error("Invalid if false block");
      }
      ifFalse = ifFalse.value;
      if (ifFalse.type !== "NodeList") {
        throw Error("Invalid if false block");
      }
      let falseBlock = [];
      i = 0;
      l = length(ifFalse.children);
      while (i < l) {
        falseBlock = [...falseBlock, createInterp(ifFalse.children[i])];
        i = i + 1;
      }

      return IfInterplet(expr, trueBlock, falseBlock);
    } else if (parsed.id === "(") {
      let first = createInterp(parsed.first);
      let second = parsed.second;

      if (second.type !== "Name") {
        throw Error("Invalid method name");
      }

      let third = parsed.third;
      
      if (third.type !== "NodeList") {
        throw Error("Invalid function call");
      }

      let args: AstInterplet[] = [];
      let i = 0;
      let l = length(third.children);

      while (i < l) {
        let a = createInterp(third.children[i]);
        args = [...args, a];

        i = i + 1;
      }

      return MethodCallInterplet(first, second.value, args);
    } else if (parsed.id === "?") {
      let condition = createInterp(parsed.first);
      let ifTrue = createInterp(parsed.second);
      let ifFalse = createInterp(parsed.third);

      return TernaryIfInterplet(condition, ifTrue, ifFalse);
    }
  }
  console.error("Unhandled", parsed);
  throw Error("failed");
};

export default createInterp;