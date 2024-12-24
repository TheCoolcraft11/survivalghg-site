function findBestUnit(bytes) {
    let dividor = 1024;
    units = ['B', 'KB', 'MB', 'GB', 'TB'];
    unitIndex = 0;
    while (bytes >= dividor && unitIndex < units.length - 1) {
        bytes /= dividor;
        unitIndex++;
    }
    return `${bytes.toFixed(2)} ${units[unitIndex]}`;
}
