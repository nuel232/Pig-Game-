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
      btnSettings: document.querySelector('.btn--settings'),
      btnHelp: document.querySelector('.btn--help'),
      
      // Modal elements
      settingsModal: document.querySelector('.modal--settings'),
      helpModal: document.querySelector('.modal--help'),
      overlay: document.querySelector('.overlay'),
      closeModalBtns: document.querySelectorAll('.modal__close'),
      saveSettingsBtn: document.querySelector('.btn--save-settings'),
      
      // Settings inputs
      player1NameInput: document.getElementById('player1-name'),
      player2NameInput: document.getElementById('player2-name'),
      winningScoreInput: document.getElementById('winning-score'),
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
    
    // Initialize settings form values
    this.initSettingsForm();
  }

  /**
   * Initialize settings form with current values
   */
  initSettingsForm() {
    this.elements.player1NameInput.value = this.state.playerNames[0];
    this.elements.player2NameInput.value = this.state.playerNames[1];
    this.elements.winningScoreInput.value = this.state.winningScore;
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Game controls
    this.elements.btnNew.addEventListener('click', () => this.init());
    this.elements.btnRoll.addEventListener('click', () => this.rollDice());
    this.elements.btnHold.addEventListener('click', () => this.holdScore());
    
    // Modal controls
    this.elements.btnSettings.addEventListener('click', () => this.openModal('settings'));
    this.elements.btnHelp.addEventListener('click', () => this.openModal('help'));
    this.elements.overlay.addEventListener('click', () => this.closeAllModals());
    
    // Close modals
    this.elements.closeModalBtns.forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });
    
    // Save settings
    this.elements.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
  }

  /**
   * Open a specific modal
   */
  openModal(type) {
    if (type === 'settings') {
      this.elements.settingsModal.classList.remove('hidden');
    } else if (type === 'help') {
      this.elements.helpModal.classList.remove('hidden');
    }
    
    this.elements.overlay.classList.remove('hidden');
  }

  /**
   * Close all modals
   */
  closeAllModals() {
    this.elements.settingsModal.classList.add('hidden');
    this.elements.helpModal.classList.add('hidden');
    this.elements.overlay.classList.add('hidden');
  }

  /**
   * Save settings from form
   */
  saveSettings() {
    // Get values from form
    const player1Name = this.elements.player1NameInput.value.trim() || 'Player 1';
    const player2Name = this.elements.player2NameInput.value.trim() || 'Player 2';
    const winningScore = parseInt(this.elements.winningScoreInput.value) || 100;
    
    // Validate winning score
    const validatedScore = Math.max(20, Math.min(300, winningScore));
    
    // Update state
    this.setPlayerNames([player1Name, player2Name]);
    this.setWinningScore(validatedScore);
    
    // Close modal
    this.closeAllModals();
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyPress(e) {
    // Close modals with Escape key
    if (e.key === 'Escape') {
      this.closeAllModals();
      return;
    }
    
    // Game controls (only when playing and no modals are open)
    if (!this.state.playing || !this.elements.settingsModal.classList.contains('hidden')) return;
    
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
