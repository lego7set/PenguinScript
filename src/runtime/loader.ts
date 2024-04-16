import { IsPenguinMod } from "../pmUtils/PenguinModDetector";
import { _globalEnv } from "../transpile/jsGen";

const trueEnv = _globalEnv.__env;

class Loader {
  public loadPackage(package) {
    for (const globalIndex of package) {
      const value = package[globalIndex];
      trueEnv.set(globalIndex, {
        get value() {return value},
        set value() {throw new TypeError("Cannot overwrite built-in global")}
      });
    }
  }
  public loadRaw(index, item) {
    trueEnv.set(index, item);
  }
  public loadRawPackage(package) {
    for (const globalIndex of package) {
      const value = package[globalIndex];
      trueEnv.set(globalIndex, value);
    }
  }
  public loadPenguinModPackage(package) {
    if (!IsPenguinMod) return;
    for (const globalIndex of package) {
      const value = package[globalIndex];
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

