const package = { __proto__: null };

package.print = function* log(util, ...args) {
  console.log(...args);
  return null;
}

package.warn = function* warn(util, ...args) {
  console.warn(...args);
  return null;
}

package.error = function* error(util, ...args) {
  console.error(...args);
  return null;
}

package.EnterDebugMode = function debug(util, ...listOfThingsForAccess) {
  // do stuff.
  if (!window.confirm("Would you like to enter the PenguinScript debug mode? (requires advanced understanding of JS console to use)")) return false; // indicate not successful.
  // window.alert("Go into the console. The arguments passed into this function are accessible through the global variable PenguinScriptDebugMode.vars");
  // @ts-ignore
  globalThis.PenguinScriptDebugMode = {__proto__: null, vars: listOfThingsForAccess, util};
  eval?.(`debugger;\n"This is the PenguinScript debug mode.";\n"Please read this entire thing.";\n"The arguments passed into the global EnterDebugMode function are accessible through the global variable PenguinScriptDebugMode.vars, and you can access variable items from PenguinScriptDebugMode.util";\n'To use this global variable, go into the "console" tab.'`); // indirect eval.
  // @ts-ignore
  delete globalThis.PenguinScriptDebugMode;
  return true;
}

export default package;
