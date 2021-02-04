[yyl-rev-webpack-plugin](../README.md) / [Exports](../modules.md) / YylRevWebpackPluginOption

# Interface: YylRevWebpackPluginOption

## Hierarchy

* *Pick*<YylWebpackPluginBaseOption, *context*\>

  ↳ **YylRevWebpackPluginOption**

## Table of contents

### Properties

- [context](yylrevwebpackpluginoption.md#context)
- [extends](yylrevwebpackpluginoption.md#extends)
- [remote](yylrevwebpackpluginoption.md#remote)
- [remoteAddr](yylrevwebpackpluginoption.md#remoteaddr)
- [remoteBlankCss](yylrevwebpackpluginoption.md#remoteblankcss)
- [revFileName](yylrevwebpackpluginoption.md#revfilename)
- [revRoot](yylrevwebpackpluginoption.md#revroot)

## Properties

### context

• `Optional` **context**: *undefined* \| *string*

Defined in: node_modules/yyl-webpack-plugin-base/output/index.d.ts:21

___

### extends

• `Optional` **extends**: *undefined* \| { [key: string]: *string* \| *number*;  }

扩展参数, 会追加到 rev json 里面

Defined in: [src/index.ts:40](https://github.com/jackness1208/yyl-rev-webpack-plugin/blob/c57868b/src/index.ts#L40)

___

### remote

• `Optional` **remote**: *undefined* \| *boolean*

是否映射线上配置

Defined in: [src/index.ts:38](https://github.com/jackness1208/yyl-rev-webpack-plugin/blob/c57868b/src/index.ts#L38)

___

### remoteAddr

• `Optional` **remoteAddr**: *undefined* \| *string*

线上配置地址，用于映射线上配置在本地生成一模一样的文件

Defined in: [src/index.ts:34](https://github.com/jackness1208/yyl-rev-webpack-plugin/blob/c57868b/src/index.ts#L34)

___

### remoteBlankCss

• `Optional` **remoteBlankCss**: *undefined* \| *boolean*

映射线上配置时如线上对应本地 css 文件为空时，自动在本地生成空白css

Defined in: [src/index.ts:36](https://github.com/jackness1208/yyl-rev-webpack-plugin/blob/c57868b/src/index.ts#L36)

___

### revFileName

• `Optional` **revFileName**: *undefined* \| *string*

rev 文件名称

Defined in: [src/index.ts:30](https://github.com/jackness1208/yyl-rev-webpack-plugin/blob/c57868b/src/index.ts#L30)

___

### revRoot

• `Optional` **revRoot**: *undefined* \| *string*

rev 输出内容的相对地址

Defined in: [src/index.ts:32](https://github.com/jackness1208/yyl-rev-webpack-plugin/blob/c57868b/src/index.ts#L32)
