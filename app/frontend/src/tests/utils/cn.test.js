import { describe, it, expect } from 'vitest';
import { cn } from '../../utils/cn';

describe('utils/cn', () => {
  it('should merge tailwind classes correctly', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should handle conditional classes', () => {
    expect(cn('text-sm', true && 'font-bold', false && 'hidden')).toBe('text-sm font-bold');
  });

  it('should handle arrays and objects', () => {
    expect(cn(['text-sm', 'font-bold'], { 'hidden': true })).toBe('text-sm font-bold hidden');
  });

  it('should handle empty or null values', () => {
    expect(cn('text-sm', null, undefined, '', false, 'font-bold')).toBe('text-sm font-bold');
  });
});
