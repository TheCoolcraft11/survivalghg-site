const path = require("path");
const fs = require("fs");

function getUserStorageUsage(userId) {
    const userUploadPath = path.join('uploads/storage', `${userId}`);

    if (!fs.existsSync(userUploadPath)) {
        return 0;
    }

    let totalSize = 0;
    const files = fs.readdirSync(userUploadPath);

    files.forEach((file) => {
        const filePath = path.join(userUploadPath, file);
        const stat = fs.statSync(filePath);
        totalSize += stat.size;
    });

    return totalSize;
}

module.exports = {getUserStorageUsage};