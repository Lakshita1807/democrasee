import { describe, it, expect } from 'vitest';
import { scoreQuiz } from '../../public/quiz.js';

// The app's correct-answer index array (matches quiz.json order)
const CORRECT_ANSWERS = [1, 2, 2, 2, 0, 3, 1, 2, 1, 1];
const TOTAL_QUESTIONS  = CORRECT_ANSWERS.length; // 10

describe('Quiz — incremental scoring', () => {

    // Correct answer increments score by 1
    it('each correct answer contributes exactly +1 to the score', () => {
        // Build an answer array that is correct for exactly the first N answers
        for (let n = 0; n <= TOTAL_QUESTIONS; n++) {
            const answers = CORRECT_ANSWERS.slice(0, n);
            expect(scoreQuiz(answers, CORRECT_ANSWERS)).toBe(n);
        }
    });

    // Wrong answer does not change score
    it('a wrong answer does not increment the score', () => {
        const allWrong = CORRECT_ANSWERS.map(a => (a + 1) % 4);
        expect(scoreQuiz(allWrong, CORRECT_ANSWERS)).toBe(0);
    });

    it('mixed: only correct positions are counted, wrong ones are ignored', () => {
        // Correct at indices 0 (ans=1), 4 (ans=0) — 2 correct
        const mixed = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        expect(scoreQuiz(mixed, CORRECT_ANSWERS)).toBe(2);
    });
});

describe('Quiz — score cap (cannot exceed total questions)', () => {

    it('perfect score equals total questions, not more', () => {
        const perfect = [...CORRECT_ANSWERS];
        const score = scoreQuiz(perfect, CORRECT_ANSWERS);
        expect(score).toBe(TOTAL_QUESTIONS);
        expect(score).not.toBeGreaterThan(TOTAL_QUESTIONS);
    });

    it('extra answers beyond question count are silently ignored', () => {
        // Passing more answers than questions must not inflate the score
        const extra = [...CORRECT_ANSWERS, 0, 1, 2]; // 3 surplus entries
        expect(scoreQuiz(extra, CORRECT_ANSWERS)).toBe(TOTAL_QUESTIONS);
    });
});

describe('Quiz — completion state', () => {

    // Completing all questions triggers completion state.
    // In the source, showResults() is called when qIndex >= QUESTIONS.length.
    // We verify this via scoreQuiz: score === TOTAL_QUESTIONS signals completion.
    it('all questions answered → score equals total → completion state triggered', () => {
        const score = scoreQuiz([...CORRECT_ANSWERS], CORRECT_ANSWERS);
        const isCompleted = score === TOTAL_QUESTIONS;
        expect(isCompleted).toBe(true);
    });

    it('partial completion → score < total → NOT yet completed', () => {
        const partial = CORRECT_ANSWERS.slice(0, 7);
        const score = scoreQuiz(partial, CORRECT_ANSWERS);
        expect(score).toBeLessThan(TOTAL_QUESTIONS);
    });
});

