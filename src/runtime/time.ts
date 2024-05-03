import nativeFn from "./internal/nativefunc";
const pkg = { __proto__: null };

pkg.applicationTime = nativeFn(function*(){
  return self.performance.now();
}, false)

pkg.daysSince2000 = null;

pkg.msSince1970 = nativeFn(function*(){
  return Date.now();
}, false);

export default pkg;
