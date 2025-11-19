/**
 * Tests for AccountManagementView Component
 *
 * Tests main dashboard view with table and form integration
 */

import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { MockClient } from '@medplum/mock';
import { Practitioner, ProjectMembership } from '@medplum/fhirtypes';
import { AccountManagementView } from './AccountManagementView';

describe('AccountManagementView (T025)', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  it('should render page title', () => {
    renderWithProviders(<AccountManagementView />, { medplum });

    expect(screen.getByText(/ანგარიშების მართვა/i)).toBeInTheDocument();
  });

  it('should render AccountTable component', async () => {
    const mockPractitioners: Practitioner[] = [
      {
        resourceType: 'Practitioner',
        id: 'practitioner-1',
        name: [{ family: 'ხოზვრია', given: ['თენგიზი'] }],
        active: true,
      },
    ];

    medplum.searchResources = jest.fn().mockResolvedValue(mockPractitioners);

    renderWithProviders(<AccountManagementView />, { medplum });

    await waitFor(() => {
      expect(screen.getByText('ხოზვრია თენგიზი')).toBeInTheDocument();
    });
  });

  it('should render AccountForm for creating new accounts', async () => {
    renderWithProviders(<AccountManagementView />, { medplum });

    await waitFor(() => {
      const firstNameInputs = screen.getAllByLabelText(/სახელი/i);
      expect(firstNameInputs.length).toBeGreaterThan(0);
    });

    expect(screen.getByLabelText(/გვარი/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ელფოსტა/i)).toBeInTheDocument();
  });

  it('should create new account when form is submitted', async () => {
    const mockMembership: ProjectMembership = {
      resourceType: 'ProjectMembership',
      id: 'membership-123',
      project: { reference: 'Project/hospital' },
      user: { reference: 'User/user-123' },
      profile: { reference: 'Practitioner/practitioner-123' },
    };

    medplum.post = jest.fn().mockResolvedValue(mockMembership);
    medplum.searchResources = jest.fn().mockResolvedValue([]);

    renderWithProviders(<AccountManagementView />, { medplum });

    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByLabelText(/ელფოსტა/i)).toBeInTheDocument();
    });

    // Fill in form - get first სახელი (firstName) from form
    const firstNameInputs = screen.getAllByLabelText(/სახელი/i);
    fireEvent.change(firstNameInputs[0], {
      target: { value: 'თენგიზი' },
    });
    fireEvent.change(screen.getByLabelText(/გვარი/i), {
      target: { value: 'ხოზვრია' },
    });
    fireEvent.change(screen.getByLabelText(/ელფოსტა/i), {
      target: { value: 'tengizi@medimind.ge' },
    });

    // Submit form
    const submitButton = screen.getByText('შენახვა');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(medplum.post).toHaveBeenCalledWith(
        expect.stringContaining('admin/projects/'),
        expect.objectContaining({
          email: 'tengizi@medimind.ge',
        })
      );
    });
  });

  it('should refresh table after creating new account', async () => {
    const mockMembership: ProjectMembership = {
      resourceType: 'ProjectMembership',
      id: 'membership-123',
      project: { reference: 'Project/hospital' },
      user: { reference: 'User/user-123' },
      profile: { reference: 'Practitioner/practitioner-123' },
    };

    medplum.post = jest.fn().mockResolvedValue(mockMembership);
    medplum.searchResources = jest.fn().mockResolvedValue([]);

    renderWithProviders(<AccountManagementView />, { medplum });

    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByLabelText(/ელფოსტა/i)).toBeInTheDocument();
    });

    // Fill and submit form
    const firstNameInputs = screen.getAllByLabelText(/სახელი/i);
    fireEvent.change(firstNameInputs[0], { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/გვარი/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/ელფოსტა/i), {
      target: { value: 'test@medimind.ge' },
    });

    const submitButton = screen.getByText('შენახვა');
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Should refresh table after create (searchResources called twice: initial + refresh)
      expect(medplum.searchResources).toHaveBeenCalledTimes(2);
    });
  });

  it('should open edit modal when edit button is clicked', async () => {
    const mockPractitioners: Practitioner[] = [
      {
        resourceType: 'Practitioner',
        id: 'practitioner-1',
        name: [{ family: 'ხოზვრია', given: ['თენგიზი'] }],
        telecom: [{ system: 'email', value: 'tengizi@medimind.ge', use: 'work' }],
        active: true,
      },
    ];

    medplum.searchResources = jest.fn().mockResolvedValue(mockPractitioners);

    renderWithProviders(<AccountManagementView />, { medplum });

    await waitFor(() => {
      expect(screen.getByText('ხოზვრია თენგიზი')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText('რედაქტირება');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/ანგარიშის რედაქტირება/i)).toBeInTheDocument();
    });
  });

  it('should show success notification after creating account', async () => {
    const mockMembership: ProjectMembership = {
      resourceType: 'ProjectMembership',
      id: 'membership-123',
      project: { reference: 'Project/hospital' },
      user: { reference: 'User/user-123' },
      profile: { reference: 'Practitioner/practitioner-123' },
    };

    medplum.post = jest.fn().mockResolvedValue(mockMembership);
    medplum.searchResources = jest.fn().mockResolvedValue([]);

    renderWithProviders(<AccountManagementView />, { medplum });

    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByLabelText(/ელფოსტა/i)).toBeInTheDocument();
    });

    // Fill and submit form
    const firstNameInputs = screen.getAllByLabelText(/სახელი/i);
    fireEvent.change(firstNameInputs[0], { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/გვარი/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/ელფოსტა/i), {
      target: { value: 'test@medimind.ge' },
    });

    const submitButton = screen.getByText('შენახვა');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('ანგარიში წარმატებით შეიქმნა')).toBeInTheDocument();
    });
  });

  it('should show error notification when account creation fails', async () => {
    medplum.post = jest.fn().mockRejectedValue(new Error('Email already exists'));
    medplum.searchResources = jest.fn().mockResolvedValue([]);

    renderWithProviders(<AccountManagementView />, { medplum });

    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByLabelText(/ელფოსტა/i)).toBeInTheDocument();
    });

    // Fill and submit form
    const firstNameInputs = screen.getAllByLabelText(/სახელი/i);
    fireEvent.change(firstNameInputs[0], { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/გვარი/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/ელფოსტა/i), {
      target: { value: 'test@medimind.ge' },
    });

    const submitButton = screen.getByText('შენახვა');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/შეცდომა ანგარიშის შექმნისას/i)).toBeInTheDocument();
    });
  });

  it('should use mobile-first responsive layout', () => {
    const { container } = renderWithProviders(<AccountManagementView />, { medplum });

    // Check for Grid with responsive spans
    const gridCols = container.querySelectorAll('[class*="Grid-col"]');
    expect(gridCols.length).toBeGreaterThan(0);
  });

  it('should display loading state while fetching accounts', () => {
    medplum.searchResources = jest
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve([]), 1000)));

    renderWithProviders(<AccountManagementView />, { medplum });

    expect(screen.getByText(/იტვირთება/i)).toBeInTheDocument();
  });
});
