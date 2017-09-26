"use strict";

var openCards = [];
var numberOfMoves;
var numberOfStars;
var gameDuration;
var gameDurationTimer;

/*
 * Create a list that holds all of your cards
 */
var deck = {
  cards: [{
      icon: "diamond",
      class: "card"
    },
    {
      icon: "diamond",
      class: "card"
    },
    {
      icon: "paper-plane-o",
      class: "card"
    },
    {
      icon: "paper-plane-o",
      class: "card"
    },
    {
      icon: "anchor",
      class: "card"
    },
    {
      icon: "anchor",
      class: "card"
    },
    {
      icon: "bolt",
      class: "card"
    },
    {
      icon: "bolt",
      class: "card"
    },
    {
      icon: "cube",
      class: "card"
    },
    {
      icon: "cube",
      class: "card"
    },
    {
      icon: "leaf",
      class: "card"
    },
    {
      icon: "leaf",
      class: "card"
    },
    {
      icon: "bicycle",
      class: "card"
    },
    {
      icon: "bicycle",
      class: "card"
    },
    {
      icon: "bomb",
      class: "card"
    },
    {
      icon: "bomb",
      class: "card"
    }
  ]
};

/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */
function restartGame() {
  var htmlListItem = '<li class="%data%"></li>';
  var htmlIconValue = '<i class="fa fa-%data%"></i>';
  var $deck = $("#deck");
  var $moves = $("#moves");
  var $timer = $("#timer");

  numberOfMoves = 0;
  numberOfStars = 5;
  gameDuration = 0;
  $moves.html(numberOfMoves);
  $deck.empty();
  deck.cards = shuffle(deck.cards);
  $timer.html(gameDuration);

  for (var i = 0; i < deck.cards.length; i++) {
    var formattedListItem = htmlListItem.replace("%data%", deck.cards[i].class);
    $deck.append(formattedListItem);
    var $listItem = $("#deck li:last-child");
    var formattedIconValue = htmlIconValue.replace("%data%", deck.cards[i].icon);
    $listItem.append(formattedIconValue);
  }
  stopTimer();
  addCardClickEvent();
}

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */
function addCardClickEvent() {
  var $li = $("li");
  $li.on("click", displayCardSymbol);
  $li.on("click", startTimer);
}

// set up the event listener for the restart button
function addRestartClickEvent() {
  var $restart = $("#restart");
  $restart.on("click", restartGame);
}

// called on the li click event will add a card to the open card array
function displayCardSymbol() {
  if (($(this).attr("class") !== "card open match") && ($(this).attr("class") !== "card open show") && openCards.length < 2) {
    $(this).attr("class", "card open show");
    addToOpenCards($(this));
  }
}

// start the timer that records the duration of the game
function startTimer() {
  if (typeof gameDurationTimer === "undefined" && !checkForWinningCondition()) {
    gameDurationTimer = setInterval(keepTrackOfGameDuration, 1000);
  }
}

// stops the timer once that game has been completed or user presses restart button
function stopTimer() {
  clearInterval(gameDurationTimer);
  gameDurationTimer = undefined;
}

// add a card object to the openCards array.  Should never have more than two cards
function addToOpenCards(obj) {
  var cardClass = obj.attr("class");
  if (cardClass === "card open show") {
    openCards.push(obj);
    if (openCards.length === 2) {
      checkForMatch();
      incrementMoveCounter();
      if (checkForWinningCondition()) {
        victory();
      }
    }
  }
}

// keeps track of the number of move the player has made
function incrementMoveCounter() {
  numberOfMoves++;
  var $moves = $("#moves");
  $moves.html(numberOfMoves);
  updateStarRating();
}

// keeps track of star rating based on how many moves the player has performed
function updateStarRating() {
  var htmlListItem = '<li><i class="fa fa-star"></i></li>';
  var $stars = $("#stars");
  $stars.empty();

  switch (true) {
    case (numberOfMoves >= 25):
      numberOfStars = 1;
      break;
    case (numberOfMoves >= 20):
      numberOfStars = 2;
      break;
    case (numberOfMoves >= 18):
      numberOfStars = 3;
      break;
    case (numberOfMoves >= 15):
      numberOfStars = 4;
      break;
    case (numberOfMoves < 15):
      numberOfStars = 5;
      break;
  }

  for (var i = 1; i <= numberOfStars; i++) {
    $stars.append(htmlListItem);
  }
}

// checks to see if the open cards are a match
function checkForMatch() {
  if (openCards[0].children().attr("class") === openCards[1].children().attr("class")) {
    setTimeout(lockCardsInOpenPosition, 2000);
  } else {
    setTimeout(clearOpenCards, 2000);
  }
}

// hides all open cards that are not a known match
function clearOpenCards() {
  for (var i = 0; i < openCards.length; i++) {
    if (openCards[i].attr("class") !== "card open match") {
      openCards[i].attr("class", "card");
    }
  }
  openCards = [];
}

// called when matching cards have been established
function lockCardsInOpenPosition() {
  for (var i = 0; i < openCards.length; i++) {
    openCards[i].attr("class", "card open match");
  }
  clearOpenCards();
}

// after each move we check to see if the player has met the winning condition
function checkForWinningCondition() {
  var $deck = $("#deck");
  var gameComplete = true;

  $deck.children().each(function() {
    if ($(this).attr("class") === "card") {
      gameComplete = false;
      return false;
    }
  })

  return gameComplete;
}

// called when the player achieves victory
function victory() {
  stopTimer();
  var htmlVictoryDialog = '<p>%data%</p>';
  var victoryMessage = "Congratulations on your victory!<br><br>You completed the game in " + numberOfMoves + " moves.<br><br>You earned a star rating of " + numberOfStars + " stars.<br><br>It took you " + gameDuration + " seconds to achieve victory.";
  var formattedVictoryDialog = htmlVictoryDialog.replace("%data%", victoryMessage);
  var $victoryDialog = $("#victory-dialog");
  $victoryDialog.empty();
  $victoryDialog.append(formattedVictoryDialog);
  $victoryDialog.dialog({
    resizable: false,
    height: "auto",
    width: 400,
    modal: true,
    buttons: {
      "Let's play again!!": function() {
        $(this).dialog("close");
        restartGame();
      },
      Cancel: function() {
        $(this).dialog("close");
      }
    }
  });
}

// keeps track of the duration of the game in seconds
function keepTrackOfGameDuration() {
  gameDuration++;
  var $timer = $("#timer");
  $timer.html(gameDuration);
}

// When the document is ready the game is initialized
$(document).ready(function() {
  restartGame();
  addRestartClickEvent();
})
