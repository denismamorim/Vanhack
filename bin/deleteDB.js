var mongoose = require('mongoose');
var Game = require('../model/game');

// mongoose
var dbUrl = 'localhost';
var dbName = 'mastermind';

mongoose.connect('mongodb://' + dbUrl + '/' + dbName);

Game.find(function(err, games) {
	if (err) {
		console.log(err);
	} else {
		games.forEach(function(game) {
			game.remove(function (err) {
				if (err) {
					console.log(err);
				}
			})
		});
	}
})

console.log('Database successfuly deleted');