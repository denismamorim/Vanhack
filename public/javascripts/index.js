var colors = 'RGBYOPCM';
var gameId = '';

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
    alert('New multiplayer game with ' + numberOfPlayers + ' players and you are ' + playerName);
}

var playSolo = function() {
    $.post('/api/games', {numberOfPlayers : 1}, function(data) {
        if(data.error) {
            // TODO error creating the game
        } else {
            // Start the game
            gameId = data._id;
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
    $.post('/api/guesses', {gameId : gameId, guess: guess}, function(data) {
        if (data.error) {
            // TODO gameId invalid
        } else {
            // Update the screen with the new guess
            var newResult = '<br/> ';
            for (i = 0; i < guess.length; i++) {
                color = colorValueToClass[guess.charAt(i)];
                newResult += '<div class="circle ' + color + '"></div>';;
            }
            newResult += " exact: " + data.exact + " near: " + data.near + "<br/>";
            $('.previewGuesses').prepend(newResult);
            $('#inputGuess').val('');
        }
    })
}