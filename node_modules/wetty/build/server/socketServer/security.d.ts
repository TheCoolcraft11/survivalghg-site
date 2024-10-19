import type { Request, Response } from 'express';
export declare const policies: (allowIframe: boolean) => (req: Request, res: Response, next: (err?: unknown) => void) => void;
