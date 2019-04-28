const express = require('express');
const { body } = require('express-validator/check');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/shopping-cart', isAuth, shopController.getCart);

router.post('/add-to-cart', isAuth, shopController.postCart);

router.post('/clearCart', isAuth, shopController.postClearCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);


module.exports = router;
