const router = require('express').Router();
const { login, me } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const rateLimit = require('../utils/rateLimit');
const { loginRules } = require('../validators/productValidator');

router.post('/login', rateLimit({ max: 10 }), loginRules, validate, login);
router.get('/me', verifyToken, me);

module.exports = router;
