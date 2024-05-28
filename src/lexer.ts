class Lexer {
  static tokenRegexps: [string, RegExp][] = [
    ["identifierKeyword", /^[a-zA-Z_]+[a-ZA-Z0-9_]*/],
    ["number", /^([0-9]+\.?[0-9]*(e[+-]?[0-9]+)?|\.[0-9]+(e[+-]?[0-9]+)?)|0x[0-9a-fA-F]+|0o[0-7]+|0b[01]+/],
    ["string", /^"((?<=\\)"|[^"])*(?<!\\)"/], // this is the worst regexp ive had to think of yet
    ["open_thingy", /^[{([]/],
    ["close_thingy", /^[})\]]/],
    ["increment", /^(++|--)/],
    ["binary_operator", /^([-+*/%^<>]|==|!=)/],
    ["assignment", /^(=|+=|-=|*=|\/=|%=|^=|?=)/], // ?= is binary NOT assignment, which will look something like ?=variable
    ["question_mark", /^\?/],
    ["colon", /^:/]
  ]
}
