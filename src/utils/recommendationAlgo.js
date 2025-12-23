// src/utils/recommendationAlgo.js

/**
 * Oblicza wynik dopasowania projektu do profilu użytkownika.
 * Wagi:
 * - Kategoria projektu pasuje do preferencji: +2 pkt
 * - Każdy wspólny skill: +1 pkt
 */
export const calculateProjectScore = (project, userProfile) => {
  let score = 0;

  // 1. Sprawdzenie Kategorii (Waga: 2)
  // Upewniamy się, że mamy dane i typy się zgadzają (rzutowanie na Number/String)
  if (userProfile?.preferred_categories && project?.category_id) {
    // preferred_categories to tablica ID (np. [1, 5])
    const userCatIds = userProfile.preferred_categories.map(Number);
    const projectCatId = Number(project.category_id);

    if (userCatIds.includes(projectCatId)) {
      score += 2;
    }
  }

  // 2. Sprawdzenie Skilli (Waga: 1 za każdy skill)
  if (userProfile?.skills && project?.skills) {
    // Normalizacja do małych liter dla pewności
    const userSkills = userProfile.skills.map(s => s.toLowerCase());
    const projectSkills = project.skills.map(s => s.toLowerCase());

    // Liczymy część wspólną
    const matchingSkills = projectSkills.filter(skill => userSkills.includes(skill));
    score += matchingSkills.length; // +1 pkt za każdy match
  }

  return score;
};

/**
 * Sortuje listę projektów malejąco według wyniku dopasowania.
 * Odrzuca projekty z wynikiem 0 (opcjonalnie).
 */
export const sortProjectsByRelevance = (projects, userProfile) => {
  // Najpierw obliczamy wynik dla każdego
  const projectsWithScore = projects.map(p => ({
    ...p,
    relevanceScore: calculateProjectScore(p, userProfile)
  }));

  // Filtrujemy te, które w ogóle nie pasują (score > 0)
  // Możesz usunąć ten filtr, jeśli chcesz pokazywać też te "niepasujące" na końcu listy
  const relevantProjects = projectsWithScore.filter(p => p.relevanceScore > 0);

  // Sortujemy: Najwyższy wynik na górze
  return relevantProjects.sort((a, b) => b.relevanceScore - a.relevanceScore);
};