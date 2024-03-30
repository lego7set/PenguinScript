import { NodeType } from "./ast";

import Lexer, { Token, TokenType } from "./lexer";

import type { TokenList, TokenizeOutput } from "./lexer.ts";

import type { Stmt, StmtBody, Program, VariableDeclaration, Expr, BinaryExpr, UnaryExpr, AssignmentExpr, Identifier, NumericLiteral, StringLiteral } from "./ast.ts";

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
      throw new SyntaxError(`Expected ${type} token, got ${token?.type} instead`);
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
      default: {
        return this.parse_expr();
      }
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
      const operand = this.parse_and_expr();
      return {
        kind: NodeType.UnaryExpr,
        operand,
        operator: "not"
      } as UnaryExpr
    }
    return this.parse_and_expr()
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
    let left = this.parse_additive_expr();

    while (this.at().raw === "or") {
      const operator = this.eat().raw;
      const right = this.parse_additive_expr();
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
    const left = this.parse_not_expr();

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
    let left = this.parse_primary_expr();

    while (this.at().raw === "^") {
      const operator = this.eat().raw;
      const right = this.parse_primary_expr();
      left = {
        kind: NodeType.BinaryExpr,
        left,
        right,
        operator
      } as BinaryExpr
    }
    return left;
  }

  protected parse_primary_expr(): Expr {
    const token = this.at().type;
    switch (token) {
      case TokenType.IDENTIFIER: {
        return { kind: NodeType.Identifier, symbol: this.eat().raw } as Identifier
      }
      case TokenType.NUMBER: {
        return { kind: NodeType.PrimitiveLiteral, value: Number(this.eat().raw) } as NumericLiteral
      }
      case TokenType.STRING: {
        return { kind: NodeType.PrimitiveLiteral, value: this.eat().raw } as StringLiteral
      }
      case TokenType.OPEN_PAREN: {
        this.eat();
        const expr = this.parse_expr();
        this.expect(TokenType.CLOSE_PAREN);
        return expr;
      }
      default: {
        throw new SyntaxError(`Invalid token ${token}.`)
      }
    }
  }
}
