// Sprites are not costructable via penguinscript.

import loader from "../loader";

const Scratch = loader.requireScratch() as unknown as any;

const spriteMap = new WeakMap(); // use weakmap to do stuff
const structMap = new WeakMap();

class Sprite {
  isStruct = true;
  isSprite = true;
  props = {};
  constructor(sprite) {
    if (!(sprite instanceof Scratch.vm.exports.RenderedTarget)) { // this check should not error, as this class is only used if scratch is there
      throw new TypeError("Invalid value passed into Sprite class")
    }
    structMap.set(this, sprite); // we're doing this so that getSprite(x) === getSprite(x)
    spriteMap.set(sprite, this);
  }
  getActual() {
    return structMap.get(this);
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
