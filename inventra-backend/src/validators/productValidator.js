const { body } = require('express-validator');

const base = [
  body('sku')
    .trim().toUpperCase()
    .notEmpty().withMessage('SKU is required')
    .matches(/^[A-Z0-9-]+$/).withMessage('SKU must contain only letters, numbers and hyphens (e.g. PROD-1001)'),
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 255 }),
  body('unit_price').isFloat({ min: 0 }).withMessage('Unit price must be a valid positive number'),
  body('cost_price')
    .isFloat({ min: 0 }).withMessage('Cost price must be a valid positive number')
    .custom((value, { req }) => {
      if (parseFloat(value) > parseFloat(req.body.unit_price)) throw new Error('Cost price cannot be higher than unit price');
      return true;
    }),
  body('reorder_level').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Reorder level must be a non-negative integer'),
];

const productValidationRules = [
  ...base,
  body('stock_quantity').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Stock quantity must be an integer greater than or equal to 0'),
];

// Stock is changed only through stock movements (so it is always audited)
const productUpdateValidationRules = base;

const stockAdjustmentValidationRules = [
  body('productId').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('type').isIn(['IN', 'OUT', 'ADJUSTMENT']).withMessage('Type must be IN, OUT, or ADJUSTMENT'),
  body('quantity')
    .isInt({ min: 0 }).withMessage('Quantity must be a whole number')
    .custom((v, { req }) => {
      if (req.body.type !== 'ADJUSTMENT' && parseInt(v, 10) < 1) throw new Error('Quantity must be at least 1');
      return true;
    }),
  body('note').optional().trim().isLength({ max: 500 }),
];

const categoryRules = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 100 }),
  body('description').optional().trim(),
];

const supplierRules = [
  body('name').trim().notEmpty().withMessage('Company name is required').isLength({ max: 255 }),
  body('email').trim().isEmail().withMessage('A valid supplier email is required'),
  body('phone').optional({ values: 'falsy' }).trim().matches(/^[0-9+()\-\s]{5,30}$/).withMessage('Enter a valid phone number'),
  body('address').optional().trim(),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = {
  productValidationRules,
  productUpdateValidationRules,
  stockAdjustmentValidationRules,
  categoryRules,
  supplierRules,
  loginRules,
};
