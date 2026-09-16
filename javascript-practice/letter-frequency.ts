export {};

function letterFrequency(text: string): Record<string, number> {
  const hashMap: Record<string, number> = {};

  text.split("").forEach((letter) => {
    const lowerLetter = letter.toLowerCase();
    hashMap[lowerLetter] = hashMap[lowerLetter] ? hashMap[lowerLetter] + 1 : 1;
  });

  return hashMap;
}

const res = letterFrequency("hello");
console.log(res);

if (
  res.h === 1 &&
  res.e === 1 &&
  res.l === 2 &&
  res.o === 1 &&
  Object.keys(res).length === 4
)
  console.log("true");
else console.log("false");
