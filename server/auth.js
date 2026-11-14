import jwt from "jsonwebtoken";
import { db } from "./db.js";
const JWT_SECRET = process.env.JWT_SECRET || "time-capsule-cosmic-secret-key-2026";
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required. No token provided." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.getData().users.find((u) => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found or deleted." });
    }
    if (user.is_suspended) {
      return res.status(403).json({ error: "This account has been suspended by administration." });
    }
    const { password_hash, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired authentication token." });
  }
}
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.getData().users.find((u) => u.id === decoded.id);
    if (user && !user.is_suspended) {
      const { password_hash, ...safeUser } = user;
      req.user = safeUser;
    }
  } catch (err) {
  }
  next();
}
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Administrator privileges required." });
    }
    next();
  });
}
export {
  generateToken,
  optionalAuth,
  requireAdmin,
  requireAuth
};
