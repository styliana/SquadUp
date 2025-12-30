// src/utils/recommendationAlgo.js

/**
 * Oblicza wynik dopasowania (Similarity Score) projektu do profilu użytkownika.
 * Wykorzystuje ważoną sumę dopasowania kategorii oraz indeksu Jaccarda dla umiejętności.
 * * Wzór: Score = (W_cat * CategoryMatch) + (W_skill * JaccardIndex)
 */
export const calculateProjectScore = (project, userProfile) => {
  // Wagi (można dostroić)
  const CATEGORY_WEIGHT = 0.3; // 30% oceny to kategoria
  const SKILLS_WEIGHT = 0.7;   // 70% oceny to umiejętności

  let categoryScore = 0;
  let skillsScore = 0;

  // 1. Analiza Kategorii (0 lub 1)
  if (userProfile?.preferred_categories && project?.category_id) {
    // Rzutowanie na Number dla bezpieczeństwa
    const userCatIds = Array.isArray(userProfile.preferred_categories)
      ? userProfile.preferred_categories.map(Number)
      : [];
    const projectCatId = Number(project.category_id);

    if (userCatIds.includes(projectCatId)) {
      categoryScore = 1.0;
    }
  }

  // 2. Analiza Umiejętności (Indeks Jaccarda: 0.0 do 1.0)
  if (userProfile?.skills && project?.skills) {
    // Helper: Wyciągnij nazwy skilli (niezależnie czy to stringi czy obiekty {id, name})
    const normalizeSkills = (skillsArray) => {
      if (!Array.isArray(skillsArray)) return [];
      return skillsArray
        .map(item => {
          if (typeof item === 'string') return item.toLowerCase();
          if (typeof item === 'object' && item.name) return item.name.toLowerCase();
          return null;
        })
        .filter(Boolean); // Usuń nulle
    };

    const userSkillSet = new Set(normalizeSkills(userProfile.skills));
    const projectSkillSet = new Set(normalizeSkills(project.skills));

    // Część wspólna (Intersection)
    const intersection = new Set(
      [...userSkillSet].filter(x => projectSkillSet.has(x))
    );

    // Suma zbiorów (Union)
    const union = new Set([...userSkillSet, ...projectSkillSet]);

    // Obliczenie Jaccarda (unikanie dzielenia przez zero)
    if (union.size > 0) {
      skillsScore = intersection.size / union.size;
    }
  }

  // 3. Wynik końcowy (Ważona suma)
  // Wynik będzie z zakresu 0.0 do 1.0 (chyba że zmienisz wagi)
  const totalScore = (categoryScore * CATEGORY_WEIGHT) + (skillsScore * SKILLS_WEIGHT);
  
  return totalScore;
};

/**
 * Sortuje listę projektów malejąco według trafności.
 * Dodaje pole 'relevanceScore' i 'matchDetails' do każdego projektu.
 */
export const sortProjectsByRelevance = (projects, userProfile) => {
  if (!projects || !userProfile) return projects || [];

  const projectsWithScore = projects.map(p => {
    const score = calculateProjectScore(p, userProfile);
    return {
      ...p,
      relevanceScore: score,
      // Opcjonalnie: Formatowanie procentowe do wyświetlenia w UI (np. "95% Match")
      matchPercentage: Math.round(score * 100)
    };
  });

  // Sortowanie malejąco
  return projectsWithScore.sort((a, b) => b.relevanceScore - a.relevanceScore);
};