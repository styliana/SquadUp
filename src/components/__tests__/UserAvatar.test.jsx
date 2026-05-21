import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UserAvatar from '../common/UserAvatar';

describe('UserAvatar Component', () => {
  it('renderuje zdjęcie (tag img), gdy podano avatarUrl', () => {
    render(<UserAvatar avatarUrl="https://example.com/avatar.jpg" name="Jan Kowalski" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renderuje pierwszą literę imienia, gdy brakuje zdjęcia', () => {
    render(<UserAvatar name="Jan Kowalski" />);
    // Sprawdzamy czy wyrenderowała się litera 'J' z imienia 'Jan'
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renderuje znak "?", gdy brakuje zdjęcia i imienia (Pokrycie linii 4/fallbacku)', () => {
    render(<UserAvatar />); // Komponent wywołany kompletnie bez propsów
    expect(screen.getByText('?')).toBeInTheDocument();
  });
});