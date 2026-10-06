const router = require('express').Router();
const c = require('../controllers/stockController');
const validate = require('../middlewares/validate');
const { stockAdjustmentValidationRules } = require('../validators/productValidator');

router.post('/adjust', stockAdjustmentValidationRules, validate, c.adjustStock);
router.get('/logs', c.getAllStockLogs);
router.get('/history/:productId', c.getHistory);

module.exports = router;
