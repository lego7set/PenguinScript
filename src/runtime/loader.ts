import { IsPenguinMod } from "../pmUtils/PenguinModDetector";
import { _globalEnv } from "../transpile/jsGen";

const trueEnv = _globalEnv.__env;

class Loader {
  public loadPackage(pkg) {
    if (typeof pkg.onLoad === "function") {
      pkg.onLoad.call(this, pkg);
      delete pkg.onLoad;
    }
    for (const globalIndex in pkg) {
      const value = pkg[globalIndex];
      trueEnv.set(globalIndex, {
        get value() {return value},
        set value(v) {throw new TypeError("Cannot overwrite built-in global")}
      });
    }
  }
  public loadRaw(index, item) {
    trueEnv.set(index, item);
  }
  public loadRawPackage(pkg) {
    for (const globalIndex in pkg) {
      const value = pkg[globalIndex];
      trueEnv.set(globalIndex, value);
    }
  }
  public loadPenguinModPackage(pkg) {
    if (!IsPenguinMod) return;
    if (typeof pkg.onLoad === "function") {
      pkg.onLoad.call(this, pkg);
      delete pkg.onLoad;
    }
    for (const globalIndex of pkg) {
      const value = pkg[globalIndex];
      trueEnv.set(globalIndex, {
        get value() {return value},
        set value() {throw new TypeError("Cannot overwrite built-in global")}
      });
    }
  }
  public require(globalIndex) {
    return trueEnv.get(globalIndex)?.value;
  }
  public requireScratch() {
    // @ts-ignore
    if (IsPenguinMod) return window.Scratch;
    return null;
  }
}

export default new Loader();

