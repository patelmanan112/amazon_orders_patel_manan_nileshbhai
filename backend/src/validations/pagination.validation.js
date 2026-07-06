import { param, query, validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sort').optional().trim(),
];

const validatePagedListing = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sort').optional().trim(),

  query('OrderStatus')
    .optional({ values: 'falsy' })
    .isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'])
    .withMessage('Invalid OrderStatus value'),

  query('status')
    .optional({ values: 'falsy' })
    .isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'])
    .withMessage('Invalid status value'),

  query('search').optional({ values: 'falsy' }).trim(),
];

const validateInfinitePagination = [
  query('page')
    .notEmpty()
    .withMessage('page is required for infinite scroll')
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),

  query('sort').optional().trim(),
];

const validateCustomerIdParam = [
  param('customerId')
    .notEmpty()
    .withMessage('Customer ID is required')
    .trim()
    .matches(/^CUST\d{6}$/)
    .withMessage('CustomerID must follow format: CUST000001'),
  ...validatePagination,
];

const validateProductIdParam = [
  param('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .trim()
    .matches(/^P\d{5}$/)
    .withMessage('ProductID must follow format: P00001'),
  ...validatePagination,
];

const validatePaginatedSearch = [
  query('q')
    .notEmpty()
    .withMessage('Search query (q) is required')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query (q) must be between 1 and 200 characters'),
  ...validatePagination,
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    throw new ApiError(400, 'Validation failed', errorMessages);
  }

  next();
};

export {
  validatePagination,
  validatePagedListing,
  validateInfinitePagination,
  validateCustomerIdParam,
  validateProductIdParam,
  validatePaginatedSearch,
  handleValidationErrors,
};
