import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Funkcja pomocnicza do warunkowego łączenia klas Tailwind.
 * Rozwiązuje konflikty klas (np. p-4 nadpisuje p-2).
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}