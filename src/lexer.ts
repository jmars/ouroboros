import { length, indexOf, parseFloat, isFinite} from './util';

export type Token = {
  type: "name" | "number" | "string" | "operator",
  value: string | number,
  from: number,
  to: number,
  line: number
}

let tokenize = function (string: string, prefix: string[], suffix: string[]) {
  if (string === undefined) {
    return [];
  }

  if (typeof prefix === "undefined") {
    prefix = ["<", ">", "+", "-", "&"];
  }
  if (typeof suffix === "undefined") {
    suffix = ["=", ">", "&", ":"];
  }

  let i: number = 0;
  let line: number = 1;
  let c: string = string[i];
  let len: number = length(string);
  let n: number = 0;
  let result: Token[] = [];
  let str: string = "";
  let q: string = "";

  while (c) {
    let from = i;

    if (c <= " ") {
      if (c === "\n") {
        line = line + 1;
      }
      i = i + 1;
      c = string[i];
    } else if ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z")) {
      str = c;
      i = i + 1;
      while (true) {
        c = string[i];
        if (
          (c >= "a" && c <= "z")
          || (c >= "A" && c <= "Z")
          || (c >= "0" && c <= "9")
          || c === "_"
        ) {
          str = str + c;
          i = i + 1;
        } else {
          break;
        }
      }
      result = [...result, {
        type: "name",
        value: str,
        from: from,
        to: i,
        line: line
      }];
    } else if (c >= "0" && c <= "9") {
      str = c;
      i = i + 1;

      while (true) {
        c = string[i];
        if (c < "0" || c > "9") {
          break;
        }
        i = i + 1;
        str = str + c;
      }

      if (c === ".") {
        i = i + 1;
        str = str + c;
        while (true) {
          c = string[i];
          if (c < "0" || c > "9") {
            break;
          }
          i = i + 1;
          str = str + c;
        }
      }

      if (c === "e" || c === "E") {
        i = i + 1;
        str = str + c;
        c = string[i];
        if (c === "-" || c === "+") {
          i = i + 1;
          str = str + c;
          c = string[i];
        }
        if (c < "0" || c > "9") {
          throw Error("Bad exponent");
        }

        i = i + 1;
        str = str + c;
        c = string[i];

        while (c >= "0" && c <= "9") {
          i = i + 1;
          str = str + c;
          c = string[i];
        }
      }

      if (c >= "a" && c <= "z") {
        str = str + c;
        i = i + 1;
        throw Error("Bad number");
      }

      n = parseFloat(str);
      if (isFinite(n)) {
        result = [...result, {
          type: "number",
          value: n,
          from: from,
          to: i,
          line: line
        }];
      } else {
        throw Error("Bad number");
      }
    } else if (c === "\"" || c === "'") {
      str = "";
      q = c;
      i = i + 1;
      while (true) {
        c = string[i];
        if (c < " ") {
          throw Error("Unterminated/Control character in string");
        }

        if (c === q) {
          break;
        }

        if (c === "\\") {
          i = i + 1;
          if (i >= len) {
            throw Error("Unterminated string");
          }
          c = string[i];
          if (c === "b") {
            c = "\b";
          } else if (c === "f") {
            c = "\f";
          } else if (c === "n") {
            c = "\n";
          } else if (c === "r") {
            c = "\r";
          } else if (c === "t") {
            c = "\t";
          } else if (c === "u") {
            throw Error("Unicode escapes not supported");
          }
        }
        str = str + c;
        i = i + 1;
      }
      i = i + 1;
      result = [...result, {
        type: "string",
        value: str,
        from: from,
        to: i,
        line: line
      }];
      c = string[i];
    } else if (c === "/" && string[i + 1] === "/") {
      i = i + 1;
      while (true) {
        c = string[i];
        if (c === "\n" || c === "\r" || c === "") {
          break;
        }
        i = i + 1;
      }
    } else if (indexOf(prefix, c) >= 0) {
      str = c;
      i = i + 1;
      while (true) {
        c = string[i];
        if (i >= len || indexOf(suffix, c) < 0) {
          break;
        }
        str = str + c;
        i = i + 1;
      }
      result = [...result, {
        type: "operator",
        value: str,
        from: from,
        to: i,
        line: line
      }];
    } else {
      i = i + 1;
      result = [...result, {
        type: "operator",
        value: c,
        from: from,
        to: i,
        line: line
      }];
      c = string[i];
    }
  }
  return result;
};

export default tokenize;