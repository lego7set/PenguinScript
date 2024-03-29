import type { TokenType, TokenList } from "./parsing/lexer.ts";

import Lexer, { Token } from "./parsing/lexer";

class PenguinScript {
  
}

if (typeof Scratch === "object" && Scratch && window && typeof window === "object" && typeof window.document === "object") {
  // Logic here
}


console.log(Lexer, Token)

module.exports = {
  e: ()=>Lexer,
  PenguinScript,
  default: function transpile(src): string | Function {
    //
    return src;
  }
}
          
