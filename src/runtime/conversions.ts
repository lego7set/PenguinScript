const package = { __proto__: null };
export function* toString(util, value: any) {
  if (value && value.isStruct && value.props.__toString__ && typeof value.props.__toString__.value === "function") {
    return String(yield* value.props.__toString__.value(util, value)) // custom tostring cuz why not.
    // i need to allow this for structs so that it shows the string instead of penguisncript struct for blockly stuff
  }
  return String(value);
}
export function* toNumber(util, value: any) {
  if (value && value.isStruct && value.props.__toNumber__ && typeof value.props.__toNumber__.value === "function") {
    return Number(yield* value.props.__toNumber__.value(util, value)) // same here
  }
  return Number(value);
}
export function* toBoolean(util, value: any) {
  if (value && value.isStruct && value.props.__toBoolean__ && typeof value.props.__toBoolean__.value === "function") {
    return Boolean(yield* value.props.__toBoolean__.value(util, value)) // same here
  }
  return Boolean(value);
}

package.toString = toString;
package.toNumber = toNumber;
package.toBoolean = toBoolean;

function* charFromCodePoint(util, value: any) {
  return String.fromCodePoint(yield* convertToNumber(value) || 0) // use the new conversion functions instead of the other ones.
}

function* charToCodePoint(util, value: any) {
  if (typeof value !== "string") throw new TypeError("Please pass in a string to charToCodePoint")
  return value.codePointAt(0) ?? null;
}

package.charFromCodePoint = charFromCodePoint;
package.charToCodePoint = charToCodePoint;

export default package;
