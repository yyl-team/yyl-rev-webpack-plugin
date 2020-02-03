# yyl-rev-webpack-plugin

## USAGE
```javascript
const YylRevWebpackPlugin = require('yyl-rev-webpack-plugin')
const wConfig = {
  plugins: [
    new YylRevWebpackPlugin({ basePath: __dirname })
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
        IPlugin.getHooks(compilation).beforeRev.tapAsync(PLUGIN_NAME, (obj, done) => {
          console.log('hooks.beforeRev(obj, done)', 'obj:', obj)
          done(null, obj)
        })
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
}
export =YylRevWebpackPlugin 
```