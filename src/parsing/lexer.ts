export enum TokenType {
  NUMBER,
  IDENTIFIER,

  OPEN_PAREN, // Grouping
  CLOSE_PAREN,
  OPEN_BRACE, // Block scope
  CLOSE_BRACE,
  OPEN_BRACKET, // Objects. [key -> value, key -> value...]
  CLOSE_BRACKET
}

export type TokenList = Token[];

export class Token {
  public type: TokenType;
  public raw: string;
  public constructor(type: TokenType, raw: string = "") {
    this.type = type;
    this.raw = raw;
  }
}

export default class Lexer {
  public Token: typeof Token = Token;
  public TokenType: typeof TokenType = TokenType;
  public Keywords: Record<string, TokenType> = {
    
  };
  public constructor(sourceCode: string) {
    this.src = sourceCode;
    this.srcArr = sourceCode.split("");
  }
  public *tokenize() {
    const src = this.srcArr;
    while (src.length > 0) {
      switch (src[0]) {
        case "(": {
          const token = new Token(TokenType.OPEN_PAREN, "(")
          this.tokens.push(token);
          yield token;
          break;
        }
        case ")": {
          const token = new Token(TokenType.CLOSE_PAREN, ")")
          this.tokens.push(token);
          yield token;
          break;
        }
        case "{": {
          const token = new Token(TokenType.OPEN_BRACE, "{")
          this.tokens.push(token);
          yield token;
          break;
        }
        case "}": {
          const token = new Token(TokenType.CLOSE_BRACE, "}")
          this.tokens.push(token);
          yield token;
          break;
        }
        case "[": {
          const token = new Token(TokenType.OPEN_BRACKET, "[")
          this.tokens.push(token);
          yield token;
          break;
        }
        case "]": {
          const token = new Token(TokenType.CLOSE_BRACKET, "]")
          this.tokens.push(token);
          yield token;
          break;
        }
        default: {
          // Handle other multi character things here
        }
      }
     }
  }
  protected src: string;
  protected srcArr: string[];
  protected tokens: TokenList;
}
