import { length, indexOf, parseFloat, isFinite, codechar, charcode } from './util-native.js';

export type Token = {
  type: "name" | "number" | "string" | "operator",
  value: string | number,
  from: number,
  to: number,
  line: number
};

export let tokenize = function (input: string, prefix: string[], suffix: string[], log: any) {
  if (input === undefined || length(input) === 0) {
    return [];
  }

  let i = 0;
  let line = 1;
  let result: Token[] = [];
  let len = length(input);

  while (i < len) {
    let from = i;
    let c = charcode(input[i]);

    // Handling whitespace and new lines
    if (c <= charcode(" ")) {
      if (c === charcode("\n")) {
        line = line + 1;
      }
      i = i + 1;
      continue;
    }

    // Identifiers (variable names, keywords)
    if ((c >= charcode("a") && c <= charcode("z")) || (c >= charcode("A") && c <= charcode("Z"))) {
      let str = codechar(c);
      i = i + 1;
      while (i < len && ((c = charcode(input[i])) >= charcode("a") && c <= charcode("z") || (c >= charcode("A") && c <= charcode("Z")) || (c >= charcode("0") && c <= charcode("9")) || c === charcode("_"))) {
        str = str + codechar(c);
        i = i + 1;
      }
      result = [...result, {
        type: "name",
        value: str,
        from: from,
        to: i,
        line: line
      }];
      continue;
    }

    // Numbers
    if (c >= charcode("0") && c <= charcode("9")) {
      let str = codechar(c);
      i = i + 1;
      while (i < len && (c = charcode(input[i])) >= charcode("0") && c <= charcode("9")) {
        str = str + codechar(c);
        i = i + 1;
      }
      if (i < len && input[i] === '.') {
        str = str + '.';
        i = i + 1;
        while (i < len && (c = charcode(input[i])) >= charcode("0") && c <= charcode("9")) {
          str = str + codechar(c);
          i = i + 1;
        }
      }
      if (i < len && (input[i] === 'e' || input[i] === 'E')) {
        str = str + input[i];
        i = i + 1;
        if (i < len && (input[i] === '+' || input[i] === '-')) {
          str = str + input[i];
          i = i + 1;
        }
        let hasDigits = false;
        while (i < len && (c = charcode(input[i])) >= charcode("0") && c <= charcode("9")) {
          str = str + codechar(c);
          i = i + 1;
          hasDigits = true;
        }
        if (!hasDigits) {
          throw Error("Bad exponent");
        }
      }
      let n = parseFloat(str);
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
      continue;
    }

    // Strings
    if (c === charcode("\"") || c === charcode("'")) {
      let str = "";
      let q = c;
      i = i + 1;
      while (i < len && (c = charcode(input[i])) !== q) {
        if (c === charcode("\\")) {
          i = i + 1;
          if (i >= len) {
            throw Error("Unterminated string");
          }
          c = charcode(input[i]);
          if (c === charcode('b')) {
            str += "\b";
          } else if (c === charcode('f')) {
            str += "\f";
          } else if (c === charcode('n')) {
            str += "\n";
          } else if (c === charcode('r')) {
            str += "\r";
          } else if (c === charcode('t')) {
            str += "\t";
          } else if (c === charcode("'")) {
            str += "'";
          } else if (c === charcode("\"")) {
            str += "\"";
          } else if (c === charcode("\\")) {
            str += "\\";
          } else {
            str += codechar(c);
          }
        } else {
          str += codechar(c);
        }
        i = i + 1;
      }
      if (i >= len || charcode(input[i]) !== q) {
        throw Error("Unterminated string");
      }
      i = i + 1; // Skip the closing quote
      result = [...result, {
        type: "string",
        value: str,
        from: from,
        to: i,
        line: line
      }];
      continue;
    }

    // Operators and comments
    if (c === charcode("/")) {
      if (i + 1 < len && charcode(input[i + 1]) === charcode("/")) {
        i = i + 2;
        while (i < len && (c = charcode(input[i])) !== charcode("\n") && c !== charcode("\r")) {
          i = i + 1;
        }
        continue;
      }
    }

    if (indexOf(prefix, codechar(c)) >= 0) {
      let str = codechar(c);
      i = i + 1;
      while (i < len && indexOf(suffix, codechar((c = charcode(input[i])))) >= 0) {
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
      continue;
    }

    // Single character operators
    if (i < len) {
      result = [...result, {
        type: "operator",
        value: codechar(c),
        from: from,
        to: i + 1,
        line: line
      }];
      i = i + 1;
    }
  }

  return result;
};