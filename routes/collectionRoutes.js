const express = require('express'),
     router = express.Router(),
     imdb = require('imdb-api'),
     User = require('../models/User'),
     middleWare = require('../middleware'),
     passport = require('passport');


/* GET home page collection. */
router.get('/', middleWare.isLoggedIn, (req, res, next) => {
 if(req.query.search) {
   const regex = req.query.search;
   const mediaArr = req.user.media;
   for (var i = 0; i < mediaArr.length; i++) {
     if (mediaArr[i].title.toLowerCase()  == regex.toLowerCase()) {
       const arr = [];
       arr.push(mediaArr[i]);
       return res.render('home',{movie: arr, err: '', errMsg:'', q:''});
     }
   }
   res.render('home',{movie: mediaArr, err: 'Sorry no movie by that title found.', errMsg: '', q: ''} )
 }else {
   if (req.user.media < 1) {
     const genreArr = [];
     const movie = [];
     res.render('home',  {movie: movie, err: '', genres: genreArr});
   }else {
     for (var i = 0; i < req.user.media.length; i++) {
       const genreArr = req.user.media[i].genres;
       res.render('home',  {movie: req.user.media, err: '', genres: genreArr, errMsg: '', q: ''});
     }
   }
 }
});

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
