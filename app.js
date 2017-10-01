require('dotenv');

const express = require('express'),
      path = require('path'),
      favicon = require('serve-favicon'),
      mongoose = require('mongoose'),
      passport = require('passport'),
      LocalStrategy = require('passport-local'),
      passportLocalMongoose = require('passport-local-mongoose'),
      logger = require('morgan'),
      methodOverride   = require('method-override'),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      keys = require('./config/keys'),
      User = require('./models/User'),
      index = require('./routes/index'),
      users = require('./routes/users');

const app = express();

// mongoose.connect(process.env.MONGO_URI,(err, db) => {
//   if (err) return console.log(err);
//   db = db;
//   console.log(`Connected to DB`);
// });

mongoose.Promise = global.Promise;
mongoose.connect(keys.prodDB_URI, {
  useMongoClient: true
}, (err, db) => {
  if (err) {
    console.log(err);
  }
  console.log('Now connected to DB');
  db = db;
});
// mongoose.connect('mongodb://localhost:27017/Auth-Demo');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(require('express-session')({
  secret: "ku345bli9HUcy4",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
