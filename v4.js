import HTMLWebpackPlugin from 'html-webpack-plugin';
import { TAP_KEY_PREFIX } from '../types.js';
import { BasePlugin } from './base-plugin.js';

export class PluginForHtmlWebpackPluginV4 extends BasePlugin {
    constructor() {
        super(...arguments);
        // Using object reference to distinguish styles for multiple files
        this.cssStyleMap = new Map();
    }

    prepareCSSStyle(data) {
        // `prepareCSSStyle` may be called more than once in webpack watch mode.
        // https://github.com/Runjuu/html-inline-css-webpack-plugin/issues/30
        // https://github.com/Runjuu/html-inline-css-webpack-plugin/issues/13
        this.cssStyleMap.clear();
        const cssAssets = [...data.assets.css];
        cssAssets.forEach(cssLink => {
            if (this.isCurrentFileNeedsToBeInlined(cssLink)) {
                const style = this.getCSSStyle({
                    cssLink,
                    publicPath: data.assets.publicPath,
                });
                if (style) {
                    if (this.cssStyleMap.has(data.plugin)) {
                        this.cssStyleMap.get(data.plugin).push(style);
                    } else {
                        this.cssStyleMap.set(data.plugin, [style]);
                    }
                    const cssLinkIndex = data.assets.css.indexOf(cssLink);
                    // prevent generate <link /> tag
                    if (cssLinkIndex !== -1) {
                        data.assets.css.splice(cssLinkIndex, 1);
                    }
                }
            }
        });
    }

    process(data) {
        // check if current html needs to be inlined
        if (this.isCurrentFileNeedsToBeInlined(data.outputName)) {
            const cssStyles = this.cssStyleMap.get(data.plugin) || [];
            cssStyles.forEach(style => {
                data.html = this.addStyle({
                    style,
                    html: data.html,
                    htmlFileName: data.outputName,
                });
            });
            data.html = this.cleanUp(data.html);
        }
    }

    apply(compiler) {
        compiler.hooks.compilation.tap(`${TAP_KEY_PREFIX}_compilation`, compilation => {
            const hooks = HTMLWebpackPlugin.getHooks(compilation);
            hooks.beforeAssetTagGeneration.tap(`${TAP_KEY_PREFIX}_beforeAssetTagGeneration`, data => {
                this.prepare(compilation);
                this.prepareCSSStyle(data);
            });
            hooks.beforeEmit.tap(`${TAP_KEY_PREFIX}_beforeEmit`, data => {
                this.process(data);
            });
        });
    }
}
//# sourceMappingURL=v4.js.map