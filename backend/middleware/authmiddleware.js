const jwt = require("jsonwebtoken");

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // User is an admin, proceed
  } else {
    res.status(403).json({ message: "Forbidden: Admin access required." });
  }
};

// Middleware to ensure user is authenticated
const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = {
  isAdmin,
  isAuthenticated,
};
