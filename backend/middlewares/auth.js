const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_cyber_security_simulation_key';

const authenticate = async (req, res, next) => {
  try {
    let token = null;
    
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found or deleted' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many authentication attempts. Please try again later.' }
});

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 500,
  message: { message: 'Too many requests. Please slow down.' }
});

module.exports = {
  authenticate,
  authorize,
  authLimiter,
  apiLimiter
};
