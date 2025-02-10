const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const { authenticateToken, checkPermission } = require('../middlewares/authenticateToken');

router.get('/api/info', systemController.getSystemInfo);
router.get('/api/top-processes', systemController.getTopProcesses);
router.get('/api/speedtest', authenticateToken, checkPermission('run_speedtest'), systemController.runSpeedTest);

module.exports = router;