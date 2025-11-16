// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { MedplumClient } from '@medplum/core';
import { DrAliceSmith, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react';
import crypto from 'crypto';
import { MemoryRouter } from 'react-router';
import { TextEncoder } from 'util';
import { AppRoutes } from './AppRoutes';
import { getConfig } from './config';
import { act, fireEvent, render, screen } from './test-utils/render';

// logged out
const medplum = new MockClient({ profile: null });

describe('SignInPage', () => {
  function setup(url = '/signin', medplumClient: MedplumClient = medplum): void {
    render(
      <MemoryRouter initialEntries={[url]} initialIndex={0}>
        <MedplumProvider medplum={medplumClient}>
          <AppRoutes />
        </MedplumProvider>
      </MemoryRouter>
    );
  }

  beforeAll(() => {
    Object.defineProperty(global, 'TextEncoder', {
      value: TextEncoder,
    });

    Object.defineProperty(global.self, 'crypto', {
      value: crypto.webcrypto,
    });
  });

  function expectSigninPageRendered(): void {
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  }

  test('Renders', async () => {
    setup();

    expectSigninPageRendered();
  });

  test('Success', async () => {
    setup();

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'admin@example.com' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    });

    // Now redirects to /emr which redirects to /emr/registration
    expect(await screen.findByText('MediMind')).toBeInTheDocument();
  });

  test('Forgot password', async () => {
    setup();

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'admin@example.com' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Forgot password'));
    });
  });

  test('Register enabled', async () => {
    getConfig().registerEnabled = true;
    setup();

    await act(async () => {
      fireEvent.click(screen.getByText('Register'));
    });
  });

  test('Register disabled', async () => {
    getConfig().registerEnabled = false;
    setup();

    expectSigninPageRendered();
    expect(screen.queryByText('Register')).not.toBeInTheDocument();
  });

  test('Redirect to next after login', async () => {
    setup('/signin?next=/batch');

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'admin@example.com' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    });

    expect(await screen.findByText('Batch Create')).toBeInTheDocument();
  });

  test('Redirects to homepage after login if bad next', async () => {
    setup('/signin?next=https%3A%2F%2Fevil.com');

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'admin@example.com' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'password' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    });

    // should redirect to /emr (which redirects to /emr/registration)
    expect(await screen.findByText('MediMind')).toBeInTheDocument();
  });

  test('Does NOT automatically redirect to next if logged in and next NOT present', async () => {
    setup('/signin', new MockClient({ profile: DrAliceSmith }));

    expectSigninPageRendered();
  });

  test('Automatically redirects to next if logged in and next present', async () => {
    setup('/signin?next=/batch', new MockClient({ profile: DrAliceSmith }));

    expect(await screen.findByText('Batch Create')).toBeInTheDocument();
  });

  test('Automatically redirects to homepage if logged with bad next', async () => {
    setup('/signin?next=https%3A%2F%2Fevil.com', new MockClient({ profile: DrAliceSmith }));

    // should redirect to /emr (which redirects to /emr/registration)
    // The sign in page should no longer be visible
    await act(async () => {
      // Wait for navigation to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument();
  });
});
