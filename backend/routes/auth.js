const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verification,
  resendCode,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/verification", verification);
router.post("/resend-code", resendCode);

module.exports = router;
