import url from 'url';
import { register, Counter, Histogram } from 'prom-client';
import ResponseTime from 'response-time';
import UrlValueParser from 'url-value-parser';
const requestLabels = ['route', 'method', 'status'];
const requestCount = new Counter({
    name: 'http_requests_total',
    help: 'Counter for total requests received',
    labelNames: requestLabels,
});
const requestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: requestLabels,
    buckets: [0.01, 0.1, 0.5, 1, 1.5],
});
const requestLength = new Histogram({
    name: 'http_request_length_bytes',
    help: 'Content-Length of HTTP request',
    labelNames: requestLabels,
    buckets: [512, 1024, 5120, 10240, 51200, 102400],
});
const responseLength = new Histogram({
    name: 'http_response_length_bytes',
    help: 'Content-Length of HTTP response',
    labelNames: requestLabels,
    buckets: [512, 1024, 5120, 10240, 51200, 102400],
});
function normalizePath(originalUrl, placeholder = '#val') {
    const { pathname } = url.parse(originalUrl);
    const urlParser = new UrlValueParser();
    return urlParser.replacePathValues(pathname || '', placeholder);
}
function normalizeStatusCode(status) {
    if (status >= 200 && status < 300) {
        return '2XX';
    }
    if (status >= 300 && status < 400) {
        return '3XX';
    }
    if (status >= 400 && status < 500) {
        return '4XX';
    }
    return '5XX';
}
export function metricMiddleware(basePath) {
    const metricsPath = `${basePath}/metrics`;
    return ResponseTime((req, res, time) => {
        const { originalUrl, method } = req;
        const route = normalizePath(originalUrl);
        if (route !== metricsPath) {
            const labels = {
                route,
                method,
                status: normalizeStatusCode(res.statusCode),
            };
            requestCount.inc(labels);
            requestDuration.observe(labels, time / 1000);
            const reqLength = req.get('Content-Length');
            if (reqLength) {
                requestLength.observe(labels, Number(reqLength));
            }
            const resLength = res.get('Content-Length');
            if (resLength) {
                responseLength.observe(labels, Number(resLength));
            }
        }
    });
}
export async function metricRoute(_req, res) {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
}
//# sourceMappingURL=metrics.js.map