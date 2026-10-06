const router = require('express').Router();
const c = require('../controllers/productController');
const upload = require('../config/multer');
const validate = require('../middlewares/validate');
const { authorizeRoles } = require('../middlewares/authMiddleware');
const { productValidationRules, productUpdateValidationRules } = require('../validators/productValidator');

const canEdit = authorizeRoles('Admin', 'Manager');

router.route('/')
  .get(c.getProducts)
  .post(canEdit, upload.array('images', 5), productValidationRules, validate, c.createProduct);

router.route('/:id')
  .get(c.getProduct)
  .put(canEdit, upload.array('images', 5), productUpdateValidationRules, validate, c.updateProduct)
  .delete(authorizeRoles('Admin'), c.deleteProduct);

module.exports = router;
