const jwt = require("jsonwebtoken");

module.exports = function requireAuth(req, res, next) {
   try {
      const token =
         req.cookies?.token ||
         (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null);

      if (!token) return res.status(401).json({ error: "Unauthorized" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ FIXED: Use userId from token and set req.userId
      req.userId = decoded.userId || decoded.id || decoded._id;
      req.user = { id: req.userId, email: decoded.email, name: decoded.name };

      if (!req.userId) return res.status(401).json({ error: "Invalid token" });

      return next();
   } catch {
      return res.status(401).json({ error: "Unauthorized" });
   }
};
