import Parser from "./parsing/parser";

import Lexer from "./parsing/lexer";

class PenguinScript {
  getInfo() {
    return {
      id: "vgspenguinscript",
      name: "PenguinScript",
      blocks: []
    }
  }
  getLexer() {
    return Lexer;
  }
  getParser() {
    return Parser
  }
}

// @ts-ignore
if (typeof Scratch === "object" && Scratch && typeof window === "object" && window && typeof window.document === "object") {
  // Logic here
  if (!Scratch.extensions.isPenguinMod) throw "Please load PenguinScript in PenguinMod";

  Scratch.extensions.register(new PenguinScript());
}

module.exports = {
  PenguinScript,
  Parser,
  default: function transpile(src): string | Function {
    //
    return src;
  }
}
          
