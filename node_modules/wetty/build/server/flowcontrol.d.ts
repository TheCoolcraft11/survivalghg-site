import { Socket } from 'socket.io';
export declare function tinybuffer(socket: Socket, timeout: number, maxSize: number): (data: string) => void;
export declare class FlowControlServer {
    counter: number;
    low: number;
    high: number;
    constructor(low?: number, high?: number);
    account(length: number): boolean;
    commit(length: number): boolean;
}
