export enum NodeType {
  Program,
  VariableDeclaration,
  AssignmentExpr,
  Identifier,
  PrimitiveLiteral,
  BinaryExpr,
  UnaryExpr
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

export interface Stmt {
  kind: NodeType;
}

export type StmtBody = Stmt[];

export interface Program extends Stmt {
  kind: NodeType.Program;
  body: StmtBody;
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

export interface Identifer extends Expr {
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
