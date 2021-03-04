import path from 'path'
import request from 'request-promise'
import chalk from 'chalk'
import { Compilation, Compiler } from 'webpack'
import { LANG } from './lang'
import { getHooks } from './hooks'
import {
  AssetsInfo,
  ModuleAssets,
  YylWebpackPluginBase,
  YylWebpackPluginBaseOption
} from 'yyl-webpack-plugin-base'

const PLUGIN_NAME = 'yylRev'

function formatPath(iPath: string) {
  return iPath.split(path.sep).join('/')
}

function formatUrl(url: string) {
  let r = url
  if (/^\/\//.test(url)) {
    r = `http:${r}`
  }
  return `${r}${r.indexOf('?') === -1 ? '?' : '&'}_=${+new Date()}`
}

export interface YylRevWebpackPluginOption extends Pick<YylWebpackPluginBaseOption, 'context'> {
  /** rev 文件名称 */
  revFileName?: string
  /** rev 输出内容的相对地址 */
  revRoot?: string
  /** 线上配置地址，用于映射线上配置在本地生成一模一样的文件 */
  remoteAddr?: string
  /** 映射线上配置时如线上对应本地 css 文件为空时，自动在本地生成空白css */
  remoteBlankCss?: boolean
  /** 是否映射线上配置 */
  remote?: boolean
  /** 扩展参数, 会追加到 rev json 里面 */
  extends?: {
    [key: string]: string | number
  }
}

export default class YylRevWebpackPlugin extends YylWebpackPluginBase {
  /** hooks 用方法: 获取插件名称 */
  static getName() {
    return PLUGIN_NAME
  }

  /** hooks 用方法: 获取 hooks */
  static getHooks(compilation: Compilation) {
    return getHooks(compilation)
  }

  option: Required<YylRevWebpackPluginOption> = {
    context: process.cwd(),
    revFileName: '../assets/rev-manifest.json',
    revRoot: '../',
    remoteAddr: '',
    remoteBlankCss: false,
    remote: false,
    extends: {}
  }

  constructor(option?: YylRevWebpackPluginOption) {
    super({
      ...option,
      name: PLUGIN_NAME
    })
    if (option?.revFileName) {
      this.option.revFileName = option.revFileName
    }

    if (option?.revRoot) {
      this.option.revRoot = option.revRoot
    }

    if (option?.remoteAddr) {
      this.option.remoteAddr = option.remoteAddr
    }

    if (option?.remoteBlankCss !== undefined) {
      this.option.remoteBlankCss = option.remoteBlankCss
    }

    if (option?.remote !== undefined) {
      this.option.remote = option.remote
    }

    if (option?.extends) {
      this.option.extends = {
        ...this.option.extends,
        ...option.extends
      }
    }
  }

  async apply(compiler: Compiler) {
    const { output } = compiler.options

    const { compilation, done } = await this.initCompilation(compiler)
    Object.keys(compilation.assets).forEach((key) => {
      console.log('ddd', key)
    })
    const logger = compilation.getLogger(PLUGIN_NAME)
    logger.group(PLUGIN_NAME)
    const iHooks = getHooks(compilation)

    const rMap: ModuleAssets = {}
    const revRoot = path.resolve(output.path || '', this.option.revRoot)

    // 将基于 output.path 的相对地址转回 基于 revRoot 的
    const formatAssets = function (iPath: string) {
      return formatPath(path.relative(revRoot, path.join(output.path || '', iPath)))
    }
    // 将基于 revRoot 的相对地址转回 基于 output.path 的
    const recyleAsset = function (iPath: string) {
      return formatPath(path.relative(output.path || '', path.resolve(revRoot, iPath)))
    }
    // 添加rev文件到构建流
    const addAssets = (fileInfo: AssetsInfo) => {
      this.updateAssets({
        compilation,
        assetsInfo: fileInfo
      })
    }

    logger.info(`${LANG.BUILD_NOHASH_FILE}:`)

    Object.keys(this.assetMap).forEach((key) => {
      // 创建 revMap
      const src = formatAssets(key)
      const dest = formatAssets(this.assetMap[key])
      rMap[src] = dest

      // 生成不带 hash 的文件
      addAssets({
        dist: key,
        source: Buffer.from(compilation.assets[this.assetMap[key]].source().toString(), 'utf-8')
      })
      logger.info(`-> ${key}`)
    })

    if (this.option.remote && this.option.remoteAddr) {
      const requestUrl = formatUrl(this.option.remoteAddr)
      logger.info(`${LANG.FETCH_REMOTE_ADDR}: ${requestUrl}`)
      let rs: string = ''
      try {
        rs = await request(requestUrl)
      } catch (err) {
        logger.warn(`${LANG.FETCH_FAIL}: ${err.message}`)
      }

      if (rs) {
        let remoteMap: ModuleAssets = {}
        try {
          remoteMap = JSON.parse(rs)
          logger.info(`${LANG.FETCH_SUCCESS}`)
          Object.keys(remoteMap).forEach((key) => {
            logger.info(`${key} -> ${chalk.cyan(remoteMap[key])}`)
          })
        } catch (er) {
          logger.info(`${LANG.REMOTE_PARSE_ERROR}: ${er.message}`)
        }

        const remoteFileInfoArr: AssetsInfo[] = []
        const blankCssFileInfoArr: AssetsInfo[] = []

        Object.keys(remoteMap).forEach((key) => {
          const iExt = path.extname(key)
          if (!iExt) {
            return
          }
          if (rMap[key]) {
            // 需要额外生成文件
            if (rMap[key] !== remoteMap[key] && compilation.assets[recyleAsset(rMap[key])]) {
              console.log('===', 'rMap[key]', rMap[key])
              console.log('===', 'recyleAsset(rMap[key])', recyleAsset(rMap[key]))
              console.log('===', 'compilation.assets[recyleAsset(rMap[key])]', compilation.assets[recyleAsset(rMap[key])])
              remoteFileInfoArr.push({
                dist: recyleAsset(remoteMap[key]),
                source: Buffer.from(
                  compilation.assets[recyleAsset(rMap[key])].source().toString(),
                  'utf-8'
                )
              })
            }
          } else {
            if (iExt === '.css' && this.option.remoteBlankCss) {
              // 空白css
              blankCssFileInfoArr.push({
                dist: recyleAsset(remoteMap[key]),
                source: Buffer.from('')
              })
            }
          }
        })

        if (remoteFileInfoArr.length) {
          logger.info(`${LANG.BUILD_REMOTE_SOURCE}:`)
          remoteFileInfoArr.forEach((fileInfo) => {
            addAssets(fileInfo)
            logger.info(`-> ${chalk.cyan(fileInfo.dist)}`)
          })
        }
        if (blankCssFileInfoArr.length) {
          logger.info(`${LANG.BUILD_BLANK_CSS}:`)
          blankCssFileInfoArr.forEach((fileInfo) => {
            addAssets(fileInfo)
            logger.info(`-> ${chalk.cyan(fileInfo.dist)}`)
          })
        }
      }
    } else {
      logger.info(LANG.DISABLE_FETCH_REMOTE)
    }

    if (this.option.extends) {
      Object.assign(rMap, this.option.extends)
      logger.info(`${LANG.BUILD_EXTEND_INFO}:`)
      Object.keys(this.option.extends).forEach((key) => {
        logger.info(`${chalk.green(key)} -> ${chalk.cyan(this.option.extends[key])}`)
      })
    }

    let revFileInfo: AssetsInfo = {
      dist: path.relative(
        output.path || '',
        path.resolve(output.path || '', this.option.revFileName)
      ),
      source: Buffer.from(JSON.stringify(rMap, null, 2), 'utf-8')
    }

    // hook afterRev
    revFileInfo = await iHooks.afterRev.promise(revFileInfo)

    // add to assets
    addAssets(revFileInfo)

    await iHooks.emit.promise()

    logger.groupEnd()
    done()
  }
}

module.exports = YylRevWebpackPlugin
