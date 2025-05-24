const express = require("express");
const router = express.Router();
const { runCppCode } = require("../controllers/compilerController");

router.post("/run", runCppCode);

module.exports = router;
