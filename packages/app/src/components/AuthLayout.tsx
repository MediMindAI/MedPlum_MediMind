import { IconCheck, IconLock, IconShieldCheck } from '@tabler/icons-react';
import type { JSX, ReactNode } from 'react';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthLayoutProps): JSX.Element {
  return (
    <div className={styles.authContainer}>
      {/* Left Panel - Hero Section */}
      <div className={styles.heroPanel}>
        <div className={styles.heroContent}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M12 8V16M8 12H16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className={styles.brandName}>MediMind</h1>
            <p className={styles.tagline}>Electronic Medical Records System</p>
          </div>

          <div className={styles.trustIndicators}>
            <div className={styles.trustBadge}>
              <IconShieldCheck className={styles.trustBadgeIcon} stroke={1.5} />
              <span className={styles.trustBadgeText}>FHIR R4 Compliant</span>
            </div>
            <div className={styles.trustBadge}>
              <IconCheck className={styles.trustBadgeIcon} stroke={1.5} />
              <span className={styles.trustBadgeText}>Powered by Medplum</span>
            </div>
          </div>

          <div className={styles.securityNote}>
            <IconLock className={styles.securityIcon} stroke={1.5} />
            <span>Secure Healthcare Platform</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Section */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>{title}</h2>
            {subtitle && <p className={styles.formSubtitle}>{subtitle}</p>}
          </div>

          <div className={styles.formWrapper}>{children}</div>

          {footerText && (
            <div className={styles.footer}>
              {footerText}{' '}
              {footerLinkText && footerLinkHref && (
                <a href={footerLinkHref} className={styles.footerLink}>
                  {footerLinkText}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
