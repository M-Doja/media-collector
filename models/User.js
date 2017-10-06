const mongoose = require('mongoose'),
      passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  googleId: String,
  media: [{
    title: String,
    image: String,
    rated: String,
    year: String,
    runtime: String,
    genres: [String],
    director: String,
    writer: [String],
    actors: [String],
    plot: String,
    awards: String,
    poster: String,
    rating:String,
    imbdid: String,
    production: String,
    website: String,
    imdburl:String,
    type: { type: String, default: "Movie" },
    addedToCollectionAt: { type: Date, default: Date.now }
  }]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema)
