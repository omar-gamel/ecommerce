const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');

const router = express.Router();

// /admin/products => GET
router.get('/products', isAuth, isAdmin, adminController.getProducts);

// /admin/products => POST
router.post('/products', isAuth, isAdmin, adminController.postProducts);

// /admin/add-product => GET
router.get('/add-product', isAuth, isAdmin, adminController.getAddProduct);

// /admin/add-product => POST
router.post(
  '/add-product',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('category')
      .isString()
      .isLength({ min: 3 })
      .trim()
  ], 
  isAuth,
  isAdmin,
  adminController.postAddProduct
);

// /admin/edit-product/:productId => GET
router.get('/edit-product/:productId', isAuth, isAdmin, adminController.getEditProduct);

// /admin/edit-product => POST
router.post('/edit-product',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('category')
      .isString()
      .isLength({ min: 3 })
      .trim()
  ], 
   isAuth,
   isAdmin,
   adminController.postEditProduct
);

// /admin/delete-product => POST
router.post('/delete-product', isAuth, isAdmin, adminController.postDeleteProduct);

module.exports = router;
