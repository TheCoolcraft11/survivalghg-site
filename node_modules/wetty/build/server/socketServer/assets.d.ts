/// <reference types="serve-static" />
import express from 'express';
export declare const trim: (str: string) => string;
export declare const serveStatic: (path: string) => import("serve-static").RequestHandler<express.Response<any, Record<string, any>>>;
