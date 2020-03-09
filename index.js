const path = require('path')
const util = require('yyl-util')
const { getHooks } = require('./lib/hooks')
const LANG = require('./lang/index')
const request = require('yyl-request')
const chalk = require('chalk')

const PLUGIN_NAME = 'yylRev'
// const printError = function(msg) {
//   throw `__inline('name') error: ${msg}`
// }

function formatPath (iPath) {
  return iPath.split(path.sep).join('/')
}

class YylRevWebpackPlugin {
  static getName() {
    return PLUGIN_NAME
  }
  static getHooks(compilation) {
    return getHooks(compilation)
  }
  constructor(op) {
    this.option = Object.assign({
      /** 文件名称 */
      filename: '../assets/rev-manifest.json',
      /** rev 输出内容的相对地址 */
      revRoot: '../',
      /** 线上配置地址，用于映射线上配置在本地生成一模一样的文件 */
      remoteAddr: '',
      /** 映射线上配置时如线上对应本地 css 文件为空时，自动在本地生成空白css */
      remoteBlankCss: true,
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
        const logger = compilation.getLogger(PLUGIN_NAME)

        logger.group(PLUGIN_NAME)

        compilation.chunks.forEach((chunk) => {
          chunk.files.forEach((fName) => {
            if (/hot-update/.test(fName)) {
              return
            }
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
        // - init assetMap

        const iHooks = getHooks(compilation)

        const rMap = {}
        const revRoot = path.resolve(output.path, option.revRoot)
        /** 将基于 output.path 的相对地址转回 基于 revRoot 的 */
        const formatAssets = function (iPath) {
          return formatPath(
            path.relative(
              revRoot,
              path.join(output.path, iPath)
            )
          )
        }
        /** 将基于 revRoot 的相对地址转回 基于 output.path 的 */
        const recyleAsset = function (iPath) {
          return path.relative(
            output.path,
            path.resolve(revRoot, iPath)
          )
        }

        /** 添加rev文件到构建流 */
        const addAssets = function (fileInfo) {
          compilation.assets[fileInfo.name] = {
            source() {
              return fileInfo.content
            },
            size() {
              return fileInfo.content.length
            }
          }
          compilation.hooks.moduleAsset.call({
            userRequest: fileInfo.name
          }, fileInfo.name)
        }

        logger.info(`${LANG.BUILD_NOHASH_FILE}:`)
        Object.keys(this.assetMap).forEach((key) => {
          // 创建 revMap
          const src = formatAssets(key)
          const dest = formatAssets(this.assetMap[key])
          rMap[src] = dest

          // 生成不带 hash 的文件
          addAssets({
            name: key,
            content: compilation.assets[this.assetMap[key]].source()
          })
          logger.info(`-> ${key}`)
        })

        if (option.remote && option.remoteAddr) {
          logger.info(`${LANG.FETCH_REMOTE_ADDR}: ${option.remoteAddr}`)
          const [err, rs] = await request(option.remoteAddr)
          if (err) {
            logger.warn(`${LANG.FETCH_FAIL}: ${err.message}`)
          } else {
            let remoteMap = {}

            try {
              remoteMap = JSON.parse(rs.body)
              logger.info(`${LANG.FETCH_SUCCESS}`)
            } catch (er) {
              logger.info(`${LANG.REMOTE_PARSE_ERROR}: ${er.message}`)
            }
            const remoteFileInfoArr = []
            const blankCssFileInfoArr = []
            Object.keys(remoteMap).forEach((key) => {
              const iExt = path.extname(key)
              if (!iExt) {
                return
              }
              if (rMap[key]) {
                // 需要额外生成文件
                if (rMap[key] !== remoteMap[key] && compilation.assets[recyleAsset(rMap[key])]) {
                  remoteFileInfoArr.push({
                    name: recyleAsset(remoteMap[key]),
                    content: compilation.assets[recyleAsset(rMap[key])].source()
                  })
                }
              } else {
                if (iExt === '.css' && option.remoteBlankCss) {
                  // 空白css
                  blankCssFileInfoArr.push({
                    name: recyleAsset(remoteMap[key]),
                    content: ''
                  })
                }
              }
            })
            if (remoteFileInfoArr.length) {
              logger.info(`${LANG.BUILD_REMOTE_SOURCE}:`)
              remoteFileInfoArr.forEach((fileInfo) => {
                addAssets(fileInfo)
                logger.info(`-> ${chalk.cyan(fileInfo.name)}`)
              })
            }
            if (blankCssFileInfoArr.length) {
              logger.info(`${LANG.BUILD_BLANK_CSS}:`)
              blankCssFileInfoArr.forEach((fileInfo) => {
                addAssets(fileInfo)
                logger.info(`-> ${chalk.cyan(fileInfo.name)}`)
              })
            }
          }
        } else {
          logger.info(LANG.DISABLE_FETCH_REMOTE)
        }

        if (option.extends) {
          Object.assign(rMap, option.extends)
          logger.info(`${LANG.BUILD_EXTEND_INFO}:`)
          Object.keys(option.extends).forEach((key) => {
            logger.info(`${chalk.green(key)} -> ${chalk.cyan(option.extends[key])}`)
          })
        }

        let revFileInfo = {
          name: path.relative(
            output.path,
            path.resolve(output.path, option.filename)
          ),
          content: JSON.stringify(rMap, null, 2)
        }

        // hook afterRev
        revFileInfo = await iHooks.afterRev.promise(revFileInfo)

        // add to assets
        addAssets(revFileInfo)

        await iHooks.emit.promise()

        logger.groupEnd()
        done()
      }
    )
    // - map init
  }
}

module.exports = YylRevWebpackPlugin