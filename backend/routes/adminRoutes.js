const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(authenticate);
router.use(authorize(['admin']));

router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);
router.get('/logs', adminController.getSystemLogs);
router.get('/analytics', adminController.getSystemAnalytics);

module.exports = router;
