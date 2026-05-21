import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import ProjectCard from '../projects/ProjectCard';

// 1. Standardowy projekt (Happy Path)
const mockProject = {
  id: 123,
  title: 'Super AI Project',
  type: 'Hackathon',
  description: 'Looking for developers to build the future.',
  tags: ['React', 'Python'],
  members_current: 2,
  members_max: 5,
  deadline: '2025-12-31',
  created_at: '2023-01-01',
  profiles: {
    full_name: 'Jan Kowalski',
    avatar_url: null,
  }
};

// 2. Projekt z brakującymi danymi i wieloma skillami (Edge Cases)
const mockFallbackProject = {
  id: 999,
  title: 'Brakujący Projekt',
  type: 'NieznanyTypDlaTestu', // Wymusza użycie PROJECT_TYPE_STYLES['Default']
  description: 'Testujemy fallbacki.',
  skills: ['HTML', 'CSS', 'JS', 'React', 'Node'], // 5 skilli, wymusi render "+2"
  membersCurrent: 1, // Testujemy alias (zamiast members_current)
  membersMax: 3,
  // Celowo pomijamy deadline, aby wymusić 'Flexible'
  // Celowo pomijamy profiles, aby wymusić 'Anonymous'
  created_at: '2023-05-05',
};

describe('ProjectCard Component', () => {
  it('renders standard project details correctly', () => {
    render(
      <MemoryRouter>
        <ProjectCard project={mockProject} />
      </MemoryRouter>
    );

    expect(screen.getByText('Super AI Project')).toBeInTheDocument();
    expect(screen.getByText('Jan Kowalski')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('renders fallback values and skill overflow correctly (covers all branches)', () => {
    render(
      <MemoryRouter>
        {/* Przekazujemy userSkills, aby przetestować logikę podświetlania dopasowanych tagów */}
        <ProjectCard project={mockFallbackProject} userSkills={['React', 'CSS']} />
      </MemoryRouter>
    );

    expect(screen.getByText('Brakujący Projekt')).toBeInTheDocument();
    
    // Sprawdzamy fallback dla braku autora
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
    
    // Sprawdzamy fallback dla braku daty końcowej
    expect(screen.getByText('Flexible')).toBeInTheDocument();
    
    // Sprawdzamy logikę ucinania tagów (z 5 pokazujemy 3, więc ma być "+2")
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});