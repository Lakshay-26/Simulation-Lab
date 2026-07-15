const express = require('express');
const multer = require('multer');
const path = require('path');
const authController = require('../controllers/authController');
const { authenticate, authLimiter } = require('../middlewares/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `avatar_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/i;
    const isMatched = allowed.test(path.extname(file.originalname)) && allowed.test(file.mimetype);
    if (isMatched) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image file type'));
    }
  }
});

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.use(authenticate);
router.get('/me', authController.getCurrentUser);
router.post('/change-password', authController.changePassword);
router.put('/update-profile', upload.single('avatar'), authController.updateProfile);
router.delete('/delete-account', authController.deleteAccount);
router.post('/logout', authController.logout);

module.exports = router;
