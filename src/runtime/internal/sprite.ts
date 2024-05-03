// Sprites are not costructable via penguinscript.

import loader from "../loader";

import { degToRad, toString, toNumber, toBoolean } from "../conversions";

import { customObjectTypes } from "../structs";

import nativeFn from "./nativefunc";

const spriteMap = new WeakMap(); // use weakmap to do stuff

let Scratch: any;
let soundsCategory: any;

let Sprite;

function CreateSpriteStruct(sprite) {
  let cached;
  if (cached = spriteMap.get(sprite)) return cached;
  return new Sprite(sprite);
}

Sprite = class Sprite {
  isStruct = true;
  isSprite = true;
  props: any = { __proto__: null };
  getActual: () => any;
  constructor(sprite) {
    if (!Scratch) Scratch = loader.requireScratch() as unknown as any; // require it here.
    if (Scratch && !soundsCategory) soundsCategory = Scratch.vm.runtime.ext_scratch3_sound;
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) {
      throw new TypeError("Invalid value passed into Sprite class")
    }
    if (!customObjectTypes.sprite) customObjectTypes.sprite = (v) => v instanceof Sprite; 
    this.getActual = () => sprite; // bro why am i so dumb i could have just did this
    spriteMap.set(sprite, this);

    const isDisposed = () => sprite.isDisposed;
    
    const props = this.props;

    props.isDisposed = {
      get value() {
        return isDisposed();
      },
      set value(v) {
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        if (sprite.isOriginal) throw new TypeError("Cannot delete non-clone sprites");
        this.runtime.disposeTarget(sprite);
        this.runtime.stopForTarget(sprite);
      }
    }
    
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
      (nativeFn(function* moveSteps(util, steps: any, direction?: any) {
        if (typeof steps !== "number" || Object.is(NaN, steps)) throw new TypeError("Cannot move non-number or NaN steps");
        if (direction != null && (typeof direction !== "number" || Object.is(NaN, direction))) throw new TypeError("Cannot move steps in non-number or NaN direction");
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        const dir = direction ?? sprite.direction;
        const oldDir = sprite.direction;
        sprite.setDirection(dir); // force dir to be a scratch direction
        const newDir = sprite.direction;
        sprite.setDirection(oldDir);
        // so newDir is the direction, and numOfSteps is the step count
        const radians = yield* degToRad(null, newDir);
        const dx = steps * Math.cos(radians);
        const dy = steps * Math.sin(radians);
        sprite.setXY(sprite.x + dx, sprite.y + dy); // we're done!
      }, false))


    props.moveSteps = {
      get value() {
        return moveSteps
      },
      set value(v) {throw new TypeError("Cannot change moveSteps method on sprite")}
    }
    const moveStepsBack = nativeFn(
       function*(util, steps, direction?) {
         if (typeof steps !== "number" || Object.is(NaN, steps)) throw new TypeError("Cannot move non-number or NaN steps");
         if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
         yield* moveSteps(util, 0 - steps, direction);
       }, false)
    props.moveStepsBack = {
      get value() {
        return moveStepsBack
      },
      set value(v) {throw new TypeError("Cannot change moveStepsBack method on sprite")}
    }
    const moveStepsUp = nativeFn(
      function*(util, steps, direction?) {
        if (typeof steps !== "number" || Object.is(NaN, steps)) throw new TypeError("Cannot move non-number or NaN steps");
        if (direction != null && (typeof direction !== "number" || Object.is(NaN, direction))) throw new TypeError("Cannot move steps in non-number or NaN direction");
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        const oldDir = sprite.direction;
        if (direction != null) sprite.setDirection(direction);
        sprite.setDirection(sprite.direction - 90);
        yield* moveSteps(util, 0 - steps);
        sprite.setDirection(oldDir);
      }, false)
    const moveStepsDown = nativeFn(
      function*(util, steps, direction?) {
        if (typeof steps !== "number" || Object.is(NaN, steps)) throw new TypeError("Cannot move non-number or NaN steps");
        if (direction != null && (typeof direction !== "number" || Object.is(NaN, direction))) throw new TypeError("Cannot move steps in non-number or NaN direction");
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        const oldDir = sprite.direction;
        if (direction != null) sprite.setDirection(direction);
        sprite.setDirection(sprite.direction - 90);
        yield* moveSteps(util, steps);
        sprite.setDirection(oldDir);
      }, false)
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

    const turnRight = nativeFn(
      function*(util, direction){
        if (typeof direction !== "number" || Object.is(NaN, direction)) throw new TypeError("Cannot turn right non-number or NaN degrees");
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        sprite.setDirection(sprite.direction + direction);
      }, false)
    const turnLeft = nativeFn(
      function*(util, direction){
        if (typeof direction !== "number" || Object.is(NaN, direction)) throw new TypeError("Cannot turn left non-number or NaN degrees");
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        sprite.setDirection(sprite.direction - direction);
      }, false)
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

    const say = nativeFn(function* say(util, text: any) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      const msg = yield* toString(util, text);
      Scratch.vm.runtime.emit("SAY", sprite, 'say', msg);
      return null;
    }, false)
    const think = nativeFn(function* think(util, text: any) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      const msg = yield* toString(util, text);
      Scratch.vm.runtime.emit("SAY", sprite, 'think', msg);
      return null;
    }, false)

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
      },
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
      },
      set value(v) {
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        if (typeof v !== "boolean") throw new TypeError("Can only set visibility to a boolean")
        sprite.setVisible(v);
      }
    }

    const show = nativeFn(function* show() {
      props.visible.value = true;
    }, false)
    const hide = nativeFn(function* hide() {
      props.visible.value = false;
    }, false)

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
        sprite.setCostume(v - 1);
      }
    }
    props.costumeName = {
      get value() {
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        return sprite.getCostumes()[sprite.currentCostume].name;
      },
      set value(v) {
        if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
        if (typeof v !== "string") throw new TypeError("Can only set costumeName prop to a string")
        const index = sprite.getCostumeIndexByName(v);
        if (index !== -1) sprite.setCostume(index);
        else throw new TypeError("Costume name " + index + " does not exist");
      }
    }

    const changeCostumeBy = nativeFn(function* changeCostumeBy(util, v) {
      if (typeof v !== "number") throw new TypeError("Cannot change costume number by non-number");
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      sprite.setCostume(sprite.currentCostume + v);
    }, false)
    const nextCostume = nativeFn(function* nextCostume(util) {
      yield* changeCostumeBy(util, 1);
    }, false)
    const previousCostume = nativeFn(function* previousCostume(util) {
      yield* changeCostumeBy(util, -1);
    }, false)
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
    const getVariable = nativeFn(function* getVariable(util, name: any) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      return sprite.lookupVariableByNameAndType(yield* toString(util, name), "", true)?.value ?? null;
    }, false)
    const setVariable = nativeFn(function* setVariable(util, name: any, value: any) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      const variable = sprite.lookupVariableByNameAndType(yield* toString(util, name), "", true);
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
    }, false)
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

    const broadcast = nativeFn(function* broadcast(util, message) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      const msg = yield* toString(util, message);
      const threads = Scratch.vm.runtime.startHats("event_whenbroadcastreceived", {
        BROADCAST_OPTION: msg
      }, sprite);
      return !threads.length === 0; // returns whether or not threads were started
    }, false)
    props.broadcast = {
      get value() {
        return broadcast
      },
      set value(v) {throw new TypeError("Cannot change broadcast method on sprite")}
    }

    const broadcastAndWait = nativeFn(function* broadcastAndWait(util, message: any) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      const msg = yield* toString(util, message);
      const started = Scratch.vm.runtime.startHats("event_whenbroadcastreceived", {
        BROADCAST_OPTION: msg
      }, sprite);
      while (yield* wait(util, 15) && started.some(thread => Scratch.vm.runtime.threads.indexOf(thread) !== -1)) { // prevent freezing and check if threads are still running
        if (!util.isWarp || util.isStuck()) yield;
      }
      return !started.length === 0;
    }, false)

    props.broadcastAndWait = {
      get value() {
        return broadcastAndWait
      },
      set value(v) {throw new TypeError("Cannot change broadcastAndWait method on sprite")}
    }

    const isTouchingSprite = nativeFn(function* isTouchingSprite(util, otherSprite) {
       if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
       if (!otherSprite || !otherSprite.isStruct || !otherSprite.isSprite) throw new TypeError("Please pass in a sprite into isTouchingSprite");
       if (!Scratch.vm.renderer) return false;
       return Scratch.vm.renderer.isTouchingDrawables(sprite.drawableID, [otherSprite.drawableID]); // check if sprite is touching othersprite
    }, false)

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

    const isTouchingColor = nativeFn(function* isTouchingColor(color) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      if (!color || !color.isColor) throw new TypeError("Please pass in a colo(u)r into isTouchingColo(u)r");
      if (!Scratch.vm.renderer) return false;
      return sprite.isTouchingColor([color.props.r.value, color.props.g.value, color.props.b.value]);
    }, false, true)

    props.isTouchingColor = {
      get value() {
        return isTouchingColor
      },
      set value(v) {throw new TypeError("Cannot change isTouchingColor method on sprite")}
    }

    props.isTouchingColour = {
      get value() {
        return isTouchingColor
      },
      set value(v) {throw new TypeError("Cannot change isTouchingColour method on sprite")}
    }

    const colorIsTouchingColor = nativeFn(function* colorIsTouchingColor(color, color2) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      if (!color || !color.isColor) throw new TypeError("Please pass in a colo(u)r into isTouchingColo(u)r");
      if (!color2 || !color2.isColor) throw new TypeError("Please pass in a colo(u)r into colo(u)rIsTouchingColo(u)r");
      if (!Scratch.vm.renderer) return false;
      return sprite.colorIsTouchingColor([color2.props.r.value, color2.props.g.value, color2.props.b.value], [color.props.r.value, color.props.g.value, color.props.b.value]);
    }, false, true)

    props.colorIsTouchingColor = {
      get value() {
        return colorIsTouchingColor
      },
      set value(v) {throw new TypeError("Cannot change colorIsTouchingColor method on sprite")}
    }

    props.colourIsTouchingColour = {
      get value() {
        return colorIsTouchingColor
      },
      set value(v) {throw new TypeError("Cannot change colourIsTouchingColour method on sprite")}
    }

    const isTouchingMouse = nativeFn(function* isTouchingMouse() {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      if (!Scratch.vm.renderer) return false;
      const mouse = Scratch.vm.runtime.ioDevices.mouse;
      if (!mouse) return false;
      return Scratch.vm.renderer.drawableTouching(sprite.drawableID, mouse.getClientX(), mouse.getClientY());
  }, false, true)

    const isTouchingXY = nativeFn(function* isTouchingXY(x, y) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      if (!Scratch.vm.renderer) return false;
      return Scratch.vm.renderer.drawableTouching(sprite.drawableID, yield* toNumber(x) || 0, yield* toNumber(y) || 0);
  }, false, true)

    const isTouchingEdge = nativeFn(function* isTouchingEdge() {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      return sprite.isTouchingEdge();
  }, false, true)

    props.isTouchingMouse = {
      get value() {
        return isTouchingMouse
      },
      set value(v) {throw new TypeError("Cannot change isTouchingMouse method on sprite")}
    }

    props.isTouchingXY = {
      get value() {
        return isTouchingXY
      },
      set value(v) {throw new TypeError("Cannot change isTouchingXY method on sprite")}
    }

    props.isTouchingEdge = {
      get value() {
        return isTouchingEdge
      },
      set value(v) {throw new TypeError("Cannot change isTouchingEdge method on sprite")}
    }

    const createClone = nativeFn(function* createClone() {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      const clone = sprite.makeClone();
      if (clone) {
        Scratch.vm.runtime.addTarget(clone);
        clone.goBehindOther(sprite);
        return CreateSpriteStruct(clone);
      }
      return null;
    }, false, true)

    const getCloneWithVar = nativeFn(function* getCloneWithVar(varNme, value) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      const clones = sprite.sprite.clones;
      // i stole this from clones plus, its not my code.
      for (let index = 1; index < clones.length; index++) {
          const cloneVar = clones[index].lookupVariableByNameAndType(varName, "", true);
          if (
            cloneVar &&
            Scratch.Cast.compare(cloneVar.value, value) === 0
          ) {
            return CreateSpriteStruct(clones[index]);
          }
        }
        return null;
    }, false, true);

    props.createClone = {
      get value() {
        return createClone
      },
      set value(v) {throw new TypeError("Cannot change createClone method on sprite")}
    }
    props.clone = {
      get value() {
        return createClone
      },
      set value(v) {throw new TypeError("Cannot change clone method on sprite")}
    }

    props.getCloneWithVar = {
      get value() {
        return getCloneWithVar
      },
      set value(v) {throw new TypeError("Cannot change getCloneWithVar method on sprite")}
    }

    const playSound = nativeFn(function* playSound(util, sound, seconds) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      if (typeof sound !== "string" && typeof sound !== "number") throw new TypeError("Sound must be a string or number index");
      if (typeof seconds !== "number") seconds = yield* toNumber(seconds) || 0;
      soundsCategory._playSoundAtTimePosition({
        sound: yield* toString(sound),
        seconds
      }, {target: sprite}, true); // dont wait for the promise.
    }, false)

    props.playSound = {
      get value() {
        return playSound
      },
      set value(v) {throw new TypeError("Cannot change playSound method on sprite")}
    }

    const playSoundAndWait = nativeFn(function* playSoundAndWait(util, sound, seconds) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      if (typeof sound !== "string" && typeof sound !== "number") throw new TypeError("Sound must be a string or number index");
      if (typeof seconds !== "number") seconds = yield* toNumber(seconds) || 0;
      yield* util.waitPromise(soundsCategory._playSoundAtTimePosition({
        sound: yield* toString(sound),
        seconds
      }, {target: sprite}, true));
    }, false)

    props.playSoundAndWait = {
      get value() {
        return playSoundAndWait
      },
      set value(v) {throw new TypeError("Cannot change playSoundAndWait method on sprite")}
    }


    const playAllSounds = nativeFn(function* playAllSounds(util) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      const v = sprite.sprite;
      if (!v) return null;
      for (let i = 0; i < v.sounds.length; i++) {
        const { soundId } = v.sounds[i];
        if (v.soundBank) {
          v.soundBank.playSound(sprite, soundId);
          soundsCategory._addWaitingSound(sprite.id, soundId);
        }
      }
    }, false)

    props.playAllSounds = {
      get value() {
        return playAllSounds
      },
      set value(v) {throw new TypeError("Cannot change playAllSounds method on sprite")}
    }


    const playAllSoundsAndWait = nativeFn(function* playAllSoundsAndWait(util) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      const v = sprite.sprite;
      if (!v) return null;
      const playedSounds = [];
      for (let i = 0; i < v.sounds.length; i++) {
        const { soundId } = v.sounds[i];
        if (v.soundBank) {
          playedSounds.push(v.soundBank.playSound(sprite, soundId));
          soundsCategory._addWaitingSound(sprite.id, soundId);
        }
      }
      yield* util.waitPromise(Promise.all(playedSounds));
    }, false)

    props.playAllSoundsAndWait = {
      get value() {
        return playAllSoundsAndWait
      },
      set value(v) {throw new TypeError("Cannot change playAllSoundsAndWait method on sprite")}
    }

    const stopSound = nativeFn(function* stopSound(util, sound) {
      if (isDisposed()) throw new TypeError("This sprite has been deleted, cannot perform operation");
      if (typeof sound !== "string" && typeof sound !== "number") throw new TypeError("Sound must be a string or number index");
      soundsCategory.stopSpecificSound({
        SOUND_MENU: sound
      }, {target: sprite});
    }, false)

    props.stopSound = {
      get value() {
        return stopSound
      },
      set value(v) {throw new TypeError("Cannot change stopSound method on sprite")}
    }

    const stopAllSounds = nativeFn(function* stopAllSounds() {
      soundsCategory._stopAllSoundsFOrTarget(sprite);
    }, false);

    props.stopAllSounds = {
      get value() {
        return stopAllSounds
      },
      set value(v) {throw new TypeError("Cannot change stopAllSounds method on sprite")}
    }

    const setFadeout = nativeFn(function* setFadeout(sound, fadeout) {
      if (typeof sound !== "string" && typeof sound !== "number") throw new TypeError("Sound must be a string or number index");
      fadeout = yield* toNumber(fadeout) || 0;
      soundsCategory.setStopFadeout({
        SOUND_MENU: sound,
        VALUE: fadeout
      }, {
        target: sprite
      });
    }, false, true);

    const ask = nativeFn(function* ask(util, toAsk) {
      const msg = yield* toString(toAsk);
      let result: string = "";
      yield* util.waitPromise(async function(){
        await Scratch.vm.runtime.ext_scratch3_sensing.askAndWait({
          QUESTION: msg
        }, {target: sprite});
        result = Scratch.vm.runtime.ext_scratch3_sensing._answer;
        return result;
      })
      return result;
    }, false)

    props.ask = {
      get value() {
        return ask
      },
      set value(v) {throw new TypeError("Cannot change ask method on sprite")}
    }
    props.askAndWait = {
      get value() {
        return ask
      },
      set value(v) {throw new TypeError("Cannot change askAndWait method on sprite")}
    }
  }
  toString() {
    return "<PenguinScript Sprite>";
  }
  toJSON() {
    return ""; // just save as empty string
  }
}

export default CreateSpriteStruct;
