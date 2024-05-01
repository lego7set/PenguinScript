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

class SeenMap {
  private map: Record<string, any> = {};
  private awaitedRefs: Record<string, (v)=>void> = {};
  seen(ref: string): boolaen {
    return this.map[ref] !== undefined;
  }
  get(ref: string): any {
    return this.map[ref];
  }
  add<T>(ref: string, obj: T): T {
    if (this.awaitedRefs[ref]) {
      this.awaitedRefs[ref](obj);
      delete this.awaitedRefs[ref];
    }
    return this.map[ref] = obj;
  }
  await(ref: string, callback: (v) => void) {
    this.awaitedRefs[ref] = callback;
  }
  expectComplete() {
    
  }
}

class Transformer { // convert tokens into structs
  // this thingy is so simple (way more simple than the parser)
  protected tokens: Token[];
  public transformed: any;
  protected seen: SeenMap;
  constructor(tks: Token[]) {
    this.tokens = tokens;
    this.seen = new SeenMap();
    // process tokens here

    this.end() // when transform is complete, expect that transform was done.
  }
  public setTokens(tks: Token[]) {
    this.tokens = tokens;
    // process tokens here
  }
  protected transformRecursive(seen = this.seen, current: {obj: any, add: (v) => void} | null = null): any {
    if (!this.not_eof()) throw new TypeError("Unexpected EOF in Serialization -> v1 -> deserialize");
    switch (this.at().type) {
      case TokenType.STRING: {
        // simply just json.parse this thingy
        const tk = this.eat();
        return JSON.parse(tk.raw);
      }
      case TokenType.NUMBER: {
        const raw = this.eat().raw;
        if (raw === "inf") return Infinity;
        if (raw === "-inf") return -Infinity;
        if (raw === "NaN") return NaN;
        try {
          return JSON.parse(raw) as unknown as number;
        } catch(e) {
          throw new SyntaxError("Expected number, got invalid number instead.")
        }
      }
      case TokenType.TRUE: {
        return true;
      }
      case TokenType.FALSE: {
        return false;
      }
      case TokenType.NULL: {
        return null;
      }
      case TokenType.TYPEINFO: {
        // thingy idk
        // complete later
      }
      case TokenType.REF: {
        if (!current) throw new TypeError("Refs may only appear from within objects, arrays, and structs.")
        if (seen.seen(this.at().raw)) return seen.get(this.at().raw);
        // idk if this will ever happen for invalid refs? everything is l -> r
        seen.await(this.at().raw, current.add); // basically what this does is it schedules the assignment of the prop to when the reffed object is there.
      }
    }
  }
  protected not_eof() {
    return this.tokens[0] && this.tokens[0].type !== TokenType.EOF;
  }
  protected eat() {
    return this.tokens.shift() as unknown as Token;
  }
  protected at() {
    return this.tokens[0] as unknown as Token
  }
  protected optional(...types: TokenType[]) {
    if (!this.not_eof()) return null;
    if (types.indexOf(this.at().type) !== -1) return this.eat();
    return null;
  }
  protected expect(...types: TokenType[]) {
    if (types.indexOf(this.at().type) === -1) throw new SyntaxError(`Expected token types ${types.map(v=>TokenType[v]).join(", ")}, but got ${TokenType[this.at().type]} instead.`)
    return this.eat();
  }
  protected end() {
    if (this.at().type !== TokenType.EOF) throw new SyntaxError("Expected EOF, but got " + TokenType[this.at().type] + " instead")
  }
}
