const jwt = require('jsonwebtoken');

const isAdmin = (req, res, next) => {
  // This middleware should run *after* an authentication middleware
  // that sets req.user and req.user.role
  if (req.user && req.user.role === 'admin') {
    next(); // User is an admin, proceed
  } else {
    res.status(403).json({ message: "Forbidden: Admin access required." });
  }
};

// Middleware to ensure user is authenticated (you might already have this)
const isAuthenticated = (req, res, next) => {
    console.log("Authorization header:", req.headers.authorization);

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer '))
  {
        console.log("No token or wrong format");

    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token decoded:", decoded);

    req.user = decoded;
    next();
  } catch (err) {
        console.log("Token verification error:", err.message);

    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
  isAdmin,
  isAuthenticated // You might want to export this too for other uses
};
