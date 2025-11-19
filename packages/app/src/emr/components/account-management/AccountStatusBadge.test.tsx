/**
 * Tests for AccountStatusBadge Component
 *
 * Tests status badge rendering with color coding
 */

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { AccountStatusBadge } from './AccountStatusBadge';

describe('AccountStatusBadge (T022)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  it('should render active status', () => {
    renderWithProviders(<AccountStatusBadge active={true} />);

    const badge = screen.getByText(/აქტიური/i);
    expect(badge).toBeInTheDocument();
  });

  it('should render inactive status', () => {
    renderWithProviders(<AccountStatusBadge active={false} />);

    const badge = screen.getByText(/არააქტიური/i);
    expect(badge).toBeInTheDocument();
  });

  it('should use Mantine Badge component', () => {
    const { container } = renderWithProviders(<AccountStatusBadge active={true} />);

    const badge = container.querySelector('[class*="Badge"]');
    expect(badge).toBeInTheDocument();
  });

  it('should display correct text in Georgian', () => {
    renderWithProviders(<AccountStatusBadge active={true} />, { initialLanguage: 'ka' });
    expect(screen.getByText('აქტიური')).toBeInTheDocument();
  });

  it('should display correct text in English', () => {
    renderWithProviders(<AccountStatusBadge active={true} />, { initialLanguage: 'en' });
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should display correct text in Russian', () => {
    renderWithProviders(<AccountStatusBadge active={true} />, { initialLanguage: 'ru' });
    expect(screen.getByText('Активный')).toBeInTheDocument();
  });
});
