import { NodeType } from "./ast";

import Lexer, { Token, TokenType } from "./lexer";

import type { TokenList, TokenizeOutput } from "./lexer.ts";

import type { Stmt, StmtBody, StmtBlock, NoOp, IfStatement, ElseStatement, Program, VariableDeclaration, Expr, BinaryExpr, UnaryExpr, AssignmentExpr, Identifier, Global, NumericLiteral, StringLiteral, BooleanLiteral, True, False, Null, While, Inline, Function, ReturnStatement, ArgsList, FunctionCall, Target, Break, Continue, Struct, Chaining, Try, In, Ternary, Object, Array, Complex } from "./ast.ts";

export default class Parser {
  public constructor(src: string | TokenList) {
    if (Array.isArray(src)) this.tokens = src;
    else {
      const tokens = new Lexer(src).tokenizeNonGen();
      if (tokens.error) throw tokens.error;
      this.tokens = tokens.tokens;
    }
  }
  protected tokens: TokenList = [];

  protected not_eof(): boolean {
    return this.tokens[0]?.type !== TokenType.EOF;
  }

  protected at(): Token {
    return this.tokens[0] as Token;
  }

  protected eat(): Token {
    return this.tokens.shift() as Token;
  }

  protected expect(...type: TokenType[]): Token {
    const token = this.eat();
    // if (!Array.isArray(type)) type = [type];
    if (!token || type.indexOf(token.type) === -1) {
      throw new SyntaxError(`Expected ${type.map(v => TokenType[v]).join(", ")} token, got ${TokenType[token?.type]} instead`);
    }
    return token;
  }

  public produceAST(): Program {
    const program: Program = {
      kind: NodeType.Program,
      body: []
    };

    while (this.not_eof()) {
      program.body.push(this.parse_stmt())
    }

    return program
  }
  
  protected parse_stmt(): Stmt {
    switch (this.at().type) {
      /*case TokenType.IDENTIFIER: {
        const raw = this.at().raw;
        return {
          kind: NodeType.Identifier,
          symbol: raw
        } as Identifier; // Returns an identifier interface
      }*/
      case TokenType.LET: 
      case TokenType.CONST: {
        return this.parse_variable_declaration();
      }
      case TokenType.OPEN_BRACE: { // parenthesis for stmts, allows for multiple statements where one is expected.
        // consume brace
        this.eat();
        const stmts = [] as StmtBody;
        while (this.at().type !== TokenType.CLOSE_BRACE && this.not_eof()) {
          const stmt = this.parse_stmt();
          stmts.push(stmt);
        }
        this.expect(TokenType.CLOSE_BRACE);
        /*if (this.at().type === TokenType.SEMICOLON) { // you dont really need a semicolon after braces
          this.eat();
        }*/
        return {
          kind: NodeType.StmtBlock,
          body: stmts
        } as StmtBlock;
      }
      case TokenType.IF: {
        return this.parse_if();
      }
      case TokenType.WHILE: {
        return this.parse_loop();
      }
      case TokenType.ELSE: {
        throw new SyntaxError("Unexpected else statement.")
      }
      case TokenType.SEMICOLON: {
        this.eat();
        return {
          kind: NodeType.NoOp
        } as NoOp // an empty statement.
      }
      case TokenType.RETURN: {
        return this.parse_return();
      }
      case TokenType.BREAK: {
        this.eat();
        return {
          kind: NodeType.Break
        } as Break;
      }
      case TokenType.CONTINUE: {
        this.eat();
        return {
          kind: NodeType.Continue
        } as Continue;
      }
      case TokenType.TRY: {
        return this.parse_tryCatchFinally()
      }
      default: {
        const expr = this.parse_expr();
        //if (!(expr.kind === NodeType.Inline)) this.expect(TokenType.SEMICOLON); // expect a semicolon on every statement (except some) // yeah no im longer expecting semicolons due to them being kinda weird.
        return expr;
      }
    }
  }

  protected parse_tryCatchFinally() {
    this.eat(); // consume the try keyword
    const body = this.parse_stmt();
    // expect either catch or finally
    const catchFinally = this.expect(TokenType.CATCH, TokenType.FINALLY);
    let catchBody;
    let catchVar;
    let finallyBody;
    if (catchFinally.type === TokenType.CATCH) {
      // parse an identifier
      catchVar =  this.expect(TokenType.IDENTIFIER).raw;
      catchBody = this.parse_stmt();
      if (this.at().type === TokenType.FINALLY) this.eat(), finallyBody = this.parse_stmt();
    } else {
      finallyBody = this.parse_stmt();
      if (this.at().type === TokenType.CATCH) this.eat(), catchVar = this.expect(TokenType.IDENTIFIER).raw, catchBody = this.parse_stmt();
    }
    return {
      kind: NodeType.Try,
      body,
      catch: catchBody,
      catchVar,
      finally: finallyBody
    } as Try;
  }

  protected parse_return() {
    this.eat(); // eat return
    const expr = this.parse_expr();
    if (this.at().type === TokenType.SEMICOLON) this.eat();
    return {
      kind: NodeType.ReturnStatement,
      value: expr
    } as ReturnStatement
  }

  protected parse_function() {
    // no functions declarations haha
    let name = "";
    this.eat(); // eat fn keyword
    if (this.at().type === TokenType.IDENTIFIER) name = this.eat().raw; 
    const args = this.parse_argslist();
    // parse body
    this.expect(TokenType.OPEN_BRACE); // no single statement functions.
    const stmts = [] as StmtBody;
    while (this.at().type !== TokenType.CLOSE_BRACE && this.not_eof()) {
      const stmt = this.parse_stmt();
      stmts.push(stmt);
    }
    this.expect(TokenType.CLOSE_BRACE);
    const body = {
      kind: NodeType.StmtBlock,
      body: stmts
    } as StmtBlock
    return {
      kind: NodeType.Function,
      args,
      body,
      symbol: name
    }
  }

  protected parse_argslist() {
    this.expect(TokenType.OPEN_PAREN);
    const args = [] as Identifier[];
    while (this.at().type !== TokenType.CLOSE_PAREN && this.not_eof()) {
      let ident: any = this.parse_primary_expr() as Expr;
      if (ident.kind !== NodeType.Identifier) throw new SyntaxError("Expected parameter name.");
      ident = ident as unknown as Identifier; // this is actually annoying
      if (this.at().type !== TokenType.CLOSE_PAREN) this.expect(TokenType.COMMA);
      else if (this.at().type === TokenType.COMMA) this.eat(); // consume one trailing comma, if it exists
      args.forEach((val) => {if (val.symbol === ident.symbol) throw new SyntaxError("Duplicate parameter name")});
      args.push(ident);
    }
    this.expect(TokenType.CLOSE_PAREN);
    const params = {
      kind: NodeType.ArgsList,
      args
    } as ArgsList
    return params;
  }

  protected parse_inline() {
    this.eat(); // eat inline
    const body = this.parse_stmt()
    if (body.kind === NodeType.VariableDeclaration) throw new SyntaxError("Cannot declare a variable in a single-statement context")
    return {
      kind: NodeType.Inline,
      body
    } as Inline
  }

  protected parse_loop() {
    const raw = this.eat().raw
    switch (raw) {
      case "while": {
        return {
          kind: NodeType.While,
          condition: this.parse_expr(),
          body: this.parse_stmt()
        } as While
      }
      case "repeatUntil": {
        return {
          kind: NodeType.While,
          condition: {
            kind: NodeType.UnaryExpr,
            operand: this.parse_expr(),
            operator: "not"
          } as UnaryExpr,
          body: this.parse_stmt()
        }
      }
      case "forever": {
        return {
          kind: NodeType.While,
          condition: {
            kind: NodeType.PrimitiveLiteral,
            value: true
          } as True,
          body: this.parse_stmt()
        }
      }
    }
  }

  protected parse_if() {
    this.eat(); // consume if
    const expr = this.parse_expr(); // for the condition
    const stmt = this.parse_stmt(); // for the body 
    let elseStmt;
    if (this.at().type === TokenType.ELSE) {
      this.eat();
      const elseBody = this.parse_stmt();
      elseStmt = {
        kind: NodeType.ElseStatement,
        body: elseBody
      } as ElseStatement
      return {
        kind: NodeType.IfStatement,
        body: stmt,
        condition: expr,
        else: elseStmt
      }
    }
    return {
      kind: NodeType.IfStatement,
      body: stmt,
      condition: expr
    }
  }

  protected parse_variable_declaration(): VariableDeclaration {
    const isConstant = this.eat().type === TokenType.CONST;
    const identifier = this.expect(TokenType.IDENTIFIER).raw;
    if (this.at().type === TokenType.SEMICOLON) {
      this.eat();
      if (isConstant) {
        throw new SyntaxError("Must declare constant with initializer");
      }
      return {
        kind: NodeType.VariableDeclaration,
        constant: false,
        symbol: identifier
      } as VariableDeclaration
    }

    this.expect(TokenType.EQUALS);

    const declaration = {
      kind: NodeType.VariableDeclaration,
      constant: isConstant,
      symbol: identifier,
      value: this.parse_expr()
    } as VariableDeclaration

    //this.expect(TokenType.SEMICOLON);

    return declaration;
  }
  
  protected parse_expr(): Expr {
    return this.parse_assignment_expr();
  }

  protected parse_not_expr(): UnaryExpr | Expr {
    if (this.at().raw === "not" && this.at().type === TokenType.UNARY_OPERATOR) { // bruh i forgor that strings can do this too
      this.eat(); // consume the not
      const operand = this.parse_not_expr();
      return {
        kind: NodeType.UnaryExpr,
        operand,
        operator: "not"
      } as UnaryExpr
    }
    return this.parse_additive_expr()
  }

  protected parse_and_expr(): BinaryExpr | Expr {
    let left = this.parse_xor_expr();

    while (this.at().raw === "and" && this.at().type === TokenType.BINARY_OPERATOR) {
      const operator = this.eat().raw;
      const right = this.parse_xor_expr();
      left = {
        kind: NodeType.BinaryExpr,
        left,
        right,
        operator
      } as BinaryExpr
    }
    
    return left;
  }

  protected parse_xor_expr(): BinaryExpr | Expr {
    let left = this.parse_or_expr();

    while (this.at().raw === "xor" && this.at().type === TokenType.BINARY_OPERATOR) {
      const operator = this.eat().raw;
      const right = this.parse_or_expr();
      left = {
        kind: NodeType.BinaryExpr,
        left,
        right,
        operator
      } as BinaryExpr
    }
    
    return left;
  }

  protected parse_or_expr(): BinaryExpr | Expr {
    let left = this.parse_relational_expr();

    while (this.at().raw === "or" && this.at().type === TokenType.BINARY_OPERATOR) {
      const operator = this.eat().raw;
      const right = this.parse_relational_expr();
      left = {
        kind: NodeType.BinaryExpr,
        left,
        right,
        operator
      } as BinaryExpr
    }
    
    return left;
  }

  protected parse_relational_expr(): BinaryExpr | Expr {
    let left = this.parse_not_expr();

    while ((this.at().raw === "<" || this.at().raw === ">" || this.at().raw === "==") && this.at().type === TokenType.BINARY_OPERATOR) {
      let operator = this.eat().raw;
      if (operator === "<" || operator === ">") {
        if (this.at().type === TokenType.EQUALS) {
          this.eat(); // consume equals token, and make a <= or >= token instead (also technically  0 >   = 0 is valid code lol, oh and also its only valid code because it wouldn't make sense of > to be the left hand side of assignment)
        }
        operator += "=";
      }
      const right = this.parse_not_expr();
      left = {
        kind: NodeType.BinaryExpr,
        left,
        right,
        operator
      } as BinaryExpr
    }
    
    return left;
  }
  
  protected parse_assignment_expr(): AssignmentExpr | Expr {
    const left = this.parse_ternary_expr();

    if (this.at().type === TokenType.EQUALS) {
      this.eat();
      const value = this.parse_assignment_expr();
      return {
        kind: NodeType.AssignmentExpr,
        value,
        assigne: left
      } as AssignmentExpr
    }

    return left;
  }

  protected parse_ternary_expr(): Ternary | Expr {
    const isIf = this.at().type === TokenType.IF;
    if (isIf) this.eat();
    let left = this.parse_and_expr();
    while (this.at().type === TokenType.IF) {
      // if condition expr1 else if condition2 expr2 else...
      const middle = this.parse_expr();
      let right;
      if (this.at().type === TokenType.ELSE) {
        this.eat();
        right = this.parse_expr();
      };
      left = {
        kind: NodeType.Ternary,
        body: middle,
        condition: left,
        else: right // if is not present, use null as default
      } as Ternary; // typescript is so annoying
    }
    return left;
  }

  protected parse_additive_expr(): BinaryExpr | Expr {
    let left = this.parse_multiplicative_expr();

    while ((this.at().raw === "+" || this.at().raw === "-") && this.at().type === TokenType.BINARY_OPERATOR) {
      const operator = this.eat().raw;
      const right = this.parse_multiplicative_expr();
      left = {
        kind: NodeType.BinaryExpr,
        left,
        right,
        operator
      } as BinaryExpr
    }
    return left;
  }

  protected parse_multiplicative_expr(): BinaryExpr | Expr {
    let left = this.parse_exponential_expr();

    while ((this.at().raw === "*" || this.at().raw === "/" || this.at().raw === "%") && this.at().type === TokenType.BINARY_OPERATOR) {
      const operator = this.eat().raw;
      const right = this.parse_exponential_expr();
      left = {
        kind: NodeType.BinaryExpr,
        left,
        right,
        operator
      } as BinaryExpr
    }
    return left;
  }

  protected parse_exponential_expr(): BinaryExpr | Expr {
    let left = this.parse_chaining_function_call_expr(); // such a long name but it works.

    while (this.at().raw === "^" && this.at().type === TokenType.BINARY_OPERATOR) {
      const operator = this.eat().raw;
      const right = this.parse_exponential_expr(); // 3 ^ 4 ^ 5 would be parsed as 3 (primary) ^, 4 (primary) ^ 5 (primary). so it would be 3^(4^5) instead of (3^4)^5
      left = {
        kind: NodeType.BinaryExpr,
        left,
        right,
        operator
      } as BinaryExpr
    }
    return left;
  }

  protected parse_chaining_function_call_expr() {
    let primary = this.parse_in_expr();
    while (this.at().type === TokenType.OPEN_PAREN) {
      this.expect(TokenType.OPEN_PAREN);
      const args = [] as Expr[];
      while (this.at().type !== TokenType.CLOSE_PAREN && this.not_eof()) {
        const val = this.parse_expr();
        if (this.at().type !== TokenType.CLOSE_PAREN) this.expect(TokenType.COMMA);
        else if (this.at().type === TokenType.COMMA) this.eat(); // consume one trailing comma, if it exists
        args.push(val);
      }
      this.expect(TokenType.CLOSE_PAREN);
      primary = {
        kind: NodeType.FunctionCall,
        func: primary,
        args
      } as FunctionCall;
    } // parse all function calls first. so we can capture things like x()()()()
    
    while (this.at().type === TokenType.CHAINING) { // handle chaining. so that if -> comes after things like x()()()() we can get values of it.
      this.eat(); // eat chaining;
      let ident = this.expect(TokenType.STRING, TokenType.IDENTIFIER).raw;
      primary = {
        kind: NodeType.Chaining,
        item: primary,
        index: ident
      } as Chaining;
      while (this.at().type === TokenType.OPEN_PAREN) {
        this.expect(TokenType.OPEN_PAREN);
        const args = [] as Expr[];
        while (this.at().type !== TokenType.CLOSE_PAREN && this.not_eof()) {
          const val = this.parse_expr();
          if (this.at().type !== TokenType.CLOSE_PAREN) this.expect(TokenType.COMMA);
          else if (this.at().type === TokenType.COMMA) this.eat(); // consume one trailing comma, if it exists
          args.push(val);
        }
        this.expect(TokenType.CLOSE_PAREN);
        primary = {
          kind: NodeType.FunctionCall,
          func: primary,
          args
        } as FunctionCall;
      } // nested loops to catch things like x()()()() -> doStuff()()() -> doStuff(2, 5) -> doStuff(someRandomVar)()
    }
    return primary;
  }

  protected parse_in_expr() {
    const isStringOrIdent = this.at().type === TokenType.IDENTIFIER || this.at().type === TokenType.STRING;
    let left = this.parse_primary_expr();
    
    if (this.at().type === TokenType.BINARY_OPERATOR && this.at().raw === "in") {
      this.eat(); // eat 'in' keyword
      // expect left to be a string or identifier.
      if (!isStringOrIdent) throw new SyntaxError("Left side of in must be an identifier or string");
      let right = this.parse_in_expr(); // lets just make it right-left associative for now.
      // i will have to add a warning in the docs to not chain in expressions.
      left = {
        kind: NodeType.In,
        item: right,
        // @ts-ignore
        index: left.symbol || left.value,
      } as In;
    }
  
    return left;
  }

  protected parse_struct() {
    this.eat(); // eat struct keyword
    this.expect(TokenType.OPEN_BRACKET); // expect bracket
    const body = [] as [string, Expr | null][];
    while (this.at().type !== TokenType.CLOSE_BRACKET) {
      let ident =  "";
      if (this.at().type === TokenType.STRING) ident = this.eat().raw;
      else ident = this.expect(TokenType.IDENTIFIER).raw;
      let expr = null;
      if (this.at().type === TokenType.EQUALS) {
        this.eat();
        expr = this.parse_expr();
      }
      this.expect(TokenType.SEMICOLON);
      body.forEach(value => {
        if (ident === value[0]) throw new SyntaxError("Duplicate member name in struct.")
      });
      body.push([ident, expr]);
    }
    this.expect(TokenType.CLOSE_BRACKET);
    return {
      kind: NodeType.Struct,
      body
    } as Struct;
  }

  protected parse_complicated_literals(): Expr {
    this.eat(); // consume the opening bracket.
    let literalType = "o";
    if (this.at().type === TokenType.IDENTIFIER || this.at().type === TokenType.STRING) {
      literalType = this.eat().raw;
      this.expect(TokenType.SEMICOLON);
    }
    switch (literalType) {
      case "o": {
        // object
        const exprs = [];
        while (this.at().type !== TokenType.CLOSE_BRACKET && this.not_eof()) {
          const pair = [];
          const isIdent = this.at().type === TokenType.IDENTIFIER || this.at().type === TokenType.GLOBAL;
          const key = this.parse_expr();
          pair.push(key); // push key (also change this to use parse assignment expr when i implement comma expression)
          if (this.at().type === TokenType.CHAINING) {
            // non shorthand property.
            this.eat();
            pair.push(this.parse_expr());
          } else {
            // expect key to be an identifier.
            if (!isIdent) throw new SyntaxError("Invalid shorthand property or missing -> arrow");
            const ident = key as unknown as Identifier; // technically it can be global too but who cares?
            pair.push(({kind: NodeType.PrimitiveLiteral, value: key.symbol} as String));
            pair.push(ident); // value here is an ident.
          }
          if (this.at().type !== TokenType.CLOSE_BRACKET) this.expect(TokenType.COMMA);
          exprs.push(pair)
        }
        this.expect(TokenType.CLOSE_BRACKET);
        return ({ kind: NodeType.Object; body: exprs } as Object);
      }
    }
  }

  protected parse_primary_expr(): Expr {
    const token = this.at().type;
    switch (token) {
      case TokenType.BINARY_OPERATOR: { // more like unary operator but who cares?
        if (this.eat().raw !== "-") throw new SyntaxError(`Invalid or unexpected token ${TokenType[token]}.`);
        return { kind: NodeType.UnaryExpr, operand: this.parse_primary_expr(), operator: "-" } // cmon -4 + 3 isnt -7 so we use parse primary expr.
        // we're going to reserve a bunch of other symbols like ++, --. += and other assignment operators we dont need to reserve cuz thats invalid syntax.
      }
      case TokenType.IDENTIFIER: {
        return { kind: NodeType.Identifier, symbol: this.eat().raw } as Identifier
      }
      case TokenType.OPEN_BRACKET: {
        // use brackets [] for all kinds of literals like array, object, complex, and maybe regexp later.
        return this.parse_complicated_literals();
      }
      case TokenType.GLOBAL: {
        this.eat();
        if (this.at().type !== TokenType.IDENTIFIER) throw new SyntaxError("Expected identifier after keyword global");
        return { kind: NodeType.Global, symbol: this.eat().raw } as Global
      }
      case TokenType.TARGET: {
        this.eat();
        return { kind: NodeType.Target } as Target;
      }
      case TokenType.NUMBER: {
        return { kind: NodeType.PrimitiveLiteral, value: Number(this.eat().raw) } as NumericLiteral
      }
      case TokenType.STRING: {
        return { kind: NodeType.PrimitiveLiteral, value: this.eat().raw } as StringLiteral
      }
      case TokenType.TRUE: {
        this.eat();
        return { kind: NodeType.PrimitiveLiteral, value: true } as True
      }
      case TokenType.FALSE: {
        this.eat();
        return { kind: NodeType.PrimitiveLiteral, value: false } as False
      }
      case TokenType.NULL: {
        this.eat();
        return { kind: NodeType.PrimitiveLiteral, value: null } as Null
      }
      case TokenType.OPEN_PAREN: {
        this.eat();
        const expr = this.parse_expr();
        this.expect(TokenType.CLOSE_PAREN);
        return expr;
      }
      case TokenType.FUNCTION: {
        return this.parse_function();
      }
      case TokenType.STRUCT: {
        return this.parse_struct();
      }
      case TokenType.INLINE: {
        return this.parse_inline();
      }
      case TokenType.RESERVED: {
        throw new SyntaxError(`Unexpected reserved word or symbol ${this.at().raw}`);
      }
      default: {
        throw new SyntaxError(`Invalid or unexpected token ${TokenType[token]}.`)
      }
    }
  }
}
