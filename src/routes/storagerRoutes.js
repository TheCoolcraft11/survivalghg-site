const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storageController');
const { authenticateToken, checkPermission } = require('../middlewares/authenticateToken');


router.post('/api/storage/upload', authenticateToken, checkPermission('upload'), storageController.uploadFiles);
router.get('/api/storage/usage', authenticateToken, storageController.getUsage);
router.get('/api/storage/files', authenticateToken, checkPermission('read'), storageController.getFiles);
router.get('/api/storage/download/:filename', authenticateToken, checkPermission('read'), storageController.downloadFile);
router.delete('/api/storage/delete/:filename', authenticateToken, checkPermission('delete'), storageController.deleteFile);
router.post('/api/storage/share/:filename', authenticateToken, checkPermission('share'), storageController.shareFile);
router.get('/api/storage/shared/:filename/:token', storageController.getSharedFile);
router.get('/api/storage/share-info/:filename/:token', storageController.getSharedFile);

module.exports = router;