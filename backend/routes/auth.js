const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verification,
  resendCode,
  forgotpassword,
  resetpassword,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/verification", verification);
router.post("/resend-code", resendCode);
router.post("/forgot-password", forgotpassword);
router.post("/reset-password", resetpassword);

module.exports = router;
