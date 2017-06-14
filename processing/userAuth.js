var models = require('../models'),
    mongoose = require('mongoose'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcryptjs');

exports.login = function(passport){
    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
        function(req, username, password, done) {
        models.User.findOne({username: username}, function(err, user){
            if (err) { return done(err); }
            if (!user) { 
                loginCustomer(username, password, req, user, done);
            }
            else{
                if (!user.comparePassword(password, user.password)) { return done(null, false); }
                return done(null, user);
            }
        });
        }
    ));
}

exports.signUp = function(req, res){
    var json = {
        error: '',
        body: req.body,
        display: 'none'
    };

    var newUser = new models.User({
        username: req.body.username,
        password: req.body.password,
        committee: false
    });

    var message = '';

    models.User.findOne({username: newUser.username}, function(err, customer){
        if(err){
            console.log('* There was an error processing your request');
        }
        else if(customer == null){
            if(json.body.code === process.env.CODE){
                newUser.committee = true;
                var promise = newUser.save(function(err){
                    if(err){
                        console.log('ERROR: Customer did not save properly');
                    }
                });
                promise.then(function(customerDoc){
                    res.redirect('/');
                });
            }
            else{
                message = '* Wrong committee code.';
                json.error = message;
                json.display = 'block';
                res.render('pages/signUp', {errMsg: json});
            }
        }
        else{
            message = '* User already exists in database. Use different username.';
            json.error = message;
            json.display = 'block';
            res.render('pages/signUp', {errMsg: json});
        }
    });
}

function loginCustomer(username, password, req, user, done){
    models.User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.comparePassword(password, user.password)) { return done(null, false); }
        return done(null, user);
    });
}