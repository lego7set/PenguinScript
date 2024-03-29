export enum TokenType {
  NUMBER, // Literal types
  STRING,
  IDENTIFIER,

  LET,

  EQUALS,
  BINARY_OPERATOR,

  OPEN_PAREN, // Grouping
  CLOSE_PAREN,
  OPEN_BRACE, // Block scope
  CLOSE_BRACE,
  OPEN_BRACKET, // Objects. [key -> value, key -> value...]
  CLOSE_BRACKET
}

export type TokenList = Token[];

export interface TokenizeOutput {
  error: Error | null;
  tokens: TokenList;
}

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
    let: TokenType.LET,
    
  };
  public constructor(sourceCode: string) {
    this.src = sourceCode;
    this.srcArr = sourceCode.split("");
    this.tokens = ([] as TokenList)
  }
  public *yieldToken(token) {
    this.tokens.push(token);
    yield token;
  }
  public *tokenize() {
    const src = this.srcArr;
    while (src.length > 0) {
      switch (src[0]) {
        case "(": {
          const token = new Token(TokenType.OPEN_PAREN, src.shift())
          this.tokens.push(token);
          yield token;
          break;
        }
        case ")": {
          const token = new Token(TokenType.CLOSE_PAREN, src.shift())
          this.tokens.push(token);
          yield token;
          break;
        }
        case "{": {
          const token = new Token(TokenType.OPEN_BRACE, src.shift())
          this.tokens.push(token);
          yield token;
          break;
        }
        case "}": {
          const token = new Token(TokenType.CLOSE_BRACE, src.shift())
          this.tokens.push(token);
          yield token;
          break;
        }
        case "[": {
          const token = new Token(TokenType.OPEN_BRACKET, src.shift())
          this.tokens.push(token);
          yield token;
          break;
        }
        case "]": {
          const token = new Token(TokenType.CLOSE_BRACKET, src.shift())
          this.tokens.push(token);
          yield token;
          break;
        }
        default: {
          // Handle other multi character things here
          if (/^[_a-zA-Z]$/.test(src[0])) {
            // This is an identifier / keyword
            let str = ""
            for (; typeof src[0] === "string" && /^[_a-zA-Z]+[_a-zA-Z0-9]*$/.test(str + src[0]) && src.length > 0; str += src.shift());
            let tokenType: TokenType;
            if (tokenType = this.Keywords[str]) yield* this.yieldToken(new Token(tokenType, str));
            else yield* this.yieldToken(new Token(TokenType.IDENTIFIER, str));
          } else if (/^[0-9]$.test(src[0])/) {
            // This is a number
            let num = "";
            for (;typeof src[0] === "string" && /^[0-9]+$/.test(num + src[0]) && src.length > 0; num += src.shift());
            if (src[0] === "." && /^[0-9]$/.test(String(src[1]))) {
              num += src.shift();
              num += src.shift();
              for (;typeof src[0] === "string" && /^[0-9]+\.[0-9]+$/.test(num + src[0]) && src.length > 0; num += src.shift());
            }
            yield* this.yieldToken(new Token(TokenType.NUMBER, num));
          } else if (src[0] === '"') {
            // do not actually include the opening and closing quotes.
            src.shift();
            let str = "";
            for (;typeof src[0] === "string" && src[0] !== '"' && src.length > 0;) {
              const char = src.shift();
              if (char === "\\") {
                const char = src.shift();
                switch (char) {
                  case "n": {
                    str += "\n";
                    break;
                  }
                  case "f": {
                    str += "\f";
                    break;
                  }
                  case "r": {
                    str += "\r";
                    break;
                  }
                  case "t": {
                    str += "\t";
                    break;
                  }
                  case "v": {
                    str += "\v";
                    break;
                  }
                  case "b": {
                    str += "\b"
                    break;
                  }
                  case "c": {
                    const letter = src.shift();
                    // who cares if we throw an error from the lexer
                    if ((!letter) || (!/^[a-zA-Z]$/.test(letter))) throw new SyntaxError(`Expected letter after escape sequence \\c, got ${letter || '<EOF>'} instead`);
                    str += String.fromCodePoint(letter.codePointAt() % 32);
                    break;
                  }
                  case "x": {
                    // hex escape sequence.
                    // expects two hex digits ahead.
                    let char1;
                    let char2;
                    if (/^[0-9a-fA-F]+$/.test((char1 = src[0]) + (char2 = src[1]))) str += String.fromCodePoint(Number("0x" + src.shift() + src.shift()));
                    else throw new SyntaxError(`Expected two hexadecimal digits after escape sequence \\x, got ${char1 || "<EOF>"}${char1 ? char2 || " and <EOF>" : ""} instead`;
                    break;
                  }
                  case "u": {
                    // unicode escape sequence.
                    // expects four hex digits ahead
                    if (/^[0-9a-fA-F]+$/.test(src.slice(0,4).join(""))) str += String.fromCodePoint(Number("0x" + src.shift() + src.shift() + src.shift() + src.shift()));
                    else throw new SyntaxError("Invalid Unicode escape sequence, expected 4 hexadecimal digits. ");
                    break;
                  }
                  case "U": {
                    // larger unicode escape sequence.
                    // expects sisx hex digits ahead
                    if (/^[0-9a-fA-F]+$/.test(src.slice(0,6).join(""))) str += String.fromCodePoint(Number("0x" + src.shift() + src.shift() + src.shift() + src.shift() + src.shift() + src.shift()));
                    else throw new SyntaxError("Invalid Unicode escape sequence, expected 6 hexadecimal digits. ");
                    break;
                  }
                  case "s": {
                    // first emoji escape sequence. skull emoji
                    str += "\u{1F480}";
                    break;
                  }
                  case "m": {
                    // second emoji escape sequence, mo'ai emoji
                    str += "\u{1F5FF}";
                    break;
                  }
                  case "z": {
                    // third emoji escape sequence, cold (frozen) face emoji
                    str += "\u{1F976}";
                    break;
                  }
                  case "l": 
                  case "T": {
                    // fourth emoji escape sequence, turtle emoji
                    str += "\u{1F422}";
                    break;
                  }
                  case "F": {
                    // fifth emoji escape sequence, fire emoji
                    str += "\u{1F525}";
                    break;
                  }
                  case "S":
                  case "a": {
                    // Sparkles / Shiny / Awesome emoji (sixth emoji escape sequence)
                    str += "\u{2728}"
                    break;
                  }
                  case "p": {
                    // final, and the best, emoji escape sequence: The PENGUIN EMOJI
                    str += "\u{1F427}";
                    break;
                  }
                  case "0": {
                    str += "\x00";
                    break;
                  }
                  default: {
                    str += (char || "");
                    break;
                  }
                }
              };
              else str += char;
            }
            if (src.shift() !== '"') throw new SyntaxError("Expected closing quotes, got <EOF> instead."); // consume the closing quote and throw if not present.
            yield* this.yieldToken(new Token(TokenType.STRING, str))
          } else if (/^[ \n\r]+$/.test(src[0])) {
            // skip, do nothing.
          }
        }
      }
    }
  }
  public tokenizeNonGen(): TokenizeOutput {
    this.tokens = ([] as TokenList);
    const tokens = ([] as TokenList)
    try {
      for (const token of this.tokenize()) {
        tokens.push(token)
      }
    } catch(error) {
      return ({ error, tokens } as TokenizeOutput);
    }
    return ({ error: null, tokens } as TokenizeOutput);
    //return Array.from(this.tokenize());
  }
  protected src: string;
  protected srcArr: string[];
  protected tokens: TokenList;
}
