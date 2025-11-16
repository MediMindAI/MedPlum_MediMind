// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { SignInForm, useMedplumProfile } from '@medplum/react';
import type { JSX } from 'react';
import { useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AuthLayout } from './components/AuthLayout';
import { getConfig, isRegisterEnabled } from './config';

export function SignInPage(): JSX.Element {
  const profile = useMedplumProfile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const config = getConfig();

  const navigateToNext = useCallback(() => {
    // only redirect to next if it is a pathname to avoid redirecting
    // to a maliciously crafted URL, e.g. /signin?next=https%3A%2F%2Fevil.com
    const nextUrl = searchParams.get('next');
    navigate(nextUrl?.startsWith('/') ? nextUrl : '/emr')?.catch(console.error);
  }, [searchParams, navigate]);

  useEffect(() => {
    if (profile && searchParams.has('next')) {
      navigateToNext();
    }
  }, [profile, searchParams, navigateToNext]);

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your medical records"
      footerText="Don't have an account?"
      footerLinkText={isRegisterEnabled() ? 'Create one' : undefined}
      footerLinkHref={isRegisterEnabled() ? '/register' : undefined}
    >
      <SignInForm
        onSuccess={() => navigateToNext()}
        onForgotPassword={() => navigate('/resetpassword')?.catch(console.error)}
        onRegister={isRegisterEnabled() ? () => navigate('/register')?.catch(console.error) : undefined}
        googleClientId={config.googleClientId}
        login={searchParams.get('login') || undefined}
        projectId={searchParams.get('project') || undefined}
      >
        {searchParams.get('project') === 'new' && (
          <div style={{ marginBottom: '16px', color: 'var(--emr-text-secondary)', fontSize: '14px' }}>
            Sign in again to create a new project
          </div>
        )}
      </SignInForm>
    </AuthLayout>
  );
}
