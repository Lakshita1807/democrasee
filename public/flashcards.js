/**
 * Flashcard Mastery Tracker and Renderer
 */

/**
 * Marks a flashcard as mastered
 * @param {string} term 
 * @param {Array<string>} currentMasteredList 
 * @returns {Array<string>}
 */
export function markAsMastered(term, currentMasteredList) {
  if (!currentMasteredList.includes(term)) {
    return [...currentMasteredList, term];
  }
  return currentMasteredList;
}

/**
 * Resets mastery progress
 * @returns {Array}
 */
export function resetMastery() {
  return [];
}

let currentCard = 0;
let mastered = JSON.parse(localStorage.getItem('masteredFlashcards') || '[]');
let deck = [];
let flipped = false;

/**
 * Initializes flashcards module
 */
export async function initFlashcards() {
  const container = document.getElementById('flashcard');
  if (!container) return;
  
  // Load Data
  const data = await window.getCached('flashcards_data', () => 
    fetch('data/flashcards.json').then(r => r.json())
  );
  deck = data;

  // Touch Swiping Support
  let touchStartX = 0;
  let touchEndX = 0;
  
  container.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, {passive: true});

  container.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, {passive: true});

  function handleSwipe() {
    const threshold = 50;
    if (touchEndX < touchStartX - threshold) {
      nextCard(); // Swipe Left
    }
    if (touchEndX > touchStartX + threshold) {
      prevCard(); // Swipe Right
    }
  }

  renderCard();
  updateCounter();
}

/**
 * Renders current card to DOM
 */
function renderCard() {
  if (deck.length === 0) return;
  const card = deck[currentCard];
  const termEl = document.getElementById('card-term');
  const defEl = document.getElementById('card-def');
  const catEl = document.getElementById('card-cat');
  
  if (termEl) termEl.textContent = card.term;
  if (defEl) defEl.textContent = card.example || card.definition;
  if (catEl) catEl.textContent = card.cat || 'General';
  
  const flashcardEl = document.getElementById('flashcard');
  if (flashcardEl) flashcardEl.classList.remove('flipped');
  flipped = false;
}

/**
 * Toggles card flip state
 */
function flipCard() {
  const el = document.getElementById('flashcard');
  if (el) {
    el.classList.toggle('flipped');
    flipped = !flipped;
  }
}

/**
 * Handles 'Got It' button click
 */
function gotIt() {
  if (deck.length === 0) return;
  mastered = markAsMastered(deck[currentCard].term, mastered);
  localStorage.setItem('masteredFlashcards', JSON.stringify(mastered));
  if (window.updateDashboard) window.updateDashboard();
  nextCard();
  updateCounter();
}

/**
 * Handles 'Review Again' button click
 */
function reviewAgain() { nextCard(); }

/**
 * Moves to next card
 */
function nextCard() {
  if (deck.length === 0) return;
  currentCard = (currentCard + 1) % deck.length;
  renderCard();
}

/**
 * Moves to previous card
 */
function prevCard() {
  if (deck.length === 0) return;
  currentCard = (currentCard - 1 + deck.length) % deck.length;
  renderCard();
}

/**
 * Shuffles the card deck
 */
function shuffleDeck() {
  deck = [...deck].sort(() => Math.random() - 0.5);
  currentCard = 0;
  renderCard();
}

/**
 * Updates mastery counter UI
 */
function updateCounter() {
  const el = document.getElementById('mastered-count');
  if (el) {
    el.textContent = `${mastered.length} of ${deck.length || 25} mastered`;
  }
}

// Global exposure
window.markAsMastered = markAsMastered;
window.resetMastery = resetMastery;
window.initFlashcards = initFlashcards;
window.renderCard = renderCard;
window.flipCard = flipCard;
window.gotIt = gotIt;
window.reviewAgain = reviewAgain;
window.nextCard = nextCard;
window.prevCard = prevCard;
window.shuffleDeck = shuffleDeck;
window.updateCounter = updateCounter;
