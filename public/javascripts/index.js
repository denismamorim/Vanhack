var colors = 'RGBYOPCM';
var gameId = '';
var gameCode = '';
var playerId = '';

var colorClasses = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'cyan', 'magenta'];
var colorValues = ['R', 'G', 'B', 'Y', 'O', 'P', 'C', 'M'];
var colorValueToClass = {
    R : 'red',
    G : 'green',
    B : 'blue',
    Y : 'yellow',
    O : 'orange',
    P : 'purple',
    C : 'cyan',
    M : 'magenta'
}

// DOM Ready
$(document).ready(function() {
    // Add playSolo button click handler
    $('#playSolo').click(playSolo);
    $('#multiplayer').click(multiplayer);
})

var multiplayer = function() {
    $('#multiplayerInput').removeClass('hidden');
    $('#startMultiplayer').click(startNewGameMultiplayer);
}

var startNewGameMultiplayer = function() {
    var playerName = $('#nameInput').val();
    var numberOfPlayers = $('#numberOfPlayers').val();
    if (playerName.trim() === '' || numberOfPlayers < 2) {
        alert('Plaase choose a valid name and at least 2 players!');
        return;
    }
    var gameCode = $('#gameCodeInput').val();
    $.post('/api/games', {numberOfPlayers : numberOfPlayers, playerName : playerName, gameCode : gameCode}, function(data) {
        if (data.error) {
            // TODO
        } else {
            gameId = data.game._id,
            gameCode = data.gameCode,
            playerId = data.player.id
        }
        startNewGameSolo();
    })
}

var playSolo = function() {
    $.post('/api/games', {numberOfPlayers : 1, playerName : "SoloPlayer"}, function(data) {
        if(data.error) {
            // TODO error creating the game
        } else {
            // Start the game
            gameId = data.game._id;
            gameCode = data.gameCode;
            playerId = data.player.id;
            startNewGameSolo();
        }
    })
}

var startNewGameSolo = function() {
    // Make the game view visible
    $('.chooseGame').addClass('hidden');
    $('.game').removeClass('hidden');
    // Add handles
    $('#makeGuess').click(makeGuess);
    $('.circle').click(changeColor);
    $('.circle').prop('value', 'R');
    updateInstructionsInTime();
}

var changeColor = function(event) {
    var value = this.value;
    // Recover the current color selected
    var index = colorValues.indexOf(value);
    var nextIndex = (index + 1) % colorValues.length;
    // Change the color
    $(this).removeClass(colorValueToClass[colorValues[index]]);
    $(this).addClass(colorValueToClass[colorValues[nextIndex]]);
    this.value = colorValues[nextIndex];
}

// Make a guess to the server
var makeGuess = function(event) {
    // Frist need to validate the guess
    var guess = '';
    $('.inputArea').children().each(function(index, child) {
        guess += child.value;
    });
    // Send the valid guess to the server
    $.post('/api/guesses', {gameId : gameId, guess: guess, playerId : playerId}, function(data) {
        if (data.error) {
            // TODO gameId invalid
        } else {
            // Update the screen with the new guess
            var newResult = '<br/> ';
            for (i = 0; i < guess.length; i++) {
                color = colorValueToClass[guess.charAt(i)];
                newResult += '<div class="circle ' + color + '"></div>';;
            }
            newResult += " exact: " + data.result.exact + " near: " + data.result.near + "<br/>";
            $('.previewGuesses').prepend(newResult);
            if (data.game.over == true) {
                alert('Congratz, you won the game =D');
            }
        }
    })
}

var updateInstructionsInTime = function() {
    $.getJSON('/api/games/' + gameId, function(game){
        updateInstructions(game);
        setTimeout(updateInstructionsInTime, 2000);
    })
}

var updateInstructions = function(game) {
    var instructions = '';
    if (game.over == true) {
        instructions += 'The game is over! '
        game.players.forEach(function(i, player) {
            if (player.won == true) {
                instructions += player.name + " ";
            }
        })
        instructions += " won";
    } else if (game.numberOfPlayers == game.players.length) {
        // Game have started
        var myPlayer = getPlayer(game.players, playerId);
        if (myPlayer.guessed == false) {
            instructions += "You can make a guess!";
        } else {
            instructions += "You need to wait for: ";
            game.players.forEach(function(player) {
                if (player.guessed == false) {
                    instructions += player.name + " ";
                }
            })
        }
    } else {
        // Game havent started
        var numberLeft = game.numberOfPlayers - game.players.length;
        instructions += "Still need more " + numberLeft + " players";
        instructions += "Give them this code: " + game.gameCode;
    }
    $('.instructionArea').html(instructions);
}


var getPlayer = function(players, playerId) {
    returnPlayer = {};
    players.forEach(function(player) {
        if (player.id == playerId) {
            returnPlayer = player;
        }
    });
    return returnPlayer;
}