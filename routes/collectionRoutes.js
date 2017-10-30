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

/* GET home page collection. */
router.get('/', middleWare.isLoggedIn, (req, res, next) => { // If Searching
 if(req.query.search) {
   const regex = req.query.search;
   const media = req.user.media
    .filter(movie => movie.title.toLowerCase()  == regex.toLowerCase());

    if (media.length > 0) {
      return res.render('home',{movie: media, err: '', errMsg: '', q: '' , alpha : alphaArr});
    }else {
      return res.render('home',{
        movie: media,
        err: 'Sorry no movie by that title found.',
        errMsg: '',
        q: '',
        alpha: alphaArr
      });
    }
 }else {
   if (req.user.media < 1) { // If New User
     const genreArr = [];
     const movie = [];
     return res.render('home',{
       movie: movie,
       err: '',
       genres: genreArr,
       errMsg: '',
       q: '',
       alpha: alphaArr
     });
   }else { // Existing User
     const genreArr = req.user.media
      .filter(movie => movie.genres);
     return res.render('home',  {
       movie: req.user.media,
       err: '',
       genres: genreArr,
       errMsg: '',
       q: '',
       alpha: alphaArr
     });
   }
 }
});

/* View Single Movie In Collection */
router.get('/movie/:id', (req, res, next) => {
 User.findOne({'_id': req.user.id}, (err, user) => {
 const usermedia = user.media
   .filter(movie => movie.id === req.params.id);
  res.render('movie', {movie: usermedia[0] });
 });
});

/* Remove Movie From Collection */
router.post('/delete/:id', middleWare.isLoggedIn, (req, res) => {
 User.findOne({'_id': req.user.id}, (err, user) => {
   for (var i = 0; i < user.media.length; i++) {
     if (user.media[i].id === req.params.id) {
       user.media.remove(req.params.id);
       user.save();
       if ( user.media.length < 1) {
         res.redirect('/search');
       }else {
         res.redirect('/collection');
       }
     }
   }
 });
});

/* Get User Collection Settings */
 router.get('/settings/:id', middleWare.isLoggedIn, (req, res, next) => {
   User.findById(req.user.id, (err, user) => {
     res.render('settings', {user: user, message: ''});
   });
 });

/* Remove All Movies from Collection */
router.get('/delete_all/:id', middleWare.isLoggedIn, (req, res) => {
  User.findOne({'_id': req.user.id}, (err, user) => {
    user.media = [];
    user.save();
    res.render('settings', {user: user, message: 'Collection has been deleted'});
  });
});

function random_movie(movies){
 return movies[Math.floor(Math.random()* movies.length)];
}

/* GET random movie page. */
router.get('/now_showing', middleWare.isLoggedIn, (req, res, next) => {
  const randomMovie = random_movie(req.user.media);
  if (randomMovie) {
    res.render('nowShowing', {movie: randomMovie});
  }else {
    const movie = {}
    res.render('search' ,{movie: movie, err:''});
  }
});

module.exports = router;
