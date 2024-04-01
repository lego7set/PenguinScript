import { NodeType } from "./ast";

import Lexer, { Token, TokenType } from "./lexer";

import type { TokenList, TokenizeOutput } from "./lexer.ts";

import type { Stmt, StmtBody, StmtBlock, NoOp, IfStatement, ElseStatement, Program, VariableDeclaration, Expr, BinaryExpr, UnaryExpr, AssignmentExpr, Identifier, Global, NumericLiteral, StringLiteral, BooleanLiteral, True, False, Null, While, Inline, Function, ReturnStatement, ArgsList, FunctionCall, Target, Break, Continue } from "./ast.ts";

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

  protected expect(type: TokenType): Token {
    const token = this.eat();
    if (!token || token.type !== type) {
      throw new SyntaxError(`Expected ${TokenType[type]} token, got ${TokenType[token?.type]} instead`);
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
        if (this.at().type === TokenType.SEMICOLON) { // you dont really need a semicolon after braces
          this.eat();
        }
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
      default: {
        const expr = this.parse_expr();
        this.expect(TokenType.SEMICOLON); // expect a semicolon on every statement (except some)
        return expr;
      }
    }
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

    this.expect(TokenType.SEMICOLON);

    return declaration;
  }
  
  protected parse_expr(): Expr {
    return this.parse_assignment_expr();
  }

  protected parse_not_expr(): UnaryExpr | Expr {
    if (this.at().raw === "not") {
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

    while (this.at().raw === "and") {
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

    while (this.at().raw === "xor") {
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

    while (this.at().raw === "or") {
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

    while (this.at().raw === "<" || this.at().raw === ">" || this.at().raw === "==") {
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
    const left = this.parse_and_expr();

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

  protected parse_additive_expr(): BinaryExpr | Expr {
    let left = this.parse_multiplicative_expr();

    while (this.at().raw === "+" || this.at().raw === "-") {
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

    while (this.at().raw === "*" || this.at().raw === "/" || this.at().raw === "%") {
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
    let left = this.parse_function_call(); //

    while (this.at().raw === "^") {
      const operator = this.eat().raw;
      const right = this.parse_exponential_exr(); // 3 ^ 4 ^ 5 would be parsed as 3 (primary) ^, 4 (primary) ^ 5 (primary). so it would be 3^(4^5) instead of (3^4)^5
      left = {
        kind: NodeType.BinaryExpr,
        left,
        right,
        operator
      } as BinaryExpr
    }
    return left;
  }

  protected parse_function_call() {
    let primary = this.parse_primary_expr();
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
    }
      
    return primary;
  }

  protected parse_primary_expr(): Expr {
    const token = this.at().type;
    switch (token) {
      case TokenType.IDENTIFIER: {
        return { kind: NodeType.Identifier, symbol: this.eat().raw } as Identifier
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
      case TokenType.INLINE: {
        return this.parse_inline();
      }
      case TokenType.RESERVED: {
        throw new SyntaxError(`Unexpected reserved word ${token.raw}`);
      }
      default: {
        throw new SyntaxError(`Invalid or unexpected token ${TokenType[token]}.`)
      }
    }
  }
}
