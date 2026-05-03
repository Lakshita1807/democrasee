import { describe, it, expect, beforeEach } from 'vitest';
import { saveProgress, loadProgress, resetProgress, APP_STORAGE_KEYS } from '../../public/app.js';

// ---------------------------------------------------------------------------
// In-memory mock for localStorage — no browser required.
// ---------------------------------------------------------------------------
function createMockStorage() {
    const store = Object.create(null);
    return {
        setItem(key, val)  { store[key] = String(val); },
        getItem(key)       { return key in store ? store[key] : null; },
        removeItem(key)    { delete store[key]; },
        clear()            { Object.keys(store).forEach(k => delete store[k]); },
        get _store()       { return store; },
    };
}

describe('Progress — saveProgress saves to localStorage correctly', () => {
    let storage;

    beforeEach(() => { storage = createMockStorage(); });

    it('saves userRegion and userRole as plain strings', () => {
        saveProgress({ userRegion: 'Maharashtra', userRole: 'First-time Voter' }, storage);
        expect(storage.getItem('userRegion')).toBe('Maharashtra');
        expect(storage.getItem('userRole')).toBe('First-time Voter');
    });

    it('saves quizBestScore as a string representation of the number', () => {
        saveProgress({ quizBestScore: 7 }, storage);
        expect(storage.getItem('quizBestScore')).toBe('7');
    });

    it('saves masteredFlashcards as a JSON-serialised array', () => {
        const cards = ['ECI', 'EVM', 'NOTA'];
        saveProgress({ masteredFlashcards: cards }, storage);
        const stored = JSON.parse(storage.getItem('masteredFlashcards'));
        expect(stored).toEqual(cards);
    });

    it('saves all fields together in one call', () => {
        saveProgress({
            userRegion:         'Kerala',
            userRole:           'Student',
            quizBestScore:      9,
            masteredFlashcards: ['ECI'],
        }, storage);
        expect(storage.getItem('userRegion')).toBe('Kerala');
        expect(storage.getItem('userRole')).toBe('Student');
        expect(storage.getItem('quizBestScore')).toBe('9');
        expect(JSON.parse(storage.getItem('masteredFlashcards'))).toContain('ECI');
    });
});

describe('Progress — loadProgress loads from localStorage on init', () => {
    let storage;

    beforeEach(() => { storage = createMockStorage(); });

    it('returns null for keys that have not been set', () => {
        const progress = loadProgress(storage);
        expect(progress.userRegion).toBeNull();
        expect(progress.userRole).toBeNull();
        expect(progress.quizBestScore).toBeNull();
    });

    it('returns empty array for masteredFlashcards when key is absent', () => {
        const progress = loadProgress(storage);
        expect(progress.masteredFlashcards).toEqual([]);
    });

    it('round-trips: load correctly reads what save wrote', () => {
        const snapshot = {
            userRegion:         'Tamil Nadu',
            userRole:           'Voter',
            quizBestScore:      6,
            masteredFlashcards: ['ECI', 'EVM'],
        };
        saveProgress(snapshot, storage);
        const loaded = loadProgress(storage);

        expect(loaded.userRegion).toBe('Tamil Nadu');
        expect(loaded.userRole).toBe('Voter');
        expect(loaded.quizBestScore).toBe('6');
        expect(loaded.masteredFlashcards).toEqual(['ECI', 'EVM']);
    });
});

describe('Progress — resetProgress clears all app localStorage keys', () => {
    let storage;

    beforeEach(() => {
        storage = createMockStorage();
        // Pre-populate every app-owned key
        saveProgress({
            userRegion:         'Delhi',
            userRole:           'Voter',
            quizBestScore:      5,
            masteredFlashcards: ['ECI'],
        }, storage);
        storage.setItem('language',          'HI');
        storage.setItem('theme',             'dark');
        storage.setItem('democrasee_acc_v3', 'true');
        storage.setItem('stats_questions',   '12');
    });

    it('removes every key listed in APP_STORAGE_KEYS', () => {
        resetProgress(storage);
        APP_STORAGE_KEYS.forEach(key => {
            expect(storage.getItem(key)).toBeNull();
        });
    });

    it('after reset, loadProgress returns empty/null state', () => {
        resetProgress(storage);
        const progress = loadProgress(storage);
        expect(progress.userRegion).toBeNull();
        expect(progress.userRole).toBeNull();
        expect(progress.quizBestScore).toBeNull();
        expect(progress.masteredFlashcards).toEqual([]);
    });

    it('does not throw if a key was never set (idempotent)', () => {
        const freshStorage = createMockStorage();
        expect(() => resetProgress(freshStorage)).not.toThrow();
    });
});
