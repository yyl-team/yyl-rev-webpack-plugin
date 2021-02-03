import { Compilation, Compiler } from 'webpack';
import { YylWebpackPluginBase, YylWebpackPluginBaseOption } from 'yyl-webpack-plugin-base';
export interface YylRevWebpackPluginOption extends Pick<YylWebpackPluginBaseOption, 'context'> {
    /** rev 文件名称 */
    revFileName?: string;
    /** rev 输出内容的相对地址 */
    revRoot?: string;
    /** 线上配置地址，用于映射线上配置在本地生成一模一样的文件 */
    remoteAddr?: string;
    /** 映射线上配置时如线上对应本地 css 文件为空时，自动在本地生成空白css */
    remoteBlankCss?: boolean;
    /** 是否映射线上配置 */
    remote?: boolean;
    /** 扩展参数, 会追加到 rev json 里面 */
    extends?: {
        [key: string]: string | number;
    };
}
export default class YylRevWebpackPlugin extends YylWebpackPluginBase {
    /** hooks 用方法: 获取插件名称 */
    static getName(): string;
    /** hooks 用方法: 获取 hooks */
    static getHooks(compilation: Compilation): any;
    option: Required<YylRevWebpackPluginOption>;
    constructor(option?: YylRevWebpackPluginOption);
    apply(compiler: Compiler): Promise<void>;
}
