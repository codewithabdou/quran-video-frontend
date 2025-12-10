import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility function', () => {
    it('should merge class names correctly', () => {
        const result = cn('px-4', 'py-2');
        expect(result).toBe('px-4 py-2');
    });

    it('should handle conditional classes', () => {
        const result = cn('base-class', false && 'hidden', 'visible');
        expect(result).toBe('base-class visible');
    });

    it('should merge tailwind classes without conflicts', () => {
        const result = cn('px-2 py-1', 'px-4');
        expect(result).toBe('py-1 px-4');
    });

    it('should handle empty inputs', () => {
        const result = cn();
        expect(result).toBe('');
    });

    it('should handle arrays of classes', () => {
        const result = cn(['class1', 'class2'], 'class3');
        expect(result).toBe('class1 class2 class3');
    });

    it('should handle objects with boolean values', () => {
        const result = cn({
            'active': true,
            'disabled': false,
            'primary': true,
        });
        expect(result).toBe('active primary');
    });
});
