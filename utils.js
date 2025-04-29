import lodash from 'lodash';
export const escapeRegExp = lodash.escapeRegExp;

export function is(filenameExtension) {
    const reg = new RegExp(`.${filenameExtension}$`);
    return function (fileName) { return reg.test(fileName); };
}

export const isCSS = is('css');