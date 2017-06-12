var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var express = require('express');

/* User Schema */
var newUser = new mongoose.Schema({
    username: { type: String },
    password: { type: String },
    committee: {type: Boolean}
});

var SALT_WORK_FACTOR = 10;

newUser.pre('save', function(next) {
	var user = this;

	// only hash the password if it has been modified (or is new)
	if(!user.isModified('password')) return next();

	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if(err) return next(err);

		// has the password along with our new salt
		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) return next(err);

			// override the cleartext password with the hashed one
			user.password = hash;
			next();
		});
	});
});

newUser.methods.comparePassword = function(enteredPassword) {
	return bcrypt.compareSync(enteredPassword, this.password);
};

exports.User = mongoose.model('User', newUser);