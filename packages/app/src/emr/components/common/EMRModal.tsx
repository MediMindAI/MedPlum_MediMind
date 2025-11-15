// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, Box, Title, Group, ActionIcon, ScrollArea } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { ReactNode } from 'react';

export interface EMRModalProps {
  /** Whether the modal is opened */
  opened: boolean;
  /** Function to call when modal should close */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Modal content */
  children: ReactNode;
  /** Modal size - xs, sm, md, lg, xl, or percentage */
  size?: string | number;
  /** Whether to show close button */
  withCloseButton?: boolean;
  /** Whether clicking overlay should close modal */
  closeOnClickOutside?: boolean;
  /** Whether pressing escape should close modal */
  closeOnEscape?: boolean;
  /** Custom padding */
  padding?: string | number;
  /** Maximum height for scrollable content */
  maxHeight?: string | number;
  /** Custom z-index */
  zIndex?: number;
  /** Additional styles for modal */
  styles?: any;
}

/**
 * Reusable EMR Modal Component
 *
 * A beautiful, production-ready modal with:
 * - Gradient header with turquoise theme
 * - Close button in header
 * - Scrollable content area
 * - Consistent styling across the app
 * - Customizable size and behavior
 *
 * @example
 * ```tsx
 * <EMRModal
 *   opened={opened}
 *   onClose={() => setOpened(false)}
 *   title="პაციენტის რედაქტირება"
 *   size="xl"
 * >
 *   <YourFormContent />
 * </EMRModal>
 * ```
 */
export function EMRModal({
  opened,
  onClose,
  title,
  children,
  size = 'lg',
  withCloseButton = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  padding = 'md',
  maxHeight = 'calc(100vh - 120px)',
  zIndex = 1000,
  styles,
}: EMRModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={size}
      closeOnClickOutside={closeOnClickOutside}
      closeOnEscape={closeOnEscape}
      withCloseButton={false}
      padding={0}
      zIndex={zIndex}
      styles={{
        content: {
          borderRadius: 'var(--emr-border-radius-lg)',
          overflow: 'hidden',
        },
        ...styles,
      }}
    >
      {/* Modal Header with Gradient */}
      <Box
        style={{
          background: 'linear-gradient(90deg, #2b6cb0 0%, #3182ce 50%, #4299e1 100%)',
          padding: '16px 24px',
          position: 'relative',
        }}
      >
        <Group justify="space-between" align="center">
          <Title
            order={3}
            style={{
              color: 'white',
              fontSize: '20px',
              fontWeight: 600,
              margin: 0,
            }}
          >
            {title}
          </Title>
          {withCloseButton && (
            <ActionIcon
              variant="transparent"
              onClick={onClose}
              size="lg"
              style={{
                color: 'white',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <IconX size={20} />
            </ActionIcon>
          )}
        </Group>
      </Box>

      {/* Modal Content - Scrollable */}
      <ScrollArea style={{ maxHeight }} p={padding}>
        {children}
      </ScrollArea>
    </Modal>
  );
}
