import { type } from "../structs";

// custom serializers do seem like a good idea, but uh idk how we  would undo it
// export customSerializers: Record<string, (v) => boolean> = {};

class StructIds {
  private map = new WeakMap();
  private idx = 0;
  add(obj) {
    if (this.map.has(obj)) return;
    this.map.set(obj, "ref" + this.idx++);
  }
  get(obj) {
    let cached;
    if (cached = this.map.get(obj)) return cached;
    return null;
  }
}

function* serializeRecursive(stuff: any, seen = new StructIds(), util): string {
  // Loop through structs and stuff
  // Add a ref onto everything we encounter.
  // Do not attempt to serialize sprites, and if sprites are encountered just ignore
  switch (yield* type(stuff)) {
    case "sprite": {
      // https://github.com/lego7set/PenguinMod-Vm/blob/develop/src/compiler/jsgen.js#L1979
      util.warn("Cannot serialize sprite; Serialized as null instead."); // dont throw an error because its going to happen and its not as preventable as illegal errors & other stuff
      return "null";
    }
    case "string":
    case "boolean": {
      return JSON.stringify(stuff); // yup im too lazy so ye lets just do this
    }
    case "number": {
      if (stuff) {
        if (stuff === Infinity) return "inf"; // save some space lmao
        if (stuff === -Infinity) return "-inf";
        return JSON.stringify(stuff);
      }
      if (Object.is(stuff, 0)) return "0";
      if (Object.is(stuff, -0)) return "-0";
      return "NaN";
    }
    case "error": {
      if (typeof stuff.props.msg !== "string" || typeof stuff.props.type !== "string") throw new TypeError("Illegal Error struct (both msg and type prop have to be strings to be serialized)")
      return `er${JSON.stringify(stuff.props.msg)}${JSON.stringify(stuff.props.type)}` // idk this probably wont look intuitive to people but who cares?
    }
    case "object": {
      
      return `o[${Object.entries(stuff.getActual).map([k,v]=>serializeRecursive(k,seen,util)+";"+serializeRecursive(v,seen,util))}]`
    }
    case "function": {
      return "null"; // theyre going to expect functions to be not serialized and if they do not they are a dum dum
    }
  }
}
