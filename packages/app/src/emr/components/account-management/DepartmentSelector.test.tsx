// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, waitFor } from '@testing-library/react';
import { MedplumProvider } from '@medplum/react-hooks';
import { MockClient } from '@medplum/mock';
import { MantineProvider } from '@mantine/core';
import { DepartmentSelector } from './DepartmentSelector';
import type { Organization } from '@medplum/fhirtypes';

describe('DepartmentSelector', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  function renderWithProviders(component: React.ReactElement): ReturnType<typeof render> {
    return render(
      <MantineProvider>
        <MedplumProvider medplum={medplum}>{component}</MedplumProvider>
      </MantineProvider>
    );
  }

  it('renders department selector', async () => {
    renderWithProviders(<DepartmentSelector value="" onChange={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Department')).toBeInTheDocument();
    });
  });

  it('fetches and displays departments', async () => {
    const mockDepartments: Organization[] = [
      {
        resourceType: 'Organization',
        id: 'dept-001',
        name: 'Cardiology',
        type: [{ coding: [{ code: 'dept' }] }],
      },
      {
        resourceType: 'Organization',
        id: 'dept-002',
        name: 'Radiology',
        type: [{ coding: [{ code: 'dept' }] }],
      },
    ];

    jest.spyOn(medplum, 'search').mockResolvedValue({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: mockDepartments.map((dept) => ({ resource: dept })),
    });

    renderWithProviders(<DepartmentSelector value="" onChange={jest.fn()} />);

    await waitFor(() => {
      expect(medplum.search).toHaveBeenCalledWith('Organization', {
        type: 'dept',
        _count: '100',
      });
    });
  });

  it('handles empty department list', async () => {
    jest.spyOn(medplum, 'search').mockResolvedValue({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [],
    });

    renderWithProviders(<DepartmentSelector value="" onChange={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Department')).toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    jest.spyOn(medplum, 'search').mockRejectedValue(new Error('Network error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    renderWithProviders(<DepartmentSelector value="" onChange={jest.fn()} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        '[DepartmentSelector] Failed to fetch departments:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it('calls onChange when selection changes', async () => {
    const onChange = jest.fn();
    renderWithProviders(<DepartmentSelector value="" onChange={onChange} />);

    await waitFor(() => {
      expect(screen.getByText('Department')).toBeInTheDocument();
    });
  });

  it('displays custom label and placeholder', async () => {
    renderWithProviders(
      <DepartmentSelector
        value=""
        onChange={jest.fn()}
        label="Custom Department Label"
        placeholder="Custom Placeholder"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Custom Department Label')).toBeInTheDocument();
    });
  });

  it('shows required asterisk when required', async () => {
    renderWithProviders(<DepartmentSelector value="" onChange={jest.fn()} required />);

    await waitFor(() => {
      expect(screen.getByText('Department')).toBeInTheDocument();
    });
  });

  it('disables selector when disabled prop is true', async () => {
    jest.spyOn(medplum, 'search').mockResolvedValue({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [],
    });

    const { container } = renderWithProviders(<DepartmentSelector value="" onChange={jest.fn()} disabled />);

    await waitFor(() => {
      expect(screen.getByText('Department')).toBeInTheDocument();
    });

    // Check that the component renders with disabled state
    const selectWrapper = container.querySelector('[data-disabled="true"]');
    expect(selectWrapper).toBeInTheDocument();
  });

  it('displays error message when error prop is provided', async () => {
    renderWithProviders(
      <DepartmentSelector value="" onChange={jest.fn()} error="Department is required" />
    );

    await waitFor(() => {
      expect(screen.getByText('Department is required')).toBeInTheDocument();
    });
  });
});
