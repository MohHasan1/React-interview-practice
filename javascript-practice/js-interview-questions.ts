export {};

// String immutability: individual characters cannot be changed, but a let variable can be reassigned.
let str = "haan";
// str[2] = "l"; -> throws error as ts
console.log(str);
str = "a"
console.log(str);


// Rest parameters: the first argument goes into a, and the remaining arguments are collected in b.
function abc(a: number, ...b: number[]) {
  console.log(a);
  console.log(b);
}

abc(1, 10, 18, 14, 6);
