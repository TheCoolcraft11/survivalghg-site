const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');

router.get('/api/info', systemController.getSystemInfo);
router.get('/api/top-processes', systemController.getTopProcesses);

module.exports = router;