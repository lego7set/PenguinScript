const package: any = { __proto__: null };

import * as ComplexConstructor from "complex.js"; // i forgor to add to package

const Complex = ComplexConstructor as unknown as any;

import nativeFn from "./internal/nativefunc";

// ---------------------------Object------------------------------

package.Object = nativeFn(function* createObjectStruct(...keysValues) {
  if (keysValues.length % 2 !== 0) throw new TypeError("Each key must have a value in object structs");
  const entries = [];

  for (let i = 0; i < keysValues.length; i += 2) {
    entries.push([keysValues[i], keysValues[i + 1]])
  }
  const struct: any = {__proto__: null, isStruct: true, props:{__proto__:null},isObject:true};
  let props: any = {__proto__: null, ...(Object.fromEntries(entries))};
  struct.getActual = () => props;
  struct.overwriteProps = (v) => props = v;
  struct.toString = () => "<PenguinScript Object>";
  struct.props.get = {value:nativeFn(function*(key){ // an object class, kinda
    return props[key];
  }, false, true)};
  struct.props.set = {value:nativeFn(function*(key, value) {
    return props[key] = value;
  }, false, true)};
  struct.props.has = {value:nativeFn(function*(key) {
    return props[key] != null; // != cuz it looks at undefined too.
  }, false, true)};
  struct.props.delete = {value:nativeFn(function*(key) {
    return delete props[key];
  }, false, true)};
  struct.props.remove = {value:nativeFn(function*(key) {
    delete props[key];
    return struct;
  }, false, true)};
  struct.props.append = {value:nativeFn(function*(key, value) {
    props[key] = value;
    return struct;
  }, false, true)};
  /*struct.props.fromJSON = {value:nativeFn(function*(json) {
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
  }, false, true)};
  struct.props.toJSON = {value:nativeFn(function*(){
    return JSON.stringify(props);
  }, false, true)};*/
  return struct;
}, true, true)

// ------------------------------------Array------------------------------

package.Array = nativeFn(function* createArrayStruct(...values) {
  const struct: any = {__proto__: null, isStruct: true, props:{__proto__:null},isArray:true};
  let props = values;
  struct.getActual = () => props;
  struct.overwriteProps = (v) => props = v;
  struct.toString = () => "<PenguinScript Array>"
  struct.props.get = {value:nativeFn(function*(key){
    if (typeof key !== "number") throw new TypeError("Key to array must be a number.");
    if (key < 1 && key > -1) throw new TypeError("Key to array must be not be between 1 and -1");
    if (Object.is(NaN, key)) throw new TypeError("Key to array must not be NaN")
    if (key > 0) key = Math.round(key) || 1;
    if (key < 0) key = props.length - Math.round(Math.abs(key)) + 1
    return props[key - 1]; // match scratch behavior.
  }, false, true)}
  struct.props.set = {value:nativeFn(function*(key, value) {
    if (typeof key !== "number") throw new TypeError("Key to array must be a number.");
    if (key < 1 && key > -1) throw new TypeError("Key to array must be not be between 1 and -1");
    if (Object.is(NaN, key)) throw new TypeError("Key to array must not be NaN")
    if (key > 0) key = Math.round(key) || 1;
    if (key < 0) key = props.length - Math.round(Math.abs(key)) + 1
    return props[key - 1] = value;
  }, false, true)}
  /*struct.props.has = {value:function*(util, key) {
    if (typeof key !== "number") throw new TypeError("Key to array must be a number.");
    key = Math.round(key) || 1;
    return key >= 1 && key <= props.length; 
  }}
  struct.props.delete = {value:function*(util, key) {
    if (typeof key !== "number") throw new TypeError("Key to array must be a number.");
     if (key < 1) throw new TypeError("Key to array must be larger than or equal to 1");
    key = Math.round(key) || 1;
    return props.length = key;
  }}*/ // also remove delete cuz its useless.
  struct.props.pop = {value:nativeFn(function*() {
    return props.pop();
  }, false, true)}
  struct.props.push = {value:nativeFn(function*(value) {
    props.push(value);
    return struct;
  }, false, true)}
  struct.props.shift = {value:nativeFn(function*(){
    return props.shift();
  }, false, true)}
  struct.props.unshift = {value:nativeFn(function*(value){
    props.unshift(value);
    return struct;
  }, false, true)}
  struct.props.length = {
    get value() {return props.length;},
    set value(val) {
      if (typeof val !== "number") throw new TypeError("Cannot reassign to the length of an array with a non number");
      val = Math.round(val) || 0;
      props.length = val;
    }
  }
  /*struct.props.fromJSON = {value:nativeFn(function*(json) {
    if (typeof json !== "string") throw new TypeError("Array.fromJSON must be passed a string")
    props.length = 0; // erase all properties
    try {
      const obj = JSON.parse(json);
      if (!Array.isArray(obj)) throw new TypeError("Invalid JSON");
      Object.assign(props, obj);
    } catch(e) {
      throw new TypeError("Invalid JSON")
    }
  }, false, true)}
  struct.props.toJSON = {value:nativeFn(function*(){
    return JSON.stringify(props);
  }, false, true)}*/
  return struct;
}, true, true)

// ------------------------------------Complex Numbers-------------------------------

const createComplexStruct = nativeFn(function* createComplexStruct(x?, y?) {
  let complex;
  try {
    complex = new Complex(x, y);
  } catch {
    throw new TypeError("Invalid arguments passed to Complex")
  }
  let im = complex.im;
  let re = complex.re;
  const struct: any = {__proto__: null, isStruct: true, isComplex: true, props: {__proto__: null}, get im() {return im}, get re() {return re}}; // people might pass in a complex struct, so this allows you to put it into the complex thingy with erroring
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
}, true, true)

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

package.Complex = createComplexStruct;

// ---------------------------------------Math------------------------------------------

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


package.math = (function(){
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
  const cachedFns = {__proto__: null};
  struct.props = new Proxy({__proto__: null}, {
    get: (target, prop) =>  Object.hasOwn(overwritten, prop) 
      ? {get value(){
        const value = overwritten[prop];
        if (typeof value === "function") {
          return cachedFns[prop] || (cachedFns[prop] = nativeFn(value, false, true))
        }
        return value;
      }}
      : Object.hasOwn(target, prop) 
      ? {get value(){const item = target[prop];return typeof item==="function"?cachedFns[prop]||(cachedFns[prop]=nativeFn(function*(util, ...args){return item(...args)}, false)):item;}} 
      : {value: null}
  });
  // that was the longest statement ever also i used a proxy so that i dont have to waste space lol.
  return struct;
})()

// -------------Errors-------------

package.Error = nativeFn(function* createErrorStruct(util, v, type?) {
  if (typeof v === "string") v = new Error(v);
  if ((v ?? null) === null) v = new Error("");
  if (!(v instanceof Error)) throw v;
  if (typeof type === "string") v.name = type;
  const struct: any = {__proto__: null, isStruct: true, isError: true, props:{__proto__: null}};
  struct.toString = () => "<PenguinScript Error>"
  struct.props.msg = {value:v.message || ""};
  struct.props.type = {value:v.name || "Error"};
  struct.props.throw = {value:nativeFn(function*(){
    const err = new Error(struct.props.msg.value);
    err.name = String(struct.props.type.value);
    throw err; // throws the error.
  }, false)}
  return struct;
}, true, true)

// -----------------------Colo(u)rs--------------------------

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

  const createColorStruct = nativeFn(function* createColorStruct(util, format?, rh?, gs?, bv?) {
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
  }, true, true)

package.Color = createColorStruct;
package.Colour = createColorStruct; // please respect the british

// -----------------------Misc-------------------------------

export const customObjectTypes: Record<string, (v) => boolean> = {}; // format: type: test

export function* type(util, value: any) {
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
      if (value.isColor) return "color"; // sorry british people i cant create a string thats both color and colour
      return "struct";
    };
    return "unknown";
  }
  return typeof value;
}

package.typeof = nativeFn(type, false);

package.deepClone = nativeFn(function* deepClone(util, structToClone) {
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
      const newProps = { __proto__: null };
      for (const prop in actualProps) {
        newProps[prop] = yield* deepClone(util, actualProps[prop])
      }
      Object.assign(newStruct.getActual(), newProps);
      return newStruct
    }
    case "array": {
      const actualProps = structToClone.getActual();
      const newStruct = yield* createArrayStruct(util);
      const newProps = [];
      for (const prop in actualProps) {
        newProps[prop] = yield* deepClone(util, actualProps[prop])
      }
      Object.assign(newStruct.getActual(), newProps);
      return newStruct
    }
    default: {
      // EDIT: just return the thingy
      return structToClone
      // we dont need to let users deepClone complex due to the fact that simply adding zero returns a new instance
      // throw new TypeError("Can only deep clone errors, objects, and arrays.")
    }
  }
}, false)

package.createMethod = nativeFn(function* createMethod(struct, storedFunc) {
  if (!struct.isStruct) throw new TypeError("You must pass in a struct to createMethod");
  if (typeof storedFunc !== "function") throw new TypeError("You must pass in a function to createMethod")
  return function*(util, ...args) {
    return yield*(storedFunc)(util, struct, ...args);
  };
}, false, true);

// -------------------Reserved---------------
package.RegExp = null;
package.Map = null;
package.Set = null;
package.WeakMap = null;
package.WeakSet = null;
package.WeakRef = null;

package.Serialization = null;

export default package;
