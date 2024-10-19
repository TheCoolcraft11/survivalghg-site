import isUndefined from 'lodash/isUndefined.js';
export const xterm = {
    name: 'xterm-256color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: Object.assign({}, ...Object.keys(process.env)
        .filter((key) => !isUndefined(process.env[key]))
        .map((key) => ({ [key]: process.env[key] }))),
};
//# sourceMappingURL=xterm.js.map