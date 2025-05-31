const express = require("express");
const router = express.Router();
const { runCppCode , testAgainstAllCases } = require("../controllers/compilerController");
const { isAuthenticated } = require('../middleware/authmiddleware');

router.post("/run",isAuthenticated, runCppCode);
router.post("/test",isAuthenticated, testAgainstAllCases);

module.exports = router;
