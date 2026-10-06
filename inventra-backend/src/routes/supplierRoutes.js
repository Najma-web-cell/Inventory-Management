const router = require('express').Router();
const c = require('../controllers/supplierController');
const validate = require('../middlewares/validate');
const { authorizeRoles } = require('../middlewares/authMiddleware');
const { supplierRules } = require('../validators/productValidator');

router.route('/').get(c.getSuppliers).post(authorizeRoles('Admin', 'Manager'), supplierRules, validate, c.createSupplier);
router.route('/:id')
  .put(authorizeRoles('Admin', 'Manager'), supplierRules, validate, c.updateSupplier)
  .delete(authorizeRoles('Admin'), c.deleteSupplier);

module.exports = router;
