// @ts-ignore
const generatorFunc: any = function*(){}.constructor;

export default function createNativeFunction(fn, doesNotUseUtil?: boolean) {
  const isGenerator = fn instanceof generatorFunc;
  function* nativeFunction(...args) {
    let result;
    if (doesNotUseUtil) args = args.slice(1);
    if (isGenerator) result = yield* fn(...args);
    else result = fn(...args);
    return result;
  }
  Object.assign(nativeFunction, {
    toString: ()=>"<PenguinScript Native Function>",
    toJSON: () => "penguinscript functions do not save",
    isFunction: true,
    isNativeFunction: true
  });
  return nativeFunction;
}
