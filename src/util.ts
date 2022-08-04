export let length = function<T>(v: string | Array<T>): number {
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

export let indexOf = function<T>(a: string | Array<T>, v: T): number {
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

export let lastIndexOf = function<T>(a: string | Array<T>, v: T): number {
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

export let parseInt = function(str: string) {
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

export let parseFloat = function(str: string): number {
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

export let isFinite = function(n: number) {
  return n !== Infinity;
};