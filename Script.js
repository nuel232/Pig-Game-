/**
 * Pig Game - Modern Implementation
 * A two-player dice game where players take turns rolling a die.
 * Players accumulate points but risk losing their current round score if they roll a 1.
 */

class PigGame {
  // Game configuration
  static WINNING_SCORE = 100; // Default winning score
  static DICE_SIDES = 6;
  static RESET_ROLL = 1; // The roll that resets current score

  constructor(config = {}) {
    // DOM Elements
    this.elements = {
      // Player elements
      player0: document.querySelector('.player--0'),
      player1: document.querySelector('.player--1'),
      score0: document.getElementById('score--0'),
      score1: document.getElementById('score--1'),
      current0: document.getElementById('current--0'),
      current1: document.getElementById('current--1'),
      name0: document.getElementById('name--0'),
      name1: document.getElementById('name--1'),
      
      // Game controls
      dice: document.querySelector('.dice'),
      btnNew: document.querySelector('.btn--new'),
      btnRoll: document.querySelector('.btn--roll'),
      btnHold: document.querySelector('.btn--hold'),
    };

    // Game state
    this.state = {
      scores: [0, 0],
      currentScore: 0,
      activePlayer: 0,
      playing: true,
      winningScore: config.winningScore || PigGame.WINNING_SCORE,
      playerNames: config.playerNames || ['Player 1', 'Player 2'],
      history: [], // Track game actions for potential undo/stats
    };

    // Initialize the game
    this.init();
    
    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Initialize or reset the game state
   */
  init() {
    // Reset scores
    this.state.scores = [0, 0];
    this.state.currentScore = 0;
    this.state.activePlayer = 0;
    this.state.playing = true;
    this.state.history = [];

    // Update UI
    this.elements.current0.textContent = 0;
    this.elements.current1.textContent = 0;
    this.elements.score0.textContent = 0;
    this.elements.score1.textContent = 0;
    
    // Set player names
    this.elements.name0.textContent = this.state.playerNames[0];
    this.elements.name1.textContent = this.state.playerNames[1];

    // Hide dice at start
    this.elements.dice.classList.add('hidden');
    
    // Reset player styles
    this.elements.player0.classList.remove('player--winner');
    this.elements.player1.classList.remove('player--winner');
    this.elements.player0.classList.add('player--active');
    this.elements.player1.classList.remove('player--active');
    
    // Enable buttons
    this.enableGameControls();
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    this.elements.btnNew.addEventListener('click', () => this.init());
    this.elements.btnRoll.addEventListener('click', () => this.rollDice());
    this.elements.btnHold.addEventListener('click', () => this.holdScore());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyPress(e) {
    if (!this.state.playing) return;
    
    switch(e.key) {
      case 'r':
      case 'R':
        this.rollDice();
        break;
      case 'h':
      case 'H':
        this.holdScore();
        break;
      case 'n':
      case 'N':
        this.init();
        break;
      default:
        break;
    }
  }

  /**
   * Roll the dice and update game state
   */
  rollDice() {
    if (!this.state.playing) return;

    // Generate a random dice roll
    const diceValue = this.generateRandomDice();
    
    // Log the action
    this.logAction('roll', diceValue);
    
    // Display the dice
    this.showDice(diceValue);
    
    // Process the roll result
    if (diceValue !== PigGame.RESET_ROLL) {
      this.addToCurrentScore(diceValue);
    } else {
      this.switchPlayer();
    }
  }

  /**
   * Generate a random dice value
   */
  generateRandomDice() {
    return Math.trunc(Math.random() * PigGame.DICE_SIDES) + 1;
  }

  /**
   * Display the dice with the given value
   */
  showDice(value) {
    this.elements.dice.classList.remove('hidden');
    this.elements.dice.src = `dice-${value}.png`;
    
    // Add a small animation effect
    this.elements.dice.classList.add('dice-roll');
    setTimeout(() => {
      this.elements.dice.classList.remove('dice-roll');
    }, 300);
  }

  /**
   * Add value to current score and update UI
   */
  addToCurrentScore(value) {
    this.state.currentScore += value;
    document.getElementById(`current--${this.state.activePlayer}`).textContent = this.state.currentScore;
  }

  /**
   * Hold current score, add to total, and check for winner
   */
  holdScore() {
    if (!this.state.playing) return;
    
    // Log the action
    this.logAction('hold', this.state.currentScore);

    // Add current score to active player's score
    this.state.scores[this.state.activePlayer] += this.state.currentScore;
    
    // Update the UI
    document.getElementById(`score--${this.state.activePlayer}`).textContent = 
      this.state.scores[this.state.activePlayer];

    // Check for winner
    if (this.state.scores[this.state.activePlayer] >= this.state.winningScore) {
      this.endGame();
    } else {
      this.switchPlayer();
    }
  }

  /**
   * Switch to the next player
   */
  switchPlayer() {
    // Reset current player's temporary score
    document.getElementById(`current--${this.state.activePlayer}`).textContent = 0;
    this.state.currentScore = 0;
    
    // Toggle active player
    this.state.activePlayer = this.state.activePlayer === 0 ? 1 : 0;
    
    // Toggle UI active player indication
    this.elements.player0.classList.toggle('player--active');
    this.elements.player1.classList.toggle('player--active');
  }

  /**
   * End the game - display winner
   */
  endGame() {
    // Set game state to finished
    this.state.playing = false;
    
    // Log the action
    this.logAction('win', this.state.activePlayer);
    
    // Hide the dice
    this.elements.dice.classList.add('hidden');
    
    // Apply winner styling
    document
      .querySelector(`.player--${this.state.activePlayer}`)
      .classList.add('player--winner');
    
    document
      .querySelector(`.player--${this.state.activePlayer}`)
      .classList.remove('player--active');
      
    // Show winning message with confetti effect
    this.displayWinMessage();
  }
  
  /**
   * Display winning message
   */
  displayWinMessage() {
    // Create winning message
    const messageEl = document.createElement('div');
    messageEl.classList.add('winning-message');
    messageEl.textContent = `${this.state.playerNames[this.state.activePlayer]} wins!`;
    document.querySelector('main').appendChild(messageEl);
    
    // Remove the message after 4 seconds
    setTimeout(() => {
      messageEl.remove();
    }, 4000);
  }

  /**
   * Enable/disable game controls based on game state
   */
  enableGameControls() {
    const isEnabled = this.state.playing;
    this.elements.btnRoll.disabled = !isEnabled;
    this.elements.btnHold.disabled = !isEnabled;
  }

  /**
   * Log game actions for history/statistics
   */
  logAction(type, value) {
    this.state.history.push({
      type,
      value,
      player: this.state.activePlayer,
      timestamp: new Date().getTime(),
    });
  }

  /**
   * Change the winning score
   */
  setWinningScore(score) {
    if (score > 0) {
      this.state.winningScore = score;
      return true;
    }
    return false;
  }

  /**
   * Set custom player names
   */
  setPlayerNames(names) {
    if (Array.isArray(names) && names.length === 2) {
      this.state.playerNames = names;
      this.elements.name0.textContent = names[0];
      this.elements.name1.textContent = names[1];
      return true;
    }
    return false;
  }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize with default options
  const game = new PigGame({
    winningScore: 100,
    playerNames: ['Player 1', 'Player 2']
  });
  
  // Expose game instance to window for console debugging if needed
  window.pigGame = game;
}); 