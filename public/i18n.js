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
    sendBtn: "Send"
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
    sendBtn: "भेजें"
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
    sendBtn: "அனுப்பு"
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
    sendBtn: "পাঠান"
  }
};

let currentLang = 'EN';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);
  
  // Update UI strings
  const t = TRANSLATIONS[lang];
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

  // Update active state in onboarding
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.includes(lang) || (lang === 'EN' && btn.textContent === 'EN'));
  });
}

function initMultilingual() {
    // Current setup handles language switching via setLanguage directly
}
