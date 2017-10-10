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
  res.render('register', {message: ''});
});

/* GET main page. */
router.get('/addCollection', isLoggedIn, (req, res, next) => {
  res.render('/addCollection');
});

/* GET search page. */
router.get('/search', isLoggedIn, (req, res, next) => {
  const movie = {}
  res.render('search' ,{movie: movie, err:''});
});

/* GET now showing page. */
router.get('/now_showing', isLoggedIn, (req, res, next) => {
  const randomMovie = random_movie(req.user.media);
  if (randomMovie) {
    res.render('nowShowing', {movie: randomMovie});
  }else {
    const movie = {}
    res.render('search' ,{movie: movie, err:''});
  }
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



/* GET edit page. */
// router.get('/edit/:id', isLoggedIn, (req, res, next) => {
//   User.findOne({'_id': req.user.id}, (err, user) => {
//     for (var i = 0; i < user.media.length; i++) {
//       if (user.media[i].id === req.params.id) {
//         res.render('edit', {movie: user.media[i]});
//       }
//     }
//   });
// });

/*
============================================
          FILTER SEARCH ROUTES
============================================
*/

// Search DB by actor
router.post('/search/actors', isLoggedIn, (req, res) => {
  const movieArr = [];
  console.log(req.body.actor);
  req.user.media.forEach(movie => {
    movie.actors.forEach(actor => {
      if (actor === req.body.actor || actor === ' '+req.body.actor ) {
        movieArr.push(movie);

      }
    });
  });
  res.render('home',{movie:movieArr, err: ''});
});

// Search DB by genre
router.post('/search/genres', isLoggedIn, (req, res) => {
  const movieArr = [];
  console.log(req.body.genre);
  req.user.media.forEach(movie => {
    movie.genres.forEach(genre => {
      if (genre === req.body.genre || genre === ' '+req.body.genre ) {
        movieArr.push(movie);

      }
    });
  });
  res.render('home',{movie:movieArr, err: ''});
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
router.post('/addCollection', isLoggedIn, (req, res) => {
  User.findOne({_id: req.user.id}, (err, user) => {
    if (err) {
      console.log(err);
      return res.render('error', {message: err.message, error: err});
    }else {
      const userMedia = user.media;
      if (userMedia.length > 0) {
        /* CHECK FOR DUPLICATES */
        for (var i = 0; i < userMedia.length; i++) {
          if (userMedia[i].imdburl === req.body.imdburl) {
            console.log('Match found');
            return res.render('search', {movie: user.media, err: 'You already have that movie in your collection.'})
          }
        }
      }
      req.body.genres = req.body.genres.split(',');
      req.body.actors = req.body.actors.split(',');
      if (req.body.title === '') {
        return res.render('search', {movie: user.media, err: 'Please search for a movie to add to your collection'})
      }
      user.media.push(req.body);
      user.save();
      for (var i = 0; i < user.media.length; i++) {
        for (var x = 0; x < user.media[i].genres.length; x++) {
          console.log('User Genres:'+ user.media[i].genres[x]);
          const genreArr = user.media[i].genres[x]
          res.render('home', {movie: user.media, err: '', genres: genreArr});
        }
      }
    }
  })
});

/* Add Movie To WatchList */
router.post('/add_watchlist', isLoggedIn, (req, res) => {
  User.findOne({'_id': req.user.id}, (err, user) => {
    if (err) {
      return console.log(err);
    }else {
      req.body.genres = req.body.genres.split(',');
      req.body.actors = req.body.actors.split(',');
      if (req.body.title === '') {
        return res.render('search', {movie: user.media, err: 'Please search for a movie to add to your watch list'})
      }
      user.watchList.push(req.body);
      user.save();
      res.render('view_watchList', {watchList: user.watchList, err: '' });
    }
  });
});

/* View Watchlist */
router.get('/view_watchList', isLoggedIn, (req, res) => {
  User.findOne({'_id': req.user.id}, (err, user) => {
    res.render('view_watchList', {watchList: user.watchList, err: '' });
  })
});

/* View Single Movie In Watchlist */
router.get('/watchlist/:id', isLoggedIn, (req, res) => {
  User.findOne({'_id': req.user.id}, (err, user) => {
    for (var i = 0; i < user.watchList.length; i++) {
      if (user.watchList[i].imdbid === req.params.id) {
        res.render('movieWatchListView', {movie: user.watchList[i]});
      }
    }
  });
});

/* Add Single Movie In Watchlist To Collection */
router.post('/watchlist/add/:id', isLoggedIn, (req, res, next) => {
  console.log(req.params.id);
  User.findOne({'_id': req.user.id}, (err, user) => {

    for (var i = 0; i < req.user.watchList.length; i++) {

      if (req.user.watchList[i].imdbid === req.params.id) {
        const newMovie = req.user.watchList[i];
        const userMedia = req.user.media;

        if (userMedia.length > 0) {
          /* CHECK FOR DUPLICATES */
          for (var i = 0; i < userMedia.length; i++) {
            if (userMedia[i].imdburl === newMovie.imdburl) {
              console.log('Match found');
              return res.render('view_watchList', { watchList:req.user.watchList, err: 'You already have that movie in your collection.'})
            }
          }
        }
        req.user.media.push(newMovie);
        req.user.watchList.remove(newMovie);
        req.user.save();
        res.render('view_watchList', { watchList:req.user.watchList, err: 'Movie added to your collection'});

      }
    }
  });
});



/* Remove Movie From Collection */
router.post('/delete/:id', isLoggedIn, (req, res) => {
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

/* Remove Movie From Watchlist */
  router.post('/remove/:id', isLoggedIn, (req, res) => {
    console.log(req.params.id);
    User.findOne({'_id': req.user.id}, (err, user) => {
      for (var i = 0; i < req.user.watchList.length; i++) {
        if (req.user.watchList[i].imdbid === req.params.id) {
          console.log();
          const newMovie = req.user.watchList[i];
          const msg = 'Movie added to your collection';
          req.user.watchList.remove(req.user.watchList[i]);
          req.user.save();
          res.redirect('/view_watchList');
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

function random_movie(movies){
  return movies[Math.floor(Math.random()* movies.length)];
}

function stringToArr(str) {
   str = str.split(',');
  return str;
}
console.log(stringToArr('John, Micah, John'));

module.exports = router;
