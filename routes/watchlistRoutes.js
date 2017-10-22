const express = require('express'),
     router = express.Router(),
     imdb = require('imdb-api'),
     User = require('../models/User'),
     MiddleWare = require('../middleWare'),
     passport = require('passport');


 /* View Watchlist */
router.get('/view', MiddleWare.isLoggedIn, (req, res) => {
   User.findOne({'_id': req.user.id}, (err, user) => {
     res.render('view_watchList', {watchList: user.watchList, err: '' });
   })
});

 /* View Single Movie In Watchlist */
router.get('/:id', MiddleWare.isLoggedIn, (req, res) => {
   User.findOne({'_id': req.user.id}, (err, user) => {
    user.watchList.forEach(movie => {
      if (movie.imdbid === req.params.id) {
        const RatingArr = movie.rating[0].split('.')[0];
        res.render('movieWatchListView', {movie: movie, rating: movie.rating[0].split('.')[0] });
      }
    })
   });
 });

 /* Add Single Movie In Watchlist To Collection */
 router.post('/add/:id', MiddleWare.isLoggedIn, (req, res, next) => {
   User.findOne({'_id': req.user.id}, (err, user) => {
     for (var i = 0; i < req.user.watchList.length; i++) {
       if (req.user.watchList[i].imdbid === req.params.id) {
         const newMovie = req.user.watchList[i];
         const userMedia = req.user.media;
         /* CHECK FOR DUPLICATES */
         if (userMedia.length > 0) {
           for (var i = 0; i < userMedia.length; i++) {
             if (userMedia[i].imdburl === newMovie.imdburl) {
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

 /* Remove Movie From Watchlist */
   router.post('/remove/:id', MiddleWare.isLoggedIn, (req, res) => {
     User.findOne({'_id': req.user.id}, (err, user) => {
       for (var i = 0; i < req.user.watchList.length; i++) {
         if (req.user.watchList[i].imdbid === req.params.id) {
           const newMovie = req.user.watchList[i];
           const msg = 'Movie added to your collection';
           req.user.watchList.remove(req.user.watchList[i]);
           req.user.save();
           res.render('view_watchList', { watchList:req.user.watchList, err: 'Movie removed from your collection'});
         }
       }
     });
   });

module.exports = router;
