import type { Request, Response, NextFunction, RequestHandler } from 'express';
export declare function redirect(req: Request, res: Response, next: NextFunction): void;
export declare function favicon(basePath: string): Promise<RequestHandler>;
