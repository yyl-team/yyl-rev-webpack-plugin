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
  basePath: string
  revRoot?: string
  revAddr: string
  remote: boolean
}
export =YylRevWebpackPlugin 