import { render, screen } from '@testing-library/react';
import StatusBadge from '../StatusBadge';
import { describe, it, expect } from 'vitest';

describe('StatusBadge Component', () => {
  it('renders the status text correctly', () => {
    // Renderujemy komponent ze statusem "accepted"
    render(<StatusBadge status="accepted" />);
    
    // Sprawdzamy czy tekst "accepted" jest w dokumencie
    expect(screen.getByText(/accepted/i)).toBeInTheDocument();
  });

  it('renders unknown status without crashing', () => {
    // Sprawdzamy odporność na dziwne dane
    render(<StatusBadge status="unknown-status" />);
    expect(screen.getByText(/unknown-status/i)).toBeInTheDocument();
  });
});