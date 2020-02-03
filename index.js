const path = require('path')
const util = require('yyl-util')
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
  constructor(op) {
    const { basePath, revAddr, remote, revRoot } = op
    this.basePath = basePath
    this.revAddr = revAddr
    this.remote = remote
    this.revRoot = revRoot
  }
  getFileType(str) {
    str = str.replace(/\?.*/, '')
    const split = str.split('.')
    let ext = split[split.length - 1]
    if (ext === 'map' && split.length > 2) {
      ext = `${split[split.length - 2]}.${split[split.length - 1]}`
    }
    return ext
  }
  apply(compiler) {
    const { output } = compiler.options
    // + map init
    const moduleAssets = {}
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.moduleAsset.tap(PLUGIN_NAME, (module, file) => {
        if (module.userRequest) {
          moduleAssets[file] = path.join(path.dirname(file), path.basename(module.userRequest))
        }
      })
    })
    compiler.hooks.emit.tapAsync(
      PLUGIN_NAME,
      async (compilation, done) => {
        // + init assetMap
        const assetMap = {}
        compilation.chunks.forEach((chunk) => {
          chunk.files.forEach((fName) => {
            if (chunk.name) {
              const key = `${util.path.join(path.dirname(fName), chunk.name)}.${this.getFileType(fName)}`
              assetMap[key] = fName
            } else {
              assetMap[fName] = fName
            }
          })
        })

        const stats = compilation.getStats().toJson({
          all: false,
          assets: true,
          cachedAssets: true
        })
        stats.assets.forEach((asset) => {
          const name = moduleAssets[asset.name]
          if (name) {
            assetMap[util.path.join(name)] = asset.name
          }
        })
        this.assetMap = assetMap

        const iHooks = getHooks(compilation)

        console.log(this.assetMap, output)
        // TODO: build something

        await iHooks.emit.promise()
        // - init assetMap
        done()
      }
    )
    // - map init
  }
}

module.exports = YylRevWebpackPlugin