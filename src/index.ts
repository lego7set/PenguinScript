import Parser from "./parsing/parser";

import Lexer from "./parsing/lexer";

const xyz = new Lexer("abcdefg").tokenizeNonGen()
console.log(xyz);

debugger;

console.log(new Parser(xyz.tokens).produceAST())

class PenguinScript {
  
}

// @ts-ignore
if (typeof Scratch === "object" && Scratch && window && typeof window === "object" && typeof window.document === "object") {
  // Logic here
}

module.exports = {
  PenguinScript,
  Parser,
  default: function transpile(src): string | Function {
    //
    return src;
  }
}
          
