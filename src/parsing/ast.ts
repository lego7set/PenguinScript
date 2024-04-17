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
  ElseStatement,
  While,
  Function,
  Inline,
  ReturnStatement,
  ArgsList,
  FunctionCall,
  Global,
  Target,
  Break,
  Continue,
  Struct,
  Chaining,
  Try,
  In,
  Ternary,
  Object,
  Array,
  RegExp, // unused as of now
  Complex,
  ErrorLiteral,
  Color,
  Indexing
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

export interface Ternary extends Expr {
  kind: NodeType.Ternary;
  body: Expr;
  condition: Expr;
  else?: Expr;
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

export interface Global extends Expr {
  kind: NodeType.Global;
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

export interface BooleanLiteral extends PrimitiveLiteral {
  value: boolean;
}

export interface True extends BooleanLiteral {
  value: true;
}

export interface False extends BooleanLiteral {
  value: false;
}

export interface Null extends PrimitiveLiteral {
  value: null;
}

export interface While extends Stmt {
  kind: NodeType.While;
  condition: Expr;
  body: Stmt;
}

export interface ArgsList extends Expr {
  kind: NodeType.ArgsList;
  args: Identifier[];
} // its a node, but yeah.

export interface ReturnStatement extends Stmt {
  kind: NodeType.ReturnStatement;
  value: Expr;
}

export interface Function extends Expr {
  kind: NodeType.Function;
  args: ArgsList;
  body: Stmt;
  symbol?: string;
}

export interface Inline extends Expr {
  kind: NodeType.Inline;
  body: Stmt;
}

export interface FunctionCall extends Expr {
  kind: NodeType.FunctionCall;
  func: Expr;
  args: Expr[];
}

export interface Target extends Expr {
  kind: NodeType.Target;
}

export interface Break extends Stmt {
  kind: NodeType.Break;
}

export interface Continue extends Stmt {
  kind: NodeType.Continue;
}

export interface Struct extends Expr {
  kind: NodeType.Struct;
  body: [string, Expr | null][];
}

export interface Chaining extends Expr {
  kind: NodeType.Chaining;
  item: Expr;
  index: string;
}

export interface In extends Expr {
  kind: NodeType.In;
  item: Expr;
  index: string;
}

export interface Try extends Stmt {
  kind: NodeType.Try;
  body: Stmt;
  catch?: Stmt;
  catchVar?: string;
  finally?: Stmt
}

export interface Object extends Expr {
  kind: NodeType.Object; // [...] or [o; ...]
  body: [Expr, Expr][];
}

export interface Array extends Expr {
  kind: NodeType.Array; // [a; ...]
  body: Expr[]
}

export interface ComplexLiteral extends Expr {
  kind: NodeType.Complex;
  re?: Expr; // [c; 1, 5] is valid but [c; "13 + 5i"] is also valid. [c;] is also valid.
  im?: Expr;
}

export interface ErrorLiteral extends Expr {
  kind: NodeType.ErrorLiteral; // [er; type, msg]
  msg: Expr;
  type: Expr;
}

export interface Color extends Expr {
  kind: NodeType.Color;
  format: "rgb" | "hsv";
  first: Expr;
  second: Expr;
  third: Expr;
}

export interface Indexing extends Expr {
  kind: NodeType.Indexing;
  left: Expr;
  right: Expr;
}
