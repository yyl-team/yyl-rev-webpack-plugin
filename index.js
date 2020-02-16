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
    this.options = Object.assign({
      /** 执行程序的路径，与 webpack.config 所在路径相同 */
      basePath: process.cwd(),
      /** 文件名称 */
      name: '../assets/rev-mainfest.json',
      /** rev 输出内容的相对地址 */
      revAddr: '../',
      /** 线上配置地址，用于映射线上配置在本地生成一模一样的文件 */
      remoteAddr: '',
      /** 是否映射线上配置 */
      remote: false,
      /** 扩展参数, 会追加到 rev json 里面 */
      extends: {}
    }, op)
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
        const { option } = this
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
        let fileInfo = {
          name: option.name,
          content: ''
        }

        // hook afterRev
        fileInfo = await iHooks.afterRev.promise(fileInfo)
        const finalName = path.join(output.path, fileInfo.name)

        // add to assets
        compilation.assets[finalName] = {
          source() {
            return fileInfo.content
          },
          size() {
            return fileInfo.content.length
          }
        }
        compilation.hooks.moduleAsset.call({
          userRequest: fileInfo.name
        }, finalName)

        await iHooks.emit.promise()
        // - init assetMap
        done()
      }
    )
    // - map init
  }
}

module.exports = YylRevWebpackPlugin