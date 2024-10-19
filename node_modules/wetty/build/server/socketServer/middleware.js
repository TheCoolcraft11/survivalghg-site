import etag from 'etag';
import fresh from 'fresh';
import fs from 'fs-extra';
import parseUrl from 'parseurl';
import { assetsPath } from './shared/path.js';
const ONE_YEAR_MS = 60 * 60 * 24 * 365 * 1000;
const isFresh = (req, res) => fresh(req.headers, {
    etag: res.getHeader('ETag'),
    'last-modified': res.getHeader('Last-Modified'),
});
export function redirect(req, res, next) {
    if (req.path.substr(-1) === '/' && req.path.length > 1)
        res.redirect(301, req.path.slice(0, -1) + req.url.slice(req.path.length));
    else
        next();
}
export async function favicon(basePath) {
    const path = assetsPath('assets', 'favicon.ico');
    try {
        const icon = await fs.readFile(path);
        return (req, res, next) => {
            if (getPathName(req) !== `${basePath}/favicon.ico`) {
                next();
            }
            else if (req.method !== 'GET' && req.method !== 'HEAD') {
                res.statusCode = req.method === 'OPTIONS' ? 200 : 405;
                res.setHeader('Allow', 'GET, HEAD, OPTIONS');
                res.setHeader('Content-Length', '0');
                res.end();
            }
            else {
                Object.entries({
                    'Cache-Control': `public, max-age=${Math.floor(ONE_YEAR_MS / 1000)}`,
                    ETag: etag(icon),
                }).forEach(([key, value]) => {
                    res.setHeader(key, value);
                });
                if (isFresh(req, res)) {
                    res.statusCode = 304;
                    res.end();
                }
                else {
                    res.statusCode = 200;
                    res.setHeader('Content-Length', icon.length);
                    res.setHeader('Content-Type', 'image/x-icon');
                    res.end(icon);
                }
            }
        };
    }
    catch (err) {
        return (_req, _res, next) => next(err);
    }
}
function getPathName(req) {
    try {
        const url = parseUrl(req);
        return (url === null || url === void 0 ? void 0 : url.pathname) ? url.pathname : undefined;
    }
    catch (e) {
        return undefined;
    }
}
//# sourceMappingURL=middleware.js.map