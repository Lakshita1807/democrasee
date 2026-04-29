let flashcardsData = [];
let currentCardIndex = 0;
let masteredCards = new Set();

export async function initFlashcards() {
    const shuffleBtn = document.getElementById('shuffle-btn');
    const reviewBtn = document.getElementById('review-btn');
    const gotItBtn = document.getElementById('got-it-btn');
    
    if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleCards);
    if (reviewBtn) reviewBtn.addEventListener('click', () => nextCard(false));
    if (gotItBtn) gotItBtn.addEventListener('click', () => nextCard(true));
    
    // Load static data
    try {
        const response = await fetch('./data/flashcards.json');
        flashcardsData = await response.json();
        
        if (flashcardsData && flashcardsData.length > 0) {
            renderCard();
            updateMasteryCounter();
        } else {
            showError("No flashcards found.");
        }
    } catch (e) {
        console.error("Failed to load flashcards JSON:", e);
        showError("Error loading flashcards data.");
    }
}

function renderCard() {
    const deck = document.getElementById('flashcard-deck');
    if (!deck || flashcardsData.length === 0) return;
    
    const cardData = flashcardsData[currentCardIndex];
    
    deck.innerHTML = `
        <div class="flashcard" id="current-flashcard">
            <div class="flashcard-face flashcard-front">
                <h3>${cardData.term}</h3>
                <span class="hint">Click to flip</span>
            </div>
            <div class="flashcard-face flashcard-back">
                <h3>${cardData.term}</h3>
                <p style="margin: 1rem 0; font-weight: 600;">${cardData.definition}</p>
                <p style="font-size: 1rem; opacity: 0.9;"><i>Example:</i> ${cardData.example}</p>
            </div>
        </div>
    `;
    
    const cardElement = document.getElementById('current-flashcard');
    cardElement.addEventListener('click', () => {
        cardElement.classList.toggle('flipped');
    });
}

function nextCard(mastered) {
    if (mastered) {
        masteredCards.add(currentCardIndex);
    }
    
    // Find next unmastered card, or loop back
    let nextIndex = (currentCardIndex + 1) % flashcardsData.length;
    let attempts = 0;
    
    while (masteredCards.has(nextIndex) && attempts < flashcardsData.length) {
        nextIndex = (nextIndex + 1) % flashcardsData.length;
        attempts++;
    }
    
    if (attempts >= flashcardsData.length) {
        // All mastered!
        document.getElementById('flashcard-deck').innerHTML = `
            <div style="text-align:center; padding: 2rem;">
                <h3 style="color:var(--secondary);"><i class="fa-solid fa-trophy"></i> You've mastered all cards!</h3>
                <button class="btn btn-primary" onclick="location.reload()" style="margin-top:1rem;">Restart</button>
            </div>
        `;
        document.getElementById('got-it-btn').disabled = true;
        document.getElementById('review-btn').disabled = true;
    } else {
        currentCardIndex = nextIndex;
        renderCard();
    }
    
    updateMasteryCounter();
}

function shuffleCards() {
    // Fisher-Yates shuffle
    for (let i = flashcardsData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flashcardsData[i], flashcardsData[j]] = [flashcardsData[j], flashcardsData[i]];
    }
    
    // Reset state
    currentCardIndex = 0;
    masteredCards.clear();
    
    document.getElementById('got-it-btn').disabled = false;
    document.getElementById('review-btn').disabled = false;
    
    renderCard();
    updateMasteryCounter();
}

function updateMasteryCounter() {
    const counter = document.getElementById('mastery-counter');
    if (counter) {
        counter.textContent = `${masteredCards.size} of ${flashcardsData.length} mastered`;
    }
}

function showError(msg) {
    const deck = document.getElementById('flashcard-deck');
    if (deck) {
        deck.innerHTML = `<p class="error">${msg}</p>`;
    }
}
