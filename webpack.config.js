const path = require("path");
const fs = require("fs");

module.exports = {
  entry: "/src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /(node_modules)|(unused)/
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    path: "/psout",
    filename: 'main.js',
    libraryTarget: 'umd'
  }
}
