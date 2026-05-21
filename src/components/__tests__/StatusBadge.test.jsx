import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
// POPRAWIONA ŚCIEŻKA:
import StatusBadge from '../common/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders the status text correctly', () => {
    render(<StatusBadge status="accepted" />);
    expect(screen.getByText(/accepted/i)).toBeInTheDocument();
  });

  it('renders unknown status without crashing', () => {
    render(<StatusBadge status="unknown-status" />);
    expect(screen.getByText(/unknown-status/i)).toBeInTheDocument();
  });

  it('używa fallbacku (pending), gdy nie podano żadnego statusu', () => {
    render(<StatusBadge />); // Wywołanie bez propsa status
    
    // Zgodnie z kodem, jeśli status jest undefined, wymusza PENDING
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });
});