const middleWareObj = {};

middleWareObj.isLoggedIn = function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}


 module.exports = middleWareObj;
