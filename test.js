let b = "boo";
let c = 1 + 1;
let f = function(a, b) {
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
  continue;
}
let z = i;