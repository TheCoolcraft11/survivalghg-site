import type { SSL, Server } from '../shared/interfaces.js';
import type { Express } from 'express';
import type SocketIO from 'socket.io';
export declare function server(app: Express, { base, port, host, title, allowIframe }: Server, ssl?: SSL): Promise<SocketIO.Server>;
