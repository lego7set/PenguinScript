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
  return "(yield* (function*($globalEnv, $target, isStuck){" + generator.transpile("string", true, warpTimer, isWarp) + "})(runtime.ext_vgspenguinscript._globalEnv, {isStuck, target}))";
}

function* createObjectStruct() {
  const struct: {__proto__: null; isStruct: true; props:any; isObject: true} = {__proto__: null, isStruct: true, props:{__proto__:null},isObject:true};
  const props: any = {__proto__: null};
  struct.props.get = function*(key){ // an object class, kinda
    return props[key];
  }
  struct.props.set = {value:function*(key, value) {
    return props[key] = value;
  }}
  struct.props.has = {value:function*(key) {
    return key in props
  }}
  struct.props.delete = {value:function*(key) {
    return delete props[key];
  }}
  struct.props.remove = {value:function*(key) {
    delete props[key];
    return struct;
  }}
  struct.props.append = {value:function*(key, value) {
    props[key] = value;
    return struct;
  }}
  return struct;
}

_globalEnv.__env.set("Object", {
  get value() {return createObjectStruct}
})

function* createArrayStruct() {
  const struct: {__proto__: null; isStruct: true; props: any; isArray: true} = {__proto__: null, isStruct: true, props:{__proto__:null},isArray:true};
  const props = [];
  struct.props.get = function*(key){
    if (typeof key !== "number") throw new TypeError("Key to array must be a number.");
    return props[key];
  }
  struct.props.set = {value:function*(key, value) {
    if (typeof key !== "number") throw new TypeError("Key to array must be a number.");
    return props[key] = value;
  }}
  struct.props.has = {value:function*(key) {
    if (typeof key !== "number") throw new TypeError("Key to array must be a number.");
    return key in props
  }}
  struct.props.delete = {value:function*(key) {
    if (typeof key !== "number") throw new TypeError("Key to array must be a number.");
    return delete props[key];
  }}
  struct.props.pop = {value:function*() {
    return props.pop();
  }}
  struct.props.push = {value:function*(value) {
    props.push(value);
    return struct;
  }}
  struct.props.shift = {value:function*(){
    return props.shift();
  }}
  struct.props.unshift = {value:function*(value){
    props.unshift(value);
    return struct;
  }}
  struct.props.length = {
    get value() {return props.length;},
    set value(val) {props.length = val;}
  }
  return struct;
}

_globalEnv.__env.set("Array", {
  get value() {return createArrayStruct}
})

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

function* convertToString(value: any) {
  return String(value);
}
function* convertToNumber(value: any) {
  return Number(value);
}
function* convertToBoolean(value: any) {
  return Boolean(value);
}

function* charFromCodePoint(value: any) {
  return String.fromCodePoint(Number(value) || 0)
}

function* charToCodePoint(value: any) {
  if (typeof value !== "string") throw new TypeError("Please pass in a string to charToCodePoint")
  return value.codePointAt(0) ?? null;
}

_globalEnv.__env.set("toString", {
  get value() {return convertToString}
})

_globalEnv.__env.set("toNumber", {
  get value() {return convertToNumber}
})

_globalEnv.__env.set("toBoolean", {
  get value() {return convertToBoolean}
})

_globalEnv.__env.set("charFromCodePoint", {
  get value() {return charFromCodePoint}
})

_globalEnv.__env.set("charToCodePoint", {
  get value() {return charToCodePoint}
})

function* type(value: any) {
  return typeof value;
}

_globalEnv.__env.set("typeof", {
  get value() {return type}
})

function* exit(value: any) {
  throw {isExit: true, returnValue: value}; // exits
}

_globalEnv.__env.set("exit", {
  get value() {return exit}
})

function* getMathForPS(name: any) {
  if (typeof name !== "string") throw new TypeError("Expected math item to a string");
  if (!Object.hasOwn(Math, name)) throw new TypeError("Invalid math item");
  const item = Math[name];
  if (typeof item === "function") return function*(...args){return item(...args);}
  return Math[name];
}

_globalEnv.__env.set("getMath", {
  get value() {return getMathForPS}
})

function* join(str: any, str2: any) {
  return String(str) + String(str2);
}


_globalEnv.__env.set("join", {
  get value() {return join}
})

_globalEnv.__env.set("concat", {
  get value() {return join}
})

function* createMethod(struct, storedFunc) {
  if (!struct.isStruct) throw new TypeError()
  return function*(...args) {
    return yield*(storedFunc)(struct, ...args);
  };
};

_globalEnv.__env.set("createMethod", {
  get value() {return createMethod}
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
  function* getSprite(name: any) {
    if (typeof name !== "string") throw new TypeError("Attempted to get sprite with name, but name is not a string");
    return Scratch.vm.runtime.getSpriteTargetByName(name);
  }
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
  function* degToRad(deg: number) {
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
    const radians = degToRad(newDir).next().value;
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
  function* moveDownSteps(target: any, steps: any, direction?: any) {
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
  function* getX(target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get x position of non-sprite");
    return target.x;
  }
  function* getY(target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get y position of non-sprite");
    return target.y;
  }
  function* getDirection(target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get direction of non-sprite");
    return target.direction;
  }
  
  function* say(target: any, text: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot make a non-sprite say something");
    const msg = String(text);
    Scratch.vm.runtime.emit("SAY", target, 'say', msg);
    return null;
  }
  function* think(target: any, text: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot make a non-sprite think something");
    const msg = String(text);
    Scratch.vm.runtime.emit("SAY", target, 'think', msg);
    return null;
  }
  function* setSize(target: any, size: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot set size of non-sprite");
    const newSize = Math.max((Number(size) || 0), 0);
    target.setSize(newSize);
    return null;
  }
  function* setVisible(target: any, visible: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot set visibility of non-sprite");
    const visibility = (visible ?? false) === false;
    target.setVisible(visibility);
    return null;
  }
  function* getSize(target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get size of non-sprite");
    return target.size
  }
  function* getVisible(target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get visibility of non-sprite");
    return target.visible;
  }
  function* setXStretch(target: any, x: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set x stretch of non-sprite to " + Number(x));
    const pos = Number(x) || 0;
    target.setStretch(pos, target.stretch[1]);
    return null;
  }
  function* setYStretch(target: any, y: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set y stretch of non-sprite to " + Number(y));
    const pos = Number(y) || 0;
    target.setStretch(target.stretch[0], pos);
    return null;
  }
  function* setXYStretch(target: any, x: any, y: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set x and y stretch of non-sprite to " + Number(x) + "and " + Number(y) + " respectively");
    const xPos = Number(x) || 0;
    const yPos = Number(y) || 0;
    target.setStretch(xPos, yPos);
    return null;
  }
  function* changeXStretch(target: any, x: any) {
    // @ts-ignore
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to change x stretch of non-sprite by " + Number(x));
    const pos = Number(x) || 0;
    target.setXY(target.stretch[0] + pos, target.stretch[1]);
    return null;
  }
  function* changeYStretch(target: any, y: any) {
    // @ts-ignore
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to change y stretch of non-sprite by " + Number(y));
    const pos = Number(y) || 0;
    target.setXY(target.stretch[0], target.stretch[1] + pos);
    return null;
  }
  function* changeXYStretch(target: any, x: any, y: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to change x and y stretch of non-sprite by " + Number(x) + "and " + Number(y) + " respectively");
    const xPos = Number(x) || 0;
    const yPos = Number(y) || 0;
    target.setXY(target.stretch[0] + xPos, target.stretch[1] + yPos);
    return null;
  }
  function* setCostume(target: any, index: any) {
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
  function* nextCostume(target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set costume of a non-sprite");
    target.setCostume(target.currentCostume + 1);
    return null;
  }
  function* previousCostume(target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to set costume of a non-sprite");
    target.setCostume(target.currentCostume - 1);
    return null;
  }
  function* setBackdrop(index: any) {
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
  function* getCostumeName(sprite) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Attempted to get current costume name of non-sprite");
    return sprite.getCostumes()[sprite.currentCostume].name;
  }
  function* getCostumeNumber(sprite) {
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
  function* getXStretch(target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get x stretch of non-sprite")
    return target.stretch[0]
  }
  function* getYStretch(target: any) {
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
  function* getVariableForTarget(target: any, name: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get variable for a non-sprite");
    return target.lookupVariableByNameAndType(name, "", true)?.value ?? null;
  }
  function* setVariableForTarget(target: any, name: any, value: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get variable for a non-sprite");
    const variable = target.lookupVariableByNameAndType(name, "", true);
    if (variable) {
      return variable.value = String(value) // force into string because there can be some weird things like setting a variable to a sprite.
    }
    return null;
  }
  function* getVariableForAll(name: any) {
    const target = Scratch.vm.runtime.getTargetForStage();
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get variable for a non-sprite");
    return target.lookupVariableByNameAndType(name, "", true)?.value ?? null;
  }
  function* setVariableForAll(name: any, value: any) {
    const target = Scratch.vm.runtime.getTargetForStage();
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get variable for a non-sprite");
    const variable = target.lookupVariableByNameAndType(name, "", true);
    if (variable) {
      return variable.value = String(value) // force into string because there can be some weird things like setting a variable to a sprite.
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

  function* broadcast(message: any) {
    const msg = String(message);
    Scratch.vm.runtime.startHats("event_whenbroadcastreceived", {
      BROADCAST_OPTION: msg
    });
    return null
  }

  function* broadcastToSprite(message: any, target: any) {
    if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot broadcast to a non-sprite")
    const msg = String(message);
    Scratch.vm.runtime.startHats("event_whenbroadcastreceived", {
      BROADCAST_OPTION: msg
    }, target);
    return null
  }

  function* isSprite(value: any) {
    return value instanceof Scratch.vm.exports.RenderedTarget;
  }

  _globalEnv.__env.set("broadcast", {
    get value() {return broadcast}
  })

  _globalEnv.__env.set("broadcastToSprite", {
    get value() {return broadcastToSprite}
  })

  _globalEnv.__env.set("isSprite", {
    get value() {return isSprite}
  })

  // clones, touching, mouse, keyboard

  function* isTouchingSprite(sprite1, sprite2) {
    if (!(sprite1 instanceof Scratch.vm.exports.RenderedTarget) || !(sprite2 instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Both sprites for isTouchingSprite must be sprites");
    if (!Scratch.vm.renderer) return false;
    return Scratch.vm.renderer.isTouchingDrawables(sprite1.drawableID, [sprite2.drawableID]); // check if sprite1 is touching sprite2
  }

  function* isTouchingMouse(sprite) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot check if a non-sprite is touching the mouse");
    if (!Scratch.vm.renderer) return false;
    const mouse = Scratch.vm.runtime.ioDevices.mouse;
    if (!mouse) return false;
    return Scratch.vm.renderer.drawableTouching(sprite.drawableID, mouse.getClientX(), mouse.getClientY());
  }

  function* isTouchingXY(sprite, x, y) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot check if a non-sprite is touching a point");
    if (!Scratch.vm.renderer) return false;
    return Scratch.vm.renderer.drawableTouching(sprite.drawableID, Number(x) || 0, Number(y) || 0);
  }

  function* isTouchingEdge(sprite) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot check if a non-sprite is touching the edge");
    return sprite.isTouchingEdge();
  }

  _globalEnv.__env.set("isTouchingSprite", {
    get value() {return isTouchingSprite}
  })

  _globalEnv.__env.set("isTouchingMouse", {
    get value() {return isTouchingMouse}
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

  function* isKeyDown(key) {
    if (!Scratch.vm.runtime.ioDevices.keyboard) return false;
    return Scratch.vm.runtime.ioDevices.keyboard.getKeyIsDown(key);
  }

  function* isKeyHit(key) {
    if (!Scratch.vm.runtime.ioDevices.keyboard) return false;
    return Scratch.vm.runtime.ioDevices.keyboard.getKeyIsHit(key);
  }

  _globalEnv.__env.set("isKeyDown", {
    get value() {return isKeyDown}
  })
  
  _globalEnv.__env.set("isKeyHit", {
    get value() {return isKeyHit}
  })

  function* createClone(sprite) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot create clone of a non-sprite");
    const clone = sprite.makeClone();
    if (clone) {
      Scratch.vm.runtime.addTarget(clone);
      clone.goBehindOther(sprite);
    }
    return clone;
  }

  function* getCloneWithVar(spriteOrName, varName, value) {
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
            /*try {
              const tryCompile = JSON.parse(code.asString());
              preCompiled = preCompile(tryCompile, compiler.warpTimer, compiler.isWarp); // transpile at compile time to make it fast.
              //compiler.source += '"require waitPromise";'
              compiler.source += preCompiled + ";"
            } catch(e) {*/
              //compiler.source += '"require waitPromise";'
              compiler.source += `(yield* runtime.ext_vgspenguinscript.transpile(${code.asString()}, ${compiler.warpTimer}, ${compiler.isWarp})(runtime.ext_vgspenguinscript._globalEnv, {target, isStuck}));`
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
              if (canNullish) return new (imports.TypedInput)(`((yield* runtime.ext_vgspenguinscript.transpile(${code.asString()}, ${compiler.warpTimer}, ${compiler.isWarp})(runtime.ext_vgspenguinscript._globalEnv, {target, isStuck}))  ?? "null)"`, imports.TYPE_UNKNOWN);
              return new (imports.TypedInput)(`nullish((yield* runtime.ext_vgspenguinscript.transpile(${code.asString()}, ${compiler.warpTimer}, ${compiler.isWarp})(runtime.ext_vgspenguinscript._globalEnv, {target, isStuck})),"null"))`, imports.TYPE_UNKNOWN);
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
  }
  // @ts-ignore
  if (typeof LoadedAsCore === "object" && LoadedAsCore !== globalThis.LoadedAsCore) module.exports = PenguinScript;
  else  Scratch.extensions.register(new PenguinScript());
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
          
