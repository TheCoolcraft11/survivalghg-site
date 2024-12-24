const express = require('express');
const router = express.Router();
const screenshotController = require('../controllers/screenshotController');
const multer = require('multer');
const path = require('path');
const { authenticateToken, checkPermission } = require('../middlewares/authenticateToken');

const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/screenshots');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});


const screenshotStorage = multer({
    storage: storage2,
    limits: { fileSize: 10000000 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Only images are allowed');
        }
    }
});

router.post('/api/upload-screenshot', screenshotStorage.single('file'), screenshotController.uploadScreenshot);
router.delete('/api/delete-screenshot/:filename', authenticateToken, checkPermission('delete-screenshot'), screenshotController.deleteScreenshot);
router.get('/screenshots', screenshotController.getScreenshots)
router.get('/api/random-screenshot.png', screenshotController.getRandomScreenshot);

module.exports = router;