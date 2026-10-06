const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. Token missing.' });
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET); // { id, name, email, role }
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }
};

const authorizeRoles = (...allowed) => (req, res, next) => {
  if (!req.user || !allowed.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
  }
  next();
};

module.exports = { verifyToken, authorizeRoles };
