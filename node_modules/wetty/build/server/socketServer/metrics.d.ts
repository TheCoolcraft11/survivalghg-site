import type { Request, Response, RequestHandler } from 'express';
export declare function metricMiddleware(basePath: string): RequestHandler;
export declare function metricRoute(_req: Request, res: Response): Promise<void>;
