const router = require('express').Router();
const c = require('../controllers/categoryController');
const validate = require('../middlewares/validate');
const { authorizeRoles } = require('../middlewares/authMiddleware');
const { categoryRules } = require('../validators/productValidator');

router.route('/').get(c.getCategories).post(authorizeRoles('Admin', 'Manager'), categoryRules, validate, c.createCategory);
router.route('/:id')
  .put(authorizeRoles('Admin', 'Manager'), categoryRules, validate, c.updateCategory)
  .delete(authorizeRoles('Admin'), c.deleteCategory);

module.exports = router;
