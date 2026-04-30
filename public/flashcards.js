const FLASHCARDS = [
  { term: "ECI", definition: "Election Commission of India — Constitutional body under Article 324 that conducts free and fair elections.", category: "Institution" },
  { term: "EVM", definition: "Electronic Voting Machine — Replaced paper ballots in 1998. Tamper-proof, standalone device used for voting.", category: "Process" },
  { term: "VVPAT", definition: "Voter Verifiable Paper Audit Trail — Shows a paper slip of your vote for 7 seconds for verification.", category: "Process" },
  { term: "NOTA", definition: "None Of The Above — Option introduced in 2013 allowing voters to reject all candidates.", category: "Process" },
  { term: "Model Code of Conduct", definition: "Rules that govern political parties and candidates from election announcement until results.", category: "Law" },
  { term: "Constituency", definition: "A geographic area represented by one elected member. India has 543 Lok Sabha constituencies.", category: "Process" },
  { term: "Lok Sabha", definition: "Lower house of India's Parliament. 543 elected seats. Members serve 5-year terms.", category: "Institution" },
  { term: "Rajya Sabha", definition: "Upper house of Parliament. 245 seats. Members elected by state legislative assemblies.", category: "Institution" },
  { term: "Returning Officer", definition: "District official responsible for overseeing the election in one constituency.", category: "People" },
  { term: "Form 6", definition: "Application form used to register as a new voter on the electoral roll.", category: "Document" },
  { term: "BLO", definition: "Booth Level Officer — Local official who maintains the voter list for one polling booth area.", category: "People" },
  { term: "Affidavit", definition: "Legal document (Form 26) filed by candidates declaring assets, liabilities, and criminal cases.", category: "Document" },
  { term: "Delimitation", definition: "Process of redrawing constituency boundaries based on census data.", category: "Process" },
  { term: "Reserved Seats", definition: "Constituencies reserved for SC/ST candidates. 131 seats reserved in Lok Sabha.", category: "Law" },
  { term: "Anti-Defection Law", definition: "10th Schedule law that disqualifies an MP/MLA who votes against their party's direction.", category: "Law" },
  { term: "No-Confidence Motion", definition: "Motion to remove the government if it loses majority support in Lok Sabha.", category: "Process" },
  { term: "Hung Parliament", definition: "When no single party or alliance wins the majority of 272+ seats in Lok Sabha.", category: "Process" },
  { term: "Exit Poll", definition: "Survey of voters after voting to predict results. Banned during active polling phases.", category: "Process" },
  { term: "By-election", definition: "Election held for a single seat that fell vacant mid-term due to death, resignation, or disqualification.", category: "Process" },
  { term: "Re-poll", definition: "Fresh election ordered at a booth due to malpractice, technical failure, or violence.", category: "Process" },
  { term: "President's Rule", definition: "Article 356 provision where Central government takes over a state when its government collapses.", category: "Law" },
  { term: "Presiding Officer", definition: "Official in charge of one polling booth on election day.", category: "People" },
  { term: "Indelible Ink", definition: "Applied on left index finger after voting. Made exclusively at Mysore Paints & Varnish Ltd.", category: "Process" },
  { term: "Security Deposit", definition: "₹25,000 paid by general candidates (₹12,500 for SC/ST). Forfeited if votes are below 1/6th of total.", category: "Document" },
  { term: "Voter Turnout", definition: "Percentage of registered voters who actually voted. 2024 Lok Sabha national average: ~66.3%.", category: "Process" }
];

let currentCardIndex = 0;
let masteredCards = new Set();
let cards = [...FLASHCARDS];

export function initFlashcards() {
    const deck = document.getElementById('flashcard-deck');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const retryBtn = document.getElementById('review-btn');
    const gotItBtn = document.getElementById('got-it-btn');
    
    if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleCards);
    if (retryBtn) retryBtn.addEventListener('click', nextCard);
    if (gotItBtn) gotItBtn.addEventListener('click', markAsMastered);
    
    renderCard();
}

function renderCard() {
    const deck = document.getElementById('flashcard-deck');
    const counter = document.getElementById('mastery-counter');
    
    if (!deck) return;
    
    const card = cards[currentCardIndex];
    
    deck.innerHTML = `
        <div class="flashcard" id="current-card">
            <div class="flashcard-face flashcard-front">
                <span class="badge" style="position: absolute; top: 1rem; right: 1rem;">${card.category}</span>
                <h3 style="font-size: 2rem;">${card.term}</h3>
                <span class="hint">Click to reveal definition</span>
            </div>
            <div class="flashcard-face flashcard-back">
                <p>${card.definition}</p>
                <span class="hint" style="color: rgba(255,255,255,0.7); margin-top: 2rem;">Click to see term</span>
            </div>
        </div>
    `;
    
    const cardEl = document.getElementById('current-card');
    cardEl.addEventListener('click', () => {
        cardEl.classList.toggle('flipped');
    });
    
    if (counter) {
        counter.innerText = `${masteredCards.size} of ${FLASHCARDS.length} mastered`;
    }
}

function nextCard() {
    currentCardIndex = (currentCardIndex + 1) % cards.length;
    renderCard();
}

function markAsMastered() {
    masteredCards.add(cards[currentCardIndex].term);
    nextCard();
}

function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    currentCardIndex = 0;
    renderCard();
}
