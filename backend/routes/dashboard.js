// Example in server.js or routes/dashboard.js
const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/authmiddleware");
const dashboardController = require('../controllers/dashboardController'); // We'll create this

router.get("/:userId", isAuthenticated, dashboardController.getDashboardData);

module.exports = router;