import Parser from "./parsing/parser";

import Lexer from "./parsing/lexer";

import JSGenerator, { _globalEnv } from "./transpile/jsGen";

// @ts-ignore
import * as ComplexConstructor from "complex.js"; // fuck you webpack or typescript. im trying to get the require export and not the fucking require().default export. so yeah as far as i know * as directly returns the import

const Complex = ComplexConstructor as unknown as any; // idk man

function transpile(code: string, warpTimer: boolean, isWarp: boolean): any {
  const program = new Parser(code).produceAST();
  const generator = new JSGenerator(program);
  return generator.transpile("generator", true, warpTimer, isWarp)
}

/*function preCompile(code: string, warpTimer: boolean, isWarp: boolean): any {
  const program = new Parser(code).produceAST();
  const generator = new JSGenerator(program);
  return "(yield* (function*($globalEnv, $target, isStuck){" + generator.transpile("string", true, warpTimer, isWarp) + "})(runtime.ext_vgspenguinscript._globalEnv, {isStuck, target, waitPromise}))";
}*/ // dont use precompile

function* createObjectStruct(util, ...keysValues) {
  if (keysValues.length % 2 !== 0) throw new TypeError("Each key must have a value in object structs");
  const entries = [];

  for (let i = 0; i < keysValues.length; i += 2) {
    entries.push([keysValues[i], keysValues[i + 1]])
  }
  const struct: any = {__proto__: null, isStruct: true, props:{__proto__:null},isObject:true};
  const props: any = {__proto__: null, ...(Object.fromEntries(entries))};
  struct.getActual = () => props;
  struct.toString = () => "<PenguinScript Object>"
  struct.props.get = {value:function*(util, key){ // an object class, kinda
    return props[key];
  }}
  struct.props.set = {value:function*(util, key, value) {
    return props[key] = value;
  }}
  struct.props.has = {value:function*(util, key) {
    return props[key] != null; // != cuz it looks at undefined too.
  }}
  struct.props.delete = {value:function*(util, key) {
    return delete props[key];
  }}
  struct.props.remove = {value:function*(util, key) {
    delete props[key];
    return struct;
  }}
  struct.props.append = {value:function*(util, key, value) {
    props[key] = value;
    return struct;
  }}
  struct.props.fromJSON = {value:function*(util, json) {
    if (typeof json !== "string") throw new TypeError("Object.fromJSON must be passed a string")
    for (const prop in props) {
      if (Object.hasOwn(props, prop)) delete props[prop];
    }
    try {
      const obj = JSON.parse(json);
      if (typeof obj !== "object" || !obj || Array.isArray(obj)) throw new TypeError("Invalid JSON");
      Object.assign(props, obj);
    } catch(e) {
      throw new TypeError("Invalid JSON")
    }
  }}
  struct.props.toJSON = {value:function*(){
    return JSON.stringify(props);
  }}
  return struct;
}

_globalEnv.__env.set("Object", {
  get value() {return createObjectStruct}
})

function* createArrayStruct(util, ...values) {
  const struct: any = {__proto__: null, isStruct: true, props:{__proto__:null},isArray:true};
  const props = values;
  struct.getActual = () => props;
  struct.toString = () => "<PenguinScript Array>"
  struct.props.get = {value:function*(util, key){
    if (typeof key !== "number") throw new TypeError("Key to array must be a number.");
    key = Math.round(key) || 0;
    return props[key];
  }}
  struct.props.set = {value:function*(util, key, value) {
    if (typeof key !== "number") throw new TypeError("Key to array must be a number.");
    key = Math.round(key) || 0;
    return props[key] = value;
  }}
  struct.props.has = {value:function*(util, key) {
    if (typeof key !== "number") throw new TypeError("Key to array must be a number.");
    key = Math.round(key) || 0
    return key >= 0 && key < props.length; 
  }}
  struct.props.delete = {value:function*(util, key) {
    if (typeof key !== "number") throw new TypeError("Key to array must be a number.");
    key = Math.round(key) || 0
    return props.length = key;
  }}
  struct.props.pop = {value:function*() {
    return props.pop();
  }}
  struct.props.push = {value:function*(util, value) {
    props.push(value);
    return struct;
  }}
  struct.props.shift = {value:function*(){
    return props.shift();
  }}
  struct.props.unshift = {value:function*(util, value){
    props.unshift(value);
    return struct;
  }}
  struct.props.length = {
    get value() {return props.length;},
    set value(val) {
      if (typeof val !== "number") throw new TypeError("Cannot reassign to the length of an array with a non number");
      val = Math.round(val) || 0;
      props.length = val;
    }
  }
  struct.props.fromJSON = {value:function*(util, json) {
    if (typeof json !== "string") throw new TypeError("Array.fromJSON must be passed a string")
    props.length = 0; // erase all properties
    try {
      const obj = JSON.parse(json);
      if (!Array.isArray(obj)) throw new TypeError("Invalid JSON");
      Object.assign(props, obj);
    } catch(e) {
      throw new TypeError("Invalid JSON")
    }
  }}
  struct.props.toJSON = {value:function*(){
    return JSON.stringify(props);
  }}
  return struct;
}

_globalEnv.__env.set("Array", {
  get value() {return createArrayStruct}
})



function* log(util, ...args) {
  console.log(...args);
  return null;
}

function* warn(util, ...args) {
  console.warn(...args);
  return null;
}

function* error(util, ...args) {
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

function* convertToString(util, value: any) {
  return String(value);
}
function* convertToNumber(util, value: any) {
  return Number(value);
}
function* convertToBoolean(util, value: any) {
  return Boolean(value);
}

function* charFromCodePoint(util, value: any) {
  return String.fromCodePoint(Number(value) || 0)
}

function* charToCodePoint(util, value: any) {
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

const customObjectTypes: Record<string, (v) => boolean> = {}; // format: type: test

function* type(util, value: any) {
  if (value == null) return "null"; // use == purposefully so that undefined also returns null.
  if (typeof value === "object") { // its not null, so its an actual object
    for (const Type in customObjectTypes) {
      const works = customObjectTypes[Type](value);
      if (works) return Type;
    }
    if (value.isStruct && value.props) {
      if (value.isError) return "error";
      if (value.isObject) return "object";
      if (value.isArray) return "array";
      if (value.isComplex) return "complex";
      return "struct";
    };
    return "unknown";
  }
  return typeof value;
}

_globalEnv.__env.set("typeof", {
  get value() {return type}
})

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

function* getRandomInt(util, x, y) {
  if (arguments.length === 1) {
    return 0; // what r u doing
  }
  if (arguments.length === 2) {
    y = Math.floor(Number(x));
    x = 0
  } else {
    x = Math.floor(Number(x));
    y = Math.floor(Number(y));
  }
  if (Object.is(x, NaN) || Object.is(y, NaN)) {
    return NaN;
  }

  if (Object.is(x, y)) {
    return x;
  }

  if (x > y) {
    [x, y] = [y, x]; // Swap x and y if x is greater than y
  }

  return Math.floor(Math.random() * (y - x + 1)) + x;
}

function* createComplexStruct(util, x?, y?) {
  let complex;
  try {
    complex = new Complex(x, y);
  } catch {
    throw new TypeError("Invalid arguments passed to Complex")
  }
  const struct: any = {__proto__: null, isStruct: true, isComplex: true, props: {__proto__: null}};
  let im = complex.im;
  let re = complex.re;
  struct.toString = () => new Complex(struct.props.re.value, struct.props.im.value).toString()
  struct.props.re = {get value(){return re}, set value(v){
    if (typeof v !== "number") throw new TypeError("Can only set real or imaginary part of complex to a number.");
    re = v;
  }};
  struct.props.im = {get value(){return im}, set value(v){
    if (typeof v !== "number") throw new TypeError("Can only set real or imaginary part of complex to a number.");
    im = v;
  }};
  struct.props.__add__ = {
    value: function*(util, other) {
      // must be compatible.
      const otherArg = (typeof other === "number") ? new Complex(other) : new Complex(other.props.re.value, other.props.im.value);
      return yield* createComplexStruct(util, new Complex(struct.props.re.value, struct.props.im.value).add(otherArg));
    }
  }
  struct.props.__subtract__ = {
    value: function*(util, other) {
      const otherArg = (typeof other === "number") ? new Complex(other) : new Complex(other.props.re.value, other.props.im.value);
      return yield* createComplexStruct(util, new Complex(struct.props.re.value, struct.props.im.value).sub(otherArg));
    }
  }
  struct.props.__multiply__ = {
    value: function*(util, other) {
      const otherArg = (typeof other === "number") ? new Complex(other) : new Complex(other.props.re.value, other.props.im.value);
      return yield* createComplexStruct(util, new Complex(struct.props.re.value, struct.props.im.value).mul(otherArg));
    }
  }
  struct.props.__divide__ = {
    value: function*(util, other) {
      const otherArg = (typeof other === "number") ? new Complex(other) : new Complex(other.props.re.value, other.props.im.value);
      return yield* createComplexStruct(util, new Complex(struct.props.re.value, struct.props.im.value).div(otherArg));
    }
  }
  struct.props.__power__ = {
    value: function*(util, other) {
      const otherArg = (typeof other === "number") ? new Complex(other) : new Complex(other.props.re.value, other.props.im.value);
      return yield* createComplexStruct(util, new Complex(struct.props.re.value, struct.props.im.value).pow(otherArg));
    }
  }
  const notImplemented = function*() {throw new TypeError("Complex operation not implemented")}; // for impossible or non implemented operations.
  struct.props.__lt__ = {value: notImplemented};
  struct.props.__gt__ = {value: notImplemented};
  struct.props.__le__ = {value: notImplemented};
  struct.props.__ge__ = {value: notImplemented};
  struct.props.__mod__ = {value: notImplemented};

  struct.props.__equals__ = {value: function*(util, other){
    const otherArg = (typeof other === "number") ? new Complex(other) : (other && other.isComplex) ? new Complex(other.props.re.value, other.props.im.value) : null;
    if (otherArg === null) return false;
    return new Complex(struct.props.re.value, struct.props.im.value).equals(otherArg);
  }};
  
  struct.props.__isCompatible__ = {
    value: function*(util, other) {
      return (other && other.isComplex) || typeof other === "number";
    }
  }
  struct.props.arg = {
    get value() {
      return Math.atan2(struct.props.im.value, struct.props.re.value);
    },
    set value(v) {
      const complex = new Complex({arg: v, abs: struct.props.abs.value})
      struct.props.re.value = complex.re;
      struct.props.im.value = complex.im;
    }
  }
  struct.props.modulus = {
    get value() {
      return Math.sqrt(struct.props.re.value ** 2 + struct.props.im.value ** 2);
    },
    set value(v) {
      const complex = new Complex({arg: struct.props.arg.value, abs: v})
      struct.props.re.value = complex.re;
      struct.props.im.value = complex.im;
    }
  }
  
  return struct;
}

Object.assign(createComplexStruct, {
  props: {
    fromArgModulus: {
      value: function*(util, arg, modulus) {
        const complex = Complex({arg, abs: modulus});
        return yield* createComplexStruct(util, complex.re, complex.im);
      }
    }
  },
  isStruct: true
});

_globalEnv.__env.set("Complex", {
  get value() {return createComplexStruct}
})

function* getRandomFloat(util, x, y) {
  if (arguments.length === 1) {
    x = 0;
    y = 1;
  } else if (arguments.length === 2) {
    y = Number(x);
    x = 0;
  } else {
    x = Number(x);
    y = Number(y);
  }
  if (Object.is(x, NaN) || Object.is(y, NaN)) {
    return NaN;
  }

  if (Object.is(x, y)) {
    return x;
  }

  if (x > y) {
    [x, y] = [y, x]; // Swap x and y if x is greater than y
  }

  return Math.random() * (y - x) + x;
}

const MathStruct = (function(){
  const struct: any = {isStruct: true, __proto__: null, isMath: true};
  struct.toString = () => "<PenguinScript Math>"
  const overwritten = 
  {
    __proto__: null,
    random: getRandomFloat,
    randomInt: getRandomInt,
    complex: createComplexStruct
    abs: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.abs(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).abs());
    },
    sign: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.sign(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).sign());
    },
    sqrt: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.sqrt(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).sqrt());
    },
    cbrt: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.cbrt(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).pow(1/3)); // nice hack
    },
    sin: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.sin(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).sin());
    },
    cos: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.cos(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).cos());
    },
    tan: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.tan(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).tan());
    },
    cot: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? 1 / Math.tan(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).cot());
    },
    sec: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? 1 / Math.cos(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).sec());
    },
    csc: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? 1 / Math.sin(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).csc());
    },
    pow: function* (util, v, other) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      if (typeof other !== "number" && (!other || !other.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      const num1 = typeof v === "number" ? v : new Complex(v.props.re.value, v.props.im.value);
      const num2 = typeof other === "number" ? v : new Complex(other.props.re.value, other.props.im.value);
      if (typeof v === "number" && typeof other === "number") return Math.pow(v, other);
      return yield* createComplexStruct(util, new Complex(0, 0).add(num1).pow(num2));
    },
    asin: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.asin(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).asin());
    },
    acos: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.acos(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).acos());
    },
    atan: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.atan(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).atan());
    },
    acot: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.atan(1 / v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).acot());
    },
    asec: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.acos(1 / v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).asec());
    },
    acsc: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.asin(1 / v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).acsc());
    },
    sinh: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.sinh(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).sinh());
    },
    cosh: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.cosh(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).cosh());
    },
    tanh: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.tanh(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).tanh());
    },
    coth: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? 1 / Math.tanh(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).coth());
    },
    sech: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? 1 / Math.cosh(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).sech());
    },
    csch: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? 1 / Math.sinh(v) : new Complex(v.props.re.value, v.props.im.value).csch();
    },
    asinh: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.asinh(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).asinh());
    },
    acosh: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.acosh(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).acosh());
    },
    atanh: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.atanh(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).atanh());
    },
    acoth: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.atanh(1 / v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).acoth());
    },
    asech: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.acosh(1 / v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).asech());
    },
    acsch: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.asinh(1 / v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).acsch());
    },
    atan2: function* (util, v, other) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      if (typeof other !== "number" && (!other || !other.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      const num1 = typeof v === "number" ? v : new Complex(v.props.re.value, v.props.im.value);
      const num2 = typeof other === "number" ? v : new Complex(other.props.re.value, other.props.im.value);
      if (typeof v === "number" && typeof other === "number") return Math.atan2(v, other);
      return yield* createComplexStruct(util, new Complex(0, 0).add(num1).div(num2).atan()); // this is literally how atan2 works
    },
    log: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.log(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).log());
    },
    log2: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.log2(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).log().div(new Complex(2).log()));
    },
    log10: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.log10(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).log().div(new Complex(10).log()));
    },
    exp: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.exp(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).exp());
    },
    expm1: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.expm1(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).expm1());
    },
    ceil: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.ceil(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).ceil(0));
    },
    floor: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.floor(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).floor(0));
    },
    round: function* (util, v) {
      if (typeof v !== "number" && (!v || !v.isComplex)) throw new TypeError("Math operations can only be used on complex and numbers");
      return typeof v === "number" ? Math.round(v) : yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).round(0));
    },
    arg: function* (util, v) {
      if (!v || !v.isComplex) throw new TypeError("Arg can only be used on a complex number because it isn't useful for real numbers");
      return yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).arg());
    },
    conjugate: function* (util, v) {
      if (!v || !v.isComplex) throw new TypeError("Conjugate can only be used on a complex");
      return yield* createComplexStruct(util, new Complex(v.props.re.value, v.props.im.value).conjugate());
    },
    // implement some stuff here later
  };
  struct.props = new Proxy({__proto__: null}, {
    get: (target, prop) =>  Object.hasOwn(overwritten, prop) 
      ? {get value(){return overwritten[prop]}}
      : Object.hasOwn(target, prop) 
      ? {get value(){const item = target[prop];return typeof item==="function"?function*(util, ...args){return item(...args)}:item;}} 
      : {value: null}
  });
  // that was the longest statement ever also i used a proxy so that i dont have to waste space lol.
  return struct;
})()

_globalEnv.__env.set("math", {
  get value() {return MathStruct}
})

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

function* createMethod(util, struct, storedFunc) {
  if (!struct.isStruct) throw new TypeError("You must pass in a struct to createMethod");
  if (typeof storedFunc !== "function") throw new TypeError("You must pass in a function to createMethod")
  return function*(util, ...args) {
    return yield*(storedFunc)(util, struct, ...args);
  };
};

_globalEnv.__env.set("createMethod", {
  get value() {return createMethod}
})

function* createErrorStruct(util, v, type?) {
  if (typeof v === "string") v = new Error(v);
  if ((v ?? null) === null) v = new Error("");
  if (!(v instanceof Error)) throw v;
  if (typeof type === "string") v.name = type;
  const struct: any = {__proto__: null, isStruct: true, isError: true, props:{__proto__: null}};
  struct.toString = () => "<PenguinScript Error>"
  struct.props.msg = {value:v.message || ""};
  struct.props.type = {value:v.name || "Error"};
  struct.props.throw = {value: function*(){
    const err = new Error(struct.props.msg.value);
    err.name = String(struct.props.type.value);
    throw err; // throws the error.
  }}
  return struct;
}

_globalEnv.__env.set("Error", {
  get value() {return createErrorStruct}
})

function* deepClone(util, structToClone) {
  const typeToClone = yield* type(util, structToClone)
  switch (typeToClone) {
    case "error": {
      let err: any;
      try {yield* structToClone.props.throw.value()} catch(e) {err = e;} // this is guaranteed.
      return yield* createErrorStruct(util, err);
    }
    case "object": {
      const actualProps = structToClone.getActual();
      const newStruct = yield* createObjectStruct(util);
      const newProps = Object.assign(newStruct.getActual(), actualProps);
      return newStruct
    }
    case "array": {
      const actualProps = structToClone.getActual();
      const newStruct = yield* createArrayStruct(util);
      const newProps = Object.assign(newStruct.getActual(), actualProps);
      return newStruct
    }
    default: {
      throw new TypeError("Can only deep clone errors, objects, and arrays.")
    }
  }
}

_globalEnv.__env.set("deepClone", {
  get value() {return deepClone}
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
  
  _globalEnv.__env.set("RegExp", {
    get value() {return null} // nonexistent for now
  })

  function hsvToRgb(h, s, v) {
    // Normalize hue to range [0, 360]
    h = h % 360;
  
    // Calculate chroma
    const c = v * s;
  
    // Calculate hue sector
    const sector = Math.floor(h / 60);
  
    // Calculate fractional part of hue
    const f = h / 60 - sector;
  
    // Calculate x and y
    const x = c * (1 - f);
    const y = c * (1 - f * 6);
    const z = c * (1 - (f * 6 - 1));
  
    // Calculate RGB components based on hue sector
    let r, g, b;
    switch (sector) {
      case 0:
        r = c;
        g = z;
        b = 0;
        break;
      case 1:
        r = y;
        g = c;
        b = 0;
        break;
      case 2:
        r = 0;
        g = c;
        b = x;
        break;
      case 3:
        r = 0;
        g = y;
        b = c;
        break;
      case 4:
        r = x;
        g = 0;
        b = c;
        break;
      case 5:
        r = c;
        g = 0;
        b = z;
        break;
    }
  
    // Calculate RGB components based on value
    r = (r + v - c) * 255;
    g = (g + v - c) * 255;
    b = (b + v - c) * 255;
  
    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
  }

  function rgbToHsv(r, g, b) {
    // Normalize RGB values to range [0, 1]
    r = r / 255;
    g = g / 255;
    b = b / 255;
  
    // Find the maximum and minimum values
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
  
    // Calculate the hue
    let h;
    if (max === min) {
      h = 0;
    } else if (max === r) {
      h = 60 * (0 + (g - b) / (max - min));
    } else if (max === g) {
      h = 60 * (2 + (b - r) / (max - min));
    } else if (max === b) {
      h = 60 * (4 + (r - g) / (max - min));
    }
  
    // Calculate the saturation
    const s = max === 0 ? 0 : (max - min) / max;
  
    // Calculate the value
    const v = max;
  
    return { h, s, v };
  }

  function* createColorStruct(util, format?, rh?, gs?, bv?) {
    const struct: any = {__proto__: null, isStruct: true, isColor: true, props:{__proto__:null}};
    let r = 0; // default to just black cuz why not
    let g = 0;
    let b = 0;
    format = String(format ?? "null");
    if (format && rh != undefined && gs != undefined && bv != undefined) {
      if (format.toLowerCase() === "rgb") {
        r = rh || 0;
        g = gs || 0;
        b = bv || 0;
      } else if (format.toLowerCase() === "hsv") {
        const rgb = hsvToRgb(rh || 0, gs || 0, bv || 0);
        r = rgb.r;
        g = rgb.g;
        b = rgb.b;
      }
    }

    struct.props.r = {
      get value() {return r},
      set value(v) {r = v}
    }
    struct.props.g = {
      get value() {return g},
      set value(v) {g = v}
    }
    struct.props.b = {
      get value() {return b},
      set value(v) {b = v}
    }

    struct.props.h = {
      get value() {return rgbToHsv(r, g, b).h},
      set value(v) {const rgb = hsvToRgb(v, struct.props.s.value, struct.props.v.value); r = rgb.r; g = rgb.g; b = rgb.b;}
    }
    struct.props.s = {
      get value() {return rgbToHsv(r, g, b).s},
      set value(v) {const rgb = hsvToRgb(struct.props.h.value, v, struct.props.v.value); r = rgb.r; g = rgb.g; b = rgb.b;}
    }
    struct.props.v = {
      get value() {return rgbToHsv(r, g, b).v},
      set value(v) {const rgb = hsvToRgb(struct.props.h.value, struct.props.s.value, v); r = rgb.r; g = rgb.g; b = rgb.b;}
    }

    return struct;
  }

  _globalEnv.__env.set("Color", {
    get value() {return createColorStruct}
  })
  _globalEnv.__env.set("Colour", {
    get value() {return createColorStruct}
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
      createError: createErrorStruct,
      createObject: createObjectStruct,
      createArray: createArrayStruct,
      createComplex: createComplexStruct,
      *negate(a) {
        if (a && a.isComplex && a.isStruct) return yield* createComplexStruct(this, new Complex(a.props.re.value, a.props.im.value).neg()); // im too lazy to create a new method or check if one already exists
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
          
