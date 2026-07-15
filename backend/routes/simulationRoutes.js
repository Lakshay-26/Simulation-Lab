const express = require('express');
const { authenticate } = require('../middlewares/auth');
const simulationController = require('../controllers/simulationController');

const router = express.Router();

router.use(authenticate);

router.get('/defenses', simulationController.getDefenses);
router.post('/toggle-defense', simulationController.toggleDefense);
router.post('/run-recon', simulationController.runRecon);
router.post('/run-exploit', simulationController.runExploit);
router.get('/stats', simulationController.getStats);

module.exports = router;
