let b = "boo";
let c = 1 + 1;
let f = function(a, b) {
  c = "bar";
  return a + b;
};
let a = [1, true, null, "foo", { foo: "bar" }, b, c, f(3, 3)];
let d = a[5];
let e = {
  test: "makeitlookeasy"
};
let g = e.test;
let i = 0;
while (i < 10) {
  i = i + 1;
}
let z = i;
let err = "no-error";
try {
  throw "test-error";
} catch (e) {
  err = e;
}
let ff = function(a) {
  if (a) {
    return false;
  } else {
    return true;
  }
};
let fe = ff(true);
let fd = function(a) {
  if (a === false) {
    return true;
  } else if (a === "foo") {
    return "wut";
  }
  return false;
};
let fz = fd(false);
let aa = -1;
let zz = typeof "test";
let ze = fd("foo");
let zzz = [1,2,3];
let arraySpread = [...zzz, 4];
let yy = {foo: "bar"};
let yyy = {...yy, bar: "foo"};
let method = {
  f: function() {
    return true;
  }
};
let mr = method.f();
let nested = {
  m: method
};
method.f = function(dd) {
  dd = dd === undefined ? 1 : dd;
  return dd;
};
let nmr = nested.m.f();
let dynamic = nested["m"].f();
let ttt = [...a, ...a];
let yyyy = {...yy, ...yy};