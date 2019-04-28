const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');

const User = require('../models/user');

const transporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_key:
          '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'
      }
    })
  );

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: null,
        oldInput: {
          email: '',
          password: ''
        },
        validationErrors: []
      });
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: null,
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: errors.array()
    });
  }
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: 'Invalid email or password.',
        oldInput: {
          email: email,
          password: password
        },
        validationErrors: []
      });
    }

    const doMatch = await bcrypt.compare(password, user.password);
    if (doMatch) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      await req.session.save();
      return res.redirect('/');
    }
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: 'Invalid email or password.',
      oldInput: {
        email: email,
        password: password
      },
      validationErrors: []
    });

  } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      oldInput: {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      validationErrors: []
    });
};


exports.postSignup = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        oldInput: {
          name: name,
          email: email,
          password: password,
          confirmPassword: req.body.confirmPassword
        },
        validationErrors: errors.array()
      });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
            isAdmin: false,
            cart: { items: [] }
        });
        await user.save();
        res.redirect('/login');

        // return transporter.sendMail({
        //   to: email,
        //   from: 'shop@node-complete.com',
        //   subject: 'Signup succeeded!',
        //   html: '<h1>You successfully signed up!</h1>'
        // });

    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
  };

  exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
      console.log(err);
      res.redirect('/');
    });
  };