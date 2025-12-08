/**
 * Formatuje datę do czytelnej postaci.
 * Obsługuje formaty relatywne ("Today", "Yesterday") lub pełne daty.
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  
  // Opcja: tylko czas (dla czatu dzisiaj)
  if (options.timeOnly) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Sprawdź czy to dzisiaj
  const isToday = date.toDateString() === now.toDateString();
  if (isToday && options.relative) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Domyślny format: "12 Oct" lub pełny
  return date.toLocaleDateString([], { 
    day: 'numeric', 
    month: 'short', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
};

/**
 * Formatuje datę pod input typu date (YYYY-MM-DD)
 */
export const formatForInput = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};