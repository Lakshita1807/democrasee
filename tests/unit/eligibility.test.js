import { describe, it, expect } from 'vitest';
import { checkEligibility } from '../../public/eligibility.js';

describe('Eligibility Checker', () => {
    it('should return NOT eligible for 17-year-old Indian citizen', () => {
        const result = checkEligibility({ age: 17, citizen: true, registered: false });
        expect(result.eligible).toBe(false);
        expect(result.message).toContain('at least 18');
    });

    it('should return eligible for 18-year-old Indian citizen', () => {
        const result = checkEligibility({ age: 18, citizen: true, registered: true });
        expect(result.eligible).toBe(true);
        expect(result.message).toContain('fully eligible');
    });

    it('should return NOT eligible for non-citizen of any age', () => {
        const result = checkEligibility({ age: 25, citizen: false, registered: false });
        expect(result.eligible).toBe(false);
        expect(result.message).toContain('citizens of India');
    });

    it('should return eligible but prompt to register for 18yo citizen not yet registered', () => {
        const result = checkEligibility({ age: 18, citizen: true, registered: false });
        expect(result.eligible).toBe(true);
        expect(result.message).toContain('need to register');
    });

    it('should return fully eligible for 18yo citizen already registered', () => {
        const result = checkEligibility({ age: 18, citizen: true, registered: true });
        expect(result.eligible).toBe(true);
        expect(result.message).toContain('fully eligible');
    });
});
