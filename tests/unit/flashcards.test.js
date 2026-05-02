import { describe, it, expect } from 'vitest';
import { markAsMastered, resetMastery } from '../../public/flashcards.js';

describe('Flashcard Mastery Tracker', () => {
    it('should increment count when marking a card as mastered', () => {
        let mastered = [];
        mastered = markAsMastered('ECI', mastered);
        expect(mastered).toHaveLength(1);
        expect(mastered).toContain('ECI');
    });

    it('should not double-count when marking the same card twice', () => {
        let mastered = ['ECI'];
        mastered = markAsMastered('ECI', mastered);
        expect(mastered).toHaveLength(1);
    });

    it('should reset progress correctly', () => {
        let mastered = ['ECI', 'EVM'];
        mastered = resetMastery();
        expect(mastered).toHaveLength(0);
    });
});
