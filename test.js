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
  if (a) {
    return true;
  }
  return false;
};
let fz = fd(false);