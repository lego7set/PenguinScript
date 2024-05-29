enum TokenType {
  // add some token types later.
}

class Token {
  type: TokenType;
  raw: string;
  value: string;
  constructor(type: TokenType, raw: string, processed: string) {
    this.type = type;
    this.raw = raw;
    this.value = processed;
  }
}

class Lexer {
  static source: string = "";
  static position: number = 0;
  static tokenRegexps: [string, RegExp][] = [
    ["identifierKeyword", /^[a-zA-Z_]+[a-ZA-Z0-9_]*/],
    ["number", /^([0-9]+\.?[0-9]*(e[+-]?[0-9]+)?|\.[0-9]+(e[+-]?[0-9]+)?)|0x[0-9a-fA-F]+|0o[0-7]+|0b[01]+/],
    ["string", /^"((?<=\\)"|[^"])*(?<!\\)"/], // this is the worst regexp ive had to think of yet
    ["open_thingy", /^[{([]/],
    ["close_thingy", /^[})\]]/],
    ["increment", /^(++|--)/],
    ["binary_operator", /^([-+*/%^<>]|==|!=)/],
    ["assignment", /^(=|+=|-=|*=|\/=|%=|^=|?=)/], // ?= is binary NOT assignment, which will look something like ?=variable
    ["question_mark", /^\?/],
    ["colon", /^:/]
  ]
  static tokenHandlers: Record<string, (this: typeof Lexer, matched: string) => Token> = {
    
  }
}
