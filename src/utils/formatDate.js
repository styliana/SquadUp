import { format } from 'date-fns';

/**
 * Formatuje datę do czytelnej postaci.
 * Obsługuje formaty relatywne ("Today", "Yesterday"), wzorce (np. 'MMM d, yyyy') lub pełne daty.
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return options.fallback || '';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return options.fallback || '';

    // Jeśli podano wzorzec formatowania date-fns
    if (options.pattern) {
      return format(date, options.pattern);
    }

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
  } catch (e) {
    return options.fallback || '';
  }
};

/**
 * Formatuje datę z czasem, np. "Oct 12, 14:30"
 */
export const formatDateTime = (dateString, pattern = 'MMM d, HH:mm') => {
  return formatDate(dateString, { pattern });
};

/**
 * Formatuje datę pod input typu date (YYYY-MM-DD)
 */
export const formatForInput = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};