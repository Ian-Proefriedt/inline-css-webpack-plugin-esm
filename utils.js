import { escapeRegExp } from 'lodash';

export { escapeRegExp };

export function is(filenameExtension) {
    const reg = new RegExp(`.${filenameExtension}$`);
    return function (fileName) { return reg.test(fileName); };
}

export const isCSS = is('css');