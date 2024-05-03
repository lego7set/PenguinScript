import * as ComplexConstructor from "complex.js";

const Complex = ComplexConstructor as unknown as any;

import Parser from "./parsing/parser";

import Lexer from "./parsing/lexer";

import JSGenerator, { _globalEnv } from "./transpile/jsGen";

import loader from "./runtime/loader";

import structsPackage, { customObjectTypes } from "./runtime/structs"; // move all this stuff into the runtime folder cuz its looking like a lot of code here. 

import debugPackage from "./runtime/debug";

import conversionsPackage from "./runtime/conversions";

import stringUtilsPackage from "./runtime/stringUtils";

import scratchmiscPackage from "./runtime/scratchmisc";

import timePackage from "./runtime/time"

import miscPackage from "./runtime/misc";

function transpile(code: string, warpTimer: boolean, isWarp: boolean): any {
  const program = new Parser(code).produceAST();
  const generator = new JSGenerator(program);
  return generator.transpile("generator", true, warpTimer, isWarp)
}

loader.loadPackage(structsPackage); // load the package.

loader.loadPackage(conversionsPackage);

loader.loadPackage(stringUtilsPackage);

loader.loadPackage(debugPackage);

loader.loadPackage(timePackage);

loader.loadPackage(miscPackage);

loader.loadPenguinModPackage(scratchmiscPackage);

/*function preCompile(code: string, warpTimer: boolean, isWarp: boolean): any {
  const program = new Parser(code).produceAST();
  const generator = new JSGenerator(program);
  return "(yield* (function*($globalEnv, $target, isStuck){" + generator.transpile("string", true, warpTimer, isWarp) + "})(runtime.ext_vgspenguinscript._globalEnv, {isStuck, target, waitPromise}))";
}*/ // dont use precompile

/*function* getMathForPS(util, name: any) {
  if (typeof name !== "string") throw new TypeError("Expected math item to a string");
  if (!Object.hasOwn(Math, name)) throw new TypeError("Invalid math item");
  const item = Math[name];
  if (typeof item === "function") return function*(...args){return item(...args);}
  return Math[name];
}

_globalEnv.__env.set("getMath", {
  get value() {return getMathForPS}
})*/

// NOTE TO SELF: CREATE SERIALIZATION FOLDER WITH MULTIPLE SERIALIZE / DESERIALIZE MODULES THAT WE IMPORT HERE AND IMPLEMENT THE MAIN SERIALIZATION CLASS WHICH ALSO ADDS CUSTOM SERIALIZEATION FOR SPRITES

/*function supportsNullishCoalescing() {
  try { // this is useless lol cuz the jsgen uses it anyways
    return eval("true ?? 0")
  } catch(e) {
    return false
  }
}*/

const canNullish = true// supportsNullishCoalescing();

let Scratch: any;
// @ts-ignore
if ((typeof window === "object" && window && typeof window.document === "object" && typeof (Scratch = window.Scratch) === "object" && Scratch) || (typeof LoadedAsCore === "object" && LoadedAsCore !== globalThis.LoadedAsCore && (Scratch = LoadedAsCore))) {
  // Logic here
  if (!Scratch.extensions.isPenguinMod) throw "Please load PenguinScript in PenguinMod"; // i dnot need to explain tis

  // customObjectTypes.sprite = (v: any) => v instanceof Scratch.vm.exports.RenderedTarget; // create a sprite type.
  
  class PenguinScript {
    _globalEnv = _globalEnv;
    _customObjectTypes = customObjectTypes;
    constructor() {
      Scratch.vm.runtime.registerCompiledExtensionBlocks("vgspenguinscript", this.getCompiledInfo());
    }
    getCompiledInfo() {
      return {
        ir: {
          evalStack: (generator, block) => (generator.script.yields = true, {
            kind: "stack",
            code: generator.descendInputOfBlock(block, "code")
          }),
          evalReporter: (generator, block) => (generator.script.yields = true, {
            kind: "input",
            code: generator.descendInputOfBlock(block, "code")
          }),
        },
        js: {
          evalStack: (node, compiler, imports) => {
            const code = compiler.descendInput(node.code);
            let preCompiled;
            /*try {
              const tryCompile = JSON.parse(code.asString());
              preCompiled = preCompile(tryCompile, compiler.warpTimer, compiler.isWarp); // transpile at compile time to make it fast.
              //compiler.source += '"require waitPromise";'
              compiler.source += preCompiled + ";"
            } catch(e) {*/
              //compiler.source += '"require waitPromise";'
              compiler.source += `(yield* runtime.ext_vgspenguinscript.transpile(${code.asString()}, ${compiler.warpTimer}, ${compiler.isWarp})(runtime.ext_vgspenguinscript._globalEnv, {target, isStuck, waitPromise, thread: globalState.thread, timer: globalState.Timer, warpTimer: ${compiler.warpTimer}, isWarp: ${compiler.isWarp}, tempVars, ...runtime.ext_vgspenguinscript.utilObject}));`
            //}
          },
          evalReporter: (node, compiler, imports) => {
            const code = compiler.descendInput(node.code);
            let preCompiled;
            /*try {
              const tryCompile = JSON.parse(code.asString());
              preCompiled = preCompile(tryCompile, compiler.warpTimer, compiler.isWarp); // transpile at compile time to make it fast.
              // compiler.src += preCompiled + ";"
              if (canNullish) return new (imports.TypedInput)(`(${preCompiled} ?? "null")`);
              return new (imports.TypedInput)(`nullish((${preCompiled}),"null")`, imports.TYPE_UNKNOWN);
            } catch(e) {*/
              if (canNullish) return new (imports.TypedInput)(`((yield* runtime.ext_vgspenguinscript.transpile(${code.asString()}, ${compiler.warpTimer}, ${compiler.isWarp})(runtime.ext_vgspenguinscript._globalEnv, {target, isStuck, waitPromise, thread: globalState.thread, timer: globalState.Timer, warpTimer: ${compiler.warpTimer}, isWarp: ${compiler.isWarp}, tempVars, ...runtime.ext_vgspenguinscript.utilObject}))  ?? "null")`, imports.TYPE_UNKNOWN);
              return new (imports.TypedInput)(`nullish((yield* runtime.ext_vgspenguinscript.transpile(${code.asString()}, ${compiler.warpTimer}, ${compiler.isWarp})(runtime.ext_vgspenguinscript._globalEnv, {target, isStuck, waitPromise, thread: globalState.thread, timer: globalState.Timer, warpTimer: ${compiler.warpTimer}, isWarp: ${compiler.isWarp}, tempVars, ...runtime.ext_vgspenguinscript.utilObject})),"null")`, imports.TYPE_UNKNOWN);
              // compiler.src += `(yield* transpile(${code.asString()}, ${compiler.warpTimer}, ${compiler.isWarp})(runtime.ext_vgspenguinscript._globalEnv, target));`
            //}
          }
        }
      }
    }
    getInfo() {
      return {
        id: "vgspenguinscript",
        name: "PenguinScript",
        docsURI: "https://extensions.penguinmod.com/docs/penguinscript",
        blocks: [
          {
            opcode: "evalStack",
            blockType: Scratch.BlockType.COMMAND,
            text: "evaluate [code]",
            func: "noComp",
            arguments: {
              code: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: `let x = "I am some text!"; global say(target, x);`
              }
            }
          },
          {
            opcode: "evalReporter",
            allowDropAnywhere: true,
            blockType: Scratch.BlockType.REPORTER,
            text: "evaluate [code]",
            func: "noComp",
            arguments: {
              code: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "const var = 69;return var;"
              }
            }
          }
        ]
      }
    }
    noComp() {
      throw "Please enable compiler."
    }
    transpile(code: string, warpTimer: boolean, isWarp: boolean) {
      return transpile(code, warpTimer, isWarp);
    }
    getLexer() {
      return Lexer;
    }
    getParser() {
      return Parser
    }
    getJSGenerator() {
      return JSGenerator
    }
    getGlobalEnv() {
      return _globalEnv
    }
    utilObject = {
      createError: structsPackage.Error,
      createObject: structsPackage.Object,
      createArray: structsPackage.Array,
      createComplex: structsPackage.Complex,
      createColor: structsPackage.Color,
      *index(item, index) {
        if (!item || (!(item.isObject) && !(item.isArray))) throw new TypeError("Can only index arrays and objects");
        const v = yield* item.props.get.value(this, index);
        return {
          get value() {return v},
          set value(value) {for (const h of item.props.set.value(this, index, value));}
        }
      },
      *negate(a) {
        if (a && a.isComplex && a.isStruct) return yield* this.createComplex(this, new Complex(a.props.re.value, a.props.im.value).neg()); // im too lazy to create a new method or check if one already exists
        if (typeof a !== "number") throw new TypeError("Incompatible operand");
        return -a;
      },
      *lt(a, b) {
        if (a && a.isComplex && a.isStruct) throw new TypeError("Cannot relatively compare complex values");
        if (b && b.isComplex && b.isStruct) throw new TypeError("Cannot relatively compare complex values");
        if (typeof a !== "number") throw new TypeError("Cannot relatively compare non-numbers");
        if (typeof b !== "number") throw new TypeError("Cannot relatively compare non-numbers");
        return a < b
      },
      *le(a, b) {
        if (a && a.isComplex && a.isStruct) throw new TypeError("Cannot relatively compare complex values");
        if (b && b.isComplex && b.isStruct)throw new TypeError("Cannot relatively compare complex values");
        if (typeof a !== "number") throw new TypeError("Cannot relatively compare non-numbers");
        if (typeof b !== "number") throw new TypeError("Cannot relatively compare non-numbers");
        return a <= b
      },
      *gt(a, b) {
        if (a && a.isComplex && a.isStruct) throw new TypeError("Cannot relatively compare complex values");
        if (b && b.isComplex && b.isStruct) throw new TypeError("Cannot relatively compare complex values");
        if (typeof a !== "number") throw new TypeError("Cannot relatively compare non-numbers");
        if (typeof b !== "number") throw new TypeError("Cannot relatively compare non-numbers");
        return a > b
      },
      *ge(a, b) {
        if (a && a.isComplex && a.isStruct) throw new TypeError("Cannot relatively compare complex values");
        if (b && b.isComplex && b.isStruct) throw new TypeError("Cannot relatively compare complex values");
        if (typeof a !== "number") throw new TypeError("Cannot relatively compare non-numbers");
        if (typeof b !== "number") throw new TypeError("Cannot relatively compare non-numbers");
        return a >= b
      },
      *is(a, b) {
        if (a && b && a.isComplex && b.isComplex) return yield* a.props.__equals__.value(this, b);
        if (a && a.isComplex && typeof b === "number") return yield* a.props.__equals__.value(this, b);
        if (b && b.isComplex && typeof a === "number") return yield* b.props.__equals__.value(this, a);
        return Object.is(a, b);
      },
      *add(a, b) {
        if (a && a.isComplex && a.isStruct && (yield* a.props.__isCompatible__.value(this, b))) return yield* a.props.__add__.value(this, b);
        if (b && b.isComplex && b.isStruct && (yield* b.props.__isCompatible__.value(this, a))) return yield* b.props.__add__.value(this, a);
        //if (a.isStruct && typeof a.props.__add__ === "function" && typeof a.props.__isCompatible__ === "function" && a.props.__isCompatible__(this, b)) yield* return a.props.__add__(this, b);
        //if (b.isStruct && typeof b.props.__add__ === "function" && typeof b.props.__isCompatible__ === "function" && b.props.__isCompatible__(this, a)) yield* return a.props.__add__(this, b);
        if (typeof a === "number" && typeof b === "number") { // make everything more strict
          return a + b;
        }
        if (typeof a === "string" && typeof b === "string") {
          return a + b;
        }
        throw new TypeError("Incompatible operands");
      },
      *subtract(a, b) {
        if (a && a.isComplex && a.isStruct && (yield* a.props.__isCompatible__.value(this, b))) return yield* a.props.__subtract__.value(this, b);
        if (b && b.isComplex && b.isStruct && (yield* b.props.__isCompatible__.value(this, a))) return yield* b.props.__subtract__.value(this, a);
        //if (a.isStruct && typeof a.props.__subtract__ === "function" && typeof a.props.__isCompatible__ === "function" && a.props.__isCompatible__(this, b)) yield* return a.props.__subtract__(this, b);
        //if (b.isStruct && typeof b.props.__subtract__ === "function" && typeof b.props.__isCompatible__ === "function" && b.props.__isCompatible__(this, a)) yield* return a.props.__subtract__(this, b);
        if ((typeof a === "number" && typeof b === "number")) {
          return a - b
        }
        throw new TypeError("Incompatible operands");
      },
      *multiply(a, b) {
        if (a && a.isComplex && a.isStruct && (yield* a.props.__isCompatible__.value(this, b))) return yield* a.props.__multiply__.value(this, b);
        if (b && b.isComplex && b.isStruct && (yield* b.props.__isCompatible__.value(this, a))) return yield* b.props.__multiply__.value(this, a);
        //if (a.isStruct && typeof a.props.__multiply__ === "function" && typeof a.props.__isCompatible__ === "function" && a.props.__isCompatible__(this, b)) yield* return a.props.__multiply__(this, b);
        //if (b.isStruct && typeof b.props.__multiply__ === "function" && typeof b.props.__isCompatible__ === "function" && b.props.__isCompatible__(this, a)) yield* return a.props.__multiply__(this, b);
        if ((typeof a === "number" && typeof b === "number")) {
          return a * b
        }
        if ((typeof a === "string" && typeof b === "number")) {
          if (b < 0) throw new TypeError("Cannot multiply string by negative number");
          if (b > Number.MAX_SAFE_INTEGER) throw new TypeError("Cannot multiply string by anything larger than the maximum safe integer");
          if (b % 1 !== 0) throw new TypeError("Cannot multiply string by non-integer");
          return a.repeat(b); // python does this so why not
        }
        throw new TypeError("Incompatible operands");
      },
      *divide(a, b) {
        if (a && a.isComplex && a.isStruct && (yield* a.props.__isCompatible__.value(this, b))) return yield* a.props.__divide__.value(this, b);
        if (b && b.isComplex && b.isStruct && (yield* b.props.__isCompatible__.value(this, a))) return yield* b.props.__divide__.value(this, a);
        //if (a.isStruct && typeof a.props.__divide__ === "function" && typeof a.props.__isCompatible__ === "function" && a.props.__isCompatible__(this, b)) return yield* a.props.__divide__(this, b);
        // if (b.isStruct && typeof b.props.__divide__ === "function" && typeof b.props.__isCompatible__ === "function" && b.props.__isCompatible__(this, a)) return yield* a.props.__divide__(this, b);
        if ((typeof a === "number" && typeof b === "number")) {
          return a / b
        }
        throw new TypeError("Incompatible operands");
      },
      *mod(a, b) {
        if ((a && a.isComplex) || (b && b.isComplex)) throw new TypeError("Complex operation not implemented")
        // this is basically the code from the pm vm
        if (!(typeof a === "number" && typeof b === "number")) throw new TypeError("Incompatible operands")
        let result = a % b;
        if (result / b < 0) result += b;
        return result; 
      },
      *power(a, b) {
        if (a && a.isComplex && a.isStruct && (yield* a.props.__isCompatible__.value(this, b))) return yield* a.props.__power__.value(this, b);
        if (b && b.isComplex && b.isStruct && (yield* b.props.__isCompatible__.value(this, a))) return yield* b.props.__power__.value(this, a);
        //if (a.isStruct && typeof a.props.__power__ === "function" && typeof a.props.__isCompatible__ === "function" && a.props.__isCompatible__(this, b)) return yield* a.props.__power__(this, b);
        //if (b.isStruct && typeof b.props.__power__ === "function" && typeof b.props.__isCompatible__ === "function" && b.props.__isCompatible__(this, a)) return yield* a.props.__power__(this, b);
        if ((typeof a === "number" && typeof b === "number")) {
          return a ** b
        }
        throw new TypeError("Incompatible operands");
      },
    };
  }
  // @ts-ignore
  if (((typeof LoadedAsCore === "object") && (LoadedAsCore !== globalThis.LoadedAsCore))) module.exports = PenguinScript;
  else Scratch.extensions.register(new PenguinScript());
}

// @ts-ignore
if (!(typeof LoadedAsCore === "object" && LoadedAsCore !== globalThis.LoadedAsCore)) {
  module.exports = {
    loader,
    Lexer,
    Parser,
    JSGenerator,
    transpile,
    default: transpile
  }
}
          
