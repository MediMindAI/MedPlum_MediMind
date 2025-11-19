# R8: Email Service Integration for Account Notifications

## Decision

Medplum provides a flexible email service with built-in support for **AWS SES** and **SMTP**, configured via environment variables or JSON config. The service uses **nodemailer** for email composition and supports password reset, email verification, and custom email sending. Email is **optional** and can be disabled (default in tests), with a fallback mechanism that logs when email service is unavailable.

## Email Service Availability

Medplum includes three email provider options:

### 1. **AWS SES (Recommended for Cloud)**
- Uses AWS SDK v3 `SESv2Client` for sending emails
- Configuration via environment variables: `MEDPLUM_EMAIL_PROVIDER=awsses`
- Requires AWS credentials and proper IAM permissions
- Located in: `packages/server/src/cloud/aws/email.ts`

### 2. **SMTP (Recommended for Self-Hosted)**
- Supports any SMTP-compatible email service (Gmail, SendGrid, Mailgun, etc.)
- Configuration via environment variables with `MEDPLUM_SMTP_*` prefix
- More flexible than AWS SES for non-AWS deployments
- Located in: `packages/server/src/email/email.ts`

### 3. **None (Default)**
- Default provider in test and development environments
- Email service is disabled when `emailProvider = 'none'`
- Gracefully handles email sending with logged errors

## Email Configuration

### SMTP Configuration

**Environment Variables:**
```bash
# Specify SMTP as the email provider
MEDPLUM_EMAIL_PROVIDER=smtp

# SMTP server details
MEDPLUM_SMTP_HOST=smtp.gmail.com
MEDPLUM_SMTP_PORT=587
MEDPLUM_SMTP_USERNAME=your-email@gmail.com
MEDPLUM_SMTP_PASSWORD=your-app-password

# Support email address (required for all providers)
MEDPLUM_SUPPORT_EMAIL="MediMind Support <support@medimind.ge>"

# Optional: Approved sender emails (comma-separated)
MEDPLUM_APPROVED_SENDER_EMAILS=support@medimind.ge,noreply@medimind.ge
```

**Configuration File (medplum.config.json):**
```json
{
  "emailProvider": "smtp",
  "smtp": {
    "host": "smtp.gmail.com",
    "port": 587,
    "username": "your-email@gmail.com",
    "password": "your-app-password"
  },
  "supportEmail": "\"MediMind Support\" <support@medimind.ge>",
  "approvedSenderEmails": "support@medimind.ge,noreply@medimind.ge"
}
```

### AWS SES Configuration

**Environment Variables:**
```bash
MEDPLUM_EMAIL_PROVIDER=awsses
MEDPLUM_AWS_REGION=eu-west-1  # or your preferred region
MEDPLUM_SUPPORT_EMAIL="MediMind Support <support@medimind.ge>"
```

**Configuration File (medplum.config.json):**
```json
{
  "emailProvider": "awsses",
  "awsRegion": "eu-west-1",
  "supportEmail": "\"MediMind Support\" <support@medimind.ge>"
}
```

## Sending Welcome Emails

### Basic Email Sending Pattern

```typescript
import { sendEmail } from '../email/email';
import { getSystemRepo } from '../fhir/repo';
import type Mail from 'nodemailer/lib/mailer';

async function sendWelcomeEmail(userEmail: string, userName: string, activationUrl: string): Promise<void> {
  const systemRepo = getSystemRepo();

  const options: Mail.Options = {
    to: userEmail,
    subject: 'Welcome to MediMind - Activate Your Account',
    html: `
      <h1>Welcome to MediMind, ${userName}!</h1>
      <p>Your account has been created successfully.</p>
      <p>Please click the link below to activate your account:</p>
      <a href="${activationUrl}">Activate Your Account</a>
      <p>This link will expire in 24 hours.</p>
      <hr/>
      <p>Thank you,<br/>MediMind Team</p>
    `,
    text: [
      `Welcome to MediMind, ${userName}!`,
      '',
      'Your account has been created successfully.',
      '',
      'Please click the link below to activate your account:',
      activationUrl,
      '',
      'This link will expire in 24 hours.',
      '',
      'Thank you,',
      'MediMind Team',
    ].join('\n'),
  };

  await sendEmail(systemRepo, options);
}
```

### Full Invite Flow with Email (From Codebase)

```typescript
// From packages/server/src/admin/invite.ts
export async function inviteUser(request: ServerInviteRequest): Promise<ServerInviteResponse> {
  const systemRepo = getSystemRepo();

  // 1. Create User resource
  const userResource = await makeUserResource(request);
  let user: WithId<User>;

  if (request.email) {
    const searchRequest: SearchRequest<User> = {
      resourceType: 'User',
      filters: [
        {
          code: 'email',
          operator: Operator.EXACT,
          value: request.email,
        },
      ],
    };

    const { resource: result, outcome } = await systemRepo.conditionalCreate(userResource, searchRequest);
    user = result;
  } else {
    user = await systemRepo.createResource(userResource);
  }

  // 2. Generate password reset URL (used as activation link for new users)
  let passwordResetUrl: string | undefined;
  if (!existingUser) {
    passwordResetUrl = await resetPassword(user, 'invite');
  }

  // 3. Send email if requested
  if (request.email && request.sendEmail !== false) {
    await sendInviteEmail(systemRepo, request, user, existingUser, passwordResetUrl);
  }

  return { user, profile, membership };
}

async function sendInviteEmail(
  systemRepo: Repository,
  request: ServerInviteRequest,
  user: User,
  existing: boolean,
  resetPasswordUrl: string | undefined
): Promise<void> {
  const options: Mail.Options = { to: user.email };

  if (existing) {
    // Existing user - no activation link needed
    options.subject = `Medplum: Welcome to ${request.project.name}`;
    options.text = [
      `You were invited to ${request.project.name}`,
      '',
      `The next time you sign in, you will see ${request.project.name} as an option.`,
      '',
      `You can sign in here: ${getConfig().appBaseUrl}signin`,
      '',
      'Thank you,',
      'Medplum',
      '',
    ].join('\n');
  } else {
    // New user - include activation link
    options.subject = 'Welcome to Medplum';
    options.text = [
      `You were invited to ${request.project.name}`,
      '',
      'Please click on the following link to create your account:',
      '',
      resetPasswordUrl, // This is the activation URL
      '',
      'Thank you,',
      'Medplum',
      '',
    ].join('\n');
  }

  try {
    await sendEmail(systemRepo, options);
  } catch (err) {
    // Handle email failure gracefully
    throw new OperationOutcomeError({
      resourceType: 'OperationOutcome',
      id: allOk.id,
      issue: [
        {
          severity: 'error',
          code: 'exception',
          details: {
            text: 'Could not send email. Make sure you have email service configured.',
          },
          diagnostics: normalizeErrorString(err),
        },
      ],
    });
  }
}
```

## Email Templates

### 1. **Account Invitation Email** (Built-in)
**File**: `packages/server/src/admin/invite.ts`
- **For new users**: Includes activation link (password reset URL)
- **For existing users**: Simple welcome message with login link
- **Subject**: "Welcome to Medplum" (new) or "Medplum: Welcome to [Project]" (existing)

### 2. **Password Reset Email** (Built-in)
**File**: `packages/server/src/auth/resetpassword.ts`
- **Purpose**: Self-service password reset
- **Subject**: "Medplum Password Reset"
- **Content**: Instructions + password reset link
- **Link pattern**: `{appBaseUrl}/setpassword/{id}/{secret}`

### 3. **Email Verification** (Built-in)
**File**: `packages/server/src/auth/verifyemail.ts`
- **Purpose**: Email address verification for security
- **Type**: `verify-email` in UserSecurityRequest
- **Pattern**: Similar to password reset with separate endpoint

### Customizing Email Templates

**Option 1: HTML Emails (Recommended)**
```typescript
const options: Mail.Options = {
  to: userEmail,
  subject: 'Your Subject Here',
  html: `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h1>Welcome to MediMind</h1>
        <p>Your activation link:</p>
        <a href="${activationUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Activate Account
        </a>
      </body>
    </html>
  `,
  text: 'Fallback text version here...',
};
```

**Option 2: Using Template Libraries**
Medplum supports any Node.js template engine (handlebars, EJS, etc.) via custom bots.

**Option 3: Custom Email via Bot**
Create a bot that listens to User creation events and sends custom emails.

## Fallback Strategy

### What Happens When Email Fails

1. **Email Configuration Missing**
   - Status code: HTTP 200 + OperationOutcome
   - Message: "Could not send email. Make sure you have AWS SES/SMTP set up."
   - User can still proceed with account (by design)

2. **SMTP Connection Fails**
   - Error logged to console/logs
   - Response returns success (OperationOutcome with error details)
   - User receives the response but not the email

3. **Email Service Disabled** (`emailProvider: 'none'`)
   - Sends email gracefully skipped
   - No error thrown (silent skip)
   - User can still activate account via direct link

### UI-Based Activation Link Display

When email fails or email service is disabled, display the activation URL directly in the UI:

```typescript
// After successful user creation
const { user, membership } = await inviteUser(inviteRequest);

// If email failed or email is disabled
const activationUrl = await resetPassword(user, 'invite');

// Return activation URL in response for display
return {
  success: true,
  message: 'User created. Email could not be sent.',
  activationUrl, // Display this to admin
  user: {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  },
};
```

### Safe Link Display for Admins

```typescript
// In admin UI component
if (activationUrl) {
  return (
    <Alert color="warning">
      <p>Email could not be sent. Share this link with the user:</p>
      <CopyableLink url={activationUrl} />
      <p>This link will expire in 24 hours.</p>
    </Alert>
  );
}
```

## Implementation Pattern

### Complete Account Activation Flow

```typescript
import { sendEmail } from '../email/email';
import { resetPassword } from '../auth/resetpassword';
import { getSystemRepo } from '../fhir/repo';
import { getConfig } from '../config/loader';

async function sendAccountActivationEmail(
  user: WithId<User>,
  projectName: string
): Promise<{ success: boolean; activationUrl?: string; error?: string }> {
  try {
    const systemRepo = getSystemRepo();
    const config = getConfig();

    // Generate activation link (valid for 24 hours)
    const activationUrl = await resetPassword(user, 'invite');

    // Prepare email
    const options: Mail.Options = {
      to: user.email,
      subject: `Welcome to ${projectName} - Activate Your Account`,
      html: `
        <html style="font-family: Arial, sans-serif;">
          <body>
            <div style="max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Welcome to ${projectName}</h2>

              <p>Hello ${user.firstName} ${user.lastName},</p>

              <p>Your account has been created successfully. Please click the button below to activate your account:</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${activationUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                  Activate Account
                </a>
              </div>

              <p style="color: #666; font-size: 14px;">
                If the button doesn't work, copy and paste this link in your browser:
                <br/>
                <code style="background: #f5f5f5; padding: 5px; word-break: break-all;">${activationUrl}</code>
              </p>

              <p style="color: #999; font-size: 12px;">
                This link will expire in 24 hours. If you didn't request this account, please ignore this email.
              </p>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />

              <p style="color: #666; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} ${projectName}. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
      text: [
        `Welcome to ${projectName}`,
        '',
        `Hello ${user.firstName} ${user.lastName},`,
        '',
        'Your account has been created successfully.',
        'Please click the link below to activate your account:',
        '',
        activationUrl,
        '',
        'This link will expire in 24 hours.',
        'If you didn\'t request this account, please ignore this email.',
        '',
        `© ${new Date().getFullYear()} ${projectName}`,
      ].join('\n'),
    };

    // Send email
    if (config.emailProvider !== 'none') {
      await sendEmail(systemRepo, options);
      return { success: true, activationUrl };
    } else {
      // Email disabled - return URL for manual sharing
      return {
        success: false,
        activationUrl,
        error: 'Email service is disabled. Share this link with the user manually.',
      };
    }
  } catch (err) {
    // Log error and return fallback
    const error = normalizeErrorString(err);
    getLogger().error('Failed to send account activation email', { error });

    return {
      success: false,
      error: 'Email could not be sent. Administrator can provide activation link manually.',
    };
  }
}
```

## Rationale

**Why Medplum's Email Service is Ideal:**

1. **Flexibility**: Supports AWS SES (scalable, pay-per-use) and SMTP (any provider)
2. **Security**: Uses nodemailer with proper validation and attachment security
3. **Graceful Degradation**: Doesn't break the app if email is unavailable
4. **Production-Ready**: Handles common email failures with proper error reporting
5. **FHIR Integration**: Supports attaching Binary resources to emails
6. **Multi-Project Support**: Different email configurations per deployment
7. **Feature Control**: Email is opt-in via project features flag

**For MediMind specifically:**

- **Self-hosted deployment** in Georgia should use SMTP configuration
- Recommend **SendGrid, Mailgun, or Yandex Mail** for SMTP (widely available in Georgia)
- Keep **email optional** during development (set to `'none'`)
- Provide **activation URL fallback** in admin UI when email fails
- Store **audit trail** of email attempts via BullMQ jobs

## References

**Files Examined:**
- `/packages/server/src/email/email.ts` - Main email service (104 lines)
- `/packages/server/src/email/utils.ts` - Email utilities and address handling (101 lines)
- `/packages/server/src/email/routes.ts` - Email API endpoint (35 lines)
- `/packages/server/src/cloud/aws/email.ts` - AWS SES integration (50 lines)
- `/packages/server/src/admin/invite.ts` - Invite flow with email (362 lines, sendInviteEmail fn at line 303)
- `/packages/server/src/auth/resetpassword.ts` - Password reset with email (122 lines)
- `/packages/server/src/auth/verifyemail.ts` - Email verification flow (67 lines)
- `/packages/server/src/config/types.ts` - Email config types (MedplumSmtpConfig, emailProvider)
- `/packages/server/medplum.config.json` - Example configuration (38 lines)

**Key Classes & Functions:**
- `sendEmail(repo, options)` - Main function for sending emails
- `sendEmailViaSes(options)` - AWS SES implementation
- `sendEmailViaSmtp(config, options)` - SMTP implementation
- `resetPassword(user, type)` - Creates activation/reset link
- `inviteUser(request)` - Full invite flow with optional email
- `getConfig()` - Access configuration at runtime

**Medplum Documentation:**
- Official: https://www.medplum.com/docs/self-hosted/configure-email
- Email API: https://www.medplum.com/docs/api/fhir/operations/email-send
- Bots & Email: https://www.medplum.com/docs/bots/basics

