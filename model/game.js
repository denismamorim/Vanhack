var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Game = new Schema({
    gameCode : String,
    secret : String,
    numberOfPlayers : Number,
    over : Boolean,
    players : [{
        name : String,
        id : String,
        guessed : Boolean,
        won : Boolean
    }]
})

// Executed on every save
Game.pre('save', function(next) {
    this.gameCode = selectLettersFromArray(codeSize, letters);
    this.secret = selectLettersFromArray(secretSize, colors);
    this.over = false;
    next();
})

// Return true if this player can make a guess
Game.methods.canGuess = function(playerId) {
    return !getPlayer(this.players, playerId).guessed;
}

// Return the result of guess in the form [exact, near]
Game.methods.guess = function(guess, playerId) {
    // Need to update that this player made a guess
    if (playerId) {
        getPlayer(this.players, playerId).guessed = true;
        // Need to check: if all players guessed start the next round
        var nextRound = true;
        this.players.forEach(function(player) {
            if (player.guessed == false) {
                nextRound = false;
            }
        })
        if (nextRound) {
            this.players.forEach(function(player) {
                player.guessed = false;
            })
        }
    }

    // Calcute the answear to the guess
    var secret = this.secret;
    var exact = 0;
    for (i = 0; i < guess.length; i++) {
        if (guess.charAt(i) == secret.charAt(i)) {
            // Exact guess
            exact++;
            // Char that are guess exact dont count for nears, so I remove them
            guess = setCharAt(guess, i, '0');
            secret = setCharAt(secret, i, '0');
        }
    }
    var near = 0;
    for (i = 0; i < guess.length; i++) {
        var guessChar = guess.charAt(i);
        var position = secret.search(guessChar);
        console.log(guess + " " + secret);
        console.log(guessChar + " " + position);
        if (guessChar != '0' && position != -1) {
            // Near guess
            near++;
            // Also need to remove the near char to not count it twice
            secret = setCharAt(secret, position, '0');
        }
    }
    // Check if the guess was right
    if (exact == secret.length) {
        this.over = true;
        if (playerId) {
            getPlayer(this.players, playerId).won = true;
        }
    }
    return {exact : exact, near : near};
}

Game.methods.addPlayer = function(playerName) {
    var id = selectLettersFromArray(8, letters);
    if (this.players == null) {
        this.players = [];
    }
    var newPlayer = {
        name : playerName,
        id : id,
        guessed : false,
        won : false
    }
    this.players.push(newPlayer);
    return newPlayer;
}

// Constants
var letters = 'abcdefghijklmnopqrstuvwxyz';
var colors = 'RGBYOPCM';
var codeSize = 6;
var secretSize = 8;

// Helper functions:

var getPlayer = function(players, playerId) {
    returnPlayer = {};
    players.forEach(function(player) {
        if (player.id == playerId) {
            returnPlayer = player;
        }
    });
    return returnPlayer;
}

// Select <size> random letters from a array of possible letters
var selectLettersFromArray = function(size, array) {
    var code = "";
    for (i = 0; i < size; i++) {
        code += array.charAt(Math.floor(Math.random()*array.length));
    }
    return code;
}

// Helper method to change a char at a position in a string
var setCharAt = function (string, index, char) {
    if (index > string.length-1) {
        return string;
    }
    return string.substr(0, index) + char + string.substr(index+1);
}

module.exports = mongoose.model('Game', Game);