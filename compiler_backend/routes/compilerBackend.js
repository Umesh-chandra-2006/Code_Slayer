const express = require('express');
const router = express.Router();
const { handleExecuteCode, handleJudgeCode } = require('../controllers/compilerBackendController');

router.post('/execute', handleExecuteCode); // Used for "Run Code"
router.post('/judge', handleJudgeCode);     // Used for "Submit" and "Test Public Cases"

module.exports = router;