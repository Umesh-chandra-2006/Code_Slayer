const express = require("express");
const router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

router.get("/:userId", isAuthenticated, dashboardController.getDashboardData);

module.exports = router;
