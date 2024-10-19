import isUndefined from 'lodash/isUndefined.js';
const getRemoteAddress = (remoteAddress) => isUndefined(remoteAddress.split(':')[3])
    ? 'localhost'
    : remoteAddress.split(':')[3];
export function loginOptions(command, remoteAddress) {
    return command === 'login'
        ? [command, '-h', getRemoteAddress(remoteAddress)]
        : [command];
}
//# sourceMappingURL=login.js.map