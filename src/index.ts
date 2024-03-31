import Parser from "./parsing/parser";

import Lexer from "./parsing/lexer";

import JSGenerator, { _globalEnv } from "./transpile/jsGen";

function transpile(code: string, warpTimer: boolean, isWarp: boolean): any {
  const program = new Parser(code).produceAST();
  const generator = new JSGenerator(program);
  return generator.transpile("generator", true, warpTimer, isWarp)
}

function preCompile(code: string, warpTimer: boolean, isWarp: boolean): any {
  const program = new Parser(code).produceAST();
  const generator = new JSGenerator(program);
  return "(yield* (function*($globalEnv, $target){" + generator.transpile("string", true, warpTimer, isWarp) + "})(runtime.ext_vgspenguinscript._globalEnv, target))";
}

function* log(...args) {
  console.log(...args);
  return null;
}

function* warn(...args) {
  console.warn(...args);
  return null;
}

function* error(...args) {
  console.error(...args);
  return null;
}

_globalEnv.__env.set("print", {
  get value() {return log}
})

_globalEnv.__env.set("warn", {
  get value() {return warn}
})

_globalEnv.__env.set("error", {
  get value() {return error}
})

function supportsNullishCoalescing() {
  try {
    return eval("true ?? 0")
  } catch(e) {
    return false
  }
}

const canNullish = supportsNullishCoalescing();

import { SupportsExtensions, IsPenguinMod } from "./pmUtils/PenguinModDetector";
let Scratch: any;
// @ts-ignore
if (typeof window === "object" && window && typeof window.document === "object" && typeof (Scratch = window.Scratch) === "object" && Scratch) {
  // Logic here
  if (!Scratch.extensions.isPenguinMod) throw "Please load PenguinScript in PenguinMod"; // i dnot need to explain tis
  function* setX(target: any, x: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set x position of non-sprite to " + Number(x));
    const pos = Number(x) || 0;
    target.setXY(pos, target.y, false);
    return null;
  }
  function* setY(target: any, y: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set y position of non-sprite to " + Number(y));
    const pos = Number(y) || 0;
    target.setXY(target.x, pos, false);
    return null;
  }
  function* setXY(target: any, x: any, y: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set x and y position of non-sprite to " + Number(x) + "and " + Number(y) + " respectively");
    const xPos = Number(x) || 0;
    const yPos = Number(y) || 0;
    target.setXY(xPos, yPos, false);
    return null;
  }
  function* changeX(target: any, x: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to change x position of non-sprite by " + Number(x));
    const pos = Number(x) || 0;
    target.setXY(target.x + pos, target.y, false);
    return null;
  }
  function* changeY(target: any, y: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to change y position of non-sprite by " + Number(y));
    const pos = Number(y) || 0;
    target.setXY(target.x, target.y + pos, false);
    return null;
  }
  function* changeXY(target: any, x: any, y: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to change x and y position of non-sprite by " + Number(x) + "and " + Number(y) + " respectively");
    const xPos = Number(x) || 0;
    const yPos = Number(y) || 0;
    target.setXY(target.x + xPos, target.y + yPos, false);
    return null;
  }
  function degToRad(deg: number) {
    return deg * Math.PI / 180
  }
  function _moveSteps(target: any, steps: any, direction?: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot move a non-sprite by " + Number(steps) + " steps");
    const numOfSteps = Number(steps) || 0;
    const dir = direction ?? target.direction;
    const oldDir = target.direction;
    target.setDirection(Number(dir) || 0); // force dir to be a scratch direction
    const newDir = target.direction;
    target.setDirection(oldDir);
    // so newDir is the direction, and numOfSteps is the step count
    const radians = degToRad(newDir);
    const dx = steps * Math.cos(radians);
    const dy = steps * Math.sin(radians);
    target.setXY(target.x + dx, target.y + dy); // we're done!
  }
  function* setDirection(target: any, direction: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot set or change direction of a non-sprite");
    const dir = Number(direction) || 0;
    target.setDirection(dir);
    return null;
  }
  function* turnRight(target: any, direction: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot set or change direction of a non-sprite");
    const dir = Number(direction) || 0;
    return yield* setDirection(target, target.direction + dir)
  }
  function* turnLeft(target: any, direction: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot set or change direction of a non-sprite");
    const dir = Number(direction) || 0;
    return yield* setDirection(target, target.direction - dir)
  }
  function* moveSteps(target: any, steps: any, direction?: any) {
    _moveSteps(target, steps, direction);
    return null;
  }
  function* moveBackSteps(target: any, steps: any, direction?: any) {
    const numOfSteps = Number(steps) || 0;
    _moveSteps(target, 0 - numOfSteps, direction);
    return null;
  }
  function* moveUpSteps(target: any, steps: any, direction?: any) {
    let dir = direction ?? target.direction;
    dir = Number(dir) || 0
    const numOfSteps = Number(steps) || 0
    const oldDir = target.direction;
    target.setDirection(dir - 90);
    _moveSteps(target, 0 - numOfSteps);
    target.setDirection(oldDir);
    return null;
  }
  function* moveDownSteps(target: any, steps: any, direction?: any) {
    let dir = direction ?? target.direction;
    dir = Number(dir) || 0
    const numOfSteps = Number(steps) || 0
    const oldDir = target.direction;
    target.setDirection(dir - 90);
    _moveSteps(target, numOfSteps);
    target.setDirection(oldDir);
    return null;
  }
  // Motion-related global functions.
  _globalEnv.__env.set("setX", {
    get value() {return setX}
  })
  _globalEnv.__env.set("setY", {
    get value() {return setY}
  })
  _globalEnv.__env.set("setXY", {
    get value() {return setXY}
  })
  _globalEnv.__env.set("changeX", {
    get value() {return changeX}
  })
  _globalEnv.__env.set("changeY", {
    get value() {return changeY}
  })
  _globalEnv.__env.set("changeXY", {
    get value() {return changeXY}
  })
  _globalEnv.__env.set("moveSteps", {
    get value() {return moveSteps}
  })
  _globalEnv.__env.set("moveBackSteps", {
    get value() {return moveBackSteps}
  })
  _globalEnv.__env.set("moveUpSteps", {
    get value() {return moveUpSteps}
  })
  _globalEnv.__env.set("moveDownSteps", {
    get value() {return moveDownSteps}
  })
  _globalEnv.__env.set("setDirection", {
    get value() {return setDirection}
  })
  _globalEnv.__env.set("turnLeft", {
    get value() {return turnLeft}
  })
  _globalEnv.__env.set("turnRight", {
    get value() {return turnRight}
  })
  class PenguinScript {
    _globalEnv = _globalEnv;
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
            try {
              const tryCompile = JSON.parse(code.asString());
              preCompiled = preCompile(tryCompile, compiler.warpTimer, compiler.isWarp); // transpile at compile time to make it fast.
              compiler.source += preCompiled + ";"
            } catch(e) {
              compiler.source += `(yield* runtime.ext_vgspenguinscript.transpile(${code.asString()}, ${compiler.warpTimer}, ${compiler.isWarp})(runtime.ext_vgspenguinscript._globalEnv, target));`
            }
          },
          evalReporter: (node, compiler, imports) => {
            const code = compiler.descendInput(node.code);
            let preCompiled;
            try {
              const tryCompile = JSON.parse(code.asString());
              preCompiled = preCompile(tryCompile, compiler.warpTimer, compiler.isWarp); // transpile at compile time to make it fast.
              // compiler.src += preCompiled + ";"
              if (canNullish) return new (imports.TypedInput)(`(${preCompiled}) ?? "null"`);
              return new (imports.TypedInput)(`nullish((${preCompiled}),"null")`, imports.TYPE_UNKNOWN);
            } catch(e) {
              if (canNullish) return new (imports.TypedInput)(`(yield* runtime.ext_vgspenguinscript.transpile(${code.asString()}, ${compiler.warpTimer}, ${compiler.isWarp})())  ?? "null"`, imports.TYPE_UNKNOWN);
              return new (imports.TypedInput)(`nullish((yield* runtime.ext_vgspenguinscript.transpile(${code.asString()}, ${compiler.warpTimer}, ${compiler.isWarp})()),"null")`, imports.TYPE_UNKNOWN);
              // compiler.src += `(yield* transpile(${code.asString()}, ${compiler.warpTimer}, ${compiler.isWarp})(runtime.ext_vgspenguinscript._globalEnv, target));`
            }
          }
        }
      }
    }
    getInfo() {
      return {
        id: "vgspenguinscript",
        name: "PenguinScript",
        blocks: [
          {
            opcode: "evalStack",
            blockType: Scratch.BlockType.COMMAND,
            text: "evaluate [code]",
            func: "noComp",
            arguments: {
              code: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "let x = 5; x = 6 xor 5; global print<x>;"
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
                defaultValue: "return 69;"
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
  }
  Scratch.extensions.register(new PenguinScript());
}

module.exports = {
  Lexer,
  Parser,
  JSGenerator,
  default: transpile,
  transpile
}
          
