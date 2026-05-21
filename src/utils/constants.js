// src/utils/constants.js

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

export const PROJECT_STATUS = {
  OPEN: 1,
  CLOSED: 2,
  ARCHIVED: 3
};

// CZYSTA PALETA ADOBE: 
// primary (Cyjan), secondary (Pomarańcz), accent (Miodowy), oraz kolory tła/powierzchni.
export const PROJECT_TYPE_STYLES = {
  'Hackathon': 'bg-primary/10 text-primary border-primary/30 shadow-sm shadow-primary/20',
  'Competition': 'bg-secondary/10 text-secondary border-secondary/30 shadow-sm shadow-secondary/20',
  'Portfolio': 'bg-accent/10 text-accent border-accent/30 shadow-sm shadow-accent/20',
  'Startup': 'bg-secondary/10 text-secondary border-secondary/30 shadow-sm shadow-secondary/20',
  'Research': 'bg-primary/10 text-primary border-primary/30 shadow-sm shadow-primary/20',
  'Non-profit': 'bg-accent/10 text-accent border-accent/30 shadow-sm shadow-accent/20',
  'Default': 'bg-surface text-textMuted border-border'
};

// STATUSY APLIKACJI
export const APPLICATION_STATUS_STYLES = {
  [APPLICATION_STATUS.PENDING]: "bg-accent/10 text-accent border-accent/30 shadow-sm shadow-accent/20",
  // ZMIANA TUTAJ: ACCEPTED JEST TERAZ ZIELONE!
  [APPLICATION_STATUS.ACCEPTED]: "bg-success/10 text-success border-success/30 shadow-sm shadow-success/20",
  [APPLICATION_STATUS.REJECTED]: "bg-secondary/10 text-secondary border-secondary/30 shadow-sm shadow-secondary/20",
  [APPLICATION_STATUS.CANCELLED]: "bg-surface text-textMuted border-border shadow-none"
};

export const TABLE_NAMES = {
  PROJECTS: 'projects',
  PROFILES: 'profiles',
  APPLICATIONS: 'applications',
  CATEGORIES: 'categories',
  SKILLS: 'skills'
};