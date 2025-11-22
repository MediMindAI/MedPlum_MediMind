// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { RoleSelector } from './RoleSelector';

describe('RoleSelector', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  it('should render with default placeholder', () => {
    renderWithProviders(<RoleSelector value={[]} onChange={() => {}} />);

    expect(screen.getByPlaceholderText(/აირჩიეთ როლები/i)).toBeInTheDocument();
  });

  it('should display role options from account-roles.json', () => {
    renderWithProviders(<RoleSelector value={[]} onChange={() => {}} />);

    const input = screen.getByPlaceholderText(/აირჩიეთ როლები/i);
    fireEvent.click(input);

    // Check for physician role
    expect(screen.getByText('ექიმი')).toBeInTheDocument();
    expect(screen.getByText('ექთანი')).toBeInTheDocument();
    expect(screen.getByText('ადმინისტრატორი')).toBeInTheDocument();
  });

  it('should select single role', () => {
    const handleChange = jest.fn();
    renderWithProviders(<RoleSelector value={[]} onChange={handleChange} />);

    const input = screen.getByPlaceholderText(/აირჩიეთ როლები/i);
    fireEvent.click(input);

    const physicianOption = screen.getByText('ექიმი');
    fireEvent.click(physicianOption);

    expect(handleChange).toHaveBeenCalledWith(['physician']);
  });

  it('should select multiple roles', () => {
    const handleChange = jest.fn();
    renderWithProviders(<RoleSelector value={[]} onChange={handleChange} />);

    const input = screen.getByPlaceholderText(/აირჩიეთ როლები/i);
    fireEvent.click(input);

    // Select physician
    const physicianOption = screen.getByText('ექიმი');
    fireEvent.click(physicianOption);

    // Open dropdown again
    fireEvent.click(input);

    // Select department head
    const deptHeadOption = screen.getByText('განყოფილების ხელმძღვანელი');
    fireEvent.click(deptHeadOption);

    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  it('should display pre-selected roles', () => {
    renderWithProviders(<RoleSelector value={['physician', 'nurse']} onChange={() => {}} />);

    // Use getAllByText because selected roles appear both as pills and in dropdown
    expect(screen.getAllByText('ექიმი')[0]).toBeInTheDocument();
    expect(screen.getAllByText('ექთანი')[0]).toBeInTheDocument();
  });

  it('should remove role when deselecting', () => {
    const handleChange = jest.fn();
    const { container } = renderWithProviders(
      <RoleSelector value={['physician', 'nurse']} onChange={handleChange} />
    );

    // Find all pill remove buttons (Mantine MultiSelect uses pill close buttons)
    const removeButtons = container.querySelectorAll('.mantine-Pill-remove, .mantine-CloseButton-root');
    expect(removeButtons.length).toBeGreaterThan(0);

    // Click first remove button (physician)
    fireEvent.click(removeButtons[0]);

    expect(handleChange).toHaveBeenCalledWith(['nurse']);
  });

  it('should display in English when language is en', () => {
    localStorage.setItem('emrLanguage', 'en');

    renderWithProviders(<RoleSelector value={[]} onChange={() => {}} />, { initialLanguage: 'en' });

    const input = screen.getByPlaceholderText(/select roles/i);
    fireEvent.click(input);

    expect(screen.getByText('Physician')).toBeInTheDocument();
    expect(screen.getByText('Nurse')).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('should display in Russian when language is ru', () => {
    localStorage.setItem('emrLanguage', 'ru');

    renderWithProviders(<RoleSelector value={[]} onChange={() => {}} />, { initialLanguage: 'ru' });

    const input = screen.getByPlaceholderText(/выберите роли/i);
    fireEvent.click(input);

    expect(screen.getByText('Врач')).toBeInTheDocument();
    expect(screen.getByText('Медсестра')).toBeInTheDocument();
    expect(screen.getByText('Администратор')).toBeInTheDocument();
  });

  it('should be searchable', () => {
    renderWithProviders(<RoleSelector value={[]} onChange={() => {}} />);

    const input = screen.getByPlaceholderText(/აირჩიეთ როლები/i);

    // Type to search
    fireEvent.change(input, { target: { value: 'ექიმ' } });

    // Should show physician but not nurse
    expect(screen.getByText('ექიმი')).toBeInTheDocument();
    expect(screen.queryByText('ექთანი')).not.toBeInTheDocument();
  });

  it('should have size="md" for touch-friendly interaction', () => {
    const { container } = renderWithProviders(<RoleSelector value={[]} onChange={() => {}} />);

    const input = container.querySelector('input');
    const inputWrapper = input?.closest('.mantine-MultiSelect-input');
    expect(inputWrapper).toHaveStyle({ minHeight: '44px' });
  });

  it('should display custom label when provided', () => {
    renderWithProviders(<RoleSelector value={[]} onChange={() => {}} label="Custom Label" />);

    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });

  it('should show required indicator when required prop is true', () => {
    renderWithProviders(<RoleSelector value={[]} onChange={() => {}} required />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    renderWithProviders(<RoleSelector value={[]} onChange={() => {}} disabled />);

    const input = screen.getByPlaceholderText(/აირჩიეთ როლები/i);
    expect(input).toBeDisabled();
  });

  it('should display error message when error prop is provided', () => {
    renderWithProviders(<RoleSelector value={[]} onChange={() => {}} error="This field is required" />);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should handle empty value array', () => {
    renderWithProviders(<RoleSelector value={[]} onChange={() => {}} />);

    const input = screen.getByPlaceholderText(/აირჩიეთ როლები/i);
    expect(input).toBeInTheDocument();
  });

  it('should load all 12 role options', () => {
    renderWithProviders(<RoleSelector value={[]} onChange={() => {}} />);

    const input = screen.getByPlaceholderText(/აირჩიეთ როლები/i);
    fireEvent.click(input);

    // Check all 12 roles are available
    expect(screen.getByText('ექიმი')).toBeInTheDocument();
    expect(screen.getByText('ექთანი')).toBeInTheDocument();
    expect(screen.getByText('ტექნიკოსი')).toBeInTheDocument();
    expect(screen.getByText('ადმინისტრატორი')).toBeInTheDocument();
    expect(screen.getByText('განყოფილების ხელმძღვანელი')).toBeInTheDocument();
    expect(screen.getByText('ფარმაცევტი')).toBeInTheDocument();
    expect(screen.getByText('ლაბორანტი')).toBeInTheDocument();
    expect(screen.getByText('რენტგენოლოგი')).toBeInTheDocument();
    expect(screen.getByText('რეგისტრატორი')).toBeInTheDocument();
    expect(screen.getByText('ბილინგის სპეციალისტი')).toBeInTheDocument();
    expect(screen.getByText('თერაპევტი')).toBeInTheDocument();
    expect(screen.getByText('ანესთეზიოლოგი')).toBeInTheDocument();
  });
});
