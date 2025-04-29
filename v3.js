import { TAP_KEY_PREFIX } from './types.js';
import { BasePlugin } from './base-plugin.js';

export class PluginForHtmlWebpackPluginV3 extends BasePlugin {
    process(data) {
        // check if current html needs to be inlined
        if (this.isCurrentFileNeedsToBeInlined(data.outputName)) {
            const cssAssets = [...data.assets.css];
            cssAssets.forEach(cssLink => {
                const style = this.getCSSStyle({
                    cssLink,
                    publicPath: data.assets.publicPath,
                });
                if (style) {
                    data.html = this.addStyle({
                        html: data.html,
                        htmlFileName: data.outputName,
                        style,
                    });
                    const cssLinkIndex = data.assets.css.indexOf(cssLink);
                    // prevent generate <link /> tag
                    if (cssLinkIndex !== -1) {
                        data.assets.css.splice(cssLinkIndex, 1);
                    }
                }
            });
            data.html = this.cleanUp(data.html);
        }
    }

    apply(compiler) {
        compiler.hooks.compilation.tap(`${TAP_KEY_PREFIX}_compilation`, compilation => {
            if ('htmlWebpackPluginBeforeHtmlProcessing' in compilation.hooks) {
                const hook = compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing;
                hook.tap(`${TAP_KEY_PREFIX}_htmlWebpackPluginBeforeHtmlProcessing`, data => {
                    this.prepare(compilation);
                    this.process(data);
                });
            } else {
                throw new Error('`html-webpack-plugin` should be ordered first before html-inline-css-webpack-plugin');
            }
        });
    }
}
//# sourceMappingURL=v3.js.map