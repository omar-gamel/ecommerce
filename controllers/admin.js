const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');

const Product = require('../models/product');
const fileHelper = require('../util/file');

exports.getProducts = async (req, res, next) => {
    try {
       const products = await Product.find();
        res.render('admin/products', {
            pageTitle: 'Manage Product',
            path: '/admin/products',
            prods: products
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postProducts = async (req, res, next) => {
    const search = req.body.search;
    console.log(search);
    try {
       const products = await Product 
        .find()
        .or([ 
            { title: new RegExp(search, 'i') }, 
            { title: new RegExp('^' + search + '$') } , 
            { title: new RegExp(search) }, 
            { title: new RegExp('^' + search + '$', 'i') } 
        ]);
        res.render('admin/products', {
            pageTitle: 'Manage Product',
            path: '/admin/products',
            prods: products
        });
        console.log(products);
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};


exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
};

exports.postAddProduct = async (req, res, next) => {
    const title = req.body.title;
    const price = req.body.price;
    const category = req.body.category;
    const image = req.file;
    const errors = validationResult(req);
    if (!image) {
        return res.render('admin/add-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                category: category
            },
            errorMessage: 'Attached file is not image.',
            validationErrors: []
        });
    }
    const imageUrl = image.path;
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/add-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                category: category,
                imageUrl: imageUrl
            },
            errorMessage: null,
            validationErrors: errors.array()
        });
    }
    const product = new Product({
        title: title,
        price: price,
        category: category,
        imageUrl: imageUrl,
    });
    try {
        await product.save();
        console.log('PRODUCT CREATED!');
        return res.redirect('/admin/products');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getEditProduct = async (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    try {
        const product = await Product.findById(prodId);
        res.render('admin/add-product', {
            pageTitle: 'Edit Product',
            path: '/admin/add-product',
            product: product,
            editing: editMode,
            hasError: false,
            errorMessage: null,
            validationErrors: []
        });
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postEditProduct = async (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedCategory = req.body.category;
    const image = req.file;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/add-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                category: updatedCategory,
                _id: prodId
            },
            errorMessage: null,
            validationErrors: errors.array()
        });
    }
    try {
        const product = await Product.findById(prodId);
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedCategory;
        if (image) {
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
        await product.save();
        console.log('UPDATED PRODUCT!');
        return res.redirect('/admin/products');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postDeleteProduct = async (req, res, next) => {
    const prodId = req.body.productId;
    try {
        const product = await Product.findById(prodId);
        if(!product) { 
             return next(new Error('Product not found.'));
        }
        fileHelper.deleteFile(product.imageUrl);
        await Product.deleteOne({ _id: prodId });
        console.log('DESTROYED PRODUCT');
        res.redirect('/admin/products');
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};