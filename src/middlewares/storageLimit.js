const roles = require('../roles.json');
const {getUserStorageUsage} = require('../utils/storageUtils')

function checkStorageLimit(req, res, next) {
    const userRole = req.user.role;

    if (!roles[userRole]) {
        return res.status(403).json({ message: 'Access denied: Invalid role' });
    }

    const storageLimitMB = roles[userRole].storageLimit;
    const storageLimit = storageLimitMB * 1024 * 1024;

    const userId = req.user.id;
    const currentUsage = getUserStorageUsage(userId);

    if (req.body.fileSize) {
        const newFileSize = parseInt(req.body.fileSize, 10);
        const totalUsageAfterUpload = currentUsage + newFileSize;

        if (storageLimit > 0) {

            if (totalUsageAfterUpload > storageLimit) {
                return res.status(400).json({
                    message: `Storage limit exceeded for role '${userRole}'. You can only upload ${storageLimit - currentUsage} bytes more.`
                });
            }
        }
    }

    next();
}

module.exports = checkStorageLimit();