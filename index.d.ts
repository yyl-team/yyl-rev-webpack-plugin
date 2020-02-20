import { AsyncSeriesWaterfallHook } from 'tapable'

interface RevMap {
  [orignal: string]: string
}

interface FileInfo {
  revMap: RevMap
  source: Buffer
}

interface Hooks {
  /** 生成rev map 之后触发 */
  afterRev: AsyncSeriesWaterfallHook<FileInfo>
  /** 提交时触发 */
  emit: AsyncSeriesWaterfallHook<undefined>
}


declare class YylRevWebpackPlugin {
  /** 获取钩子 */
  static getHooks(compilation: any): Hooks
  /** 获取组件名称 */
  static getName(): string
  constructor(op: WebpackPluginOption)
}
interface WebpackPluginOption {
  /** rev 文件名称 */
  filename: string
  /** rev 输出内容的相对地址 */
  revRoot?: string
  /** 线上配置地址，用于映射线上配置在本地生成一模一样的文件 */
  remoteAddr?: string
  /** 映射线上配置时如线上对应本地 css 文件为空时，自动在本地生成空白css */
  remoteBlankCss?: boolean
  /** 是否映射线上配置 */
  remote?: boolean
  /** 扩展参数, 会追加到 rev json 里面 */
  extends?: {[key: string]: string|number}
}
export =YylRevWebpackPlugin 