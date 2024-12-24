function generateUniqueId(ip, userAgentString) {
    const hash = crypto.createHash('sha256');
    hash.update(ip + userAgentString);
    return hash.digest('hex');
}
module.exports = generateUniqueId();