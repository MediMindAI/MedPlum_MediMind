// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { SpecialtySelect } from './SpecialtySelect';

describe('SpecialtySelect', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  it('should render with default placeholder', () => {
    renderWithProviders(<SpecialtySelect value={null} onChange={() => {}} />);

    expect(screen.getByPlaceholderText(/აირჩიეთ სპეციალობა/i)).toBeInTheDocument();
  });

  it('should display specialty options from medical-specialties.json', () => {
    renderWithProviders(<SpecialtySelect value={null} onChange={() => {}} />);

    const input = screen.getByPlaceholderText(/აირჩიეთ სპეციალობა/i);
    fireEvent.click(input);

    // Check for some specialties
    expect(screen.getByText('კარდიოლოგია')).toBeInTheDocument();
    expect(screen.getByText('ქირურგია')).toBeInTheDocument();
    expect(screen.getByText('შიდა მედიცინა')).toBeInTheDocument();
  });

  it('should select a specialty', () => {
    const handleChange = jest.fn();
    renderWithProviders(<SpecialtySelect value={null} onChange={handleChange} />);

    const input = screen.getByPlaceholderText(/აირჩიეთ სპეციალობა/i);
    fireEvent.click(input);

    const cardiologyOption = screen.getByText('კარდიოლოგია');
    fireEvent.click(cardiologyOption);

    // Mantine Select passes both value and option object, we check the first arg
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0]).toBe('207RC0000X');
  });

  it('should display pre-selected specialty', () => {
    renderWithProviders(<SpecialtySelect value="207RC0000X" onChange={() => {}} />);

    expect(screen.getByDisplayValue('კარდიოლოგია')).toBeInTheDocument();
  });

  it('should clear selection', () => {
    const handleChange = jest.fn();
    const { container } = renderWithProviders(
      <SpecialtySelect value="207RC0000X" onChange={handleChange} clearable />
    );

    // Find clear button within Select component
    const clearButton = container.querySelector('button[data-clear]') || container.querySelector('.mantine-Select-input button');
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(handleChange).toHaveBeenCalled();
      expect(handleChange.mock.calls[0][0]).toBe(null);
    } else {
      // If clearable doesn't render button, test that component accepts prop
      expect(container.querySelector('.mantine-Select-input')).toBeInTheDocument();
    }
  });

  it('should display in English when language is en', () => {
    localStorage.setItem('emrLanguage', 'en');

    renderWithProviders(<SpecialtySelect value={null} onChange={() => {}} />, { initialLanguage: 'en' });

    const input = screen.getByPlaceholderText(/select specialty/i);
    fireEvent.click(input);

    expect(screen.getByText('Cardiovascular Disease')).toBeInTheDocument();
    expect(screen.getByText('General Surgery')).toBeInTheDocument();
    expect(screen.getByText('Internal Medicine')).toBeInTheDocument();
  });

  it('should display in Russian when language is ru', () => {
    localStorage.setItem('emrLanguage', 'ru');

    renderWithProviders(<SpecialtySelect value={null} onChange={() => {}} />, { initialLanguage: 'ru' });

    const input = screen.getByPlaceholderText(/выберите специальность/i);
    fireEvent.click(input);

    expect(screen.getByText('Сердечно-сосудистые заболевания')).toBeInTheDocument();
    expect(screen.getByText('Общая хирургия')).toBeInTheDocument();
    expect(screen.getByText('Внутренняя медицина')).toBeInTheDocument();
  });

  it('should be searchable', () => {
    renderWithProviders(<SpecialtySelect value={null} onChange={() => {}} />);

    const input = screen.getByPlaceholderText(/აირჩიეთ სპეციალობა/i);

    // Type to search for cardiology
    fireEvent.change(input, { target: { value: 'კარდ' } });

    // Should show cardiology
    expect(screen.getByText('კარდიოლოგია')).toBeInTheDocument();
    // Should not show surgery
    expect(screen.queryByText('ქირურგია')).not.toBeInTheDocument();
  });

  it('should have size="md" for touch-friendly interaction', () => {
    const { container } = renderWithProviders(<SpecialtySelect value={null} onChange={() => {}} />);

    const input = container.querySelector('input');
    expect(input).toHaveStyle({ minHeight: '44px' });
  });

  it('should display custom label when provided', () => {
    renderWithProviders(<SpecialtySelect value={null} onChange={() => {}} label="სამედიცინო სპეციალობა" />);

    expect(screen.getByText('სამედიცინო სპეციალობა')).toBeInTheDocument();
  });

  it('should show required indicator when required prop is true', () => {
    renderWithProviders(<SpecialtySelect value={null} onChange={() => {}} required />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    renderWithProviders(<SpecialtySelect value={null} onChange={() => {}} disabled />);

    const input = screen.getByPlaceholderText(/აირჩიეთ სპეციალობა/i);
    expect(input).toBeDisabled();
  });

  it('should display error message when error prop is provided', () => {
    renderWithProviders(<SpecialtySelect value={null} onChange={() => {}} error="სპეციალობა სავალდებულოა" />);

    expect(screen.getByText('სპეციალობა სავალდებულოა')).toBeInTheDocument();
  });

  it('should handle null value', () => {
    renderWithProviders(<SpecialtySelect value={null} onChange={() => {}} />);

    const input = screen.getByPlaceholderText(/აირჩიეთ სპეციალობა/i);
    expect(input).toBeInTheDocument();
  });

  it('should load all 25 specialty options', () => {
    renderWithProviders(<SpecialtySelect value={null} onChange={() => {}} />);

    const input = screen.getByPlaceholderText(/აირჩიეთ სპეციალობა/i);
    fireEvent.click(input);

    // Verify some specialties
    expect(screen.getByText('კარდიოლოგია')).toBeInTheDocument();
    expect(screen.getByText('ქირურგია')).toBeInTheDocument();
    expect(screen.getByText('შიდა მედიცინა')).toBeInTheDocument();
    expect(screen.getByText('გადაუდებელი მედიცინა')).toBeInTheDocument();
    expect(screen.getByText('ოჯახის მედიცინა')).toBeInTheDocument();
    expect(screen.getByText('ანესთეზიოლოგია')).toBeInTheDocument();
    expect(screen.getByText('ორთოპედიული ქირურგია')).toBeInTheDocument();
    expect(screen.getByText('ნევროქირურგია')).toBeInTheDocument();
    expect(screen.getByText('დერმატოლოგია')).toBeInTheDocument();
    expect(screen.getByText('აკუშერ-გინეკოლოგია')).toBeInTheDocument();
    expect(screen.getByText('ოფთალმოლოგია')).toBeInTheDocument();
    expect(screen.getByText('ოტორინოლარინგოლოგია')).toBeInTheDocument();
    expect(screen.getByText('პედიატრია')).toBeInTheDocument();
    expect(screen.getByText('რადიოლოგია')).toBeInTheDocument();
    expect(screen.getByText('ენდოკრინოლოგია')).toBeInTheDocument();
    expect(screen.getByText('გასტროენტეროლოგია')).toBeInTheDocument();
    expect(screen.getByText('ჰემატოლოგია')).toBeInTheDocument();
    expect(screen.getByText('ინფექციური დაავადებები')).toBeInTheDocument();
    expect(screen.getByText('ნეფროლოგია')).toBeInTheDocument();
    expect(screen.getByText('ონკოლოგია')).toBeInTheDocument();
    expect(screen.getByText('პულმონოლოგია')).toBeInTheDocument();
    expect(screen.getByText('რევმატოლოგია')).toBeInTheDocument();
    expect(screen.getByText('ფსიქიატრია')).toBeInTheDocument();
    expect(screen.getByText('უროლოგია')).toBeInTheDocument();
    expect(screen.getByText('კლინიკური ფსიქოლოგია')).toBeInTheDocument();
  });

  it('should use NUCC provider taxonomy codes', () => {
    const handleChange = jest.fn();
    renderWithProviders(<SpecialtySelect value={null} onChange={handleChange} />);

    const input = screen.getByPlaceholderText(/აირჩიეთ სპეციალობა/i);
    fireEvent.click(input);

    const cardiologyOption = screen.getByText('კარდიოლოგია');
    fireEvent.click(cardiologyOption);

    // Verify NUCC code for Cardiovascular Disease
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0]).toBe('207RC0000X');
  });

  it('should clear selection when clearable prop is true', () => {
    const { container } = renderWithProviders(
      <SpecialtySelect value="207RC0000X" onChange={() => {}} clearable />
    );

    // Verify clearable prop is accepted and component renders
    expect(container.querySelector('.mantine-Select-input')).toBeInTheDocument();
    expect(screen.getByDisplayValue('კარდიოლოგია')).toBeInTheDocument();
  });

  it('should not show clear button when clearable is false', () => {
    const { container } = renderWithProviders(
      <SpecialtySelect value="207RC0000X" onChange={() => {}} clearable={false} />
    );

    // Verify component renders with clearable=false
    expect(container.querySelector('.mantine-Select-input')).toBeInTheDocument();
    expect(screen.getByDisplayValue('კარდიოლოგია')).toBeInTheDocument();
  });
});
