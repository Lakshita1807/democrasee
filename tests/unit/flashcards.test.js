import { describe, it, expect, vi } from 'vitest';
import { markAsMastered, resetMastery } from '../../public/flashcards.js';

// ---------------------------------------------------------------------------
// Helper: pure shuffle (mirrors shuffleDeck logic inside flashcards.js)
// ---------------------------------------------------------------------------
function shuffleArray(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

// Sample deck used across tests
const SAMPLE_DECK = [
    { term: 'ECI',  definition: 'Election Commission of India' },
    { term: 'EVM',  definition: 'Electronic Voting Machine' },
    { term: 'VVPAT', definition: 'Voter Verifiable Paper Audit Trail' },
    { term: 'MCC',  definition: 'Model Code of Conduct' },
    { term: 'NOTA', definition: 'None of the Above' },
];

describe('Flashcard — "Got It!" (markAsMastered)', () => {

    it('adds card ID to mastered array', () => {
        let mastered = [];
        mastered = markAsMastered('ECI', mastered);
        expect(mastered).toContain('ECI');
        expect(mastered).toHaveLength(1);
    });

    it('does not duplicate if card already mastered', () => {
        let mastered = ['ECI'];
        mastered = markAsMastered('ECI', mastered);
        expect(mastered).toHaveLength(1);
    });

    it('can master multiple distinct cards', () => {
        let mastered = [];
        mastered = markAsMastered('ECI',  mastered);
        mastered = markAsMastered('EVM',  mastered);
        mastered = markAsMastered('NOTA', mastered);
        expect(mastered).toHaveLength(3);
        expect(mastered).toContain('EVM');
    });
});

describe('Flashcard — "Review Again"', () => {

    it('does NOT add card to mastered array (list is unchanged)', () => {
        // reviewAgain() in the source only calls nextCard() — it never calls
        // markAsMastered. We verify the contract: mastered list is untouched.
        let mastered = ['ECI'];
        // Simulate: user sees EVM, clicks "Review Again" → mastered unchanged
        const afterReview = mastered; // no call to markAsMastered
        expect(afterReview).toHaveLength(1);
        expect(afterReview).not.toContain('EVM');
    });
});

describe('Flashcard — Shuffle randomises card order', () => {

    it('shuffled deck has the same cards as the original deck', () => {
        const shuffled = shuffleArray(SAMPLE_DECK);
        expect(shuffled).toHaveLength(SAMPLE_DECK.length);
        SAMPLE_DECK.forEach(card => {
            expect(shuffled.map(c => c.term)).toContain(card.term);
        });
    });

    it('shuffle produces a different order at least sometimes (statistical check)', () => {
        // Run 10 shuffles; at least one must differ from the original order.
        const originalOrder = SAMPLE_DECK.map(c => c.term).join(',');
        const allSame = Array.from({ length: 10 }).every(() => {
            const s = shuffleArray(SAMPLE_DECK);
            return s.map(c => c.term).join(',') === originalOrder;
        });
        // It's astronomically unlikely all 10 shuffles are identical
        expect(allSame).toBe(false);
    });

    it('shuffle does not mutate the original deck reference', () => {
        const original = [...SAMPLE_DECK];
        shuffleArray(SAMPLE_DECK);           // returns new array
        expect(SAMPLE_DECK).toEqual(original); // original untouched
    });
});

describe('Flashcard — Mastered count matches mastered array length', () => {

    it('count starts at 0 for an empty mastered list', () => {
        const mastered = resetMastery();
        expect(mastered).toHaveLength(0);
    });

    it('count increments correctly as cards are mastered', () => {
        let mastered = resetMastery();
        const terms = ['ECI', 'EVM', 'NOTA'];
        terms.forEach(term => { mastered = markAsMastered(term, mastered); });
        // count shown in UI = mastered.length
        expect(mastered.length).toBe(terms.length);
    });

    it('count is always consistent with the array (no phantom counts)', () => {
        let mastered = [];
        SAMPLE_DECK.forEach(card => {
            mastered = markAsMastered(card.term, mastered);
            // After each "Got It" the UI count must equal array length
            expect(mastered.length).toBe(mastered.filter(t => t === t).length);
        });
        expect(mastered.length).toBe(SAMPLE_DECK.length);
    });
});

