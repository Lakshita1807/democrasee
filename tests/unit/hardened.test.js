import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkEligibility, AppState, cachedFetch, CONFIG } from '../../public/js/hardened.js';

describe('Eligibility Checker Edge Cases', () => {
    it('should block age = 0', () => {
        const res = checkEligibility({ age: 0, citizen: true, registered: false });
        expect(res.eligible).toBe(false);
        expect(res.type).toBe('invalid-age');
    });

    it('should block age = 17', () => {
        const res = checkEligibility({ age: 17, citizen: true, registered: false });
        expect(res.eligible).toBe(false);
        expect(res.type).toBe('underage');
    });

    it('should block age = 200', () => {
        const res = checkEligibility({ age: 200, citizen: true, registered: false });
        expect(res.eligible).toBe(false);
        expect(res.type).toBe('invalid-age');
    });

    it('should block non-numeric input', () => {
        const res = checkEligibility({ age: 'abc', citizen: true, registered: false });
        expect(res.eligible).toBe(false);
        expect(res.type).toBe('invalid-age');
    });
});

describe('AppState Round-trip', () => {
    let mockStorage;

    beforeEach(() => {
        mockStorage = {
            data: {},
            setItem(key, val) { this.data[key] = val; },
            getItem(key) { return this.data[key] || null; }
        };
    });

    it('should save and load correctly', () => {
        AppState.quizScore = 5;
        AppState.questionsAsked = 10;
        AppState.flashcardsMastered = ['ECI', 'EVM'];
        
        AppState.save(mockStorage);
        
        // Reset state
        AppState.quizScore = 0;
        AppState.questionsAsked = 0;
        AppState.flashcardsMastered = [];
        
        AppState.load(mockStorage);
        
        expect(AppState.quizScore).toBe(5);
        expect(AppState.questionsAsked).toBe(10);
        expect(AppState.flashcardsMastered).toContain('ECI');
    });
});

describe('cachedFetch Logic', () => {
    it('should return cached data without hitting API', async () => {
        const mockStorage = {
            getItem: vi.fn().mockReturnValue(JSON.stringify({
                data: { test: 'cached' },
                timestamp: Date.now()
            })),
            setItem: vi.fn()
        };
        const mockFetch = vi.fn();

        const result = await cachedFetch('key', 'url', mockStorage, mockFetch);
        
        expect(result.test).toBe('cached');
        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should hit API if cache is expired', async () => {
        const mockStorage = {
            getItem: vi.fn().mockReturnValue(JSON.stringify({
                data: { test: 'old' },
                timestamp: Date.now() - (20 * 60 * 1000) // 20 mins ago
            })),
            setItem: vi.fn()
        };
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ test: 'new' })
        });

        const result = await cachedFetch('key', 'url', mockStorage, mockFetch);
        
        expect(result.test).toBe('new');
        expect(mockFetch).toHaveBeenCalled();
    });
});
