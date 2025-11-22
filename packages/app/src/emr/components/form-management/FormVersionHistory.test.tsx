// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderWithProviders, screen, fireEvent } from '../../test-utils';
import { FormVersionHistory } from './FormVersionHistory';
import type { VersionHistoryEntry } from '../../services/formBuilderService';

const mockHistory: VersionHistoryEntry[] = [
  {
    versionId: '3',
    version: '2.1',
    date: '2025-11-20T10:00:00Z',
    status: 'active',
    title: 'Patient Consent Form',
    modifiedBy: 'Dr. Smith',
  },
  {
    versionId: '2',
    version: '2.0',
    date: '2025-11-15T09:00:00Z',
    status: 'active',
    title: 'Patient Consent Form',
    modifiedBy: 'Dr. Smith',
  },
  {
    versionId: '1',
    version: '1.0',
    date: '2025-11-10T08:00:00Z',
    status: 'draft',
    title: 'Patient Consent Form',
  },
];

describe('FormVersionHistory', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
    onClose.mockClear();
  });

  it('renders modal when opened', () => {
    renderWithProviders(
      <FormVersionHistory
        opened={true}
        onClose={onClose}
        title="Patient Consent Form"
        history={mockHistory}
      />
    );
    expect(screen.getByTestId('version-history-modal')).toBeInTheDocument();
  });

  it('does not show modal content when closed', () => {
    renderWithProviders(
      <FormVersionHistory
        opened={false}
        onClose={onClose}
        title="Patient Consent Form"
        history={mockHistory}
      />
    );
    // When closed, the modal body/table should not be visible
    expect(screen.queryByTestId('version-history-table')).not.toBeInTheDocument();
  });

  it('renders form title', () => {
    renderWithProviders(
      <FormVersionHistory
        opened={true}
        onClose={onClose}
        title="Patient Consent Form"
        history={mockHistory}
      />,
      { initialLanguage: 'en' }
    );
    expect(screen.getByText(/Patient Consent Form/)).toBeInTheDocument();
  });

  it('renders version history table', () => {
    renderWithProviders(
      <FormVersionHistory
        opened={true}
        onClose={onClose}
        title="Patient Consent Form"
        history={mockHistory}
      />
    );
    expect(screen.getByTestId('version-history-table')).toBeInTheDocument();
  });

  it('renders all version entries', () => {
    renderWithProviders(
      <FormVersionHistory
        opened={true}
        onClose={onClose}
        title="Patient Consent Form"
        history={mockHistory}
      />
    );
    expect(screen.getByText('v2.1')).toBeInTheDocument();
    expect(screen.getByText('v2.0')).toBeInTheDocument();
    expect(screen.getByText('v1.0')).toBeInTheDocument();
  });

  it('marks first entry as current', () => {
    renderWithProviders(
      <FormVersionHistory
        opened={true}
        onClose={onClose}
        title="Patient Consent Form"
        history={mockHistory}
      />,
      { initialLanguage: 'en' }
    );
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('renders modified by information', () => {
    renderWithProviders(
      <FormVersionHistory
        opened={true}
        onClose={onClose}
        title="Patient Consent Form"
        history={mockHistory}
      />
    );
    expect(screen.getAllByText('Dr. Smith').length).toBeGreaterThan(0);
  });

  it('shows loading skeleton when loading', () => {
    renderWithProviders(
      <FormVersionHistory
        opened={true}
        onClose={onClose}
        title="Patient Consent Form"
        history={[]}
        loading={true}
      />
    );
    expect(screen.queryByTestId('version-history-table')).not.toBeInTheDocument();
  });

  it('shows empty state when no versions', () => {
    renderWithProviders(
      <FormVersionHistory
        opened={true}
        onClose={onClose}
        title="Patient Consent Form"
        history={[]}
      />,
      { initialLanguage: 'en' }
    );
    expect(screen.getByText('No version history available')).toBeInTheDocument();
  });

  it('shows total versions count', () => {
    renderWithProviders(
      <FormVersionHistory
        opened={true}
        onClose={onClose}
        title="Patient Consent Form"
        history={mockHistory}
      />,
      { initialLanguage: 'en' }
    );
    expect(screen.getByText('3 version(s)')).toBeInTheDocument();
  });

  it('calls onViewVersion when view button is clicked', () => {
    const onViewVersion = jest.fn();
    renderWithProviders(
      <FormVersionHistory
        opened={true}
        onClose={onClose}
        title="Patient Consent Form"
        history={mockHistory}
        onViewVersion={onViewVersion}
      />
    );

    fireEvent.click(screen.getByTestId('view-version-3'));
    expect(onViewVersion).toHaveBeenCalledWith('3');
  });

  it('renders with Georgian translations', () => {
    renderWithProviders(
      <FormVersionHistory
        opened={true}
        onClose={onClose}
        title="Patient Consent Form"
        history={mockHistory}
      />,
      { initialLanguage: 'ka' }
    );
    expect(screen.getByText('ვერსიების ისტორია')).toBeInTheDocument();
    expect(screen.getByText('მიმდინარე')).toBeInTheDocument();
  });

  it('renders with Russian translations', () => {
    renderWithProviders(
      <FormVersionHistory
        opened={true}
        onClose={onClose}
        title="Patient Consent Form"
        history={mockHistory}
      />,
      { initialLanguage: 'ru' }
    );
    expect(screen.getByText('История версий')).toBeInTheDocument();
    expect(screen.getByText('Текущая')).toBeInTheDocument();
  });
});
