import nativeFn from "./internal/nativefunc";

import { toString } from "./conversions";

const package = { __proto__: null };

let Scratch: any;

package.broadcast = nativeFn(function* broadcast(util, message: any) {
  const msg = yield* toString(message);
  const list = Scratch.vm.runtime.startHats("event_whenbroadcastreceived", {
    BROADCAST_OPTION: msg
  });
  return list.length;
}, false)

package.broadcastAndWait = nativeFn(function* broadcastAndWait(util, message: any) {
  const msg = yield* toString(message);
  const started = Scratch.vm.runtime.startHats("event_whenbroadcastreceived", {
    BROADCAST_OPTION: msg
  });
  while (yield* wait(util, 15) && started.some(thread => Scratch.vm.runtime.threads.indexOf(thread) !== -1)) { // prevent freezing.
    if (!util.isWarp || util.isStuck()) yield;
  }
  return started.length;
}, false)

package.getVariable(function* getVariableForAll(util, name: any) {
  const target = Scratch.vm.runtime.getTargetForStage();
  if (!(target instanceof Scratch.vm.exports.RenderedTarget)) throw new TypeError("Cannot get variable for a non-sprite");
  return target.lookupVariableByNameAndType(yield* toString(name), "", true)?.value ?? null;
}, false)

package.setVariable(function* setVariableForAll(util, name: any, value: any) {
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

package.onLoad = function() {
  Scratch = this.requireScratch();
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

export default package;
