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
    parties: "Political Parties"
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
    parties: "राजनीतिक दल"
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
    parties: "அரசியல் கட்சிகள்"
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
    parties: "রাজনৈতিক দল"
  }
};

let currentLang = 'EN';

const SCHEDULED_LANGUAGES = {
  'EN': 'English', 'HI': 'Hindi', 'TA': 'Tamil', 'BN': 'Bengali',
  'AS': 'Assamese', 'BR': 'Bodo', 'DG': 'Dogri', 'GU': 'Gujarati',
  'KN': 'Kannada', 'KS': 'Kashmiri', 'KO': 'Konkani', 'MA': 'Maithili',
  'ML': 'Malayalam', 'MN': 'Manipuri', 'MR': 'Marathi', 'NE': 'Nepali',
  'OR': 'Odia', 'PA': 'Punjabi', 'SA': 'Sanskrit', 'SAT': 'Santali',
  'SI': 'Sindhi', 'TE': 'Telugu', 'UR': 'Urdu'
};

async function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);
  
  // 1. Check if we have hardcoded translations
  let t = TRANSLATIONS[lang];
  
  // 2. If not, fetch dynamic translation for the whole page
  if (!t) {
    showGlobalLoader(true);
    t = await fetchDynamicTranslations(lang);
    showGlobalLoader(false);
    if (!t) return; // Fallback failed
  }

  // Update UI strings
  Object.keys(t).forEach(key => {
    document.querySelectorAll(`[data-i18n="${key}"]`).forEach(el => {
      el.textContent = t[key];
    });
  });

  // Update Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) el.placeholder = t[key];
  });

  // Update active state in UI
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.includes(lang) || (lang === 'EN' && btn.textContent === 'EN'));
  });

  // GA4 Tracking
  if (window.gtag) {
    gtag('event', 'language_change', { 'language': lang });
  }
}

async function fetchDynamicTranslations(lang) {
  const sourceText = TRANSLATIONS['EN']; // Use English as source
  const keys = Object.keys(sourceText);
  const values = Object.values(sourceText);

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: values, target: lang.toLowerCase() })
    });

    const data = await response.json();
    if (data.data?.translations) {
      const translatedValues = data.data.translations.map(t => t.translatedText);
      const translatedMap = {};
      keys.forEach((key, i) => {
        translatedMap[key] = translatedValues[i];
      });
      // Cache for the session
      TRANSLATIONS[lang] = translatedMap;
      return translatedMap;
    }
  } catch (error) {
    console.error("Dynamic translation failed:", error);
  }
  return null;
}

function showGlobalLoader(show) {
    const loader = document.getElementById('global-loader');
    if (loader) loader.classList.toggle('hidden', !show);
}

function initMultilingual() {
    // Inject the language selector into the grid if it exists
    const grid = document.querySelector('.lang-grid');
    if (grid && grid.children.length <= 4) {
        Object.keys(SCHEDULED_LANGUAGES).forEach(code => {
            if (['EN', 'HI', 'TA', 'BN'].includes(code)) return;
            const card = document.createElement('div');
            card.className = 'lang-card';
            card.onclick = () => setLanguage(code);
            card.innerHTML = `
                <span class="lang-flag">🇮🇳</span>
                <h3>${SCHEDULED_LANGUAGES[code]}</h3>
                <p>Dynamic Translation</p>
            `;
            grid.appendChild(card);
        });
    }
}

// Global exposure
window.setLanguage = setLanguage;
window.initMultilingual = initMultilingual;
window.TRANSLATIONS = TRANSLATIONS;
