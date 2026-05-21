import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('Funkcja cn()', () => {
  it('łączy proste stringi z klasami', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('rozwiązuje konflikty klas Tailwinda (nadpisuje poprzednie)', () => {
    // p-4 powinno zostać nadpisane przez p-2
    expect(cn('p-4', 'p-2')).toBe('p-2');
    // mt-4 nadpisuje mt-2
    expect(cn('mt-2 text-black', 'mt-4')).toBe('text-black mt-4');
  });

  it('obsługuje warunkowe klasy (obiekty z clsx)', () => {
    const isError = true;
    expect(cn('p-2', { 'bg-red-500': isError, 'bg-blue-500': !isError })).toBe('p-2 bg-red-500');
  });

  it('ignoruje wartości null, undefined i false', () => {
    expect(cn('flex', null, undefined, false, 'items-center')).toBe('flex items-center');
  });
});