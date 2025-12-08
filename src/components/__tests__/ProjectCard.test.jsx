import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProjectCard from '../ProjectCard';
import { describe, it, expect } from 'vitest';

// Przykładowe dane (Mock Data)
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
  // Symulujemy strukturę, którą zwraca Twoje nowe API (z relacjami)
  profiles: {
    full_name: 'Jan Kowalski',
    avatar_url: null,
    university: 'WUT'
  }
};

describe('ProjectCard Component', () => {
  it('renders project details correctly', () => {
    render(
      // Owijamy w MemoryRouter, bo ProjectCard zawiera <Link>
      <MemoryRouter>
        <ProjectCard project={mockProject} />
      </MemoryRouter>
    );

    // 1. Sprawdzamy czy widać tytuł
    expect(screen.getByText('Super AI Project')).toBeInTheDocument();
    
    // 2. Sprawdzamy typ projektu
    expect(screen.getByText('Hackathon')).toBeInTheDocument();
    
    // 3. Sprawdzamy autora (zaciągniętego z relacji profiles)
    expect(screen.getByText('Jan Kowalski')).toBeInTheDocument();
    
    // 4. Sprawdzamy czy tagi się wyrenderowały
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
  });
});