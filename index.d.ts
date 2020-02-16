import { AsyncSeriesWaterfallHook } from 'tapable'

interface RevMap {
  [orignal: string]: string
}

interface FileInfo {
  revMap: RevMap
  source: Buffer
}

interface Hooks {
  beforeRev: AsyncSeriesWaterfallHook<FileInfo>
  afterRev: AsyncSeriesWaterfallHook<FileInfo>
  emit: AsyncSeriesWaterfallHook<undefined>
}


declare class YylRevWebpackPlugin {
  static getHooks(compilation: any): Hooks
  static getName(): string
  constructor(op: WebpackPluginOption)
}
interface WebpackPluginOption {
  /** 执行程序的路径，与 webpack.config 所在路径相同 */
  basePath: string
  /** rev 文件名称 */
  name: string
  /** rev 输出内容的相对地址 */
  revRoot?: string
  /** 线上配置地址，用于映射线上配置在本地生成一模一样的文件 */
  remoteAddr?: string
  /** 是否映射线上配置 */
  remote: boolean
  /** 扩展参数, 会追加到 rev json 里面 */
  extends?: {[key: string]: string|number}
}
export =YylRevWebpackPlugin 