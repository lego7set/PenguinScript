import nativeFn from "./internal/nativefunc";

import makeSprite from "./internal/sprite";

import { toString } from "./conversions";

const pkg: any = { __proto__: null };

let Scratch: any;

pkg.getSprite = nativeFn(function* getSprite(name) {
  if (typeof name !== "string") throw new TypeError("Attempted to get sprite with name, but name is not a string");
  return makeSprite(Scratch.vm.runtime.getSpriteTargetByName(name));
}, true, false)

pkg.broadcast = nativeFn(function* broadcast(util, message: any) {
  const msg = yield* toString(message);
  const list = Scratch.vm.runtime.startHats("event_whenbroadcastreceived", {
    BROADCAST_OPTION: msg
  });
  return list.length;
}, false)

pkg.broadcastAndWait = nativeFn(function* broadcastAndWait(util, message: any) {
  const msg = yield* toString(message);
  const started = Scratch.vm.runtime.startHats("event_whenbroadcastreceived", {
    BROADCAST_OPTION: msg
  });
  while (yield* wait(util, 15) && started.some(thread => Scratch.vm.runtime.threads.indexOf(thread) !== -1)) { // prevent freezing.
    if (!util.isWarp || util.isStuck()) yield;
  }
  return started.length;
}, false)

pkg.getVariable = nativeFn(function* getVariableForAll(util, name: any) {
  const target = Scratch.vm.runtime.getTargetForStage();
  if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get variable for a non-sprite");
  return target.lookupVariableByNameAndType(yield* toString(name), "", true)?.value ?? null;
}, false)

pkg.setVariable = nativeFn(function* setVariableForAll(util, name: any, value: any) {
  const target = Scratch.vm.runtime.getTargetForStage();
  if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get variable for a non-sprite");
  const variable = target.lookupVariableByNameAndType(yield* toString(name), "", true);
  if (variable) {
    return variable.value = value // im juts going to use a toJSON method to prevent weird things frmo happening
  }
  return null;
}, false)

function mouseDown() {
  if (!Scratch.vm.runtime.ioDevices.mouse) return false;
  return Scratch.vm.runtime.ioDevices.mouse.getIsDown();
}

function mouseClicked() {
  if (!Scratch.vm.runtime.ioDevices.mouse) return false;
  return Scratch.vm.runtime.ioDevices.mouse.getIsClicked();
}

pkg.isKeyDown = nativeFn(function* isKeyDown(util, key) {
  if (!Scratch.vm.runtime.ioDevices.keyboard) return false;
  return Scratch.vm.runtime.ioDevices.keyboard.getKeyIsDown(key);
}, false)

pkg.isKeyHit = nativeFn(function* isKeyHit(util, key) {
  if (!Scratch.vm.runtime.ioDevices.keyboard) return false;
  return Scratch.vm.runtime.ioDevices.keyboard.getKeyIsHit(key);
}, false)

export function* wait({timer, isStuck, isWarp}, ms) {
  if (typeof ms !== "number" || Object.is(ms, NaN)) throw new TypeError("ms in global wait must be a number (and not NaN).");
  ms = Math.max(0, ms);
  const waitTimer = new timer();
  waitTimer.start(); // start timer
  while (waitTimer.timeElapsed() < ms) {
    if (!isWarp || isStuck()) yield; // yield so thingy doesnt freeze
  }
  return true; // so that you can do while global wait(10) doSomething
}

export function* waitUntil(util, conditionFunction, ...argFuncs) {
  if (typeof conditionFunction !== "function") throw new TypeError("The first arg to global waitUntil must be a function.");
  for (const func of argFuncs) if (typeof func !== "function") throw new TypeError("All args after the first arg must be functions");
  while (yield* wait(util, 4)) { // prevent freezing
    // evaluate args.
    const args = argFuncs.map(func => func(util)); // i almost forgor that all funcs take in the util object.
    if ((conditionFunction(util, ...args) ?? false) === false) break;
  }
  return true; // why would i return false if the condition is true?
}

pkg.wait = nativeFn(wait, false)
pkg.waitUntil = nativeFn(waitUntil, false)

pkg.setTempVar = nativeFn(function* setTempVar(util, name, v) {
  return util.tempVars[String(name)] = v;
}, false)

pkg.getTempVar = nativeFn(function* getTempVar(util, name, v) {
  return util.tempVars[String(name)];
}, false)

pkg.tempVarExists = nativeFn(function* tempVarExists(util, name, v) {
  return !!util.tempVars[String(name)]; // this is literally what the pm compiler uses
}, false)

let startTime = self.performance.now();
pkg.timeSinceBlueFlag = nativeFn(function* timeSinceBlueFlag() {
  return self.performance.now() - startTime;
}, false)

pkg.onLoad = function() {
  Scratch = this.requireScratch();
  Scratch.vm.runtime.on("PROJECT_START", () => startTime = self.performance.now());
  this.loadRaw("mouseDown", {
    get value() {return mouseDown()},
    set value(v) {throw new TypeError("Cannot overwrite mouseDown global value")}
  })
  this.loadRaw("mouseClicked", {
    get value() {return mouseClicked()},
    set value(v) {throw new TypeError("Cannot overwrite mouseClicked global value")}
  })
  this.loadRaw("mouseX", {
    get value() {
      if (!Scratch.vm.runtime.ioDevices.mouse) return 0;
      return Scratch.vm.runtime.ioevices.mouse.getScratchX();
    },
    set value(v) {throw new TypeError("Cannot overwrite mouseX global value")}
  })
  this.loadRaw("mouseY", {
    get value() {
      if (!Scratch.vm.runtime.ioDevices.mouse) return 0;
      return Scratch.vm.runtime.ioevices.mouse.getScratchY();
    },
    set value(v) {throw new TypeError("Cannot overwrite mouseY global value")}
  })
}  

export default pkg;
