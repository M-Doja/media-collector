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
