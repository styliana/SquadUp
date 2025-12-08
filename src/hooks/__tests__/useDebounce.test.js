import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';
import { describe, it, expect, vi } from 'vitest';

// Włączamy "fałszywe zegary", żeby kontrolować czas w teście
vi.useFakeTimers();

describe('useDebounce Hook', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('should update value only after specified delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // 1. Sprawdzamy wartość początkową
    expect(result.current).toBe('initial');

    // 2. Zmieniamy wartość (symulacja pisania)
    rerender({ value: 'updated', delay: 500 });

    // 3. Wartość NIE powinna się zmienić od razu (debounce działa)
    expect(result.current).toBe('initial');

    // 4. Przesuwamy czas do przodu o 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // 5. Teraz wartość powinna być zaktualizowana
    expect(result.current).toBe('updated');
  });
});