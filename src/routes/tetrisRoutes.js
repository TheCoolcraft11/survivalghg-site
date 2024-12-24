const express = require('express');
const router = express.Router();
const tetrisController = require('../controllers/tetrisController');

router.post('/api/tetris/highscore', tetrisController.setHighscore);
router.get('/api/tetris/highscores', tetrisController.getTopHighscores);

module.exports = router;