// Minimal in-memory rate limiter (per IP). Good enough for a single-instance API.
module.exports = ({ windowMs = 15 * 60 * 1000, max = 10, message = 'Too many attempts, please try again later.' } = {}) => {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const entry = hits.get(key);
    if (!entry || now > entry.reset) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set('Retry-After', Math.ceil((entry.reset - now) / 1000));
      return res.status(429).json({ success: false, message });
    }
    next();
  };
};
