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

/* Log In */
router.post('/login', passport.authenticate('local', {
  successRedirect: '/collection',
  failureRedirect: '/register'
}), (req, res) => {});

/* Register New User */
router.post('/register', function(req, res, next) {
  User.register(new User({
    username: req.body.username
  }), req.body.password, (err, user) => {
    if (err) {
      return res.render('register', {message: err.message, error: err});
    }
    passport.authenticate('local')(req, res, () => {
      var movie = [];
      res.redirect('/collection');
    });
  });
});

/* Log Out User */
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

module.exports = router;
