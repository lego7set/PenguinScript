import nativeFn from "./internal/nativefunc";

const package = { __proto__: null };

package.exit = nativeFn(function* exit(util, value: any) {
  throw {isExit: true, returnValue: value}; // exits
}, false)

export default package;
