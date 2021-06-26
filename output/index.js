/*!
 * yyl-rev-webpack-plugin cjs 1.0.11
 * (c) 2020 - 2021 
 * Released under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var axios = require('axios');
var chalk = require('chalk');
var tapable = require('tapable');
var yylWebpackPluginBase = require('yyl-webpack-plugin-base');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const LANG = {
    DISABLE_FETCH_REMOTE: '跳过远程配置',
    FETCH_REMOTE_ADDR: '获取远程配置',
    FETCH_FAIL: '获取失败',
    FETCH_SUCCESS: '获取成功',
    REMOTE_PARSE_ERROR: '配置解析出错',
    BUILD_NOHASH_FILE: '生成无哈希文件',
    BUILD_EXTEND_INFO: '生成额外配置',
    BUILD_REMOTE_SOURCE: '生成本地文件',
    BUILD_BLANK_CSS: '生成空白样式',
    BUILD_REV_FILE: '生成 manifest'
};

const iWeakMap = new WeakMap();
function createHooks() {
    return {
        afterRev: new tapable.AsyncSeriesWaterfallHook(['pluginArgs']),
        emit: new tapable.AsyncSeriesWaterfallHook(['pluginArgs'])
    };
}
function getHooks(compilation) {
    let hooks = iWeakMap.get(compilation);
    if (hooks === undefined) {
        hooks = createHooks();
        iWeakMap.set(compilation, hooks);
    }
    return hooks;
}

const PLUGIN_NAME = 'yylRev';
function formatPath(iPath) {
    return iPath.split(path__default['default'].sep).join('/');
}
function formatUrl(url) {
    let r = url;
    if (/^\/\//.test(url)) {
        r = `http:${r}`;
    }
    return `${r}${r.indexOf('?') === -1 ? '?' : '&'}_=${+new Date()}`;
}
class YylRevWebpackPlugin extends yylWebpackPluginBase.YylWebpackPluginBase {
    constructor(option) {
        super(Object.assign(Object.assign({}, option), { name: PLUGIN_NAME }));
        this.option = {
            context: process.cwd(),
            revFileName: './assets/rev-manifest.json',
            revRoot: './',
            remoteAddr: '',
            remoteBlankCss: false,
            remote: false,
            extends: {}
        };
        if (option === null || option === void 0 ? void 0 : option.revFileName) {
            this.option.revFileName = option.revFileName;
        }
        if (option === null || option === void 0 ? void 0 : option.revRoot) {
            this.option.revRoot = option.revRoot;
        }
        if (option === null || option === void 0 ? void 0 : option.remoteAddr) {
            this.option.remoteAddr = option.remoteAddr;
        }
        if ((option === null || option === void 0 ? void 0 : option.remoteBlankCss) !== undefined) {
            this.option.remoteBlankCss = option.remoteBlankCss;
        }
        if ((option === null || option === void 0 ? void 0 : option.remote) !== undefined) {
            this.option.remote = option.remote;
        }
        if (option === null || option === void 0 ? void 0 : option.extends) {
            this.option.extends = Object.assign(Object.assign({}, this.option.extends), option.extends);
        }
    }
    /** hooks 用方法: 获取插件名称 */
    static getName() {
        return PLUGIN_NAME;
    }
    /** hooks 用方法: 获取 hooks */
    static getHooks(compilation) {
        return getHooks(compilation);
    }
    apply(compiler) {
        return __awaiter(this, void 0, void 0, function* () {
            const { output } = compiler.options;
            this.initCompilation({
                compiler,
                onProcessAssets: (compilation) => __awaiter(this, void 0, void 0, function* () {
                    const logger = compilation.getLogger(PLUGIN_NAME);
                    logger.group(PLUGIN_NAME);
                    const iHooks = getHooks(compilation);
                    const rMap = {};
                    const revRoot = path__default['default'].resolve(output.path || '', this.option.revRoot);
                    // 将基于 output.path 的相对地址转回 基于 revRoot 的
                    const formatAssets = function (iPath) {
                        return formatPath(path__default['default'].relative(revRoot, path__default['default'].join(output.path || '', iPath)));
                    };
                    // 将基于 revRoot 的相对地址转回 基于 output.path 的
                    const recyleAsset = function (iPath) {
                        return formatPath(path__default['default'].relative(output.path || '', path__default['default'].resolve(revRoot, iPath)));
                    };
                    // 添加rev文件到构建流
                    const addAssets = (fileInfo) => {
                        this.updateAssets({
                            compilation,
                            assetsInfo: fileInfo
                        });
                    };
                    logger.info(`${chalk__default['default'].yellow(LANG.BUILD_NOHASH_FILE)}:`);
                    Object.keys(this.assetMap).forEach((key) => {
                        // 创建 revMap
                        const src = formatAssets(key);
                        const dest = formatAssets(this.assetMap[key]);
                        const curAsset = compilation.assets[this.assetMap[key]];
                        rMap[src] = dest;
                        if (curAsset) {
                            const iSource = curAsset.source();
                            // 生成不带 hash 的文件
                            addAssets({
                                dist: key,
                                source: typeof iSource === 'string' ? Buffer.from(iSource, 'utf-8') : iSource
                            });
                            logger.info(`-> ${chalk__default['default'].cyan(key)}`);
                        }
                    });
                    if (this.option.remote && this.option.remoteAddr) {
                        const requestUrl = formatUrl(this.option.remoteAddr);
                        logger.info(`${chalk__default['default'].yellow(LANG.FETCH_REMOTE_ADDR)}:`);
                        logger.info(`-> ${requestUrl}`);
                        let rs = {};
                        try {
                            rs = (yield axios__default['default'].get(requestUrl, {
                                timeout: 5000
                            })).data;
                        }
                        catch (err) {
                            logger.warn(`${chalk__default['default'].yellow(LANG.FETCH_FAIL)}: ${err.message}`);
                        }
                        if (rs) {
                            let remoteMap = {};
                            try {
                                remoteMap = rs;
                                logger.info(`${chalk__default['default'].yellow(LANG.FETCH_SUCCESS)}:`);
                                Object.keys(remoteMap).forEach((key) => {
                                    logger.info(`${key} -> ${chalk__default['default'].cyan(remoteMap[key])}`);
                                });
                            }
                            catch (er) {
                                logger.info(`${chalk__default['default'].red(LANG.REMOTE_PARSE_ERROR)}: ${er.message}`);
                            }
                            const remoteFileInfoArr = [];
                            const blankCssFileInfoArr = [];
                            Object.keys(remoteMap).forEach((key) => {
                                const iExt = path__default['default'].extname(key);
                                if (!iExt) {
                                    return;
                                }
                                if (rMap[key]) {
                                    // 需要额外生成文件
                                    if (rMap[key] !== remoteMap[key] && compilation.assets[recyleAsset(rMap[key])]) {
                                        const iSource = compilation.assets[recyleAsset(rMap[key])].source();
                                        remoteFileInfoArr.push({
                                            dist: recyleAsset(remoteMap[key]),
                                            source: typeof iSource === 'string' ? Buffer.from(iSource) : iSource
                                        });
                                    }
                                }
                                else {
                                    if (iExt === '.css' && this.option.remoteBlankCss) {
                                        // 空白css
                                        blankCssFileInfoArr.push({
                                            dist: recyleAsset(remoteMap[key]),
                                            source: Buffer.from('')
                                        });
                                    }
                                }
                            });
                            if (remoteFileInfoArr.length) {
                                logger.info(`${chalk__default['default'].yellow(LANG.BUILD_REMOTE_SOURCE)}:`);
                                remoteFileInfoArr.forEach((fileInfo) => {
                                    addAssets(fileInfo);
                                    logger.info(`-> ${chalk__default['default'].cyan(fileInfo.dist)}`);
                                });
                            }
                            if (blankCssFileInfoArr.length) {
                                logger.info(`${chalk__default['default'].yellow(LANG.BUILD_BLANK_CSS)}:`);
                                blankCssFileInfoArr.forEach((fileInfo) => {
                                    addAssets(fileInfo);
                                    logger.info(`-> ${chalk__default['default'].cyan(fileInfo.dist)}`);
                                });
                            }
                        }
                    }
                    else {
                        logger.info(LANG.DISABLE_FETCH_REMOTE);
                    }
                    if (this.option.extends) {
                        Object.assign(rMap, this.option.extends);
                        logger.info(`${chalk__default['default'].yellow(LANG.BUILD_EXTEND_INFO)}:`);
                        Object.keys(this.option.extends).forEach((key) => {
                            logger.info(`${chalk__default['default'].green(key)} -> ${chalk__default['default'].cyan(this.option.extends[key])}`);
                        });
                    }
                    let revFileInfo = {
                        dist: path__default['default'].relative(output.path || '', path__default['default'].resolve(output.path || '', this.option.revFileName)),
                        source: Buffer.from(JSON.stringify(rMap, null, 2), 'utf-8')
                    };
                    // hook afterRev
                    revFileInfo = yield iHooks.afterRev.promise(revFileInfo);
                    // add to assets
                    addAssets(revFileInfo);
                    logger.info(`${chalk__default['default'].yellow(LANG.BUILD_REV_FILE)}:`);
                    logger.info(`-> ${chalk__default['default'].cyan(revFileInfo.dist)}`);
                    yield iHooks.emit.promise();
                    logger.groupEnd();
                })
            });
        });
    }
}
module.exports = YylRevWebpackPlugin;

exports.default = YylRevWebpackPlugin;
