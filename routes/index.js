const express = require('express'),
     router = express.Router(),
     imdb = require('imdb-api'),
     User = require('../models/User'),
     middleWare = require('../middleware'),
     passport = require('passport');

/* GET main page. */
router.get('/', (req, res, next) => {
  res.redirect('/login');
});

/* GET main page (test layout page). */
router.get('/grid', (req, res, next) => {
  res.render('grid');
});

/* GET login page. */
router.get('/login', (req, res, next) => {
  res.render('index');
});

/* GET register page. */
router.get('/register', (req, res, next) => {
  res.render('register', {message: ''});
});

/* GET new user search page. */
router.get('/addCollection', middleWare.isLoggedIn, (req, res, next) => {
  res.render('/addCollection');
});



module.exports = router;
