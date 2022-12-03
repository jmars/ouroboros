export let length = function <T>(v: string | Array<T>): number {
  let i = 0;
  try {
    let e = v[i];
    while (e !== undefined) {
      i = i + 1;
      e = v[i];
    }
    return i;
  } catch (e) {
    return i;
  }
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

  while (i >= 0) {
    let c = str[i];
    n = n + (indexOf(charVals, c) * e);
    e = e * 10;
    i = i - 1;
  }

  return n;
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

  return parseInt(h) + (parseInt(d) / (10 ** length(d)));
};

export let isFinite = function (n: number) {
  return n !== Infinity;
};

export let ascii = [
  "\b",
  "\t",
  "\n",
  "\f",
  "\r",
  " ",
  "!",
  "\"",
  "#",
  "$",
  "%",
  "&",
  "'",
  "(",
  ")",
  "*",
  "+",
  ",",
  "-",
  ".",
  "/",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  ":",
  ";",
  "<",
  "=",
  ">",
  "?",
  "@",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "[",
  "\\",
  "]",
  "^",
  "_",
  "`",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "{",
  "|",
  "}",
  "~"
];

export let charcode = function (a: string) {
  let code = indexOf(ascii, a);

  return code;
}

export let codechar = function (a: number) {
  let char = ascii[a];

  return char;
}