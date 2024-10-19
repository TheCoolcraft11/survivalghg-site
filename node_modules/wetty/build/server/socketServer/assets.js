import express from 'express';
import { assetsPath } from './shared/path.js';
export const trim = (str) => str.replace(/\/*$/, '');
export const serveStatic = (path) => express.static(assetsPath(path));
//# sourceMappingURL=assets.js.map