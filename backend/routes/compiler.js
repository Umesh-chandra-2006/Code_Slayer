const express = require("express");
const router = express.Router();
const { runCppCode , testAgainstAllCases } = require("../controllers/compilerController");

router.post("/run", runCppCode);
router.post("/test", testAgainstAllCases);

module.exports = router;
