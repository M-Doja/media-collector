const express = require('express'),
     router = express.Router(),
     imdb = require('imdb-api'),
     User = require('../models/User'),
     middleWare = require('../middleware'),
     passport = require('passport');

/* Remove A User Account */
router.get('/remove_acct/:id', (req, res) => {
  User.findByIdAndRemove(req.user.id, (err, user) => {
    if (err) {
      return res.redirect('/home');
    }
    res.redirect('/login');
  })
});

module.exports = router;
