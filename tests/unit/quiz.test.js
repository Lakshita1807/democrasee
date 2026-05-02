import { describe, it, expect } from 'vitest';
import { scoreQuiz } from '../../public/quiz.js';

describe('Quiz Scoring Logic', () => {
    const correctAnswers = [1, 2, 2, 2, 0, 3, 1, 2, 1, 1];

    it('should score 10 for all correct answers', () => {
        const userAnswers = [...correctAnswers];
        expect(scoreQuiz(userAnswers, correctAnswers)).toBe(10);
    });

    it('should score 0 for all wrong answers', () => {
        const userAnswers = correctAnswers.map(a => (a + 1) % 4);
        expect(scoreQuiz(userAnswers, correctAnswers)).toBe(0);
    });

    it('should score partial points for mixed answers', () => {
        const userAnswers = [1, 2, 0, 0, 0, 0, 0, 0, 0, 0]; // 3 correct (index 0, 1, 4)
        expect(scoreQuiz(userAnswers, correctAnswers)).toBe(3);
    });

    it('should score 0 for empty submission', () => {
        expect(scoreQuiz([], correctAnswers)).toBe(0);
        expect(scoreQuiz(null, correctAnswers)).toBe(0);
    });
});
