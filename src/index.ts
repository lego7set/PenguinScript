import Parser from "./parsing/parser";

import Lexer from "./parsing/lexer";

import JSGenerator, { _globalEnv } from "./transpile/jsGen";

import loader from "./runtime/loader";

import structsPackage, { customObjectTypes } from "./runtime/structs"; // move all this stuff into the runtime folder cuz its looking like a lot of code here. 

import debugPackage from "./runtime/debug";

import conversionsPackage from "./runtime/conversions";

function transpile(code: string, warpTimer: boolean, isWarp: boolean): any {
  const program = new Parser(code).produceAST();
  const generator = new JSGenerator(program);
  return generator.transpile("generator", true, warpTimer, isWarp)
}

loader.loadPackage(structsPackage); // load the package.

loader.loadPackage(conversionsPackage);

loader.loadPackage(debugPackage);

/*function preCompile(code: string, warpTimer: boolean, isWarp: boolean): any {
  const program = new Parser(code).produceAST();
  const generator = new JSGenerator(program);
  return "(yield* (function*($globalEnv, $target, isStuck){" + generator.transpile("string", true, warpTimer, isWarp) + "})(runtime.ext_vgspenguinscript._globalEnv, {isStuck, target, waitPromise}))";
}*/ // dont use precompile

function* exit(util, value: any) {
  throw {isExit: true, returnValue: value}; // exits
}

_globalEnv.__env.set("exit", {
  get value() {return exit}
})

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

function* join(util, str: any, str2: any) {
  return String(str ?? "null") + String(str2 ?? "null");
}


_globalEnv.__env.set("join", {
  get value() {return join}
})

_globalEnv.__env.set("concat", {
  get value() {return join}
})

function* repeatStr(util, str, times) {
  const times = Number(times) || 0;
  str = String(str ?? "null");
  return str.repeat(Math.floor(Math.abs(times)))
}

_globalEnv.__env.set("repeatString", {
  get value() {return repeatStr}
});

function* inStr(util, str1, str2) {
  str1 = String(str1 ?? "null");
  str2 = String(str2 ?? "null");
  return str1.includes(str2);
}

_globalEnv.__env.set("stringContains", {
  get value() {return inStr}
});

_globalEnv.__env.set("stringHas", {
  get value() {return inStr}
});

function* strLen(util, str) {
  str = String(str ?? "null");
  return str.length;
}

function* letterOf(util, str, index) {
  if (typeof index !== "number") throw new TypeError("Invalid letter position passed to letterOf");
  if (index < 1) throw new TypeError("Letter position must be larger than or equal to 1");
  str = String(str ?? "null");
  return str[Math.floor(Math.abs(index)) - 1]; // subtract 1 to mimic scratch behavior
}

function* lettersOf(util, str, index, index2) {
  if (typeof index !== "number") throw new TypeError("Invalid letter position passed to lettersOf");
  if (typeof index2 !== "number") throw new TypeError("Invalid letter position passed to lettersOf");
  if (index < 1) throw new TypeError("Letter position must be larger than or equal to 1");
  if (index2 < 1) throw new TypeError("Letter position must be larger than or equal to 1");
  str = String(str ?? "null");
  return str.substring(Math.floor(Math.abs(index)) - 1, Math.floor(Math.abs(index2))); // subtract 1 to mimic scratch behavior, and dont subtract 1 for the second one cuz the second one is EXclusive.
}

_globalEnv.__env.set("lengthOfString", {
  get value() {return strLen}
});

_globalEnv.__env.set("strLen", {
  get value() {return strLen}
});

_globalEnv.__env.set("letterOf", {
  get value() {return letterOf}
});

_globalEnv.__env.set("charAt", {
  get value() {return letterOf}
});

_globalEnv.__env.set("lettersOf", {
  get value() {return lettersOf}
});

_globalEnv.__env.set("substring", {
  get value() {return substring}
});

// NOTE TO SELF: CREATE SERIALIZATION FOLDER WITH MULTIPLE SERIALIZE / DESERIALIZE MODULES THAT WE IMPORT HERE AND IMPLEMENT THE MAIN SERIALIZATION CLASS WHICH ALSO ADDS CUSTOM SERIALIZEATION FOR SPRITES
_globalEnv.__env.set("Serialization", { // reserve global serialization so that people can serialize object, arrays, errors, complex objects, user-defined structs, and sprite (if used in pm)
    get value() {return null}
  })

function supportsNullishCoalescing() {
  try {
    return eval("true ?? 0")
  } catch(e) {
    return false
  }
}

const canNullish = supportsNullishCoalescing();

let Scratch: any;
// @ts-ignore
if ((typeof window === "object" && window && typeof window.document === "object" && typeof (Scratch = window.Scratch) === "object" && Scratch) || (typeof LoadedAsCore === "object" && LoadedAsCore !== globalThis.LoadedAsCore && (Scratch = LoadedAsCore))) {
  // Logic here
  if (!Scratch.extensions.isPenguinMod) throw "Please load PenguinScript in PenguinMod"; // i dnot need to explain tis
  function* getSprite(util, name: any) {
    if (typeof name !== "string") throw new TypeError("Attempted to get sprite with name, but name is not a string");
    return Scratch.vm.runtime.getSpriteTargetByName(name);
  }
  function* setX(util, target: any, x: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set x position of non-sprite to " + Number(x));
    const pos = Number(x) || 0;
    target.setXY(pos, target.y, false);
    return null;
  }
  function* setY(util, target: any, y: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set y position of non-sprite to " + Number(y));
    const pos = Number(y) || 0;
    target.setXY(target.x, pos, false);
    return null;
  }
  function* setXY(util, target: any, x: any, y: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set x and y position of non-sprite to " + Number(x) + "and " + Number(y) + " respectively");
    const xPos = Number(x) || 0;
    const yPos = Number(y) || 0;
    target.setXY(xPos, yPos, false);
    return null;
  }
  function* changeX(util, target: any, x: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to change x position of non-sprite by " + Number(x));
    const pos = Number(x) || 0;
    target.setXY(target.x + pos, target.y, false);
    return null;
  }
  function* changeY(util, target: any, y: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to change y position of non-sprite by " + Number(y));
    const pos = Number(y) || 0;
    target.setXY(target.x, target.y + pos, false);
    return null;
  }
  function* changeXY(util, target: any, x: any, y: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to change x and y position of non-sprite by " + Number(x) + "and " + Number(y) + " respectively");
    const xPos = Number(x) || 0;
    const yPos = Number(y) || 0;
    target.setXY(target.x + xPos, target.y + yPos, false);
    return null;
  }
  function* degToRad(util, deg: number) {
    return deg * Math.PI / 180;
  }
  function* radToDeg(util, rad: number) {
    return rad * 180 / Math.PI;
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
    const radians = degToRad(null, newDir).next().value;
    const dx = steps * Math.cos(radians);
    const dy = steps * Math.sin(radians);
    target.setXY(target.x + dx, target.y + dy); // we're done!
  }
  function* setDirection(util, target: any, direction: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot set or change direction of a non-sprite");
    const dir = Number(direction) || 0;
    target.setDirection(dir);
    return null;
  }
  function* turnRight(util, target: any, direction: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot set or change direction of a non-sprite");
    const dir = Number(direction) || 0;
    return yield* setDirection(util, target, target.direction + dir)
  }
  function* turnLeft(util, target: any, direction: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot set or change direction of a non-sprite");
    const dir = Number(direction) || 0;
    return yield* setDirection(util, target, target.direction - dir)
  }
  function* moveSteps(util, target: any, steps: any, direction?: any) {
    _moveSteps(target, steps, direction);
    return null;
  }
  function* moveBackSteps(util, target: any, steps: any, direction?: any) {
    const numOfSteps = Number(steps) || 0;
    _moveSteps(target, 0 - numOfSteps, direction);
    return null;
  }
  function* moveUpSteps(util, target: any, steps: any, direction?: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot move up non-sprite by " + Number(steps) + " steps");
    let dir = direction ?? target.direction;
    dir = Number(dir) || 0
    const numOfSteps = Number(steps) || 0
    const oldDir = target.direction;
    target.setDirection(dir - 90);
    _moveSteps(target, 0 - numOfSteps);
    target.setDirection(oldDir);
    return null;
  }
  function* moveDownSteps(util, target: any, steps: any, direction?: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot move down non-sprite by " + Number(steps) + " steps");
    let dir = direction ?? target.direction;
    dir = Number(dir) || 0
    const numOfSteps = Number(steps) || 0
    const oldDir = target.direction;
    target.setDirection(dir - 90);
    _moveSteps(target, numOfSteps);
    target.setDirection(oldDir);
    return null;
  }
  function* getX(util, target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get x position of non-sprite");
    return target.x;
  }
  function* getY(util, target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get y position of non-sprite");
    return target.y;
  }
  function* getDirection(util, target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get direction of non-sprite");
    return target.direction;
  }
  
  function* say(util, target: any, text: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot make a non-sprite say something");
    const msg = String(text ?? "null");
    Scratch.vm.runtime.emit("SAY", target, 'say', msg);
    return null;
  }
  function* think(util, target: any, text: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot make a non-sprite think something");
    const msg = String(text ?? "null");
    Scratch.vm.runtime.emit("SAY", target, 'think', msg);
    return null;
  }
  function* setSize(util, target: any, size: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot set size of non-sprite");
    const newSize = Math.max((Number(size) || 0), 0);
    target.setSize(newSize);
    return null;
  }
  function* setVisible(util, target: any, visible: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot set visibility of non-sprite");
    const visibility = (visible ?? false) === false;
    target.setVisible(visibility);
    return null;
  }
  function* getSize(util, target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get size of non-sprite");
    return target.size
  }
  function* getVisible(util, target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get visibility of non-sprite");
    return target.visible;
  }
  function* setXStretch(util, target: any, x: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set x stretch of non-sprite to " + Number(x));
    const pos = Number(x) || 0;
    target.setStretch(pos, target.stretch[1]);
    return null;
  }
  function* setYStretch(util, target: any, y: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set y stretch of non-sprite to " + Number(y));
    const pos = Number(y) || 0;
    target.setStretch(target.stretch[0], pos);
    return null;
  }
  function* setXYStretch(util, target: any, x: any, y: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set x and y stretch of non-sprite to " + Number(x) + "and " + Number(y) + " respectively");
    const xPos = Number(x) || 0;
    const yPos = Number(y) || 0;
    target.setStretch(xPos, yPos);
    return null;
  }
  function* changeXStretch(util, target: any, x: any) {
    // @ts-ignore
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to change x stretch of non-sprite by " + Number(x));
    const pos = Number(x) || 0;
    target.setXY(target.stretch[0] + pos, target.stretch[1]);
    return null;
  }
  function* changeYStretch(util, target: any, y: any) {
    // @ts-ignore
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to change y stretch of non-sprite by " + Number(y));
    const pos = Number(y) || 0;
    target.setXY(target.stretch[0], target.stretch[1] + pos);
    return null;
  }
  function* changeXYStretch(util, target: any, x: any, y: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to change x and y stretch of non-sprite by " + Number(x) + "and " + Number(y) + " respectively");
    const xPos = Number(x) || 0;
    const yPos = Number(y) || 0;
    target.setXY(target.stretch[0] + xPos, target.stretch[1] + yPos);
    return null;
  }
  function* setCostume(util, target: any, index: any) {
    if (typeof index !== "string" && typeof index !== "number") throw new TypeError("Expected costume index to be a string or number");
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set costume of a non-sprite");
    const requestedCostume = index;
     if (typeof requestedCostume === 'number') { // i love copy paste
        // Numbers should be treated as costume indices, always
        target.setCostume(requestedCostume - 1);
      } else {
        // Strings should be treated as costume names, where possible
        const costumeIndex = target.getCostumeIndexByName(requestedCostume.toString());

        if (costumeIndex !== -1) {
           target.setCostume(costumeIndex);
        } /*else if (requestedCostume === 'next costume') {
            target.setCostume(target.currentCostume + 1);
        } else if (requestedCostume === 'previous costume') {
            target.setCostume(target.currentCostume - 1);
        // Try to cast the string to a number (and treat it as a costume index)
        // Pure whitespace should not be treated as a number
        // Note: isNaN will cast the string to a number before checking if it's NaN
        }*/ else if (!(isNaN(Number(requestedCostume)) || Scratch.Cast.isWhiteSpace(requestedCostume))) {
            target.setCostume(Number(requestedCostume) - 1);
        }
    }
    return null;
  }
  function* nextCostume(util, target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set costume of a non-sprite");
    target.setCostume(target.currentCostume + 1);
    return null;
  }
  function* previousCostume(util, target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set costume of a non-sprite");
    target.setCostume(target.currentCostume - 1);
    return null;
  }
  function* setBackdrop(util, index: any) {
    const target = Scratch.vm.runtime.getTargetForStage();
    if (typeof index !== "string" && typeof index !== "number") throw new TypeError("Expected costume index to be a string or number");
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set costume of a non-sprite");
    const requestedCostume = index;
     if (typeof requestedCostume === 'number') { // i love copy paste
        // Numbers should be treated as costume indices, always
        target.setCostume(requestedCostume - 1);
      } else {
        // Strings should be treated as costume names, where possible
        const costumeIndex = target.getCostumeIndexByName(requestedCostume.toString());

        if (costumeIndex !== -1) {
           target.setCostume(costumeIndex);
        } /*else if (requestedCostume === 'next costume') {
            target.setCostume(target.currentCostume + 1);
        } else if (requestedCostume === 'previous costume') {
            target.setCostume(target.currentCostume - 1);
        // Try to cast the string to a number (and treat it as a costume index)
        // Pure whitespace should not be treated as a number
        // Note: isNaN will cast the string to a number before checking if it's NaN
        }*/ else if (!(isNaN(Number(requestedCostume)) || Scratch.Cast.isWhiteSpace(requestedCostume))) {
            target.setCostume(Number(requestedCostume) - 1);
        }
    }
    return null;
  }
  function* nextBackdrop() {
    const target = Scratch.vm.runtime.getTargetForStage();
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set costume of a non-sprite");
    target.setCostume(target.currentCostume + 1);
    return null;
  }
  function* previousBackdrop() {
    const target = Scratch.vm.runtime.getTargetForStage();
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set costume of a non-sprite");
    target.setCostume(target.currentCostume - 1);
    return null;
  }
  function* getCostumeName(util, sprite) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to get current costume name of non-sprite");
    return sprite.getCostumes()[sprite.currentCostume].name;
  }
  function* getCostumeNumber(util, sprite) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to get current costume number of non-sprite");
    return sprite.currentCostume + 1;
  }
  function* getBackdropName() {
    const sprite = Scratch.vm.runtime.getTargetForStage();
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to get current costume name of non-sprite");
    return sprite.getCostumes()[sprite.currentCostume].name;
  }
  function* getBackdropNumber() {
    const sprite = Scratch.vm.runtime.getTargetForStage();
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to get current costume number of non-sprite");
    return sprite.currentCostume + 1;
  }
  // Looks-related global functions.
  _globalEnv.__env.set("getCostumeName", {
    get value() {return getCostumeName}
  })
  _globalEnv.__env.set("getCostumeNumber", {
    get value() {return getCostumeNumber}
  })
  _globalEnv.__env.set("getBackdropName", {
    get value() {return getBackdropName}
  })
  _globalEnv.__env.set("getBackdropNumber", {
    get value() {return getBackdropNumber}
  })
  _globalEnv.__env.set("setCostume", {
    get value() {return setCostume}
  })
  _globalEnv.__env.set("nextCostume", {
    get value() {return nextCostume}
  })
  _globalEnv.__env.set("previousCostume", {
    get value() {return previousCostume}
  })
  _globalEnv.__env.set("setBackdrop", {
    get value() {return setBackdrop}
  })
  _globalEnv.__env.set("nextBackdrop", {
    get value() {return nextBackdrop}
  })
  _globalEnv.__env.set("previousBackdrop", {
    get value() {return previousBackdrop}
  })
  _globalEnv.__env.set("say", {
    get value() {return say}
  })
  _globalEnv.__env.set("think", {
    get value() {return think}
  })
  _globalEnv.__env.set("setSize", {
    get value() {return setSize}
  })
  _globalEnv.__env.set("setVisible", {
    get value() {return setVisible}
  })
  _globalEnv.__env.set("getSize", {
    get value() {return getSize}
  })
  _globalEnv.__env.set("getVisible", {
    get value() {return getVisible}
  })
  _globalEnv.__env.set("setXStretch", {
    get value() {return setXStretch}
  })
  _globalEnv.__env.set("setYStretch", {
    get value() {return setYStretch}
  })
  _globalEnv.__env.set("setXYStretch", {
    get value() {return setXYStretch}
  })
  _globalEnv.__env.set("changeXStretch", {
    get value() {return changeXStretch}
  })
  _globalEnv.__env.set("changeYStretch", {
    get value() {return changeYStretch}
  })
  _globalEnv.__env.set("changeXYStretch", {
    get value() {return changeXYStretch}
  })
  function* getXStretch(util, target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get x stretch of non-sprite")
    return target.stretch[0]
  }
  function* getYStretch(util, target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get y stretch of non-sprite")
    return target.stretch[1]
  }
  _globalEnv.__env.set("getXStretch", {
    get value() {return getXStretch}
  })
  _globalEnv.__env.set("getYStretch", {
    get value() {return getYStretch}
  })
  // Scratch-related global functions.
  _globalEnv.__env.set("getSprite", {
    get value() {return getSprite}
  })
  // Motion-related global functions.
  _globalEnv.__env.set("getX", {
    get value() {return getX}
  })
  _globalEnv.__env.set("getY", {
    get value() {return getY}
  })
  _globalEnv.__env.set("getDirection", {
    get value() {return getDirection}
  })
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
  _globalEnv.__env.set("degToRad", {
    get value() {return degToRad}
  })
  _globalEnv.__env.set("radToDeg", {
    get value() {return radToDeg}
  })
  function* getVariableForTarget(util, target: any, name: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get variable for a non-sprite");
    return target.lookupVariableByNameAndType(name ?? "null", "", true)?.value ?? null;
  }
  function* setVariableForTarget(util, target: any, name: any, value: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get variable for a non-sprite");
    const variable = target.lookupVariableByNameAndType(name ?? "null", "", true);
    if (variable) {
      return variable.value = String(value ?? "null") // force into string because there can be some weird things like setting a variable to a sprite.
    }
    return null;
  }
  function* getVariableForAll(util, name: any) {
    const target = Scratch.vm.runtime.getTargetForStage();
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get variable for a non-sprite");
    return target.lookupVariableByNameAndType(name ?? "null", "", true)?.value ?? null;
  }
  function* setVariableForAll(util, name: any, value: any) {
    const target = Scratch.vm.runtime.getTargetForStage();
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get variable for a non-sprite");
    const variable = target.lookupVariableByNameAndType(name ?? "null", "", true);
    if (variable) {
      return variable.value = String(value ?? "null") // force into string because there can be some weird things like setting a variable to a sprite.
    }
    return null;
  }

  _globalEnv.__env.set("getVariableForSprite", {
    get value() {return getVariableForTarget}
  })
  _globalEnv.__env.set("setVariableForSprite", {
    get value() {return setVariableForTarget}
  })
  _globalEnv.__env.set("getVariableForAllSprites", {
    get value() {return getVariableForAll}
  })
  _globalEnv.__env.set("setVariableForAllSprites", {
    get value() {return setVariableForAll}
  })

  function* broadcast(util, message: any) {
    const msg = String(message ?? "null");
    Scratch.vm.runtime.startHats("event_whenbroadcastreceived", {
      BROADCAST_OPTION: msg
    });
    return null
  }

  function* broadcastToSprite(util, message: any, target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot broadcast to a non-sprite")
    const msg = String(message ?? "null");
    Scratch.vm.runtime.startHats("event_whenbroadcastreceived", {
      BROADCAST_OPTION: msg
    }, target);
    return null
  }

  function* broadcastAndWait(util, message: any) {
    const msg = String(message ?? "null");
    const started = Scratch.vm.runtime.startHats("event_whenbroadcastreceived", {
      BROADCAST_OPTION: msg
    });
    while (yield* wait(util, 15) && started.some(thread => Scratch.vm.runtime.threads.indexOf(thread) !== -1)) { // prevent freezing.
      if (!util.isWarp || util.isStuck()) yield;
    }
    return null
  }

  function* broadcastToSpriteAndWait(util, message: any, target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot broadcast to a non-sprite")
    const msg = String(message ?? "null");
    const started = Scratch.vm.runtime.startHats("event_whenbroadcastreceived", {
      BROADCAST_OPTION: msg
    }, target);
    while (yield* wait(util, 15) && started.some(thread => Scratch.vm.runtime.threads.indexOf(thread) !== -1)) { // prevent freezing.
      if (!util.isWarp || util.isStuck()) yield;
    }
    return null
  }
  
  function* isSprite(util, value: any) {
    return value instanceof Scratch.vm.exports.RenderedTarget;
  }

  _globalEnv.__env.set("broadcast", {
    get value() {return broadcast}
  })

  _globalEnv.__env.set("broadcastToSprite", {
    get value() {return broadcastToSprite}
  })

  _globalEnv.__env.set("broadcastAndWait", {
    get value() {return broadcastAndWait}
  })

  _globalEnv.__env.set("broadcastToSpriteAndWait", {
    get value() {return broadcastToSpriteAndWait}
  })

  _globalEnv.__env.set("isSprite", {
    get value() {return isSprite}
  })

  // clones, touching, mouse, keyboard

  function* isTouchingSprite(util, sprite1, sprite2) {
    if (!(sprite1 instanceof Scratch.vm.exports.RenderedTarget) || !(sprite2 instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Both sprites for isTouchingSprite must be sprites");
    if (!Scratch.vm.renderer) return false;
    return Scratch.vm.renderer.isTouchingDrawables(sprite1.drawableID, [sprite2.drawableID]); // check if sprite1 is touching sprite2
  }

  function* isTouchingColor(util, sprite, color) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot check if non-sprite is touching color");
    if (!color.isColor) throw new TypeError("Please pass a color into isTouchingColor")
    if (!Scratch.vm.renderer) return false;
    return sprite.isTouchingColor([color.props.r.value, color.props.g.value, color.props.b.value]);
  }

  function* isColorTouchingColor(util, sprite, color1, color2) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot check if non-sprite's color is touching color");
    if (!color1.isColor || !color2.isColor) throw new TypeError("Please pass two colors into isColorTouchingColor")
    if (!Scratch.vm.renderer) return false;
    return sprite.colorIsTouchingColor([color2.props.r.value, color2.props.g.value, color2.props.b.value], [color1.props.r.value, color1.props.g.value, color1.props.b.value]);
  }

  function* isTouchingMouse(util, sprite) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot check if a non-sprite is touching the mouse");
    if (!Scratch.vm.renderer) return false;
    const mouse = Scratch.vm.runtime.ioDevices.mouse;
    if (!mouse) return false;
    return Scratch.vm.renderer.drawableTouching(sprite.drawableID, mouse.getClientX(), mouse.getClientY());
  }

  function* isTouchingXY(util, sprite, x, y) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot check if a non-sprite is touching a point");
    if (!Scratch.vm.renderer) return false;
    return Scratch.vm.renderer.drawableTouching(sprite.drawableID, Number(x) || 0, Number(y) || 0);
  }

  function* isTouchingEdge(util, sprite) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot check if a non-sprite is touching the edge");
    return sprite.isTouchingEdge();
  }

  _globalEnv.__env.set("isTouchingSprite", {
    get value() {return isTouchingSprite}
  })

  _globalEnv.__env.set("isTouchingMouse", {
    get value() {return isTouchingMouse}
  })

  _globalEnv.__env.set("isTouchingColor", {
    get value() {return isTouchingColor}
  })

  _globalEnv.__env.set("isTouchingColour", {
    get value() {return isTouchingColor}
  })

  _globalEnv.__env.set("isColorTouchingColor", {
    get value() {return isColorTouchingColor}
  })

  _globalEnv.__env.set("isColourTouchingColour", {
    get value() {return isColorTouchingColor}
  })
  
  _globalEnv.__env.set("isTouchingXY", {
    get value() {return isTouchingXY}
  })
  
  _globalEnv.__env.set("isTouchingEdge", {
    get value() {return isTouchingEdge}
  })

  function mouseDown() {
    if (!Scratch.vm.runtime.ioDevices.mouse) return false;
    return Scratch.vm.runtime.ioDevices.mouse.getIsDown();
  }

  function mouseClicked() {
    if (!Scratch.vm.runtime.ioDevices.mouse) return false;
    return Scratch.vm.runtime.ioDevices.mouse.getIsClicked();
  }

  _globalEnv.__env.set("mouseDown", {
    get value() {return mouseDown()}
  })
  
  _globalEnv.__env.set("mouseClicked", {
    get value() {return mouseClicked()}
  })

  _globalEnv.__env.set("mouseX", {
    get value() {
      if (!Scratch.vm.runtime.ioDevices.mouse) return 0;
      return Scratch.vm.runtime.ioevices.mouse.getScratchX();
    }
  })

  _globalEnv.__env.set("mouseY", {
    get value() {
      if (!Scratch.vm.runtime.ioDevices.mouse) return 0;
      return Scratch.vm.runtime.ioevices.mouse.getScratchY();
    }
  })

  function* isKeyDown(util, key) {
    if (!Scratch.vm.runtime.ioDevices.keyboard) return false;
    return Scratch.vm.runtime.ioDevices.keyboard.getKeyIsDown(key);
  }

  function* isKeyHit(util, key) {
    if (!Scratch.vm.runtime.ioDevices.keyboard) return false;
    return Scratch.vm.runtime.ioDevices.keyboard.getKeyIsHit(key);
  }

  _globalEnv.__env.set("isKeyDown", {
    get value() {return isKeyDown}
  })
  
  _globalEnv.__env.set("isKeyHit", {
    get value() {return isKeyHit}
  })

  function* createClone(util, sprite) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot create clone of a non-sprite");
    const clone = sprite.makeClone();
    if (clone) {
      Scratch.vm.runtime.addTarget(clone);
      clone.goBehindOther(sprite);
    }
    return clone;
  }

  function* getCloneWithVar(util, spriteOrName, varName, value) {
    let sprite = spriteOrName;
    if (typeof spriteOrName === "string") sprite = Scratch.vm.runtime.getSpriteTargetByName(spriteOrName);
    if (!(spriteOrName instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("The sprite passed to getCloneWithVar is not a sprite name or sprite");
    const clones = sprite.sprite.clones;
    // i stole this from clones plus, its not my code.
    for (let index = 1; index < clones.length; index++) {
        const cloneVar = clones[index].lookupVariableByNameAndType(varName, "", true);
        if (
          cloneVar &&
          Scratch.Cast.compare(cloneVar.value, value) === 0
        ) {
          return clones[index];
        }
      }
      return null;
  }

  _globalEnv.__env.set("createClone", {
    get value() {return createClone}
  })
  
  _globalEnv.__env.set("getCloneWithVar", {
    get value() {return getCloneWithVar}
  })

  // waiting functions

  function* wait({timer, isStuck, isWarp}, ms) {
    if (typeof ms !== "number" || Object.is(ms, NaN)) throw new TypeError("ms in global wait must be a number (and not NaN).");
    ms = Math.max(0, ms);
    const waitTimer = new timer();
    waitTimer.start(); // start timer
    while (waitTimer.timeElapsed() < ms) {
      if (!isWarp || isStuck()) yield; // yield so thingy doesnt freeze
    }
    return true; // so that you can do while global wait(10) doSomething
  }

  function* waitUntil(util, conditionFunction, ...argFuncs) {
    if (typeof conditionFunction !== "function") throw new TypeError("The first arg to global waitUntil must be a function.");
    for (const func of argFuncs) if (typeof func !== "function") throw new TypeError("All args after the first arg must be functions");
    while (yield* wait(util, 4)) { // prevent freezing
      // evaluate args.
      const args = argFuncs.map(func => func(util)); // i almost forgor that all funcs take in the util object.
      if ((conditionFunction(util, ...args) ?? false) === false) break;
    }
    return true; // why would i return false if the condition is true?
  }

  _globalEnv.__env.set("wait", {
    get value() {return wait}
  })

  _globalEnv.__env.set("waitUntil", {
    get value() {return waitUntil}
  })

  let startApplicationTime = self.performance.now();
  function* applicationTime() { // time since green flag clicked in milliseconds.
    return self.performance.now() - startApplicationTime;
  }

  _globalEnv.__env.set("applicationTime", {
    get value() {return applicationTime}
  })

  _globalEnv.__env.set("timeSinceBlueFlag", { // i was gonna put green flag but its pm
    get value() {return applicationTime}
  })

  Scratch.vm.runtime.on("PROJECT_START", () => startApplicationTime = self.performance.now());

  const soundsCategory = Scratch.vm.runtime.ext_scratch3_sound;
  function* playSound(util, sprite, sound, seconds) { // lol theres a target prop on util, but we cant use that cuz no
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot play sound from a non-sprite");
    if (typeof sound !== "string" && typeof sound !== "number") throw new TypeError("Sound must be a string or number index");
    if (typeof seconds !== "number") seconds = Number(seconds) || 0;
    soundsCategory._playSoundAtTimePosition({
      sound: Scratch.Cast.toString(sound),
      seconds
    }, {target: sprite}, true); // dont wait for the promise.
  }

  function* playSoundAndWait(util, sprite, sound, seconds) { // lol theres a target prop on util, but we cant use that cuz no
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot play sound from a non-sprite");
    if (typeof sound !== "string" && typeof sound !== "number") throw new TypeError("Sound must be a string or number index");
    if (typeof seconds !== "number") seconds = Number(seconds) || 0;
    yield* util.waitPromise(soundsCategory._playSoundAtTimePosition({
      sound: Scratch.Cast.toString(sound),
      seconds
    }, {target: sprite}, true)); // do wait for the promise.
  }

  function* playAllSounds(util, target) { // im not using that weird function on the sound category.
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot play all sounds from a non-sprite");
    const sprite = target.sprite;
    if (!sprite) return null;
    for (let i = 0; i < sprite.sounds.length; i++) {
      const { soundId } = sprite.sounds[i];
      if (sprite.soundBank) {
        sprite.soundBank.playSound(target, soundId);
        soundsCategory._addWaitingSound(target.id, soundId);
      }
    }
  }

  function* playAllSoundsAndWait(util, target) { // im not using that weird function on the sound category.
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot play all sounds from a non-sprite");
    const sprite = target.sprite;
    if (!sprite) return null;
    const playedSounds = [];
    for (let i = 0; i < sprite.sounds.length; i++) {
      const { soundId } = sprite.sounds[i];
      if (sprite.soundBank) {
        playedSounds.push(sprite.soundBank.playSound(target, soundId));
        soundsCategory._addWaitingSound(target.id, soundId);
      }
    }
    yield* util.waitPromise(Promise.all(playedSounds))
  }

  function* stopSound(util, sprite, sound) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot stop sound from a non-sprite");
    if (typeof sound !== "string" && typeof sound !== "number") throw new TypeError("Sound must be a string or number index");
    soundsCategory.stopSpecificSound({
      SOUND_MENU: sound
    }, {
      target: sprite
    })
  }

  function* stopAllSoundsForSprite(util, sprite) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot stop all sound from a non-sprite");
    soundsCategory._stopAllSoundsForTarget(sprite);
  }

  function* stopAllSounds(util) {
    soundsCategory.stopAllSounds();
  }

  function* setFadeout(util, sprite, sound, fadeout) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot set fadeout of a sound from a non-sprite");
    if (typeof sound !== "string" && typeof sound !== "number") throw new TypeError("Sound must be a string or number index");
    fadeout = Number(fadeout) || 0;
    soundsCategory.setStopFadeout({
      SOUND_MENU: sound,
      VALUE: fadeout
    }, {
      target: sprite
    });
  }

  _globalEnv.__env.set("playSound", {
    get value() {return playSound}
  })

  _globalEnv.__env.set("stopSound", {
    get value() {return stopSound}
  })

  _globalEnv.__env.set("stopAllSoundsForSprite", {
    get value() {return stopAllSoundsForSprite}
  })

  _globalEnv.__env.set("stopAllSounds", {
    get value() {return stopAllSounds}
  })

  _globalEnv.__env.set("playSoundAndWait", {
    get value() {return playSoundAndWait}
  })


  _globalEnv.__env.set("playAllSounds", {
    get value() {return playAllSounds}
  })

  _globalEnv.__env.set("playAllSoundsAndWait", {
    get value() {return playAllSoundsAndWait}
  })

  _globalEnv.__env.set("setFadeout", {
    get value() {return setFadeout}
  })

  function* setTempVar(util, name, v) {
    return util.tempVars[String(name)] = v;
  }

  function* getTempVar(util, name, v) {
    return util.tempVars[String(name)];
  }

  function* tempVarExists(util, name, v) {
    return !!util.tempVars[String(name)]; // this is literally what the pm compiler uses
  }

  _globalEnv.__env.set("setTempVar", {
    get value() {return setTempVar}
  })
  _globalEnv.__env.set("getTempVar", {
    get value() {return setTempVar}
  })
  _globalEnv.__env.set("tempVarExists", {
    get value() {return tempVarExists}
  })

  function* ask(util, sprite, toAsk) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot ask something as a non-sprite")
    let result: string = "";
    yield* util.waitPromise(async function(){
      await Scratch.vm.runtime.ext_scratch3_sensing.askAndWait({
        QUESTION: String(toAsk ?? "null")
      }, {target: sprite});
      result = Scratch.vm.runtime.ext_scratch3.sensing._answer;
      return result; // the return value here is unused but whatever
    }());
    return result;
  }

  _globalEnv.__env.set("ask", {
    get value() {return ask}
  })

  _globalEnv.__env.set("askAndWait", {
    get value() {return ask}
  })

  customObjectTypes.sprite = (v: any) => v instanceof Scratch.vm.exports.RenderedTarget; // create a sprite type.
  
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
      *negate(a) {
        if (a && a.isComplex && a.isStruct) return yield* this.createComplex(this, new Complex(a.props.re.value, a.props.im.value).neg()); // im too lazy to create a new method or check if one already exists
        return -Number(a);
      },
      *lt(a, b) {
        if (a && a.isComplex && a.isStruct) return false;
        if (b && b.isComplex && b.isStruct) return false;
        return Number(a) < Number(b)
      },
      *le(a, b) {
        if (a && a.isComplex && a.isStruct) return false;
        if (b && b.isComplex && b.isStruct) return false;
        return Number(a) <= Number(b)
      },
      *gt(a, b) {
        if (a && a.isComplex && a.isStruct) return false;
        if (b && b.isComplex && b.isStruct) return false;
        return Number(a) > Number(b)
      },
      *ge(a, b) {
        if (a && a.isComplex && a.isStruct) return false;
        if (b && b.isComplex && b.isStruct) return false;
        return Number(a) >= Number(b)
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
        return Number(a) + Number(b)
      },
      *subtract(a, b) {
        if (a && a.isComplex && a.isStruct && (yield* a.props.__isCompatible__.value(this, b))) return yield* a.props.__subtract__.value(this, b);
        if (b && b.isComplex && b.isStruct && (yield* b.props.__isCompatible__.value(this, a))) return yield* b.props.__subtract__.value(this, a);
        //if (a.isStruct && typeof a.props.__subtract__ === "function" && typeof a.props.__isCompatible__ === "function" && a.props.__isCompatible__(this, b)) yield* return a.props.__subtract__(this, b);
        //if (b.isStruct && typeof b.props.__subtract__ === "function" && typeof b.props.__isCompatible__ === "function" && b.props.__isCompatible__(this, a)) yield* return a.props.__subtract__(this, b);
        return Number(a) - Number(b)
      },
      *multiply(a, b) {
        if (a && a.isComplex && a.isStruct && (yield* a.props.__isCompatible__.value(this, b))) return yield* a.props.__multiply__.value(this, b);
        if (b && b.isComplex && b.isStruct && (yield* b.props.__isCompatible__.value(this, a))) return yield* b.props.__multiply__.value(this, a);
        //if (a.isStruct && typeof a.props.__multiply__ === "function" && typeof a.props.__isCompatible__ === "function" && a.props.__isCompatible__(this, b)) yield* return a.props.__multiply__(this, b);
        //if (b.isStruct && typeof b.props.__multiply__ === "function" && typeof b.props.__isCompatible__ === "function" && b.props.__isCompatible__(this, a)) yield* return a.props.__multiply__(this, b);
        return Number(a) * Number(b)
      },
      *divide(a, b) {
        if (a && a.isComplex && a.isStruct && (yield* a.props.__isCompatible__.value(this, b))) return yield* a.props.__divide__.value(this, b);
        if (b && b.isComplex && b.isStruct && (yield* b.props.__isCompatible__.value(this, a))) return yield* b.props.__divide__.value(this, a);
        //if (a.isStruct && typeof a.props.__divide__ === "function" && typeof a.props.__isCompatible__ === "function" && a.props.__isCompatible__(this, b)) return yield* a.props.__divide__(this, b);
        // if (b.isStruct && typeof b.props.__divide__ === "function" && typeof b.props.__isCompatible__ === "function" && b.props.__isCompatible__(this, a)) return yield* a.props.__divide__(this, b);
        return Number(a) / Number(b)
      },
      *mod(a, b) {
        if ((a && a.isComplex) || (b && b.isComplex)) throw new TypeError("Complex operation not implemented")
        // this is basically the code from the pm vm
        const n = Number(a);
        const modulus = Number(b);
        let result = n % modulus;
        if (result / modulus < 0) result += modulus;
        return result; 
      },
      *power(a, b) {
        if (a && a.isComplex && a.isStruct && (yield* a.props.__isCompatible__.value(this, b))) return yield* a.props.__power__.value(this, b);
        if (b && b.isComplex && b.isStruct && (yield* b.props.__isCompatible__.value(this, a))) return yield* b.props.__power__.value(this, a);
        //if (a.isStruct && typeof a.props.__power__ === "function" && typeof a.props.__isCompatible__ === "function" && a.props.__isCompatible__(this, b)) return yield* a.props.__power__(this, b);
        //if (b.isStruct && typeof b.props.__power__ === "function" && typeof b.props.__isCompatible__ === "function" && b.props.__isCompatible__(this, a)) return yield* a.props.__power__(this, b);
        return Number(a) ** Number(b)
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
    Lexer,
    Parser,
    JSGenerator,
    transpile,
    default: transpile
  }
}
          
