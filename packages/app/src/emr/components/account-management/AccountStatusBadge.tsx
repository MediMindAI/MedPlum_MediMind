/**
 * AccountStatusBadge Component
 *
 * Displays account active/inactive status with color coding
 */

import { Badge } from '@mantine/core';
import { useTranslation } from '../../hooks/useTranslation';

interface AccountStatusBadgeProps {
  active: boolean;
}

/**
 * Badge component showing account status with appropriate color
 *
 * @param active - Whether the account is active
 * @returns Badge component with status text and color
 *
 * @example
 * <AccountStatusBadge active={true} />  // Green "აქტიური"
 * <AccountStatusBadge active={false} /> // Red "არააქტიური"
 */
export function AccountStatusBadge({ active }: AccountStatusBadgeProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <Badge color={active ? 'green' : 'red'} variant="filled" size="sm">
      {active ? t('accountManagement.status.active') : t('accountManagement.status.inactive')}
    </Badge>
  );
}
