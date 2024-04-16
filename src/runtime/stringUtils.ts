const package = { __proto__: null };

import { toString, toNumber } from "./conversions";

function* join(util, str: any, str2: any) {
  return yield* toString(util, str) + yield* toString(util, str);
}

package.join = join;
package.concat = join;

package.repeatString = function* repeatString(util, str, times) {
  const times = yield* toNumber(util, times) || 0;
  str = yield* toString(util, str);
  return str.repeat(Math.floor(Math.abs(times)))
}

function* inStr(util, str1, str2) {
  str1 = String(str1 ?? "null");
  str2 = String(str2 ?? "null");
  return str1.includes(str2);
}


package.stringContains = inStr;
package.stringHas = inStr;

function* strLen(util, str) {
  if (typeof str !== "string") throw new TypeError("Expected a string passed to strLen / lengthOfString");
  return str.length;
}

package.strLen = strLen;
package.lengthOfString = strLen;

function* letterOf(util, str, index) {
  if (typeof index !== "number") throw new TypeError("Invalid letter position passed to letterOf");
  if (index < 1) throw new TypeError("Letter position must be larger than or equal to 1");
  str = yield* toString(str);
  return str[Math.floor(Math.abs(index)) - 1]; // subtract 1 to mimic scratch behavior
}

function* lettersOf(util, str, index, index2) {
  if (typeof index !== "number") throw new TypeError("Invalid letter position passed to lettersOf");
  if (typeof index2 !== "number") throw new TypeError("Invalid letter position passed to lettersOf");
  if (index < 1) throw new TypeError("Letter position must be larger than or equal to 1");
  if (index2 < 1) throw new TypeError("Letter position must be larger than or equal to 1");
  str = yield* toString(str);
  return str.substring(Math.floor(Math.abs(index)) - 1, Math.floor(Math.abs(index2))); // subtract 1 to mimic scratch behavior, and dont subtract 1 for the second one cuz the second one is EXclusive.
}

package.charAt = letterOf;
package.letterOf = letterOf;

package.lettersOf = lettersOf;
package.substring = lettersOf;

export default package;
