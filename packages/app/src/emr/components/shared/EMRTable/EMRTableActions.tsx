/**
 * EMRTableActions - Combined action pattern for EMRTable
 * Primary action visible as icon button, secondary actions in dropdown menu
 */

import React from 'react';
import { ActionIcon, Menu, Tooltip, Loader } from '@mantine/core';
import { IconDots } from '@tabler/icons-react';
import { EMRTableActions as ActionsConfig, EMRTableAction } from './EMRTableTypes';

interface EMRTableActionsProps<T> {
  row: T;
  actions: ActionsConfig<T>;
}

export function EMRTableActions<T>({ row, actions }: EMRTableActionsProps<T>): JSX.Element {
  const { primary, secondary = [] } = actions;

  // Filter visible secondary actions
  const visibleSecondary = secondary.filter((action) => {
    if (typeof action.visible === 'function') {
      return action.visible(row);
    }
    return action.visible !== false;
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
      }}
    >
      {/* Primary Action - Always Visible */}
      {primary && <PrimaryActionButton row={row} action={primary} />}

      {/* Secondary Actions - Dropdown Menu */}
      {visibleSecondary.length > 0 && (
        <Menu position="bottom-end" withinPortal shadow="md">
          <Menu.Target>
            <Tooltip label="More actions" position="top" withArrow>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                radius="sm"
                style={{
                  transition: 'var(--emr-transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--emr-table-action-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <IconDots size={16} />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>

          <Menu.Dropdown>
            {visibleSecondary.map((action, index) => (
              <SecondaryActionItem key={index} row={row} action={action} />
            ))}
          </Menu.Dropdown>
        </Menu>
      )}
    </div>
  );
}

/**
 * Primary action button (always visible)
 */
function PrimaryActionButton<T>({
  row,
  action,
}: {
  row: T;
  action: EMRTableAction<T>;
}): JSX.Element | null {
  const Icon = action.icon;
  const isDisabled =
    typeof action.disabled === 'function' ? action.disabled(row) : action.disabled;
  const isVisible =
    typeof action.visible === 'function' ? action.visible(row) : action.visible !== false;

  if (!isVisible) return null;

  const colorMap: Record<string, string> = {
    blue: '#3b82f6',
    green: '#10b981',
    red: '#ef4444',
    yellow: '#f59e0b',
    gray: '#6b7280',
  };

  const hoverColorMap: Record<string, string> = {
    blue: 'rgba(59, 130, 246, 0.1)',
    green: 'rgba(16, 185, 129, 0.1)',
    red: 'rgba(239, 68, 68, 0.1)',
    yellow: 'rgba(245, 158, 11, 0.1)',
    gray: 'rgba(107, 114, 128, 0.1)',
  };

  const color = action.color || 'blue';
  const iconColor = colorMap[color];
  const hoverBg = hoverColorMap[color];

  return (
    <Tooltip label={action.label} position="top" withArrow>
      <ActionIcon
        variant="subtle"
        size="sm"
        radius="sm"
        disabled={isDisabled}
        onClick={(e) => {
          e.stopPropagation();
          action.onClick(row);
        }}
        style={{
          color: isDisabled ? 'var(--emr-gray-400)' : iconColor,
          transition: 'var(--emr-transition-fast)',
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = hoverBg;
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {action.loading ? <Loader size={14} /> : <Icon size={16} stroke={1.5} />}
      </ActionIcon>
    </Tooltip>
  );
}

/**
 * Secondary action menu item
 */
function SecondaryActionItem<T>({
  row,
  action,
}: {
  row: T;
  action: EMRTableAction<T>;
}): JSX.Element {
  const Icon = action.icon;
  const isDisabled =
    typeof action.disabled === 'function' ? action.disabled(row) : action.disabled;

  return (
    <Menu.Item
      leftSection={
        action.loading ? (
          <Loader size={14} />
        ) : (
          <Icon size={14} stroke={1.5} />
        )
      }
      color={action.color === 'red' ? 'red' : undefined}
      disabled={isDisabled}
      onClick={(e) => {
        e.stopPropagation();
        action.onClick(row);
      }}
      style={{
        fontSize: 'var(--emr-font-sm)',
      }}
    >
      {action.label}
    </Menu.Item>
  );
}

export default EMRTableActions;
