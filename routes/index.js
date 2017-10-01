const express = require('express'),
     router = express.Router(),
     imdb = require('imdb-api'),
     User = require('../models/User'),
     passport = require('passport');

/*
============================================
          Page Displays
============================================
*/
/* GET main page. */
router.get('/', (req, res, next) => {
  res.redirect('/login');
});

/* GET login page. */
router.get('/login', (req, res, next) => {
  res.render('index');
});

/* GET register page. */
router.get('/register', (req, res, next) => {
  res.render('register');
});

/* GET main page. */
router.get('/addCollection', (req, res, next) => {
  res.render('/addCollection');
});

/* GET home page. */
router.get('/home', isLoggedIn, (req, res, next) => {
  User.find({}, (err, user) => {
    const search = 'The Transporter';
    imdb.get(search ,{apiKey: 'thewdb'})
    .then( movie => {
      console.log(movie);
      if (req.user.media.length < 1) {

        res.render('home',  {movie: movie, movies: "Welcome to the viewing room"});
      }else {
        res.render('home',  {movie: req.user.media, movies: "Welcome to the viewing room"});
      }
      console.log('Movie saved to collection');
    })
    .catch(console.log);
  });
});

/* GET search page. */
router.get('/search', isLoggedIn, (req, res, next) => {
  const movie = {}
  res.render('search' ,{movie: movie});
});

/* GET search page. */
router.get('/edit/:id', isLoggedIn, (req, res, next) => {
  User.findOne({'_id': req.user.id}, (err, user) => {
    for (var i = 0; i < user.media.length; i++) {
      console.log(user.media[i].id);
      if (user.media[i].id === req.params.id) {
        res.render('edit', {movie: user.media[i]});
      }
    }
  })
});


/*
============================================
          USER ROUTES
============================================
*/
/* Log In */
router.post('/login', passport.authenticate('local', {
  successRedirect: 'home',
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
      return res.render('error', {message: err.message, error: err});
    }
    passport.authenticate('local')(req, res, () => {
      var movie = {};
      res.render('search', {movie: movie});
    });
  });
});

/* Log Out User*/
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

/*
============================================
          MEDIA COLLECTION ROUTES
============================================
*/

/* Search Movie API */
router.get('/newsearch', (req, res) => {
  var search = req.query.search;
  imdb.get(search ,{apiKey: 'thewdb'})
  .then( movie => {
    console.log(movie);
    res.render('addCollection', {movie:movie});
    console.log('Movie saved to collection');
  })
  .catch(console.log);
});

/* Search Movie API */
router.get('/results', (req, res) => {
  var search = req.query.search;
  imdb.get(search ,{apiKey: 'thewdb'})
  .then( movie => {
    console.log(movie);
    res.render('search',  {movie: movie});
    console.log('Movie saved to collection');
  })
  .catch(console.log);
});

/* Add Movie To Collection */
router.post('/addCollection', (req, res) => {
  User.findOne({_id: req.user.id}, (err, user) => {
    if (err) {
      console.log(err);
      return res.render('error', {message: err.message, error: err});
    }else {
      user.media.push(req.body);
      user.save();
      res.render('home', {movie: user.media})
    }
  })
});

/* Remove Movie From Collection */
router.post('/delete/:id', (req, res) => {
  User.findOne({'_id': req.user.id}, (err, user) => {
    for (var i = 0; i < user.media.length; i++) {
      console.log(user.media[i].id);
      if (user.media[i].id === req.params.id) {
        user.media.remove(req.params.id);
        user.save();
        if ( user.media.length < 1) {
          res.redirect('/search')
        }else {
          res.redirect('/home')
        }
      }
    }
  })
});

/* Edit Movie  */
router.post('/update/:id', (req, res, next) => {
  User.findOne({'_id': req.user.id}, (err, user) => {
    for (var i = 0; i < user.media.length; i++) {
      console.log(user.media[i].id);
      if (user.media[i].id === req.params.id) {
          user.media[i].genre = req.body.genre;
          console.log(user);
          user.save();
        res.render('movie', {movie: user.media[i]})
      }
    }
  })
});

/* View Movie  */
router.get('/movie/:id', (req, res, next) => {
  User.findOne({'_id': req.user.id}, (err, user) => {
    for (var i = 0; i < user.media.length; i++) {
      console.log(user.media[i].id);
      if (user.media[i].id === req.params.id) {
        res.render('movie', {movie: user.media[i]})
      }
    }
  })
});




/* MIDDLEWARE */
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}







module.exports = router;
