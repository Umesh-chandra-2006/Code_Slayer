const express = require("express");
const router = express.Router();
const { authLimiter } = require("../middleware/rateLimitMiddleware");
const {
  register,
  login,
  verification,
  resendCode,
  forgotpassword,
  resetpassword,
} = require("../controllers/authController");

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/verification", authLimiter, verification);
router.post("/resend-code", authLimiter, resendCode);
router.post("/forgot-password", authLimiter, forgotpassword);
router.post("/reset-password", authLimiter, resetpassword);

module.exports = router;
