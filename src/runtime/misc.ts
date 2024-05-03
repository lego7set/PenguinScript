import nativeFn from "./internal/nativefunc";

const pkg = { __proto__: null };

pkg.exit = nativeFn(function* exit(util, value: any) {
  throw {isExit: true, returnValue: value}; // exits
}, false)

export default pkg;
