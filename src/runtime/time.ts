import nativeFn from ".internal/nativefunc";
const package = { __proto__: null };

package.applicationTime = nativeFn(function*(){
  return self.performance.now();
}, false)

package.daysSince2000 = null;

package.msSince1970 = nativeFn(function*(){
  return Date.now();
}, false);

export default package;
