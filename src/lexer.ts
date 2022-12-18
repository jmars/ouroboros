import { length, indexOf, parseFloat, isFinite, codechar, charcode } from './util-native.js';

export type Token = {
  type: "name" | "number" | "string" | "operator",
  value: string | number,
  from: number,
  to: number,
  line: number
}

export let tokenize = function (string: string, prefix: string[], suffix: string[] , log: any) {
  if (string === undefined) {
    return [];
  }

  let i: number = 0;
  let line: number = 1;
  let c: number = charcode(string[i]);
  let len: number = length(string);
  let n: number = 0;
  let result: Token[] = [];
  let str: string = "";
  let q: number = charcode("");

  try {
    while (i < len) {
      let from = i;

      if (c <= charcode(" ")) {
        if (c === charcode("\n")) {
          line = line + 1;
        }
        i = i + 1;
        c = charcode(string[i]);
      } else if ((c >= charcode("a") && c <= charcode("z")) || (c >= charcode("A") && c <= charcode("Z"))) {
        str = codechar(c);
        i = i + 1;
        while (true) {
          c = charcode(string[i]);
          if (
            (c >= charcode("a") && c <= charcode("z"))
            || (c >= charcode("A") && c <= charcode("Z"))
            || (c >= charcode("0") && c <= charcode("9"))
            || c === charcode("_")
          ) {
            str = str + codechar(c);
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
      } else if (c >= charcode("0") && c <= charcode("9")) {
        str = codechar(c);
        i = i + 1;

        while (true) {
          c = charcode(string[i]);
          if (c < charcode("0") || c > charcode("9")) {
            break;
          }
          i = i + 1;
          str = str + codechar(c);
        }

        if (c === charcode(".")) {
          i = i + 1;
          str = str + codechar(c);
          while (true) {
            c = charcode(string[i]);
            if (c < charcode("0") || c > charcode("9")) {
              break;
            }
            i = i + 1;
            str = str + codechar(c);
          }
        }

        if (c === charcode("e") || c === charcode("E")) {
          i = i + 1;
          str = str + codechar(c);
          c = charcode(string[i]);
          if (c === charcode("-") || c === charcode("+")) {
            i = i + 1;
            str = str + codechar(c);
            c = charcode(string[i]);
          }
          if (c < charcode("0") || c > charcode("9")) {
            throw Error("Bad exponent");
          }

          i = i + 1;
          str = str + codechar(c);
          c = charcode(string[i]);

          while (c >= charcode("0") && c <= charcode("9")) {
            i = i + 1;
            str = str + codechar(c);
            c = charcode(string[i]);
          }
        }

        if (c >= charcode("a") && c <= charcode("z")) {
          str = str + codechar(c);
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
      } else if (c === charcode("\"") || c === charcode("'")) {
        str = "";
        q = c;
        i = i + 1;
        while (true) {
          c = charcode(string[i]);
          if (c < charcode(" ")) {
            throw Error("Unterminated/Control character in string");
          }

          if (c === q) {
            break;
          }

          if (c === charcode("\\")) {
            i = i + 1;
            if (i >= len) {
              throw Error("Unterminated string");
            }
            c = charcode(string[i]);
            if (c === charcode("b")) {
              c = charcode("\b");
            } else if (c === charcode("f")) {
              c = charcode("\f");
            } else if (c === charcode("n")) {
              c = charcode("\n");
            } else if (c === charcode("r")) {
              c = charcode("\r");
            } else if (c === charcode("t")) {
              c = charcode("\t");
            } else if (c === charcode("u")) {
              throw Error("Unicode escapes not supported");
            }
          }
          str = str + codechar(c);
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
        c = charcode(string[i]);
      } else if (c === charcode("/") && string[i + 1] === "/") {
        i = i + 1;
        while (true) {
          c = charcode(string[i]);
          if (c === charcode("\n") || c === charcode("\r") || c === charcode("")) {
            break;
          }
          i = i + 1;
        }
      } else if (indexOf(prefix, codechar(c)) >= 0) {
        str = codechar(c);
        i = i + 1;
        while (true) {
          c = charcode(string[i]);
          if (i >= len || indexOf(suffix, codechar(c)) < 0) {
            break;
          }
          str = str + codechar(c);
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
          value: codechar(c),
          from: from,
          to: i,
          line: line
        }];
        c = charcode(string[i]);
      }
    }
  } catch (e) {
    return result;
  }
  return result;
};