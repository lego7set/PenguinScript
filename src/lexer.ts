class Lexer {
  static tokenRegexps: Record<string, RegExp> = {
    identifierKeyword: /^[a-zA-Z_]+[a-ZA-Z0-9_]*/,
    number: /^([0-9]+.?[0-9]*(e[+-]?[0-9]+)?|.[0-9]+(e[+-]?[0-9]+)?)/
  }
}
