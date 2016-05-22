var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Game = new Schema({
    gameCode : String,
    secret : String,
    numberOfPlayers : Number,
    players : [{
        name : String,
        id : String
    }]
})

// Executed on every save
Game.pre('save', function(next) {
    this.gameCode = selectLettersFromArray(codeSize, letters);
    this.secret = selectLettersFromArray(secretSize, colors);
    next();
})


// Return the result of guess in the form [exact, near]
Game.methods.guess = function(guess) {
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
    return [exact, near];
}

Game.methods.addPlayer = function(playerName) {
    var id = selectLettersFromArray(8, letters);
    if (this.players == null) {
        this.players = [];
    }
    this.players.push({
        name : playerName,
        id : id
    })
}

// Constants
var letters = 'abcdefghijklmnopqrstuvwxyz';
var colors = 'RGBYOPCM';
var codeSize = 6;
var secretSize = 8;

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