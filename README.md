# yyl-rev-webpack-plugin

## USAGE
```javascript
const YylRevWebpackPlugin = require('yyl-rev-webpack-plugin')
const wConfig = {
  plugins: [
    new YylRevWebpackPlugin({
      /** 文件名称 */
      name: '../assets/rev-manifest.json',
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
    })
  ]
}
```

## hooks
```javascript
let YylRevWebpackPlugin
try {
  YylRevWebpackPlugin = require('yyl-rev-webpack-plugin')
} catch (e) {
  if (!(e instanceof Error) || e.code !== 'MODULE_NOT_FOUND') {
    throw e
  }
}

const PLUGIN_NAME = 'your_plugin'
class ExtPlugin {
  apply (compiler) {
    const IPlugin = YylRevWebpackPlugin
    if (IPlugin) {
      compiler.hooks.compilation.tap(IPlugin.getName(), (compilation) => {
        IPlugin.getHooks(compilation).afterRev.tapAsync(PLUGIN_NAME, (obj, done) => {
          console.log('hooks.afterRev(obj, done)', 'obj:', obj)
          done(null, obj)
        })

        IPlugin.getHooks(compilation).emit.tapAsync(PLUGIN_NAME, (obj, done) => {
          console.log('hooks.emit(obj, done)', 'obj:', obj)
          done(null, obj)
        })
      })
    }
  }
}
```

## ts
```typescript
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
  name: string
  /** rev 输出内容的相对地址 */
  revRoot?: string
  /** 线上配置地址，用于映射线上配置在本地生成一模一样的文件 */
  remoteAddr?: string
  /** 映射线上配置时如线上对应本地 css 文件为空时，自动在本地生成空白css */
  remoteBlankCss: boolean
  /** 是否映射线上配置 */
  remote: boolean
  /** 扩展参数, 会追加到 rev json 里面 */
  extends?: {[key: string]: string|number}
}
export =YylRevWebpackPlugin 
```