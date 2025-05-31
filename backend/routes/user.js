const express = require("express");
const router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/authmiddleware");
const User = require("../models/User");

router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/all", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error getting all users' });
  }
});


module.exports = router;
