const FLASHCARDS = [
  {term:"ECI", def:"Election Commission of India — Constitutional body under Article 324 that conducts free and fair elections in India.", cat:"Institution"},
  {term:"EVM", def:"Electronic Voting Machine — Replaced paper ballots in 1998. Standalone, tamper-proof device used for casting votes.", cat:"Process"},
  {term:"VVPAT", def:"Voter Verifiable Paper Audit Trail — Shows a paper slip of your vote for 7 seconds after pressing EVM button.", cat:"Process"},
  {term:"NOTA", def:"None Of The Above — Option introduced in 2013 allowing voters to reject all candidates on the ballot.", cat:"Process"},
  {term:"Model Code of Conduct", def:"Rules governing political parties and candidates from election announcement until results are declared.", cat:"Law"},
  {term:"Constituency", def:"Geographic area represented by one elected member. India has 543 Lok Sabha constituencies.", cat:"Process"},
  {term:"Lok Sabha", def:"Lower house of India's Parliament. 543 elected seats. Members serve 5-year terms.", cat:"Institution"},
  {term:"Rajya Sabha", def:"Upper house of Parliament. 245 seats. Members elected by state legislative assemblies for 6-year terms.", cat:"Institution"},
  {term:"Returning Officer", def:"District official responsible for overseeing the entire election process in one constituency.", cat:"People"},
  {term:"Form 6", def:"Application form used to register as a new voter on the electoral roll at voters.eci.gov.in.", cat:"Document"},
  {term:"BLO", def:"Booth Level Officer — Local official who maintains and verifies the voter list for one polling booth area.", cat:"People"},
  {term:"Affidavit (Form 26)", def:"Legal document filed by candidates declaring all assets, liabilities, income, and criminal cases.", cat:"Document"},
  {term:"Delimitation", def:"Process of redrawing constituency boundaries based on latest census data. Done by Delimitation Commission.", cat:"Process"},
  {term:"Reserved Seats", def:"Constituencies reserved exclusively for SC/ST candidates. 131 seats reserved in Lok Sabha.", cat:"Law"},
  {term:"Anti-Defection Law", def:"10th Schedule law disqualifying MP/MLA who votes against party direction or joins another party.", cat:"Law"},
  {term:"No-Confidence Motion", def:"Motion to remove the government if it loses majority support in Lok Sabha. Requires 272+ votes.", cat:"Process"},
  {term:"Hung Parliament", def:"Situation where no single party or alliance wins the required 272+ majority seats in Lok Sabha.", cat:"Process"},
  {term:"Exit Poll", def:"Survey of voters conducted outside booths after voting. Banned during active polling phases by ECI.", cat:"Process"},
  {term:"By-election", def:"Election held for a single seat that fell vacant mid-term due to death, resignation, or disqualification.", cat:"Process"},
  {term:"Re-poll", def:"Fresh election ordered at a booth due to malpractice, technical failure, booth capturing, or violence.", cat:"Process"},
  {term:"President's Rule", def:"Article 356 provision — Central government takes over state governance when state government collapses.", cat:"Law"},
  {term:"Presiding Officer", def:"Official appointed by ECI to be in charge of conducting voting at one specific polling booth.", cat:"People"},
  {term:"Indelible Ink", def:"Applied on left index finger after voting to prevent double voting. Made at Mysore Paints & Varnish Ltd.", cat:"Process"},
  {term:"Security Deposit", def:"₹25,000 paid by general candidates (₹12,500 SC/ST). Forfeited if votes fall below 1/6th of total.", cat:"Document"},
  {term:"Voter Turnout", def:"Percentage of registered voters who actually voted. 2024 Lok Sabha national average was ~66.3%.", cat:"Process"}
];

let currentCard = 0;
let mastered = JSON.parse(localStorage.getItem('masteredFlashcards') || '[]');
let deck = [...FLASHCARDS];
let flipped = false;

function initFlashcards() {
  const container = document.getElementById('flashcard');
  if (!container) return;
  
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

function renderCard() {
  const card = deck[currentCard];
  document.getElementById('card-term').textContent = card.term;
  document.getElementById('card-def').textContent = card.def;
  document.getElementById('card-cat').textContent = card.cat;
  document.getElementById('flashcard').classList.remove('flipped');
  flipped = false;
}

function flipCard() {
  document.getElementById('flashcard').classList.toggle('flipped');
  flipped = !flipped;
}

function gotIt() {
  if (!mastered.includes(deck[currentCard].term)) {
    mastered.push(deck[currentCard].term);
    localStorage.setItem('masteredFlashcards', JSON.stringify(mastered));
    if (window.updateDashboard) window.updateDashboard();
  }
  nextCard();
  updateCounter();
}

function reviewAgain() { nextCard(); }

function nextCard() {
  currentCard = (currentCard + 1) % deck.length;
  renderCard();
}

function prevCard() {
  currentCard = (currentCard - 1 + deck.length) % deck.length;
  renderCard();
}

function shuffleDeck() {
  deck = [...deck].sort(() => Math.random() - 0.5);
  currentCard = 0;
  renderCard();
}

function updateCounter() {
  document.getElementById('mastered-count').textContent = 
    mastered.length + ' of 25 mastered';
}
