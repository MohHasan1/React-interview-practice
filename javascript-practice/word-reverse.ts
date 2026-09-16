export {};

const ogStr: string = "my name is hasan";

// TODO: 0(n) n = 16
const resStr: string = ogStr
  .split(" ")
  .map((word) => word.split("").reverse().join(""))
  .join(" ");

console.log(resStr);

if (resStr === "ym eman si nasah") console.log("true");
else console.log("false");
