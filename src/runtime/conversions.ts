import nativeFn from "./internal/nativefunc";
const pkg: any = { __proto__: null };
export function* toString(util, value: any) {
  if (value && value.isStruct && value.props.__toString__ && typeof value.props.__toString__.value === "function") {
    return String(yield* value.props.__toString__.value(util, value)) // custom tostring cuz why not.
    // actually no its impossible
  }
  if (value == null) return "null";
  return String(value);
}
export function* toNumber(util, value: any) {
  if (value && value.isStruct && value.props.__toNumber__ && typeof value.props.__toNumber__.value === "function") {
    return Number(yield* value.props.__toNumber__.value(util, value)) // same here
  }
  if (value == null) return 0;
  return Number(value);
}
export function* toBoolean(util, value: any) {
  if (value && value.isStruct && value.props.__toBoolean__ && typeof value.props.__toBoolean__.value === "function") {
    return (yield* value.props.__toBoolean__.value(util, value) ?? false) === false // same here
  }
  return (value ?? false) === false;
}

export function* degToRad(util, deg: number) {
  return deg * Math.PI / 180;
}
export function* radToDeg(util, rad: number) {
  return rad * 180 / Math.PI;
}

pkg.degToRad = nativeFn(degToRad, false);
pkg.radToDeg = nativeFn(radToDeg, false)

// @ts-ignore
pkg.toString = nativeFn(toString, false);
pkg.toNumber = nativeFn(toNumber, false);
pkg.toBoolean = nativeFn(toBoolean, false);

function* charFromCodePoint(util, value: any) {
  return String.fromCodePoint((yield* toNumber(util, value)) || 0) // use the new conversion functions instead of the other ones.
}

function* charToCodePoint(util, value: any) {
  if (typeof value !== "string") throw new TypeError("Please pass in a string to charToCodePoint")
  return value.codePointAt(0) ?? null;
}

pkg.charFromCodePoint = nativeFn(charFromCodePoint, false);
pkg.charToCodePoint = nativeFn(charToCodePoint, false);

export default pkg;
