const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middlewares/authenticateToken');
const weatherController = require('../controllers/weatherController');

router.get('/widgets', dashboardController.getWidgets);
router.get('/weather', weatherController.getWeatherData);
router.post('/api/dashboard-layout/save', authenticateToken, dashboardController.saveLayout);
router.get('/api/dashboard-layout/load', authenticateToken, dashboardController.getLayout);

module.exports = router;
