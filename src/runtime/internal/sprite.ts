// Sprites are not costructable via penguinscript.

import loader from "../loader";

const Scratch = loader.requireScratch() as unknown as any;

import { degToRad } from "../conversions";

const spriteMap = new WeakMap(); // use weakmap to do stuff

class Sprite {
  isStruct = true;
  isSprite = true;
  props = {};
  constructor(sprite) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) { // this check should not error, as this class is only used if scratch is there
      throw new TypeError("Invalid value passed into Sprite class")
    }
    this.sprite = sprite;
    spriteMap.set(sprite, this);

    const isDisposed = () => sprite.isDisposed;

    props.isDisposed = {
      get value() {
        return isDisposed();
      }
    }
    
    const props = this.props;

    props.x = {
      get value() {
        if (isDisposed()) {
          throw new TypeError("This sprite has been deleted, cannot perform operation")
        }
        return sprite.x
      },
      set value(v) {
        if (isDisposed()) {
          throw new TypeError("This sprite has been deleted, cannot perform operation")
        }
        if (typeof sprite !== "number" || Object.is(NaN, v)) throw new TypeError("Cannot set x position of sprite to non-number or NaN");
        sprite.setXY(v, sprite.y)
      }
    }
    
    props.y = {
      get value() {
        if (isDisposed()) {
          throw new TypeError("This sprite has been deleted, cannot perform operation")
        }
        return sprite.y
      },
      set value(v) {
        if (isDisposed()) {
          throw new TypeError("This sprite has been deleted, cannot perform operation")
        }
        if (typeof sprite !== "number" || Object.is(NaN, v)) throw new TypeError("Cannot set y position of sprite to non-number or NaN");
        sprite.setXY(sprite.x, v)
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
        if (typeof sprite !== "number" || Object.is(NaN, v)) throw new TypeError("Cannot set x position of sprite to non-number or NaN");
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
        const radians = degToRad(null, newDir).next().value;
        const dx = steps * Math.cos(radians);
        const dy = steps * Math.sin(radians);
        target.setXY(target.x + dx, target.y + dy); // we're done!
      })


    props.moveSteps = {
      get value() {
        return moveSteps
      },
      set value() {throw new TypeError("Cannot change moveSteps method on sprite")}
    }
    const moveStepsBack = (
       function*(util, steps, direction?) {
         if (typeof steps !== "number" || Object.is(NaN, steps)) throw new TypeError("Cannot move non-number or NaN steps");
         yield* moveSteps(util, 0 - steps, direction);
       })
    props.moveStepsBack = {
      get value() {
        return moveStepsBack
      },
      set value() {throw new TypeError("Cannot change moveStepsBack method on sprite")}
    }
    const moveStepsUp = (
      function*(util, steps, direction?) {
        if (typeof steps !== "number" || Object.is(NaN, steps)) throw new TypeError("Cannot move non-number or NaN steps");
        if (direction != null && (typeof direction !== "number" || Object.is(NaN, direction))) throw new TypeError("Cannot move steps in non-number or NaN direction");
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
      set value() {throw new TypeError("Cannot change moveStepsUp method on sprite")}
    }
    props.moveStepsDown = {
      get value() {
        return moveStepsDown
      },
      set value() {throw new TypeError("Cannot change moveStepsDown method on sprite")}
    }

    const turnRight = (
      function*(util, direction){
        if (typeof direction !== "number" || Object.is(NaN, direction)) throw new TypeError("Cannot turn right non-number or NaN degrees");
        target.setDirection(target.direction + direction);
      })
    const turnLeft = (
      function*(util, direction){
        if (typeof direction !== "number" || Object.is(NaN, direction)) throw new TypeError("Cannot turn left non-number or NaN degrees");
        target.setDirection(target.direction - direction);
      })
    props.turnRight = {
      get value() {
        return turnRight
      },
      set value() {throw new TypeError("Cannot change turnRight method on sprite")}
    }
    props.turnLeft = {
      get value() {
        return turnLeft
      },
      set value() {throw new TypeError("Cannot change turnLeft method on sprite")}
    }
  }
  getActual() {
    return this.sprite;
  }
  toString() {
    return "<PenguinScript Sprite>";
  }
}

export default function CreateSpriteStruct(sprite) {
  let cached;
  if (cached = spriteMap.get(sprite)) return cached;
  return new Sprite(sprite);
}
