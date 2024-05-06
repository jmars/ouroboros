import type { ErrorValue } from "./astinterp";

export let length = function <T>(v: string | Array<T>): number {
  let i = 0;
  let e = v[i];
  while (e !== undefined) {
    i = i + 1;
    e = v[i];
  }
  return i;
};

export let indexOf = function <T>(a: string | Array<T>, v: T): number {
  let i = 0;
  let l = length(a);

  while (i < l) {
    if (a[i] === v) {
      return i;
    }
    i = i + 1;
  }

  return -1;
}

export let lastIndexOf = function <T>(a: string | Array<T>, v: T): number {
  let i = length(a) - 1;

  while (i >= 0) {
    if (a[i] === v) {
      return i;
    }
    i = i - 1;
  }

  return -1;
}

let charVals = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export let parseInt = function (str: string) {
  let i = length(str) - 1;
  let n = 0;
  let e = 1;
  let hasDigit = false;

  while (i >= 0) {
    let c = str[i];
    let digitIndex = indexOf(charVals, c);
    if (digitIndex === -1) {
      return NaN;
    }
    hasDigit = true;
    n = n + (digitIndex * e);
    e = e * 10;
    i = i - 1;
  }

  return hasDigit ? n : NaN;
};

export let parseFloat = function (str: string): number {
  let h = "";
  let d = "";
  let i = 0;
  let dot = false;

  while (i < length(str)) {
    let c = str[i];
    if (c !== ".") {
      if (dot === false) {
        h = h + c;
      } else {
        d = d + c;
      }
    } else {
      dot = true;
    }
    i = i + 1;
  }

  if (d === "") {
    return parseInt(h);
  } else {
    return parseInt(h) + (parseInt(d) / (10 ** length(d)));
  }
};

export let isFinite = function (n: number) {
  return n !== Infinity;
};

export let ascii = [
  " ", "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/",
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", ";", "<", "=", ">", "?",
  "@", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
  "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "[", "\\", "]", "^", "_",
  "`", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o",
  "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "{", "|", "}", "~"
];

export let charcode = function (a: string): number {
  let index = ascii.indexOf(a);
  if (index === -1) {
    return -1;
  }
  return index + 32;
};

export let codechar = function (a: number): string {
  let index = a - 32;
  if (index < 0 || index >= ascii.length) {
    return "";
  }
  return ascii[index];
};

export let Error = function(msg: string): ErrorValue {
  return {
    type: "error",
    message: msg
  };
};

export let numberToString = function(num: number): string {
  if (num === 0) {
    return "0";
  }
  
  let digitToChar = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  let isNegative = num < 0;
  let result = "";

  if (isNegative) {
      num = -num;
  }

  while (num > 0) {
      let digit = 0;
      let n = num;
      while (n >= 10) {
          n = n - 10;
      }
      digit = n;

      result = digitToChar[digit] + result;

      let tempNum = 0;
      while (num >= 10) {
          num = num - 10;
          tempNum = tempNum + 1;
      }
      num = tempNum;
  }

  if (isNegative) {
      result = "-" + result;
  }

  return result;
};