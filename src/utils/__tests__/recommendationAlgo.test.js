import { describe, it, expect } from 'vitest';
import { calculateProjectScore, sortProjectsByRelevance } from '../recommendationAlgo';

describe('Funkcja calculateProjectScore()', () => {
  it('zwraca wynik 1.0 (100%) dla idealnego dopasowania', () => {
    const user = { preferred_categories: [1, 2], skills: ['React', 'Node'] };
    const project = { category_id: 1, skills: ['react', 'node'] }; // inna wielkość liter
    
    expect(calculateProjectScore(project, user)).toBe(1.0);
  });

  it('zwraca 0.3 (30%) gdy pasuje tylko kategoria, a brakuje wspólnych skilli', () => {
    const user = { preferred_categories: [3], skills: ['Java'] };
    const project = { category_id: 3, skills: ['Python', 'C++'] };
    
    expect(calculateProjectScore(project, user)).toBe(0.3);
  });

  it('zwraca 0.7 (70%) gdy pasują idealnie skille, ale inna kategoria', () => {
    const user = { preferred_categories: [1], skills: ['Figma'] };
    const project = { category_id: 2, skills: ['figma'] };
    
    expect(calculateProjectScore(project, user)).toBe(0.7);
  });

  it('poprawnie oblicza indeks Jaccarda dla częściowego dopasowania skilli', () => {
    // User ma skille: A, B. Projekt wymaga: B, C.
    // Część wspólna (Intersection) = B (1)
    // Suma zbiorów (Union) = A, B, C (3)
    // Wynik dla skilli: 1/3. 
    // Brak dopasowania kategorii (0). Wynik końcowy: 0.7 * (1/3) = ~0.233
    const user = { preferred_categories: [99], skills: ['A', 'B'] };
    const project = { category_id: 88, skills: ['B', 'C'] };
    
    const score = calculateProjectScore(project, user);
    expect(score).toBeCloseTo(0.233, 3); 
  });

  it('obsługuje skille jako obiekty (z polem name)', () => {
    const user = { 
      preferred_categories: [5], 
      skills: [{ id: 1, name: 'Docker' }] 
    };
    const project = { 
      category_id: 5, 
      skills: [{ id: 2, name: 'docker' }, { id: 3, name: 'AWS' }] 
    };
    // Wspólne: Docker (1). Unia: Docker, AWS (2). Indeks: 0.5
    // Kategoria pasuje (0.3). Wynik: 0.3 + (0.7 * 0.5) = 0.65
    expect(calculateProjectScore(project, user)).toBeCloseTo(0.65, 2);
  });

  it('zwraca 0, jeśli brakuje danych w profilu lub projekcie', () => {
    expect(calculateProjectScore(null, null)).toBe(0);
    expect(calculateProjectScore({}, {})).toBe(0);
    expect(calculateProjectScore({ category_id: 1 }, null)).toBe(0);
  });
});

describe('Funkcja sortProjectsByRelevance()', () => {
  it('sortuje projekty malejąco i dodaje pola relevanceScore oraz matchPercentage', () => {
    const user = { preferred_categories: [1], skills: ['React', 'Node'] };
    
    const projects = [
      { id: 1, title: 'Brak Dopasowania', category_id: 99, skills: ['Java'] }, // score: 0
      { id: 2, title: 'Idealny', category_id: 1, skills: ['React', 'Node'] }, // score: 1.0
      { id: 3, title: 'Tylko Kategoria', category_id: 1, skills: ['PHP'] }, // score: 0.3
    ];

    const sorted = sortProjectsByRelevance(projects, user);

    // Sprawdzamy czy pierwszy to "Idealny" i ma 100%
    expect(sorted[0].title).toBe('Idealny');
    expect(sorted[0].matchPercentage).toBe(100);
    expect(sorted[0].relevanceScore).toBe(1.0);

    // Sprawdzamy czy drugi to "Tylko Kategoria"
    expect(sorted[1].title).toBe('Tylko Kategoria');
    expect(sorted[1].matchPercentage).toBe(30);

    // Sprawdzamy czy ostatni to "Brak Dopasowania"
    expect(sorted[2].title).toBe('Brak Dopasowania');
    expect(sorted[2].matchPercentage).toBe(0);
  });

  it('obsługuje błędy (puste tablice lub brak usera)', () => {
    expect(sortProjectsByRelevance([], null)).toEqual([]);
    expect(sortProjectsByRelevance(null, {})).toEqual([]);
  });

  it('ignoruje nieprawidłowe dane w tablicy skilli (np. liczby lub puste obiekty)', () => {
    const user = { preferred_categories: [1], skills: ['React', 123, { id: 99 }] };
    const project = { category_id: 1, skills: ['React'] };
    // '123' i '{id: 99}' powinny wejść w linijkę 38 i zwrócić null, a algorytm to zignoruje
    expect(calculateProjectScore(project, user)).toBeCloseTo(0.3 + (0.7 * 1.0));
  });
});