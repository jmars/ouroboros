import { Node } from "./parser.js";
import { length, indexOf, lastIndexOf } from "./util-native.js";

type Value
  = string
  | number
  | boolean
  | null
  | undefined
  | ArrayValue
  | RecordValue
  | FunctionValue
  | SpreadMarker
  | NativeFunction
  | ErrorValue

interface ArrayValue {
  type: "array";
  values: Value[];
  length: number;
};

interface RecordValue {
  type: "object";
  values: Value[];
  keys: string[];
};

interface FunctionValue {
  type: "function";
  parameters: string[];
  body: AstInterplet[];
}

export interface ErrorValue {
  type: "error";
  message: string;
}

export interface NativeFunction {
  type: "nativefunction";
  body: Function;
  parameters: string[];
}

interface SpreadMarker {
  type: "spread";
  value: ArrayValue | RecordValue;
}

export interface Scope {
  locals: string[];
  values: Value[];
  errorHandler: Array<AstInterplet[]>;
  parent: Scope | null;
  frame: Frame;
}

export interface Frame {
  parent: Frame | null;
}

interface AstInterplet {
  interpret(self: AstInterplet, scope: Scope): Value;
}

interface LiteralStringInterplet extends AstInterplet {
  value: string;
  interpret(self: LiteralStringInterplet, scope: Scope): Value;
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
  interpret(self: LiteralNumberInterplet, scope: Scope): Value;
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
  interpret(self: LiteralBooleanInterplet, scope: Scope): Value;
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
  interpret(self: LiteralNullInterplet, scope: Scope): Value;
}

let LiteralNullInterplet = function(): LiteralNullInterplet {
  return {
    interpret: function(self) {
      return null;
    }
  };
}

interface LiteralUndefinedInterplet extends AstInterplet {
  interpret(self: LiteralUndefinedInterplet, scope: Scope): Value;
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
  interpret(self: LiteralArrayInterplet, scope: Scope): Value;
}

let LiteralArrayInterplet = function(v: Array<AstInterplet>): LiteralArrayInterplet {
  return {
    expressions: v,
    interpret: function(self, scope) {
      let result: Value[] = [];
      let i = 0;
      let l = length(self.expressions)
      while (i < l) {
        let expr = self.expressions[i];
        let value = expr.interpret(expr, scope);
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
  interpret(self: LiteralObjectInterplet, scope: Scope): Value;
}

let LiteralObjectInterplet = function(keys: Array<string>, values: Array<AstInterplet>): LiteralObjectInterplet {
  return {
    keys: keys,
    values: values,
    interpret: function(self, scope) {
      let keys: string[] = [];
      let values: Value[] = [];
      let i = 0;
      let l = length(self.keys);
      while (i < l) {
        let key = self.keys[i];
        let value = self.values[i].interpret(self.values[i], scope);
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
  interpret(self: AssignmentInterplet, scope: Scope): Value;
}

let AssignmentInterplet = function(name: string, value: AstInterplet): AssignmentInterplet {
  return {
    name: name,
    value: value,
    interpret: function(self, scope) {
      let v = self.value.interpret(self.value, scope);
      let current = scope;
      let index = -1;

      while (current !== null) {
        index = lastIndexOf(current.locals, self.name);
        if (index !== -1) {
          break;
        }

        if (current.parent === null) {
          throw Error("Assignment to undeclared variable");
        }

        current = current.parent;
      }

      current.values[index] = v;

      return v;
    }
  }
}

interface ObjectAssignmentInterplet extends AstInterplet {
  target: AstInterplet;
  name: string;
  value: AstInterplet;
  interpret(self: ObjectAssignmentInterplet, scope: Scope): Value;
}

let ObjectAssignmentInterplet = function(target: AstInterplet, name: string, value: AstInterplet): ObjectAssignmentInterplet {
  return {
    target: target,
    name: name,
    value: value,
    interpret: function(self, scope) {
      let v = self.value.interpret(self.value, scope);
      let target = self.target.interpret(self.target, scope);

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
  interpret(self: LetInterplet, scope: Scope): Value;
}

let LetInterplet = function(name: string, value: AstInterplet): LetInterplet {
  return {
    name: name,
    value: value,
    interpret: function(self, scope) {
      let v = self.value.interpret(self.value, scope);
      let exists = indexOf(scope.locals, self.name);

      if (exists >= 0) {
        throw Error("Cannot redeclare let-scoped variable: " + self.name);
      }

      scope.locals = [...scope.locals, self.name];
      scope.values = [...scope.values, v];

      return v;
    }
  }
}

interface NameInterplet extends AstInterplet {
  name: string;
  interpret(self: NameInterplet, scope: Scope): Value;
}

let NameInterplet = function(name: string): NameInterplet {
  return {
    name: name,
    interpret: function(self, scope) {
      let current = scope;

      while (current !== null) {
        let index = lastIndexOf(current.locals, self.name);

        if (index >= 0) {
          return current.values[index];
        }

        if (current.parent === null) {
          throw Error("Attempt to access undeclared variable");
        }

        current = current.parent;
      }
    }
  }
}

let operators = ["+", "-", "/", "*", "**", ">", ">=", "<", "<=", "&&", "||", "===", "!=="];

interface OperatorInterplet extends AstInterplet {
  operator: string,
  left: AstInterplet,
  right: AstInterplet,
  interpret(self: OperatorInterplet, scope: Scope): Value;
}

let OperatorInterplet = function(operator: string, left: AstInterplet, right: AstInterplet): OperatorInterplet {
  return {
    operator: operator,
    left: left,
    right: right,
    interpret: function(self, scope) {
      let left = self.left.interpret(self.left, scope);

      if (self.operator === "&&" || self.operator === "||") {
        if (typeof left !== "boolean") {
          throw Error("&& or || values must be boolean");
        }

        if (self.operator === "&&") {
          if (left === true) {
            let r = self.right.interpret(self.right, scope);
            if (typeof r !== "boolean") {
              throw Error("&& or || values must be boolean");
            }
            return r;
          }
          return false;
        } else {
          if (left === true) {
            return true;
          }
          let r = self.right.interpret(self.right, scope);
          if (typeof r !== "boolean") {
            throw Error("&& or || values must be boolean");
          }
          return r;
        }
      }

      let right = self.right.interpret(self.right, scope);
      
      if (self.operator === "===") {
        return left === right;
      } else if (self.operator === "!==") {
        return left !== right;
      } else {
        if (typeof left === "string" && typeof right === "string" && self.operator === "+") {
          return left + right;
        }

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
  interpret(self: FunctionInterplet, scope: Scope): Value;
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
  interpret(self: ReturnInterplet, scope: Scope): Value;
}

let ReturnInterplet = function(value: AstInterplet): ReturnInterplet {
  return {
    value: value,
    interpret: function(self, scope): Value {
      let ret = self.value.interpret(self.value, scope);
      throw {
        type: 'return',
        value: ret
      }
    }
  }
}

interface CallInterplet extends AstInterplet {
  func: AstInterplet,
  args: AstInterplet[],
  interpret(self: CallInterplet, scope: Scope): Value;
}

let CallInterplet = function(func: AstInterplet, args: AstInterplet[]): CallInterplet {
  return {
    func: func,
    args: args,
    interpret: function(self, scope): Value {
      let f = self.func.interpret(self.func, scope);

      if (f === null || typeof f !== "object" || f.type !== "function" && f.type !== "nativefunction") {
        throw Error("Attempt to call non-function");
      }

      let i = 0;
      let locals: string[] = [];
      let values: Value[] = [];
      let argI = length(self.args);
      let l = length(f.parameters);

      while (i < l) {
        if (i >= argI) {
          throw Error("Not enough arguments")
        }
        let a = self.args[i];
        locals = [...locals, f.parameters[i]];
        values = [...values, a.interpret(a, scope)];
        i = i + 1;
      }
      
      if (f.type === "nativefunction") {
        return f.body(values[0]);
      }

      let frame: Frame = {
        parent: scope.frame
      }

      let stack: Scope = {
        locals: locals,
        values: values,
        frame: frame,
        errorHandler: [],
        parent: scope
      }

      i = 0;
      l = length(f.body);
      while (i < l) {
        let s = f.body[i];
        try {
          s.interpret(s, stack);
        } catch (err: any) {
          // TODO: interpreter catching host errors, attach handlers to stack frames and use non-native throw
          // TODO: object space for typeof and others
          if (typeof err === "object" && err.type === "return") {
            return err.value;
          }
          throw err;
        }

        i = i + 1;
      }

      return undefined;
    }
  }
}

interface MethodCallInterplet extends AstInterplet {
  obj: AstInterplet,
  func: string,
  args: AstInterplet[],
  interpret(self: MethodCallInterplet, scope: Scope): Value;
}

let MethodCallInterplet = function(obj: AstInterplet, func: string, args: AstInterplet[]): MethodCallInterplet {
  return {
    obj: obj,
    func: func,
    args: args,
    interpret: function(self, scope): Value {
      let obj = self.obj.interpret(self.obj, scope);
      
      if (obj === null || typeof obj !== "object" || obj.type !== "object") {
        throw Error("Method calls are only allowed on objects")
      }

      let f = obj.values[indexOf(obj.keys, self.func)];

      if (f === null || typeof f !== "object" || f.type !== "function") {
        throw Error("Attempt to call non-function");
      }

      let i = 0;
      let locals: string[] = [];
      let values: Value[] = [];
      let argI = length(self.args);
      let l = length(f.parameters);

      while (i < l) {
        if (i >= argI) {
          throw Error("Not enough arguments")
        }
        let a = self.args[i];
        locals = [...locals, f.parameters[i]];
        values = [...values, a.interpret(a, scope)];
        i = i + 1;
      }

      let frame: Frame = {
        parent: scope.frame
      }

      let stack: Scope = {
        locals: locals,
        values: values,
        parent: scope,
        errorHandler: [],
        frame: frame
      }

      i = 0;
      l = length(f.body);

      while (i < l) {
        let s = f.body[i];
        try {
          s.interpret(s, stack);
        } catch (err: any) {
          if (typeof err === "object" && err.type === "return") {
            return err.value;
          }
          throw err;
        }

        i = i + 1;
      }

      return undefined;
    }
  }
}

interface IndexInterplet extends AstInterplet {
  target: AstInterplet;
  index: AstInterplet;
  interpret(self: IndexInterplet, scope: Scope): Value;
}

let IndexInterplet = function(target: AstInterplet, index: AstInterplet): IndexInterplet {
  return {
    target: target,
    index: index,
    interpret: function(self, scope): Value {
      let target = self.target.interpret(self.target, scope);
      let index = self.index.interpret(self.index, scope);

      if (target !== null && typeof target === "object") {
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
      } else if (typeof target === "string" && typeof index === "number") {
        if (index >= length(target)) {
          throw Error("Out of bounds index");
        } else {
          return target[index];
        }
      }
    }
  }
}

interface DotInterplet extends AstInterplet {
  target: AstInterplet;
  key: string;
  interpret(self: DotInterplet, scope: Scope): Value;
}

let DotInterplet = function(target: AstInterplet, key: string): DotInterplet {
  return {
    target: target,
    key: key,
    interpret: function(self, scope): Value {
      let target = self.target.interpret(self.target, scope);

      if (target === null || typeof target !== "object" || target.type !== "object") {
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
  interpret(self: WhileInterplet, scope: Scope): Value;
}

let WhileInterplet = function(condition: AstInterplet, block: AstInterplet[]): WhileInterplet {
  return {
    condition: condition,
    block: block,
    interpret: function(self, scope): Value {
      while (true) {
        let stack: Scope = {
          locals: [],
          values: [],
          parent: scope,
          errorHandler: [],
          frame: scope.frame
        };

        let condition = self.condition.interpret(self.condition, scope);

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
            self.block[i].interpret(self.block[i], stack);
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
    
      return undefined;
    }
  }
}

interface BreakInterplet extends AstInterplet {
  interpret(self: BreakInterplet, scope: Scope): Value;
}

let BreakInterplet = function(): BreakInterplet {
  return {
    interpret: function(self, scope): Value {
      throw "break";
    }
  }
}

interface ContinueInterplet extends AstInterplet {
  interpret(self: ContinueInterplet, scope: Scope): Value;
}

let ContinueInterplet = function(): ContinueInterplet {
  return {
    interpret: function(self, scope): Value {
      throw "continue";
    }
  }
}

interface TryInterplet extends AstInterplet {
  block: AstInterplet[];
  name: string;
  handler: AstInterplet[];
  interpret(self: TryInterplet, scope: Scope): Value;
}

let TryInterplet = function(block: AstInterplet[], name: string, handler: AstInterplet[]): TryInterplet {
  return {
    block: block,
    name: name,
    handler: handler,
    interpret: function(self, scope): Value {
      let i = 0;
      let l = 0;

      try {
        let block = self.block;
        l = length(block);
        let stack: Scope = {
          locals: [],
          values: [],
          parent: scope,
          frame: scope.frame,
          errorHandler: []
        }
        while (i < l) {
          block[i].interpret(block[i], stack);
          i = i + 1;
        }
        return undefined;
      } catch (err) {
        let stack: Scope = {
          locals: [self.name],
          values: [err as ErrorValue],
          parent: scope,
          errorHandler: [],
          frame: scope.frame
        }
        let handler = self.handler;
        i = 0;
        l = length(handler);
        while (i < l) {
          handler[i].interpret(handler[i], stack);
          i = i + 1;
        }

        return undefined;
      }
    }
  }
}

interface ThrowInterplet extends AstInterplet {
  err: AstInterplet;
  interpret(self: ThrowInterplet, scope: Scope): Value;
}

let ThrowInterplet = function(err: AstInterplet): ThrowInterplet {
  return {
    err: err,
    interpret: function(self, scope): Value {
      throw self.err.interpret(self.err, scope);
    }
  }
}

interface IfInterplet extends AstInterplet {
  condition: AstInterplet;
  ifTrue: AstInterplet[];
  ifFalse: AstInterplet[];
  interpret(self: IfInterplet, scope: Scope): Value;
}

let IfInterplet = function(condition: AstInterplet, ifTrue: AstInterplet[], ifFalse: AstInterplet[]): IfInterplet {
  return {
    condition: condition,
    ifTrue: ifTrue,
    ifFalse: ifFalse,
    interpret: function(self, scope): Value {
      let condition = self.condition.interpret(self.condition, scope);
      if (typeof condition !== "boolean") {
        throw Error("Invalid if condition: must be boolean");
      }
      let block = self.ifFalse;
      if (condition) {
        block = self.ifTrue;
      }
      let i = 0;
      let l = length(block);
      let stack: Scope = {
        locals: [],
        values: [],
        parent: scope,
        errorHandler: [],
        frame: scope.frame
      }
      while (i < l) {
        let n = block[i];
        n.interpret(n, stack);
        i = i + 1;
      }
      return undefined;
    }
  }
}

interface TernaryIfInterplet extends AstInterplet {
  condition: AstInterplet;
  ifTrue: AstInterplet;
  ifFalse: AstInterplet;
  interpret(self: TernaryIfInterplet, scope: Scope): Value;
}

let TernaryIfInterplet = function(condition: AstInterplet, ifTrue: AstInterplet, ifFalse: AstInterplet): TernaryIfInterplet {
  return {
    condition: condition,
    ifTrue: ifTrue,
    ifFalse: ifFalse,
    interpret: function(self, scope): Value {
      let condition = self.condition.interpret(self.condition, scope);
      if (typeof condition !== "boolean") {
        throw Error("Invalid if condition: must be boolean");
      }
      let expr = self.ifFalse;
      if (condition) {
        expr = self.ifTrue;
      }
      return expr.interpret(expr, scope);
    }
  }
}

interface NegativeInterplet extends AstInterplet {
  value: AstInterplet;
  interpret(self: NegativeInterplet, scope: Scope): Value;
}

let NegativeInterplet = function(value: AstInterplet): NegativeInterplet {
  return {
    value: value,
    interpret: function(self, scope): Value {
      let result = self.value.interpret(self.value, scope);
      if (typeof result !== "number") {
        throw Error("Invalid negative value: must be a number");
      }
      return -result;
    }
  }
}

interface TypeofInterplet extends AstInterplet {
  value: AstInterplet;
  interpret(self: TypeofInterplet, scope: Scope): Value;
}

let TypeofInterplet = function(value: AstInterplet): TypeofInterplet {
  return {
    value: value,
    interpret: function(self, scope): Value {
      try {
        let result = self.value.interpret(self.value, scope);
        if (result !== null && typeof result === "object" && result.type === "function") {
          return "function";
        } else {
          return typeof result;
        }
      } catch (err) {
        return typeof undefined;
      }
    }
  }
}

interface SpreadInterplet extends AstInterplet {
  value: AstInterplet;
  interpret(self: SpreadInterplet, scope: Scope): Value;
}

let SpreadInterplet = function(value: AstInterplet): SpreadInterplet {
  return {
    value: value,
    interpret: function(self, scope): Value {
      let target = self.value.interpret(self.value, scope);
      if (target === null || typeof target !== "object" || (target.type !== "array" && target.type !== "object")) {
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
      let trueBlock: AstInterplet[] = [];
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
      let falseBlock: AstInterplet[] = [];
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
  throw Error("failed");
};