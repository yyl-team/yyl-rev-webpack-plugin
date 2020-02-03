const { getHooks } = require('./lib/hooks')

const PLUGIN_NAME = 'yylRev'
// const printError = function(msg) {
//   throw `__inline('name') error: ${msg}`
// }

class YylRevWebpackPlugin {
  static getName() {
    return PLUGIN_NAME
  }
  static getHooks(compilation) {
    return getHooks(compilation)
  }
  constructor() {
    // TODO:
  }
  apply(/*compiler*/) {
    // const { output, context } = compiler.options
    // compiler.hooks.emit.tap(
    //   PLUGIN_NAME,
    //   (compilation) => {
    //   }
    // )
  }
}

module.exports = YylRevWebpackPlugin