const express = require('express'),
     router = express.Router(),
     imdb = require('imdb-api'),
     User = require('../models/User'),
     middleWare = require('../middleware'),
     passport = require('passport');

 const alphaArr = [
   'A','B','C','D','E','F','G','H','I',
   'J','K','L','M','N','O','P','Q','R',
   'S','T','U','V','W','X','Y','Z','#'
 ];

const numArr = ['1','2','3','4','5','6','7','8','9','0'];

/* GET search page. */
router.get('/', middleWare.isLoggedIn, (req, res, next) => {
 const movie = {}
 res.render('search' ,{movie: movie, err:''});
});

 // Filter Search DB by actor
router.post('/actors', middleWare.isLoggedIn, (req, res) => {
   const movieArr = [];
   req.user.media.forEach(movie => {
     movie.actors.forEach(actor => {
       if (actor === req.body.actor || actor === ' '+req.body.actor ) {
         movieArr.push(movie);

       }
     });
   });
   res.render('home',{movie:movieArr, err: ' ', errMsg:'' ,q:req.body.actor,alpha: alphaArr});
});

 // Filter Search DB by genre
router.post('/genres', middleWare.isLoggedIn, (req, res) => {
   const movieArr = [];
   req.user.media.forEach(movie => {
     movie.genres.forEach(genre => {
       if (genre === req.body.genre || genre === ' '+req.body.genre ) {
         movieArr.push(movie);

       }
     });
   });
   res.render('home',{movie:movieArr, err: '', errMsg:'', q: req.body.genre,alpha: alphaArr });
});

// Filter Search Movies alphabetically / Numberically
router.post('/movie_alpha', middleWare.isLoggedIn, (req, res) => {
  const movieArr = [];
  req.user.media.forEach(movie => {
    movieTitleArr = movie.title.split('');
    const movieLtr = movieTitleArr[0];
    for (var i = 0; i < numArr.length; i++) {
      if (movieLtr === numArr[i][0] && req.body.letter == '#') {
        movieArr.push(movie);
      }
    }
    if (movieLtr == req.body.letter  && movieLtr !== '#' ) {
      movieArr.push(movie);
    }
  });
  res.render('home',{movie:movieArr, err: '', errMsg:'', q: req.body.genre,alpha: alphaArr });
});

/* Search Movie API  (new user)*/
router.get('/new', middleWare.isLoggedIn, (req, res) => {
  var search = req.query.search;
  imdb.get(search ,{apiKey: 'thewdb'})
  .then(movie => {
    res.render('addCollection', {movie:movie});
  })
  .catch(console.log);
});

/* Search Movie By ID */
router.get('/movieId', middleWare.isLoggedIn, (req, res) => {
  imdb.getById('tt0402022', {apiKey: 'thewdb', timeout: 30000})
  .then(movie => {
    console.log(movie);
  })
  .catch(console.log);
});

/* Search Movie API (existing user)*/
router.get('/results', middleWare.isLoggedIn, (req, res) => {
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
router.post('/add_collection', middleWare.isLoggedIn, (req, res) => {
  User.findOne({_id: req.user.id}, (err, user) => {
    if (err) {
      return res.render('error', {message: err.message, error: err});
    }else {
      const userMedia = user.media;
      /* CHECK FOR DUPLICATES */
      if (userMedia.length > 0) {
        const dupArr = userMedia
          .filter(movie => movie.imdburl === req.body.imdburl);
         if (dupArr.length !== 0) {
           return res.render('search', { movie: user.media, watchList:req.user.watchList, err: 'You already have that movie in your collection.'})
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
          const genreArr = user.media[i].genres[x]
          res.render('home', {movie: user.media, err: '', genres: genreArr, errMsg:'', q: '',alpha: alphaArr});
        }
      }
    }
  })
});

/* Add Movie To WatchList */
router.post('/add_watchlist', middleWare.isLoggedIn, (req, res) => {
  User.findOne({'_id': req.user.id}, (err, user) => {
    if (err) {
      return console.log(err);
    }else {
      const userWatch = user.watchList;
      /* CHECK FOR DUPLICATES */
      if (userWatch.length > 0) {
        const dupArr = userWatch
          .filter(movie => movie.imdburl === req.body.imdburl);
         if (dupArr.length !== 0) {
           return res.render('search', { movie: user.media, watchList:req.user.watchList, err: 'You already have that movie on your watch list.'})
         }
      }
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

module.exports = router;
