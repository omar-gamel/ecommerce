const Product = require('../models/product');

exports.getIndex = async (req, res, next) => {
    const selectedCategory = req.query.category || '';
    try {
        if(selectedCategory !== '') {
            const products = await Product.find({ category : selectedCategory });
            return res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                selectedCategory: selectedCategory,
                path: '/'
            });
        }
        const products = await Product.find();
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            selectedCategory: '',
            path: '/'
        });

    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getCart = async (req, res, next) => {
    try {
        const user = await req.user.populate('cart.items.productId').execPopulate();
        const products = user.cart.items;
        let totalItemsCount = 0;
        products.forEach(p => {
           totalItemsCount  += p.quantity * p.productId.price;
        });
        res.render('shop/cart', {
          path: '/cart',
          pageTitle: 'Your Cart',
          products: products,
          totalPrice: totalItemsCount
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
      .then(product => {
        return req.user.addToCart(product);
      })
      .then(result => {
        res.redirect('/shopping-cart');
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  };

exports.postClearCart = (req, res, next) => {
    try {
        req.user.clearCart();
        res.redirect('/');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
      .removeFromCart(prodId)
      .then(result => {
        res.redirect('/shopping-cart');
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
};