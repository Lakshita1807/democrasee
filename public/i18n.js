const TRANSLATIONS = {
  EN: {
    welcome: "Welcome to DemocraSee",
    tagline: "Your Smart Election Guide",
    getStarted: "Get Started →",
    aiAssistant: "AI Assistant",
    timeline: "Election Timeline",
    flashcards: "Flashcards",
    dataStats: "Data & Stats",
    eligible: "Am I Eligible?",
    quiz: "Master Election Quiz",
    askQuestion: "Ask a question...",
    clearChat: "Clear Chat",
    sendBtn: "Send",
    helpline: "Helpline Numbers",
    voterService: "Voter ID Service",
    parties: "Political Parties",
    currentNews: "Current News",
    languages: "Languages"
  },
  HI: {
    welcome: "डेमोक्रासी में आपका स्वागत है",
    tagline: "आपका स्मार्ट चुनाव गाइड",
    getStarted: "शुरू करें →",
    aiAssistant: "AI सहायक",
    timeline: "चुनाव समयरेखा",
    flashcards: "फ्लैशकार्ड",
    dataStats: "डेटा और आँकड़े",
    eligible: "क्या मैं पात्र हूँ?",
    quiz: "मास्टर चुनाव प्रश्नोत्तरी",
    askQuestion: "प्रश्न पूछें...",
    clearChat: "चैट साफ़ करें",
    sendBtn: "भेजें",
    helpline: "हेल्पलाइन नंबर",
    voterService: "वोटर आईडी सेवा",
    parties: "राजनीतिक दल",
    currentNews: "ताज़ा खबरें",
    languages: "भाषाएं"
  },
  TA: {
    welcome: "டெமோக்ராசியில் வரவேற்கிறோம்",
    tagline: "உங்கள் தேர்தல் வழிகாட்டி",
    getStarted: "தொடங்கு →",
    aiAssistant: "AI உதவியாளர்",
    timeline: "தேர்தல் காலவரிசை",
    flashcards: "ஃப்ளாஷ்கார்டுகள்",
    dataStats: "தரவு மற்றும் புள்ளிவிவரங்கள்",
    eligible: "நான் தகுதியானவனா?",
    quiz: "முதன்மை தேர்தல் வினாடிவினா",
    askQuestion: "கேள்வி கேளுங்கள்...",
    clearChat: "அரட்டையை அழி",
    sendBtn: "அனுப்பு",
    helpline: "உதவி எண்கள்",
    voterService: "வாக்காளர் அடையாள சேவை",
    parties: "அரசியல் கட்சிகள்",
    currentNews: "தற்போதைய செய்திகள்",
    languages: "மொழிகள்"
  },
  BN: {
    welcome: "ডেমোক্রাসিতে স্বাগতম",
    tagline: "আপনার স্মার্ট নির্বাচন গাইড",
    getStarted: "শুরু করুন →",
    aiAssistant: "AI সহকারী",
    timeline: "নির্বাচন টাইমলাইন",
    flashcards: "ফ্ল্যাশকার্ড",
    dataStats: "ডেকটা ও পরিসংখ্যান",
    eligible: "আমি কি যোগ্য?",
    quiz: "মাস্টার নির্বাচন কুইজ",
    askQuestion: "প্রশ্ন জিজ্ঞাসা করুন...",
    clearChat: "চ্যাট পরিষ্কার করুন",
    sendBtn: "পাঠান",
    helpline: "হেল্পলাইন নম্বর",
    voterService: "ভোটার আইডি পরিষেবা",
    parties: "রাজনৈতিক দল",
    currentNews: "বর্তমান সংবাদ",
    languages: "ভাষা"
  }
};

let currentLang = localStorage.getItem('language') || 'EN';

const SCHEDULED_LANGUAGES = {
  'EN': 'English', 'HI': 'Hindi', 'TA': 'Tamil', 'BN': 'Bengali',
  'AS': 'Assamese', 'GU': 'Gujarati', 'KN': 'Kannada', 'MA': 'Maithili',
  'ML': 'Malayalam', 'MR': 'Marathi', 'NE': 'Nepali',
  'OR': 'Odia', 'PA': 'Punjabi', 'TE': 'Telugu', 'UR': 'Urdu'
};

// ─── Core Translation Function ───────────────────────────────────────────────
async function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);

  let t = TRANSLATIONS[lang];

  if (!t) {
    showGlobalLoader(true);
    t = await fetchDynamicTranslations(lang);
    showGlobalLoader(false);
    if (!t) {
      showTranslationError();
      return;
    }
  }

  applyTranslations(t);
  updateActiveLangCard(lang);

  if (window.gtag) {
    gtag('event', 'language_change', { language: lang });
  }
}

function applyTranslations(t) {
  // Update all [data-i18n] elements
  Object.keys(t).forEach(key => {
    document.querySelectorAll(`[data-i18n="${key}"]`).forEach(el => {
      el.textContent = t[key];
    });
  });

  // Update placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) el.placeholder = t[key];
  });
}

function updateActiveLangCard(lang) {
  document.querySelectorAll('.lang-card').forEach(card => {
    const isActive = card.getAttribute('data-lang') === lang;
    card.classList.toggle('active', isActive);
    card.style.border = isActive ? '3px solid var(--primary)' : '';
    card.style.boxShadow = isActive ? '0 0 0 4px var(--primary-light)' : '';
  });
}

function showTranslationError() {
  const grid = document.querySelector('.lang-grid');
  if (!grid) return;
  const existing = document.getElementById('lang-error-msg');
  if (existing) existing.remove();
  const msg = document.createElement('p');
  msg.id = 'lang-error-msg';
  msg.style.cssText = 'color:var(--error);font-weight:600;grid-column:1/-1;text-align:center;padding:12px;';
  msg.textContent = '⚠️ Translation failed. Please check that the Cloud Translation API is enabled in your Google Cloud project.';
  grid.after(msg);
}

// ─── Dynamic Translation via API ─────────────────────────────────────────────
async function fetchDynamicTranslations(lang) {
  const sourceText = TRANSLATIONS['EN'];
  const keys = Object.keys(sourceText);
  const values = Object.values(sourceText);

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: values, target: lang.toLowerCase() })
    });

    if (!response.ok) {
      console.error('Translation API HTTP error:', response.status);
      return null;
    }

    const data = await response.json();
    if (data.error) {
      console.error('Translation API error:', data.error);
      return null;
    }

    if (data.data?.translations) {
      const translatedValues = data.data.translations.map(t => t.translatedText);
      const translatedMap = {};
      keys.forEach((key, i) => {
        translatedMap[key] = translatedValues[i];
      });
      TRANSLATIONS[lang] = translatedMap; // Cache
      return translatedMap;
    }
  } catch (error) {
    console.error('Dynamic translation network error:', error);
  }
  return null;
}

function showGlobalLoader(show) {
  const loader = document.getElementById('global-loader');
  if (loader) loader.classList.toggle('hidden', !show);
}

// ─── Multilingual Tab Initializer ────────────────────────────────────────────
function initMultilingual() {
  const grid = document.getElementById('lang-grid');
  if (!grid) return;

  // Attach event listeners to all existing static cards
  grid.querySelectorAll('.lang-card[data-lang]').forEach(card => {
    // Remove any old listener by cloning
    const newCard = card.cloneNode(true);
    card.parentNode.replaceChild(newCard, card);
    newCard.style.cursor = 'pointer';
    newCard.addEventListener('click', () => setLanguage(newCard.getAttribute('data-lang')));
  });

  // Inject dynamic language cards if not already added
  const existingCodes = new Set([...grid.querySelectorAll('[data-lang]')].map(c => c.getAttribute('data-lang')));
  Object.entries(SCHEDULED_LANGUAGES).forEach(([code, name]) => {
    if (existingCodes.has(code)) return;
    const card = document.createElement('div');
    card.className = 'lang-card';
    card.setAttribute('data-lang', code);
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <span class="lang-flag">🇮🇳</span>
      <h3>${name}</h3>
      <p>Dynamic Translation</p>
    `;
    card.addEventListener('click', () => setLanguage(code));
    grid.appendChild(card);
  });

  // Mark active card for current language
  updateActiveLangCard(currentLang);
}

// ─── Global Exposure ──────────────────────────────────────────────────────────
window.setLanguage = setLanguage;
window.initMultilingual = initMultilingual;
window.TRANSLATIONS = TRANSLATIONS;

// Apply saved language on page load
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('language');
  if (saved && saved !== 'EN') {
    setLanguage(saved);
  }
});
