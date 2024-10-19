/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
import { Server } from 'socket.io';
import type { SSLBuffer } from '../../shared/interfaces.js';
import type express from 'express';
export declare const listen: (app: express.Express, host: string, port: number, path: string, { key, cert }: SSLBuffer) => Server;
