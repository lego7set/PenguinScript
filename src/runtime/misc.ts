import nativeFn from "./internal/nativefunc";

const pkg: any = { __proto__: null };

pkg.exit = nativeFn(function* exit(util, value: any) {
  throw {isExit: true, returnValue: value}; // exits
}, false)

export default pkg;
