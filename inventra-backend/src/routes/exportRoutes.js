const router = require('express').Router();
const c = require('../controllers/exportController');

router.get('/products', c.exportProductsCSV);
router.get('/valuation', c.exportValuationCSV);
router.get('/movements', c.exportMovementsCSV);
router.get('/audit', c.exportAuditCSV);
router.get('/csv', c.exportProductsCSV); // backwards-compatible alias

module.exports = router;
