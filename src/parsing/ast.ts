import type { Token } from "./lexer.ts";

export enum NodeType {
  Program,
  VariableDeclaration,
  AssignmentExpr,
  Identifier,
  PrimitiveLiteral,
  BinaryExpr,
  UnaryExpr,
  StmtBlock,
  IfStatement,
  NoOp,
  ElseStatement
}

export enum OutputType { // going to be unused
  String,
  Number,
  Boolean,
  Object,
  List,
  VariableReference,
  Userdata
}

export enum Precedence {
  //NONE, // lowest
  ASSIGNMENT, // lowest
  NOT,
  AND,
  XOR,
  OR,
  ADDITIVE,
  MULTIPLICATIVE,
  EXPONENTIAL,
  PRIMARY_EXPR // highest
}

export const PrecendenceRules = {
  // do this for later
}

export function TokenToPrecedence(token: Token): Precedence {
  return Precedence.ASSIGNMENT
}

export interface Stmt {
  kind: NodeType;
}

export interface NoOp extends Stmt {
  kind: NodeType.NoOp; // its an empty statement
}

export type StmtBody = Stmt[];

export interface Program extends Stmt {
  kind: NodeType.Program;
  body: StmtBody;
}

export interface StmtBlock extends Stmt {
  kind: NodeType.StmtBlock;
  body: StmtBody;
}

export interface IfStatement extends Stmt {
  kind: NodeType.IfStatement;
  body: Stmt;
  condition: Expr;
  else?: ElseStatement;
}

export interface ElseStatement extends Stmt {
  kind: NodeType.ElseStatement;
  body: Stmt;
}

export interface VariableDeclaration extends Stmt {
  kind: NodeType.VariableDeclaration;
  constant: boolean;
  symbol: string;
  value?: Expr;
}

export interface Expr extends Stmt {};

export interface AssignmentExpr extends Expr {
  kind: NodeType.AssignmentExpr;
  assigne: Expr;
  value: Expr;
}

export interface UnaryExpr extends Expr {
  kind: NodeType.UnaryExpr;
  operand: Expr;
  operator: string;
}

export interface BinaryExpr extends Expr {
  kind: NodeType.BinaryExpr;
  left: Expr;
  right: Expr;
  operator: string;
}

export interface Identifier extends Expr {
  kind: NodeType.Identifier;
  symbol: string;
}

export interface PrimitiveLiteral {
  kind: NodeType.PrimitiveLiteral,
  value: number | string | boolean | null
}

export interface NumericLiteral extends PrimitiveLiteral {
  value: number;
}

export interface StringLiteral extends PrimitiveLiteral {
  value: string;
}
