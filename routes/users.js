const express = require('express'),
     router = express.Router(),
     imdb = require('imdb-api'),
     User = require('../models/User'),
     passport = require('passport');

 /* Log In */
router.post('/login', passport.authenticate('local', {
   successRedirect: 'collection',
   failureRedirect: 'register'
}), (req, res) => {

});

 /* Register New User */
router.post('/register', function(req, res, next) {
   User.register(new User({
     username: req.body.username
   }), req.body.password, (err, user) => {
     if (err) {
       console.log(err);
       return res.render('register', {message: err.message, error: err});
     }
     passport.authenticate('local')(req, res, () => {
       var movie = {};
       res.render('search', {movie: movie, err: ''});
     });
   });
 });

 /* Log Out User*/
 router.get('/logout', (req, res) => {
   req.logout();
   res.redirect('/login');
 });

module.exports = router;
