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

/* GET main page. */
router.get('/grid', (req, res, next) => {
  res.render('grid');
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
router.get('/addCollection', isLoggedIn, (req, res, next) => {
  res.render('/addCollection');
});

/* GET home page. */
router.get('/home', isLoggedIn, (req, res, next) => {
  if(req.query.search) {
    const regex = req.query.search;
    // Search DB by movie title
    User.find({'_id': req.user.id}, function(err, user){
       if(err){
          console.log(err);
       } else {
          for (var i = 0; i < user.length; i++) {
            if (user[i].id === req.user.id) {
              const mediaArr = user[i].media;
              for (var i = 0; i < mediaArr.length; i++) {
                if (mediaArr[i].title.toLowerCase()  == regex.toLowerCase()) {
                  const arr = [];
                  arr.push(mediaArr[i]);
                  return res.render('home',{movie: arr, err: ''});
                }
              }
              res.render('home',{movie: mediaArr, err: 'Sorry no movie by that title found.'} )
            }
          }
        }
    });
  }else {
    User.find({}, (err, user) => {
      const search = 'The Transporter';
      imdb.get(search ,{apiKey: 'thewdb'})
      .then( movie => {
        if (req.user.media.length < 1) {
          const genreArr = [];
          res.render('home',  {movie: movie, err: '', genres: genreArr});
        }else {
          for (var i = 0; i < req.user.media.length; i++) {
            const genreArr = req.user.media[i].genres;
            res.render('home',  {movie: req.user.media, err: '', genres: genreArr});
          }
        }
        console.log('Movie saved to collection');
      })
       .catch(console.log);
    });
  }
});

/* GET search page. */
router.get('/search', isLoggedIn, (req, res, next) => {
  const movie = {}
  res.render('search' ,{movie: movie, err:''});
});

/* GET search page. */
router.get('/edit/:id', isLoggedIn, (req, res, next) => {
  User.findOne({'_id': req.user.id}, (err, user) => {
    for (var i = 0; i < user.media.length; i++) {
      if (user.media[i].id === req.params.id) {
        res.render('edit', {movie: user.media[i]});
      }
    }
  })
});

// Search DB by actor
router.post('/search/actors', isLoggedIn, (req, res) => {
  const movieArr = [];
  console.log(req.body.actor);
  req.user.media.forEach(movie => {
    movie.actors.forEach(actor => {
      if (actor === req.body.actor || actor === ' '+req.body.actor ) {
        movieArr.push(movie);

      }
    })
  })
  res.render('home',{movie:movieArr, err: ''});

})

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
      res.render('search', {movie: movie, err: ''});
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
  .then(movie => {
    res.render('addCollection', {movie:movie});
  })
  .catch(console.log);
});

/* Search Movie API */
router.get('/results', (req, res) => {
  var search = req.query.search;
  imdb.get(search ,{apiKey: 'thewdb'})
  .then( (movie) => {
    res.render('search',  {movie: movie, err: ''});
  })
  .catch(err => {
    movie = {}
    res.render('search',  {movie: movie, err: 'Sorry movie not found!'})
  });
});

/* Add Movie To Collection */
router.post('/addCollection', (req, res) => {
  User.findOne({_id: req.user.id}, (err, user) => {
    if (err) {
      console.log(err);
      return res.render('error', {message: err.message, error: err});
    }else {
      const userMedia = user.media;
      if (userMedia.length > 0) {
        for (var i = 0; i < userMedia.length; i++) {
          if (userMedia[i].imdburl === req.body.imdburl) {
            console.log('Match found');
            return res.render('search', {movie: user.media, err: 'You already have that movie in your collection.'})
          }
          const mediaItem = userMedia[i]

        }
      }
      req.body.genres = req.body.genres.split(',');
      req.body.actors = req.body.actors.split(',');

      user.media.push(req.body);
      user.save();
      for (var i = 0; i < user.media.length; i++) {
        for (var x = 0; x < user.media[i].genres.length; x++) {
          console.log('User Genres:'+ user.media[i].genres[x]);
          const genreArr = user.media[i].genres[x]
          res.render('home', {movie: user.media, err: '', genres: genreArr});
        }
      }
      // res.render('home', {movie: user.media, err: ''});
    }
  })
});

/* Remove Movie From Collection */
router.post('/delete/:id', (req, res) => {
  User.findOne({'_id': req.user.id}, (err, user) => {
    for (var i = 0; i < user.media.length; i++) {
      if (user.media[i].id === req.params.id) {
        user.media.remove(req.params.id);
        user.save();
        if ( user.media.length < 1) {
          res.redirect('/search');
        }else {
          res.redirect('/home');
        }
      }
    }
  });
});

/* Edit Movie In Collection */
// router.post('/update/:id', (req, res, next) => {
//   User.findOne({'_id': req.user.id}, (err, user) => {
//     for (var i = 0; i < user.media.length; i++) {
//       if (user.media[i].id === req.params.id) {
//           user.media[i].genre = req.body.genre;
//           user.save();
//         res.render('movie', {movie: user.media[i]})
//       }
//     }
//   })
// });

/* View Single Movie In Collection */
router.get('/movie/:id', (req, res, next) => {
  User.findOne({'_id': req.user.id}, (err, user) => {
    for (var i = 0; i < user.media.length; i++) {
      if (user.media[i].id === req.params.id) {
        res.render('movie', {movie: user.media[i]});
      }
    }
  });
});


/* MIDDLEWARE */
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}


function stringToArr(str) {
   str = str.split(',');
  return str;
}
console.log(stringToArr('John, Micah, John'));

module.exports = router;
