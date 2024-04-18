// Sprites are not costructable via penguinscript.

import loader from "../loader";

import { degToRad, toString, toBoolean } from "../conversions";

const spriteMap = new WeakMap(); // use weakmap to do stuff

let Scratch: any;

class Sprite {
  isStruct = true;
  isSprite = true;
  props = {};
  constructor(sprite) {
    if (!Scratch) Scratch = loader.requireScratch() as unknown as any; // require it here.
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) {
      throw new TypeError("Invalid value passed into Sprite class")
    }
    // this.sprite = sprite;
    // unused
    spriteMap.set(sprite, this);

    const isDisposed = () => sprite.isDisposed;

    props.isDisposed = {
      get value() {
        return isDisposed();
      },
      set value() {
        // dont do anything right now, but allow people to dispose (delete) sprites.
        
      }
    }
    
    const props = this.props;

    props.xStretch = {
      get value() {
        if (isDisposed()) {
          throw new TypeError("This sprite has been deleted, cannot perform operation")
        }
        return sprite.stretch[0];
      },
      set value(v) {
        if (isDisposed()) {
          throw new TypeError("This sprite has been deleted, cannot perform operation")
        }
        if (typeof v !== "number" || Object.is(NaN, v)) throw new TypeError("Cannot set x stretch of sprite to non-number or NaN");
        sprite.setStretch(v, sprite.stretch[1])
      }
    }
    
    props.yStretch = {
      get value() {
        if (isDisposed()) {
          throw new TypeError("This sprite has been deleted, cannot perform operation")
        }
        return sprite.stretch[1];
      },
      set value(v) {
        if (isDisposed()) {
          throw new TypeError("This sprite has been deleted, cannot perform operation")
        }
        if (typeof v !== "number" || Object.is(NaN, v)) throw new TypeError("Cannot set y stretch of sprite to non-number or NaN");
        sprite.setXY(sprite.stretc[0], v)
      }
    }

    const directionProp = {
      get value() {
        if (isDisposed()) {
          throw new TypeError("This sprite has been deleted, cannot perform operation")
        }
        return sprite.direction
      },
      set value(v) {
        if (isDisposed()) {
          throw new TypeError("This sprite has been deleted, cannot perform operation")
        }
        if (typeof v !== "number" || Object.is(NaN, v)) throw new TypeError("Cannot set x position of sprite to non-number or NaN");
        sprite.setDirection(v)
      }
    }
    props.dir = directionProp;
    props.direction = directionProp;

    const moveSteps = 
      (function* moveSteps(util, steps: any, direction?: any) {
        if (typeof steps !== "number" || Object.is(NaN, steps)) throw new TypeError("Cannot move non-number or NaN steps");
        if (direction != null && (typeof direction !== "number" || Object.is(NaN, direction))) throw new TypeError("Cannot move steps in non-number or NaN direction");
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        const dir = direction ?? sprite.direction;
        const oldDir = sprite.direction;
        target.setDirection(dir); // force dir to be a scratch direction
        const newDir = sprite.direction;
        target.setDirection(oldDir);
        // so newDir is the direction, and numOfSteps is the step count
        const radians = yield* degToRad(null, newDir).next().value;
        const dx = steps * Math.cos(radians);
        const dy = steps * Math.sin(radians);
        target.setXY(target.x + dx, target.y + dy); // we're done!
      })


    props.moveSteps = {
      get value() {
        return moveSteps
      },
      set value(v) {throw new TypeError("Cannot change moveSteps method on sprite")}
    }
    const moveStepsBack = (
       function*(util, steps, direction?) {
         if (typeof steps !== "number" || Object.is(NaN, steps)) throw new TypeError("Cannot move non-number or NaN steps");
         if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
         yield* moveSteps(util, 0 - steps, direction);
       })
    props.moveStepsBack = {
      get value() {
        return moveStepsBack
      },
      set value(v) {throw new TypeError("Cannot change moveStepsBack method on sprite")}
    }
    const moveStepsUp = (
      function*(util, steps, direction?) {
        if (typeof steps !== "number" || Object.is(NaN, steps)) throw new TypeError("Cannot move non-number or NaN steps");
        if (direction != null && (typeof direction !== "number" || Object.is(NaN, direction))) throw new TypeError("Cannot move steps in non-number or NaN direction");
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        const oldDir = sprite.direction;
        if (direction != null) target.setDirection(direction);
        target.setDirection(sprite.direction - 90);
        yield* moveSteps(util, 0 - steps);
        target.setDirection(oldDir);
      })
    const moveStepsDown = (
      function*(util, steps, direction?) {
        if (typeof steps !== "number" || Object.is(NaN, steps)) throw new TypeError("Cannot move non-number or NaN steps");
        if (direction != null && (typeof direction !== "number" || Object.is(NaN, direction))) throw new TypeError("Cannot move steps in non-number or NaN direction");
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        const oldDir = sprite.direction;
        if (direction != null) target.setDirection(direction);
        target.setDirection(sprite.direction - 90);
        yield* moveSteps(util, steps);
        target.setDirection(oldDir);
      })
    props.moveStepsUp = {
      get value() {
        return moveStepsUp
      },
      set value(v) {throw new TypeError("Cannot change moveStepsUp method on sprite")}
    }
    props.moveStepsDown = {
      get value() {
        return moveStepsDown
      },
      set value(v) {throw new TypeError("Cannot change moveStepsDown method on sprite")}
    }

    const turnRight = (
      function*(util, direction){
        if (typeof direction !== "number" || Object.is(NaN, direction)) throw new TypeError("Cannot turn right non-number or NaN degrees");
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        target.setDirection(target.direction + direction);
      })
    const turnLeft = (
      function*(util, direction){
        if (typeof direction !== "number" || Object.is(NaN, direction)) throw new TypeError("Cannot turn left non-number or NaN degrees");
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        target.setDirection(target.direction - direction);
      })
    props.turnRight = {
      get value() {
        return turnRight
      },
      set value(v) {throw new TypeError("Cannot change turnRight method on sprite")}
    }
    props.turnLeft = {
      get value() {
        return turnLeft
      },
      set value(v) {throw new TypeError("Cannot change turnLeft method on sprite")}
    }

    function* say(util, text: any) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      const msg = yield* toString(text);
      Scratch.vm.runtime.emit("SAY", sprite, 'say', msg);
      return null;
    }
    function* think(util, text: any) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      const msg = yield* toString(text);
      Scratch.vm.runtime.emit("SAY", sprite, 'think', msg);
      return null;
    }

    props.say = {
      get value() {
        return say
      },
      set value(v) {throw new TypeError("Cannot change say method on sprite")}
    }

    props.think = {
      get value() {
        return think
      },
      set value(v) {throw new TypeError("Cannot change think method on sprite")}
    }

    props.size = {
      get value() {
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        return sprite.size;
      }
      set value(v) {
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        if (typeof v !== "number" || Object.is(NaN, v)) throw new TypeError("Cannot size of sprite to a non-number or NaN");
        sprite.setSize(v);
      }
    }

    props.visible = {
      get value() {
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        return sprite.visible;
      }
      set value(v) {
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        sprite.setVisible(yield* toBoolean(v));
      }
    }

    function* show() {
      props.visible.value = true;
    }
    function* hide() {
      props.visible.value = false;
    }

    props.show = {
      get value() {
        return show
      },
      set value(v) {throw new TypeError("Cannot change show method on sprite")}
    }
    props.hide = {
      get value() {
        return hide
      },
      set value(v) {throw new TypeError("Cannot change hide method on sprite")}
    }

    props.costumeNumber = {
      get value() {
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        return sprite.currentCostume + 1;
      },
      set value(v) {
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        if (typeof v !== "number" || Object.is(NaN, v)) throw new TypeError("Cannot set costume number of sprite to non-number or NaN");
        v = Math.sign(v) * Math.floor(Math.abs(v));
        target.setCostume(v - 1);
      }
    }
    props.costumeName = {
      get value() {
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        return sprite.getCostumes()[sprite.currentCostume].name;
      },
      set value(v) {
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        v = yield* toString(v);
        const index = target.getCostumeIndexByName(v);
        if (index !== -1) target.setCostume(index);
        else throw new TypeError("Costume name " + index + " does not exist");
      }
    }

    function* changeCostumeBy(util, v) {
      if (typeof v !== "number") throw new TypeError("Cannot change costume number by non-number");
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      sprite.setCostume(sprite.currentCostume + v);
    }
    function* nextCostume(util) {
      yield* changeCostumeBy(util, 1);
    }
    function* previousCostume(util) {
      yield* changeCostumeBy(util, -1);
    }
    props.nextCostume = {
      get value() {
        return nextCostume
      },
      set value(v) {throw new TypeError("Cannot change nextCostume method on sprite")}
    }
    props.previousCostume = {
      get value() {
        return previousCostume
      },
      set value(v) {throw new TypeError("Cannot change previousCostume method on sprite")}
    }
    props.name = {
      get value() {
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        return sprite.getName();
      },
      set value(v) {
        throw new TypeError("Cannot overwrite a sprite's name");
      } 
    }
    props.isClone = {
      get value() {
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        return !sprite.isOriginal;
      },
      set value(v) {
        throw new TypeError("Cannot overwrite a sprite's isClone status");
      } 
    }
    function* getVariable(util, name: any) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      return sprite.lookupVariableByNameAndType(yield* toString(name), "", true)?.value ?? null;
    }
    function* setVariable(util, name: any, value: any) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      const variable = sprite.lookupVariableByNameAndType(yield* toString(name), "", true);
      if (variable) { 
        if (value == null) {
          variable.value = "null";
          return true;
        }
        if (typeof value === "number" || typeof value === "string" || typeof value === "boolean") { 
          variable.value = value;
          return true;
        }
        variable.value = yield* toString(value);
        return true;
      }
      return null;
    }
    props.getVariable = {
      get value() {
        return getVariable
      },
      set value(v) {throw new TypeError("Cannot change getVariable method on sprite")}
    }
    props.setVariable = {
      get value() {
        return setVariable
      },
      set value(v) {throw new TypeError("Cannot change setVariable method on sprite")}
    }

    function* broadcast(util, message) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      const msg = yield* toString(message);
      const threads = Scratch.vm.runtime.startHats("event_whenbroadcastreceived", {
        BROADCAST_OPTION: msg
      }, sprite);
      return !threads.length === 0; // returns whether or not threads were started
    }
    props.broadcast = {
      get value() {
        return broadcast
      },
      set value(v) {throw new TypeError("Cannot change broadcast method on sprite")}
    }

    function* broadcastAndWait(util, message: any) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      const msg = String(message ?? "null");
      const started = Scratch.vm.runtime.startHats("event_whenbroadcastreceived", {
        BROADCAST_OPTION: msg
      }, sprite);
      while (yield* wait(util, 15) && started.some(thread => Scratch.vm.runtime.threads.indexOf(thread) !== -1)) { // prevent freezing and check if threads are still running
        if (!util.isWarp || util.isStuck()) yield;
      }
      return !started.length === 0;
    }

    props.broadcastAndWait = {
      get value() {
        return broadcastAndWait
      },
      set value(v) {throw new TypeError("Cannot change broadcastAndWait method on sprite")}
    }

    function* isTouchingSprite(util, otherSprite) {
       if (!otherSprite || !otherSprite.isStruct || !otherSprite.isSprite) throw new TypeError("Please pass in a sprite into isTouchingSprite");
       if (!Scratch.vm.renderer) return false;
       return Scratch.vm.renderer.isTouchingDrawables(sprite.drawableID, [otherSprite.drawableID]); // check if sprite is touching othersprite
    }

    props.isTouchingSprite = {
      get value() {
        return isTouchingSprite
      },
      set value(v) {throw new TypeError("Cannot change isTouchingSprite method on sprite")}
    }
    props.isTouchingOtherSprite = {
      get value() {
        return isTouchingSprite
      },
      set value(v) {throw new TypeError("Cannot change isTouchingOtherSprite method on sprite")}
    }
  }
  toString() {
    return "<PenguinScript Sprite>";
  }
  toJSON() {
    return ""; // just save as empty string
  }
}

export default function CreateSpriteStruct(sprite) {
  let cached;
  if (cached = spriteMap.get(sprite)) return cached;
  return new Sprite(sprite);
}
