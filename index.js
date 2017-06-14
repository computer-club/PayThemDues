var express = require('express');
var app = express();
var mongoose = require('mongoose');
var userAuth = require('./processing/userAuth');
var passport = require('passport');
var handlebars = require('express-handlebars');
var bp = require('body-parser');

var db = mongoose.connection;
// Load environment file
require('dotenv').load();

// Establish mongodb connection
mongoose.connect('mongodb://steven:hello@ds025772.mlab.com:25772/heroku_fzbbmw67');
db.on('error', console.error.bind(console, 'Mongo DB Connection Error:'));
db.once('open', function(callback) {
    console.log("Database connected successfully.");
});

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.engine('html', handlebars({ extname: '.html' }));
app.set("view engine", "html");
app.set('views', __dirname + '/views');

app.use(passport.initialize());
app.use(passport.session());

// parse req.body
app.use(bp.urlencoded({ extended: true }));
app.use(bp.json());

userAuth.login(passport);

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/signUp', function(req, res){
  var json = {
    display: 'none'
  };
  res.render('pages/signUp', {errMsg: json});
});

app.post('/processLogin', function(req, res, next){
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { console.log("wrong person"); return res.redirect('/'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    });
  })(req, res, next);
});

app.post('/signUp', userAuth.signUp);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


