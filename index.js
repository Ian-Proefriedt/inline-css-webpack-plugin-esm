import HTMLWebpackPlugin from 'html-webpack-plugin';
import { PluginForHtmlWebpackPluginV3 } from './v3.js';
import { PluginForHtmlWebpackPluginV4 } from './v4.js';

const isHTMLWebpackPluginV4 = 'getHooks' in HTMLWebpackPlugin;

export default isHTMLWebpackPluginV4
    ? PluginForHtmlWebpackPluginV4
    : PluginForHtmlWebpackPluginV3;