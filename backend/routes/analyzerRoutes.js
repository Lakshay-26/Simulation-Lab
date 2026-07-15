const express = require('express');
const { authenticate } = require('../middlewares/auth');
const analyzerController = require('../controllers/analyzerController');

const router = express.Router();

router.use(authenticate);

router.post('/analyze', analyzerController.analyzeUrl);

module.exports = router;
