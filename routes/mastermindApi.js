var express = require('express');
var router = express.Router();
var util = require('../util/util');

var Game = require('../model/game');

/* Create a new game */
router.post('/games', function(req, res, next) {
    var numberOfPlayers = req.body.numberOfPlayers;
    var newGame = new Game({
        numberOfPlayers : numberOfPlayers,
        players : []
    });
    if (numberOfPlayers > 1) {
        // Its a multiplayer game, must create the player that started the game
        newGame.addPlayer(req.body.playerName);

    }
    newGame.save(util.defaultApiHandler(res));
});

/* Make a guess */
router.post('/guesses', function(req, res, next) {
    var gameId = req.body.gameId;
    var guess = req.body.guess;
    if (!gameId) {
        res.json({error: 'You need to inform the game id'});
    } else {
        Game.findById(gameId, util.defaultApiHandler(res, function(game) {
            var result = game.guess(guess);
            res.json({exact: result[0], near: result[1]});
        }));
    }
});

/* Get the status of a game */
router.get('/status', function(req, res, next) {

})

module.exports = router;