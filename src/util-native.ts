export let length = function <T>(v: string | Array<T>): number {
  return v.length;
};

export let indexOf = function <T>(a: string | Array<T>, v: T): number {
  return a.indexOf(v as any);
};

export let lastIndexOf = function <T>(a: string | Array<T>, v: T): number {
  return a.lastIndexOf(v as any);
};

export let parseInt = function (str: string) {
  return globalThis.parseInt(str);
};

export let parseFloat = function (str: string): number {
  return globalThis.parseFloat(str);
};

export let isFinite = function (n: number) {
  return globalThis.isFinite(n);
};

export let charcode = function (a: string) {
  return a.charCodeAt(0);
};

export let codechar = function (a: number) {
  return String.fromCharCode(a);
};