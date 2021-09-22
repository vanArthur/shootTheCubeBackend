import { randomInt } from "crypto";

let randomIds = new Set();

export function randomId() {
  let string = "";
  for (let i = 0; i < 10; i++) {
    string = string + randomInt(9).toString();
  }
  let setLenght = randomIds.size;
  randomIds.add(string);
  if (setLenght === randomIds.size) {
    string = randomId();
  }
  return string;
}
