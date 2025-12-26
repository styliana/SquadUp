// src/utils/constants.js

// Statusy aplikacji (Muszą idealnie pasować do ENUM w bazie danych!)
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

// Statusy projektów (ID bazujące na tabeli 'project_statuses')
export const PROJECT_STATUS = {
  OPEN: 1,
  CLOSED: 2,
  ARCHIVED: 3
};

// Style wizualne dla typów projektów (Badges)
export const PROJECT_TYPE_STYLES = {
  'Hackathon': 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]',
  'Competition': 'bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]',
  'Portfolio': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
  'Startup': 'bg-orange-500/20 text-orange-400 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.15)]',
  'Research': 'bg-pink-500/20 text-pink-400 border-pink-500/30 shadow-[0_0_10px_rgba(236,72,153,0.15)]',
  'Non-profit': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]',
  'Default': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
};

// Style wizualne dla statusów aplikacji
// Używamy kluczy z obiektu APPLICATION_STATUS, żeby było spójnie
export const APPLICATION_STATUS_STYLES = {
  [APPLICATION_STATUS.PENDING]: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]",
  [APPLICATION_STATUS.ACCEPTED]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]",
  [APPLICATION_STATUS.REJECTED]: "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(248,113,113,0.1)]",
  [APPLICATION_STATUS.CANCELLED]: "bg-gray-500/10 text-gray-400 border-gray-500/20"
};

// Nazwy tabel (opcjonalne, ale dobre dla porządku)
export const TABLE_NAMES = {
  PROJECTS: 'projects',
  PROFILES: 'profiles',
  APPLICATIONS: 'applications',
  CATEGORIES: 'categories',
  SKILLS: 'skills'
};