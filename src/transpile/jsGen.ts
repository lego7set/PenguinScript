import type { Stmt, NoOp, StmtBody, Program, StmtBlock, IfStatement, ElseStatement, VariableDeclaration, Expr, AssignmentExpr, BinaryExpr, UnaryExpr, Identifier, Global, PrimitiveLiteral, NumericLiteral, StringLiteral, BooleanLiteral, True, False, Null, While, ArgsList, ReturnStatement, Function, FunctionCall, Inline, Target } from "../parsing/ast.ts";
import { NodeType } from "../parsing/ast";

export enum OutputType {
  TYPE_NUMBER,
  TYPE_STRING,
  TYPE_BOOLEAN,
  TYPE_UNKNOWN
  // introduce other types later
}



export interface Input {
  asNumber: () => string;
  asString: () => string;
  asBoolean: () => string;
  asUnknown: () => string;
  asIdent: () => string;
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
    return `(${this.src} ?? null)`;
  }

  public asIdent() {
    return `(${this.src})`;
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
  public asIdent() {
    return "(null)";
  }
}

export function* VariablePool(prefix: string) {
  let i = 0;
  while (true) yield prefix + i++;
}

const ScriptPool = VariablePool("s");

export interface GlobalValue {
  value: any;
}

export interface GlobalEnv {
  get: (key: any) => any;
  set: <T>(key: any, value: T) => T;
  remove: (key: any) => boolean;
  readOnly: (key: any) => boolean;
  makeReadOnly: (key: any) => void;
  __env: Map<any, GlobalValue>;
  __readonly: Map<any, boolean>;
}

export const _globalEnv: GlobalEnv = {
  __env: new Map<any, GlobalValue>(),
  __readonly: new Map<any, boolean>(),
  makeReadOnly: function MAKE_READ_ONLY(k) {
    
    return this.__readonly.set(k, true);
  },
  readOnly: function READ_ONLY(k) {
    return this.__readonly.get(k);
  },
  set: function SET(k, v){
    //throw new Error("deprecated");
    if (this.__readonly.get(k)) throw new TypeError("Attempted to overwrite read-only global");
    this.__env.set(k, v);
    return v;
  },
  remove: function REMOVE(k) {
    //throw new Error("deprecated")
    if (this.__readonly.get(k)) throw new TypeError("Attempted to remove read-only global");
    return this.__env.delete(k);
  },
  get: function GET(k) {
    return this.__env.get(k) ?? (this.__env.set(k, {value: null} as GlobalValue), this.__env.get(k));
  }
}

export type TranspiledFunction = ($globalEnv, $target, isStuck) => any;
export type TranspiledGenerator = ($globalEnv, $target, isStuck) => Generator<any>;

const GeneratorFunction = function*(){}.constructor as unknown as GeneratorFunctionConstructor;

export default class JSGenerator {
  protected program;
  protected src: string = "let _;let _2;let _3;let _4;"; // add some variables so we can use them inside expressions
  protected scriptName: string;
  protected _variablePool: Generator<string>;
  protected _cachedVariables: Record<string, string>;
  protected _globalEnv: GlobalEnv;
  public warpTimer: boolean;
  public isWarp: boolean;
  public yields: boolean;
  public constructor(program) {
    this.program = program;
    this.scriptName = ScriptPool.next().value as unknown as string;
    this._variablePool = VariablePool("v");
    this._cachedVariables = {
      __proto__: null
    };
    this._globalEnv = _globalEnv;
  }

  public transpile(type: "string" | "func" | "generator", yields?: boolean, warpTimer?: boolean, isWarp?: boolean): string | TranspiledFunction | TranspiledGenerator {
    const program = this.program;
    this.warpTimer = warpTimer;
    this.isWarp = isWarp;
    this.yields = yields; // guaranteed to be true but, let some people do their stuff ig
    for (const node of program.body) {
      this.descendNode(node);
    }
    switch (type) {
      case "string": {
        return this.src;
      }
      case "func": {
        return new Function("$globalEnv", "$target", "isStuck", this.src) as TranspiledFunction;
      }
      case "generator": {
        return new GeneratorFunction("$globalEnv", "$target", "isStuck", this.src) as TranspiledGenerator;
      }
    }
  }

  protected yielded() {
    if (!this.yields) throw new Error("Script yielded but is not marked as yielding");
  }

  protected yieldLoop() {
    if (!this.yields) return;
    if (this.warpTimer) {
      if (this.isWarp) {
        this.src += "if (isStuck()) yield;"; 
      } else {
        this.src += "yield;";
      }
      this.yielded();
    } else {
      if (!this.isWarp) {
        this.src += "yield;";
        this.yielded();
      }
    }
  }

  protected getVariable(symbol: string): string {
    if (this._cachedVariables[symbol]) return this._cachedVariables[symbol];
    const next = this._variablePool.next().value;
    return (this._cachedVariables[symbol] = next);
  }

  protected descendNode(node: Stmt): void {
    switch (node.kind) {
      case NodeType.NoOp: {
        break;
      }
      case NodeType.StmtBlock: {
        const node2 = node as unknown as StmtBlock;
        this.src += "{"
        for (const stmt of node2.body) this.descendNode(stmt);
        this.src += "}";
        break;
      }
      case NodeType.ReturnStatement: {
        const node2 = node as unknown as ReturnStatement;
        this.src += "return(";
        this.src += this.descendExpr(node2.value).asUnknown();
        this.src += ")"
        this.src += "?? null;"
        break;
      }
      case NodeType.IfStatement: {
        const node2 = node as unknown as IfStatement;
        this.src += "if(";
        this.src += this.descendExpr(node2.condition).asBoolean();
        this.src += ")";
        if (node2.body.kind === NodeType.VariableDeclaration) throw new SyntaxError("Cannot declare a variable in a single-statement context")
        this.descendNode(node2.body);
        if (node2.else) {
          this.src += "else ";
          if (node2.else.body.kind === NodeType.VariableDeclaration) throw new SyntaxError("Cannot declare a variable in a single-statement context")
          this.descendNode(node2.else.body);
        }
        this.src += ";";
        break;
      }
      case NodeType.VariableDeclaration: {
        const node2 = node as unknown as VariableDeclaration;
        const ident = this.getVariable(node2.symbol);
        node2.constant ? this.src += "const " : this.src += "let ";
        this.src += ident;

        if (node2.value) {
          const value = this.descendExpr(node2.value);
          this.src += "=";
          this.src += value.asUnknown();
        }
        this.src += ";";
        break;
      }
      case NodeType.While: {
        const node2 = node as unknown as While;
        this.src += "while(";
        this.src += this.descendExpr(node2.condition).asBoolean();
        this.src += "){"; // luckily, variables cannot be defined in a single statement.
        if (node2.body.kind === NodeType.VariableDeclaration) throw new SyntaxError("Cannot declare a variable in a single-statement context")
        this.descendNode(node2.body);
        this.yieldLoop();
        this.src == "};"
      }
      default: {
        const expr = this.descendExpr(node);
        this.src += expr.asUnknown();
        this.src += ";";
      }
    }
  }

    protected descendExpr(node: Stmt): Input {
      switch (node.kind) {
        case NodeType.Global: {
          const node2 = node as unknown as Global;
          return new TypedInput(`(\$globalEnv.get(${JSON.stringify(node2.symbol)}).value)`, OutputType.TYPE_UNKNOWN)
        }
        case NodeType.AssignmentExpr: {
          const node2 = node as unknown as AssignmentExpr;
          if (node2.assigne.kind !== NodeType.Identifier && node2.assigne.kind !== NodeType.Global) throw new SyntaxError("Invalid left-hand in assignment")// add for member assignment later
          const assigne = this.descendExpr(node2.assigne);
          const value = this.descendExpr(node2.value);
          return new TypedInput(`((${assigne.asIdent()}) = (${value.asUnknown()}))`, OutputType.TYPE_UNKNOWN);
        }
        case NodeType.UnaryExpr: {
          const node2 = node as unknown as UnaryExpr;
          const operand = this.descendExpr(node2.operand);
          if (node2.operator === "not") return new TypedInput(`(!(${operand.asBoolean()}))`, OutputType.TYPE_BOOLEAN);
          throw new SyntaxError("Unknown unary operator");
        }
        case NodeType.BinaryExpr: {
          const node2 = node as unknown as BinaryExpr;
          switch (node2.operator) {
            // logical operators
            case "and": {
              const left = this.descendExpr(node2.left);
              const right = this.descendExpr(node2.right);
              return new TypedInput(`(_ = ${left.asUnknown()}, _2 = ${right.asUnknown()}, (((_ ?? false) === false) && !((_2 ?? false) === false)) ? _ : _2)`, OutputType.TYPE_UNKNOWN)
            }
            case "xor": {
              const left = this.descendExpr(node2.left);
              const right = this.descendExpr(node2.right);
              return new TypedInput(`(_ = ${left.asUnknown()}, _2 = ${right.asUnknown()}, (((_ ?? false) === false) && !((_2 ?? false) === false)) ? _2 : (((_2 ?? false) === false) && !((_ ?? false) === false)) ? _ : (!((_2 ?? false) === false) && !((_ ?? false) === false)) ? false : _2)`, OutputType.TYPE_UNKNOWN)
            }
            case "or": {
              const left = this.descendExpr(node2.left);
              const right = this.descendExpr(node2.right);
              return new TypedInput(`(_ = ${left.asUnknown()}, _2 = ${right.asUnknown()}, (!((_ ?? false) === false) ? _ : _2)`, OutputType.TYPE_UNKNOWN)
            }
            // relational operators
            case "<": {
              const left = this.descendExpr(node2.left);
              const right = this.descendExpr(node2.right);
              return new TypedInput(`(${left.asNumber()} < ${right.asNumber()})`, OutputType.TYPE_BOOLEAN)
            }
            case ">": {
              const left = this.descendExpr(node2.left);
              const right = this.descendExpr(node2.right);
              return new TypedInput(`(${left.asNumber()} > ${right.asNumber()})`, OutputType.TYPE_BOOLEAN)
            }
            case "<=": {
              const left = this.descendExpr(node2.left);
              const right = this.descendExpr(node2.right);
              return new TypedInput(`(${left.asNumber()} <= ${right.asNumber()})`, OutputType.TYPE_BOOLEAN)
            }
            case ">=": {
              const left = this.descendExpr(node2.left);
              const right = this.descendExpr(node2.right);
              return new TypedInput(`(${left.asNumber()} >= ${right.asNumber()})`, OutputType.TYPE_BOOLEAN)
            }
            case "==": {
              const left = this.descendExpr(node2.left);
              const right = this.descendExpr(node2.right);
              return new TypedInput(`(Object.is(${left.asUnknown()}, ${right.asUnknown()}))`, OutputType.TYPE_BOOLEAN)
            }
            // arithmetic operators
            case "+": {
              const left = this.descendExpr(node2.left);
              const right = this.descendExpr(node2.right);
              return new TypedInput(`(${left.asNumber()} + ${right.asNumber()})`, OutputType.TYPE_NUMBER) // dont be like js, be more like pm (which is awesome!!!).
            }
            case "-": {
              const left = this.descendExpr(node2.left);
              const right = this.descendExpr(node2.right);
              return new TypedInput(`(${left.asNumber()} - ${right.asNumber()})`, OutputType.TYPE_NUMBER)
            }
            case "*": {
              const left = this.descendExpr(node2.left);
              const right = this.descendExpr(node2.right);
              return new TypedInput(`(${left.asNumber()} * ${right.asNumber()})`, OutputType.TYPE_NUMBER)
            }
            case "/": {
              const left = this.descendExpr(node2.left);
              const right = this.descendExpr(node2.right);
              return new TypedInput(`(${left.asNumber()} / ${right.asNumber()})`, OutputType.TYPE_NUMBER)
            }
            case "%": {
              const left = this.descendExpr(node2.left);
              const right = this.descendExpr(node2.right);
              return new TypedInput(`(${left.asNumber()} % ${right.asNumber()})`, OutputType.TYPE_NUMBER)
            }
            case "^": {
              const left = this.descendExpr(node2.left);
              const right = this.descendExpr(node2.right);
              return new TypedInput(`(${left.asNumber()} ** ${right.asNumber()})`, OutputType.TYPE_NUMBER)
            }
          }
        }
        case NodeType.PrimitiveLiteral: {
          const node2 = node as unknown as PrimitiveLiteral;
          const value = node2.value;
          return new ConstantInput(value);
        }
        case NodeType.Identifier: {
          const node2 = node as unknown as Identifier;
          const ident = this.getVariable(node2.symbol);
          return new TypedInput(`(${ident})`, OutputType.TYPE_UNKNOWN)
        }
        case NodeType.Inline: {
          const node2 = node as unknown as Inline;
          let src = ""
          const oldSrc = this.src;
          this.src = "";
          this.descendNode(node2.body);
          const stackSrc = this.src;
          this.src = oldSrc;
          if (this.yields) src += "(yield*(function*(){";
          else src += "(function(){";
          src += stackSrc;
          src += "})()";
          if (this.yields) src += ")";
          return new TypedInput(`(${src})`, OutputType.TYPE_UNKNOWN);
        }
        case NodeType.Function: {
          const node2 = node as unknown as Function;
          const args = node2.args.args;
          let src = ""
          const oldSrc = this.src;
          this.src = "";
          this.descendNode(node2.body);
          const stackSrc = this.src;
          this.src = oldSrc;
          let list = "";
          for (const ident of args) {
            list += this.getVariable(ident.symbol);
            list += ","
          }
          return new TypedInput(`(function*(${list}){${stackSrc}})`, OutputType.TYPE_UNKNOWN)
        }
        case NodeType.FunctionCall: {
          const node2 = node as unknown as FunctionCall;
          const func = this.descendExpr(node2.func).asUnknown();
          const args = [];
          for (const arg of node2.args) {
            args.push(this.descendExpr(arg).asUnknown());
          }
          return new TypedInput(`((yield* ${func}(${args.join(",")})) ?? null)`, OutputType.TYPE_UNKNOWN)
        }
        case NodeType.Target: {
          return new TypedInput(`(\$target)`, OutputType.TYPE_UNKNOWN)
        }
      }
    }
  }
