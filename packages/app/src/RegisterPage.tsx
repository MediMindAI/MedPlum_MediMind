// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Alert } from '@mantine/core';
import { RegisterForm, useMedplum } from '@medplum/react';
import { IconAlertCircle } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AuthLayout } from './components/AuthLayout';
import { getConfig, isRegisterEnabled } from './config';

export function RegisterPage(): JSX.Element | null {
  const medplum = useMedplum();
  const navigate = useNavigate();
  const config = getConfig();

  useEffect(() => {
    if (medplum.getProfile()) {
      navigate('/signin?project=new')?.catch(console.error);
    }
  }, [medplum, navigate]);

  if (!isRegisterEnabled()) {
    return (
      <AuthLayout title="Registration Disabled" subtitle="New account creation is not available">
        <Alert icon={<IconAlertCircle size={16} />} title="New projects disabled" color="red">
          New projects are disabled on this server.
        </Alert>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join MediMind to manage your healthcare data"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/signin"
    >
      <RegisterForm
        type="project"
        projectId="new"
        onSuccess={() => {
          // Use window.location.href to force a reload
          // Otherwise we get caught in a React render loop
          window.location.href = '/';
        }}
        googleClientId={config.googleClientId}
        recaptchaSiteKey={config.recaptchaSiteKey}
      />
    </AuthLayout>
  );
}
