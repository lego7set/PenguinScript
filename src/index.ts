import type { TokenType, TokenList } from "./parsing/lexer.ts";

import Lexer, { Token } from "./parsing/lexer";

console.log(Lexer, Token)

module.exports = {
  e: ()=>Lexer
}
