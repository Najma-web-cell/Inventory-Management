const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Dummy hash keeps response time similar when the email does not exist
const DUMMY_HASH = bcrypt.hashSync('inventra-dummy', 10);

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    const user = result.rows[0];

    const ok = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
    if (!user || !ok) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    res.json({ success: true, token, user: payload });
  } catch (err) {
    next(err);
  }
};

exports.me = (req, res) => res.json({ success: true, user: req.user });
