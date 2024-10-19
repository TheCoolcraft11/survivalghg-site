export function tinybuffer(socket, timeout, maxSize) {
    const s = [];
    let length = 0;
    let sender = null;
    return (data) => {
        s.push(data);
        length += data.length;
        if (length > maxSize) {
            socket.emit('data', s.join(''));
            s.length = 0;
            length = 0;
            if (sender) {
                clearTimeout(sender);
                sender = null;
            }
        }
        else if (!sender) {
            sender = setTimeout(() => {
                socket.emit('data', s.join(''));
                s.length = 0;
                length = 0;
                sender = null;
            }, timeout);
        }
    };
}
export class FlowControlServer {
    constructor(low, high) {
        this.counter = 0;
        this.low = 524288;
        this.high = 2097152;
        if (low) {
            this.low = low;
        }
        if (high) {
            this.high = high;
        }
    }
    account(length) {
        const old = this.counter;
        this.counter += length;
        return old < this.high && this.counter > this.high;
    }
    commit(length) {
        const old = this.counter;
        this.counter -= length;
        return old > this.low && this.counter < this.low;
    }
}
//# sourceMappingURL=flowcontrol.js.map