import { dirname, resolve as resolvePath } from 'path';
import { fileURLToPath } from 'url';
import pty from 'node-pty';
import { xterm } from './shared/xterm.js';
const executable = resolvePath(dirname(fileURLToPath(import.meta.url)), '..', 'buffer.js');
export function login(socket) {
    const term = pty.spawn('/usr/bin/env', ['node', executable], xterm);
    let buf = '';
    return new Promise((resolve, reject) => {
        term.on('exit', () => {
            resolve(buf);
        });
        term.on('data', (data) => {
            socket.emit('data', data);
        });
        socket
            .on('input', (input) => {
            term.write(input);
            buf = /\177/.exec(input) ? buf.slice(0, -1) : buf + input;
        })
            .on('disconnect', () => {
            term.kill();
            reject();
        });
    });
}
//# sourceMappingURL=login.js.map