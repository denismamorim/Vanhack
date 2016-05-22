var express = require('express');
var router = express.Router();
var util = require('../util/util');

var Game = require('../model/game');

/* Create a new game */
router.post('/games', function(req, res, next) {
    var gameCode = req.body.gameCode;
    if (gameCode) {
        // Join a game
        Game.find({gameCode : gameCode}, util.defaultApiHandler(res, function(games) {
            // We can assume there is only one game for a gameCode
            var game = games[0];
            var newPlayer = game.addPlayer(req.body.playerName);
            Game.update({_id : game._id}, game, util.defaultApiHandler(res, function() {
                // Need to refetch the updated game
                Game.findById(game._id, util.defaultApiHandler(res, function(updatedGame) {
                    res.json({game : updatedGame, player: newPlayer});
                }))
            }))
        }))
    } else {
        // Start a new game
        var numberOfPlayers = req.body.numberOfPlayers;
        var newGame = new Game({
            numberOfPlayers : numberOfPlayers,
            players : []
        });
        var newPlayer = newGame.addPlayer(req.body.playerName);
        newGame.save(util.defaultApiHandler(res, function(newGame) {
            res.json({game : newGame, player: newPlayer});
        }));
    }

    
});

/* Make a guess */
router.post('/guesses', function(req, res, next) {
    var gameId = req.body.gameId;
    var guess = req.body.guess;
    var playerId = req.body.playerId;
    if (!gameId) {
        res.json({error: 'You need to inform the game id'});
    } else {
        Game.findById(gameId, util.defaultApiHandler(res, function(game) {
            if (game.numberOfPlayers > 1) {
                if (!game.canGuess(playerId)) {
                    res.json({error : "This player cant make a guess yet!"});
                    return;
                }
            }
            var result = game.guess(guess, playerId);
            console.log(game);
            Game.update({_id : game.id}, game, util.defaultApiHandler(res, function() {
                // Need to refetch the update game
                Game.findById(gameId, util.defaultApiHandler(res, function(updatedGame) {
                    res.json({result : result, game : updatedGame});    
                }))
            }))
        }));
    }
});

/* Return the current state of the game */
router.get('/games/:id', function(req, res, next) {
    var gameId = req.params.id;
    Game.findById(gameId, util.defaultApiHandler(res));
})

module.exports = router;