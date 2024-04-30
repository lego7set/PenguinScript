enum TokenType {
  TYPEINFO,
  STRING,
  NUMBER,
  TRUE,
  FALSE,
  NULL,
  COMMA,
  SEMICOLON,
  OPEN_LIST,
  CLOSE_LIST,
  REF,
  EOF
}

const lexerRegex = {
  REF: /^\$ref[0-9]+/,
  TRUE: /^true/,
  FALSE: /^false/,
  NULL: /^null/,
  TYPEINFO: /^[a-zA-Z]+/,
  STRING: /^"([^"\\]|\\.)*"/,
  NUMBER: /^(inf)|(-inf)|(NaN)|([-0-9\.e+]+)/,
  COMMA: /^,/,
  SEMICOLON: /^;/,
  OPEN_LIST: /^\[/,
  CLOSE_LIST: /^]/
}

class Token {
  public type: TokenType;
  public raw: string;
  constructor(type: TokenType, raw: string) {
    this.type = type;
    this.raw = raw;
  }
}

class Lexer { // the deserializer lexer. im going to use regexp cuz its faster and this thingy isnt very complex
  protected input: string;
  protected position = 0;
  public tokens: Token[] = [];
  constructor(input: string) {
    this.input = input;
    let tk;
    while (tk = this.getNextToken(), tk.type !== TokenType.EOF) this.tokens.push(tk);
    this.tokens.push(new Token(TokenType.EOF, ""));
  }

  protected getNextToken(): Token {
    // this is chatgpt btw
    // Check for end of input
    if (this.position >= this.input.length) {
      return new Token(TokenType.EOF, "");
    }
  
    // Iterate through regular expressions and find the first match
    for (const type in lexerRegex) {
      const regex = lexerRegex[type as keyof typeof lexerRegex];
      const match = regex.exec(this.input.substring(this.position));
      if (match) {
        const raw = match[0];
        this.position += raw.length;
        return new Token(TokenType[type], raw);
      }
    }
  
    // If no match found, throw an error
    throw new Error(`Unexpected character at position ${this.position}`);
  }
}
