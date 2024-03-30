import Parser from "./parsing/parser";

import Lexer from "./parsing/lexer";

const xyz = new Lexer("let x = 5; x = x or 5 and 3 or not 7").tokenizeNonGen()
console.log(xyz);

debugger;

console.log(new Parser("let x = 5; x = x xor 5 and 3 or not 7").produceAST())

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
          
