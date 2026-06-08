const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getMe,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);

module.exports = router;
