"use strict";

//selecting elements
const score0El = document.querySelector("#score--0");
const score1El = document.getElementById("score--1");
const current0El = document.getElementById("current--0");
const current1El = document.getElementById("current--1");
const player0El = document.querySelector(".player--0");
const player1El = document.querySelector(".player--1");

const diceEl = document.querySelector(".dice");
const btnNew = document.querySelector(".btn--new");
const btnRoll = document.querySelector(".btn--roll");
const btnHold = document.querySelector(".btn--hold");

let scores, currentScore, activePlayer, playing;
//starting conditions

const init = function () {
  scores = [0, 0];
  activePlayer = 0;
  currentScore = 0;
  playing = true;

  current0El.textContent = 0;
  current1El.textContent = 0;
  score0El.textContent = 0;
  score1El.textContent = 0;

  diceEl.classList.add("hidden");
  player0El.classList.remove("player--winner");
  player1El.classList.remove("player--winner");
  player0El.classList.add("player--active");
  player1El.classList.remove("player--active");
};
init();

const switchPlayer = function () {
  activePlayer = activePlayer === 0 ? 1 : 0;
  document.getElementById(`current--${activePlayer}`).textContent = 0;
  currentScore = 0;
  player0El.classList.toggle("player--active");
  player1El.classList.toggle("player--active");
};

//Rolling dice functionality
btnRoll.addEventListener("click", function () {
  if (playing) {
    //generate a random number between 1 and 6, inclusive
    const dice = Math.trunc(Math.random() * 6) + 1;
    // display dice
    diceEl.classList.remove("hidden");
    diceEl.src = `dice-${dice}.png`;

    // check for rolled 1 if true , switch to next player
    if (dice !== 1) {
      //Add dice to current score
      currentScore += dice;
      document.getElementById(`current--${activePlayer}`).textContent =
        currentScore;
    } else {
      //switch to next player
      switchPlayer();
    }
  }
});

btnHold.addEventListener("click", function () {
  if (playing) {
    // add the current score of the active player to their global score
    scores[activePlayer] += currentScore;
    //scores[i] = score [i]+ currentScore;
    document.getElementById(`score--${activePlayer}`).textContent =
      scores[activePlayer];
    // check if players score is >= 100
    if (scores[activePlayer] >= 20) {
      // Finsh the game
      playing = false;
      diceEl.classList.add("hidden");
      document
        .querySelector(`.player--${activePlayer}`)
        .classList.add("player--winner");
      document
        .querySelector(`.player--${1 - activePlayer}`)
        .classList.remove("player--winner");
    } else {
      switchPlayer();
    }
  }
  //switch to the next palyer
});

btnNew.addEventListener("click", init);
