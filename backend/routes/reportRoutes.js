const express = require('express');
const { authenticate } = require('../middlewares/auth');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.use(authenticate);

router.post('/generate', reportController.generateReport);
router.get('/', reportController.getReports);
router.delete('/:id', reportController.deleteReport);
router.post('/:id/restore', reportController.restoreReport);

module.exports = router;
