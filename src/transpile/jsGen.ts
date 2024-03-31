import type {Stmt, NoOp, StmtBody, Program, StmtBlock, IfStatement, ElseStatement, VariableDeclaration, Expr, AssignmentExpr, UnaryExpr} from "../parsing/ast.ts";
import { NodeType } from "../parsing/ast";

export enum OutputType {
  TYPE_NUMBER,
  TYPE_STRING,
  TYPE_BOOOLEAN,
  TYPE_UNKNOWN
  // introduce other types later
}



export interface Input {
  asNumber: () => string;
  asString: () => string;
  asBoolean: () => string;
  asUnknown: () => string;
  isAlwaysNumber: () => boolean;
  isAlwaysString: () => boolean;
}

class TypedInput implements Input {
  src: string;
  type: OutputType;

  public isAlwaysNumber() {
    return this.type === OutputType.TYPE_NUMBER;
  }

  public isAlwaysString() {
    return this.type === OutputType.TYPE_STRING;
  }

  public asNumber() {
    if (this.isAlwaysNumber()) {
      return this.src;
    }
    return `Number(${this.src})`;
  }

  public asString() {
    if (this.isAlwaysString()) {
      return this.src;
    }
    return `String(${this.src})`;
  }

  public asBoolean() {
    return `((${this.src} ?? false) === false)`
  }

  public asUnknown() {
    return this.src;
  }
  
  public constructor(src: string, type: OutputType) {
    this.src = src;
    this.type = type;
  }
}

class ConstantInput implements Input {
  constantValue: any;
  
  public constructor(constantValue: any) {
    this.constantValue = constantValue;
  }

  public isAlwaysNumber() {
    return typeof this.constantValue === "number";
  }

  public isAlwaysString() {
    return typeof this.constantValue === "string";
  }
  
  public asNumber() {
    if (this.isAlwaysNumber()) {
      return this.constantValue.toString();
    }
    return Number(this.constantValue).toString();
  }
  public asString() {
    if (this.isAlwaysString()) {
      return JSON.stringify(this.constantValue);
    }
    return JSON.stringify(this.constantValue.toString());
  }
  public asBoolean() {
    if (typeof this.constantValue === "boolean") {
      return this.constantValue.toString();
    }
    return ((this.constantValue ?? false) === false).toString();
  }
  public asUnknown() {
    switch (typeof this.constantValue) {
      case "number": return this.asNumber();
      case "boolean": return this.asBoolean();
      case "object": if (!this.constantValue) return "null"; else throw new Error("Unexpected Object.")
      default: return this.asString();
    }
  }
}

export function* VariablePool(prefix: string) {
  let i = 0;
  while (true) yield prefix + i++;
}

const ScriptPool = VariablePool("s");

export interface GlobalEnv {
  get: (key: any) => any;
  set: <T>(key: any, value: T) => T;
  remove: (key: any) => boolean;
  readOnly: (key: any) => boolean;
  makeReadOnly: (key: any) => void;
  __env: Map<any, any>;
  __readonly: <any, boolean>;
}

export const _runtimeVariables = {
  __proto__: null, // make it null prototype
};

export const _globlEnv: GlobalEnv = {
  __env: new Map<any, any>(),
  __readonly: new Map<any, boolean>(),
  makeReadOnly: function MAKE_READ_ONLY(k) {
    return this.__readonly.set(k, true);
  },
  readOnly: function READ_ONLY(k) {
    return this.__readonly.get(k);
  },
  set: function SET(k, v){
    if (this.__readonly.get(k)) throw new TypeError("Attempted to overwrite read-only global");
    this.__env.set(k, v);
    return v;
  },
  remove: function REMOVE(k) {
    if (this.__readonly.get(k)) throw new TypeError("Attempted to remove read-only global");
    return this.__env.delete(k);
  },
  get: function GET(k) {
    return this.__env.get(k) ?? null;
  }
}

export type TranspiledFunction = ($globalEnv, $target) => any

export default class JSGenerator {
  protected program;
  protected src: string = "let _;let _2;let _3;let _4"; // add some variables so we can use them inside expressions
  protected scriptName: string;
  public constructor(program) {
    this.program = program;
    this.scriptName = ScriptPool.next();
    this._variablePool = VariablePool("v");
    this._cachedVariables = {
      
    };
    this._runtimeVariables = _runtimeVariables;
    this._globalEnv = _globalEnv;
  }

  public transpile(asFunc: boolean): string | Function {
    const program = this.program;
    for (const node of program.body) {
      this.descendNode(node);
    }
  }

  protected descendNode(node: Stmt): void {
    switch (node.kind) {
      case NodeType.NoOp: {
        break;
      }
      case NodeType.StmtBlock: {
        this.src += "{"
        for (const stmt of node.body) this.descendNode(stmt);
        this.src += "}";
        break;
      }
      case NodeType.IfStatement: {
        this.src += "if(";
        this.descendExpr(node.condition);
        this.src += ")";
        if (node.body.kind === NodeType.VariableDeclaration) throw new SyntaxError("Cannot declare a variable in a single-statement context")
        this.descendNode(node.body);
        if (node.else) {
          this.src += "else ";
          if (node.else.body.kind === NodeType.VariableDeclaration) throw new SyntaxError("Cannot declare a variable in a single-statement context")
          this.descendNode(node.else.body);
        }
        this.src += ";";
        break;
      }
      case NodeType.VariableDeclaration: {
        const ident = this.getVariable(node.symbol);
        node.constant ? this.src += "const " : this.src += "let ";
        this.src += ident;

        if (node.value) {
          const value = this.descendExpr(node.value);
          this.src += "=";
          this.src += value.asUnknown();
        }
        this.src += ";";
        break;
      }
      default: {
        const expr = this.descendExpr(node);
        this.src += expr.asUnknown();
        this.src += ";";
      }
    }

    protected descendExpr(node: Stmt): Input {
      switch (node.kind) {
        case NodeType.AssignmentExpr: {
          if (node.assigne.kind !== NodeType.Identifier) throw new SyntaxError("Invalid left-hand in assignment")// add for member assignment later
          const assigne = this.descendExpr(node.assigne);
          const value = this.descendExpr(node.value);
          return new TypedInput(`((${assigne.asUnknown()}) = (${value.asUnknown()}))`);
        }
        case NodeType.UnaryExpr: {
          const operand = this.descendExpr(node.operand);
          if (node.operator === "not") return new TypedInput(`(!(${operand.asBoolean()}))`, OutputType.TYPE_BOOLEAN);
          throw new SyntaxError("Unknown unary operator");
        }
        case NodeType.BinaryExpr: {
          switch (node.operator) {
            case "and": {
              const left = this.descendExpr(node.left);
              const right = this.descendExpr(node.right);
              return new TypedInput(`(_ = ${left.asUnknown()}, _2 = ${right.asUnknown()}, (((_ ?? false) === false) && !((_2 ?? false) === false)) ? _ : (((_2 ?? false) === false) && !((_ ?? false) === false)) ? _2 : _)`)
            }
            case "xor": {
              const left = this.descendExpr(node.left);
              const right = this.descendExpr(node.right);
              return new TypedInput(`(_ = ${left.asUnknown()}, _2 = ${right.asUnknown()}, (((_ ?? false) === false) && !((_2 ?? false) === false)) ? _2 : (((_2 ?? false) === false) && !((_ ?? false) === false)) ? _ : false)`)
            }
            case "or": {
              const left = this.descendExpr(node.left);
              const right = this.descendExpr(node.right);
              return new TypedInput(`(_ = ${left.asUnknown()}, _2 = ${right.asUnknown()}, (((_ ?? false) === false) && !((_2 ?? false) === false)) ? _ : _2)`)
            }
            case "+": {
              const left = this.descendExpr(node.left);
              const right = this.descendExpr(node.right);
              return new TypedInput(`(${left.asNumber()} + ${right.asNumber()})`) // dont be like js, be more like pm (which is awesome!!!).
            }
            case "-": {
              const left = this.descendExpr(node.left);
              const right = this.descendExpr(node.right);
              return new TypedInput(`(${left.asNumber()} - ${right.asNumber()})`)
            }
            case "*": {
              const left = this.descendExpr(node.left);
              const right = this.descendExpr(node.right);
              return new TypedInput(`(${left.asNumber()} * ${right.asNumber()})`)
            }
            case "/": {
              const left = this.descendExpr(node.left);
              const right = this.descendExpr(node.right);
              return new TypedInput(`(${left.asNumber()} / ${right.asNumber()})`)
            }
            case "%": {
              const left = this.descendExpr(node.left);
              const right = this.descendExpr(node.right);
              return new TypedInput(`(${left.asNumber()} % ${right.asNumber()})`)
            }
            case "^": {
              const left = this.descendExpr(node.left);
              const right = this.descendExpr(node.right);
              return new TypedInput(`(${left.asNumber()} ** ${right.asNumber()})`)
            }
          }
        }
        case NodeType.PrimitiveLiteral: {
          const value = node.value;
          return new ConstantInput(value);
        }
      }
    }
  }
}
