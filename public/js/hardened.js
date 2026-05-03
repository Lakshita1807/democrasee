/**
 * Hardened Logic Module for DemocraSee
 * Shared between index.html and Vitest
 */

export const CONFIG = {
    AI_PROXY: '/api/ai',
    NEWS_PROXY: '/api/news',
    CACHE_TTL: 15,
    CHAT_LIMIT: 20,
    CHAR_LIMIT: 500,
    STORAGE_KEY: 'democrasee_state',
    DEBUG: false
};

export function checkEligibility({ age, citizen, registered }) {
    if (!citizen) return { eligible: false, type: 'not-citizen', message: 'Only citizens of India are eligible.' };
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) return { eligible: false, type: 'invalid-age', message: 'Please enter a valid age between 1 and 120.' };
    if (ageNum < 18) return { eligible: false, type: 'underage', message: 'You must be at least 18.' };
    if (!registered) return { eligible: true, type: 'eligible-not-reg', message: 'You need to register.' };
    return { eligible: true, type: 'eligible-reg', message: 'You are fully eligible.' };
}

export const AppState = {
    quizScore: 0,
    questionsAsked: 0,
    flashcardsMastered: [],
    
    save(storage = localStorage) {
        storage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({
            quizScore: this.quizScore,
            questionsAsked: this.questionsAsked,
            flashcardsMastered: this.flashcardsMastered
        }));
    },
    
    load(storage = localStorage) {
        const s = JSON.parse(storage.getItem(CONFIG.STORAGE_KEY) || '{}');
        this.quizScore = s.quizScore || 0;
        this.questionsAsked = s.questionsAsked || 0;
        this.flashcardsMastered = s.flashcardsMastered || [];
    }
};

export async function cachedFetch(key, url, storage = localStorage, fetcher = fetch, ttlMinutes = CONFIG.CACHE_TTL) {
    const cached = storage.getItem(key);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < ttlMinutes * 60 * 1000) return data;
    }
    const res = await fetcher(url);
    if (!res.ok) throw new Error('API_ERROR');
    const data = await res.json();
    storage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
}
