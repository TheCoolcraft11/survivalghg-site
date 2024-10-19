import type { SSH, SSL, Server } from './shared/interfaces.js';
import type { Express } from 'express';
import type SocketIO from 'socket.io';
export * from './shared/interfaces.js';
export { logger as getLogger } from './shared/logger.js';
export declare const start: (ssh?: SSH, serverConf?: Server, command?: string, forcessh?: boolean, ssl?: SSL | undefined) => Promise<SocketIO.Server>;
export declare function decorateServerWithSsh(app: Express, ssh?: SSH, serverConf?: Server, command?: string, forcessh?: boolean, ssl?: SSL | undefined): Promise<SocketIO.Server>;
