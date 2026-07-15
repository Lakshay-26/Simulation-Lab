const express = require('express');
const { authenticate } = require('../middlewares/auth');
const historyController = require('../controllers/historyController');

const router = express.Router();

router.use(authenticate);

router.get('/', historyController.getHistory);
router.delete('/:id', historyController.deleteHistory);
router.post('/:id/restore', historyController.restoreHistory);
router.get('/export', historyController.exportHistory);

module.exports = router;
