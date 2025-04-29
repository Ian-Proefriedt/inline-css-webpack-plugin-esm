import { DEFAULT_REPLACE_CONFIG } from './types.js';
import { isCSS, escapeRegExp } from './utils.js';

export class BasePlugin {
    constructor(config = {}) {
        this.config = config;
        this.cssStyleCache = {};
    }

    get replaceConfig() {
        return this.config.replace || DEFAULT_REPLACE_CONFIG;
    }

    get styleTagFactory() {
        return (this.config.styleTagFactory ||
            (({ style }) => `<style type="text/css">${style}</style>`));
    }

    prepare({ assets }) {
        Object.keys(assets).forEach((fileName) => {
            if (isCSS(fileName) && this.isCurrentFileNeedsToBeInlined(fileName)) {
                const source = assets[fileName].source();
                this.cssStyleCache[fileName] = typeof source === 'string' ? source : source.toString();
                if (!this.config.leaveCSSFile) {
                    delete assets[fileName];
                }
            }
        });
    }

    getCSSStyle({ cssLink, publicPath }) {
        // Link pattern: publicPath + fileName + '?' + hash
        const fileName = cssLink
            .replace(new RegExp(`^${escapeRegExp(publicPath)}`), '')
            .replace(/\?.+$/g, '');
        
        if (this.isCurrentFileNeedsToBeInlined(fileName)) {
            const style = this.cssStyleCache[fileName];
            if (style === undefined) {
                console.error(`Can not get css style for ${cssLink}. It may be a bug of html-inline-css-webpack-plugin.`);
            }
            return style;
        }
        return undefined;
    }

    isCurrentFileNeedsToBeInlined(fileName) {
        if (typeof this.config.filter === 'function') {
            return this.config.filter(fileName);
        }
        return true;
    }

    addStyle({ html, htmlFileName, style }) {
        const replaceValues = [
            this.styleTagFactory({ style }),
            this.replaceConfig.target,
        ];
        
        if (this.replaceConfig.position === 'after') {
            replaceValues.reverse();
        }

        if (html.indexOf(this.replaceConfig.target) === -1) {
            throw new Error(`Can not inject css style into "${htmlFileName}", as there is not replace target "${this.replaceConfig.target}"`);
        }

        return html.replace(this.replaceConfig.target, replaceValues.join(''));
    }

    cleanUp(html) {
        return this.replaceConfig.removeTarget
            ? html.replace(this.replaceConfig.target, '')
            : html;
    }
}
//# sourceMappingURL=base-plugin.js.map