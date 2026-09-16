export {};

function wordFrequency(words: string): Record<string, number> {
  const hashMap: Record<string, number> = {};

  words.split(" ").forEach((word) => {
    const lowerWord = word.toLowerCase();
    hashMap[lowerWord] = hashMap[lowerWord] ? hashMap[lowerWord] + 1 : 1;
  });

  return hashMap;
}

const res = wordFrequency("hello hello world");
console.log(res);

if (res.hello === 2 && res.world === 1 && Object.keys(res).length === 2)
  console.log("true");
else console.log("false");
