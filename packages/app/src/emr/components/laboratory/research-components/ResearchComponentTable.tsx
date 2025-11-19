/**
 * Research Component Table
 *
 * Displays 7-column table of laboratory test parameters.
 */

import React from 'react';
import { Table, ActionIcon, Text, Skeleton, Box, Stack, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash, IconFolder } from '@tabler/icons-react';
import type { ObservationDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';
import { extractResearchComponentFormValues } from '../../../services/researchComponentService';

interface ResearchComponentTableProps {
  /** Array of components to display */
  components: ObservationDefinition[];
  /** Edit handler */
  onEdit?: (component: ObservationDefinition) => void;
  /** Delete handler */
  onDelete?: (component: ObservationDefinition) => void;
  /** Loading state */
  loading?: boolean;
}

/**
 * Table displaying research components with 7 columns
 */
export function ResearchComponentTable({
  components,
  onEdit,
  onDelete,
  loading = false,
}: ResearchComponentTableProps): JSX.Element {
  const { t } = useTranslation();

  /**
   * Loading skeleton
   */
  if (loading) {
    return (
      <Box style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Table style={{ minWidth: '1000px' }}>
          <Table.Thead
            style={{
              background: 'var(--emr-gradient-submenu)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <Table.Tr>
              <Table.Th
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '16px 20px',
                  borderBottom: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {t('laboratory.components.fields.code')}
              </Table.Th>
              <Table.Th
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '16px 20px',
                  borderBottom: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {t('laboratory.components.fields.gisCode')}
              </Table.Th>
              <Table.Th
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '16px 20px',
                  borderBottom: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {t('laboratory.components.fields.name')}
              </Table.Th>
              <Table.Th
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '16px 20px',
                  borderBottom: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {t('laboratory.components.fields.type')}
              </Table.Th>
              <Table.Th
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '16px 20px',
                  borderBottom: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {t('laboratory.components.fields.unit')}
              </Table.Th>
              <Table.Th
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '16px 20px',
                  borderBottom: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {t('laboratory.components.fields.department')}
              </Table.Th>
              <Table.Th
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '16px 20px',
                  textAlign: 'center',
                  borderBottom: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {t('common.actions')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {[...Array(5)].map((_, i) => (
              <Table.Tr key={i}>
                {[...Array(7)].map((_, j) => (
                  <Table.Td key={j} style={{ padding: '16px 20px' }}>
                    <Skeleton height={20} />
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    );
  }

  /**
   * Empty state
   */
  if (components.length === 0) {
    return (
      <Box
        style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'linear-gradient(to bottom, #f8f9fa, white)',
          borderRadius: '8px',
        }}
      >
        <Stack align="center" gap="md">
          <IconFolder
            size={64}
            style={{
              color: 'var(--emr-secondary, #2b6cb0)',
              opacity: 0.3,
            }}
          />
          <Text size="lg" fw={600} c="dimmed">
            {t('laboratory.components.empty')}
          </Text>
          <Text size="sm" c="dimmed" maw={400}>
            სცადეთ ფილტრების გასუფთავება ან დაამატეთ ახალი კომპონენტი
          </Text>
        </Stack>
      </Box>
    );
  }

  /**
   * Main table
   */
  return (
    <Box style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <Table
        style={{
          minWidth: '1000px',
          borderCollapse: 'separate',
          borderSpacing: 0,
        }}
      >
        <Table.Thead
          style={{
            background: 'var(--emr-gradient-submenu)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Table.Tr>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                padding: '16px 20px',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {t('laboratory.components.fields.code')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                padding: '16px 20px',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {t('laboratory.components.fields.gisCode')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                padding: '16px 20px',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {t('laboratory.components.fields.name')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                padding: '16px 20px',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {t('laboratory.components.fields.type')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                padding: '16px 20px',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {t('laboratory.components.fields.unit')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                padding: '16px 20px',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {t('laboratory.components.fields.department')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                padding: '16px 20px',
                textAlign: 'center',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {t('common.actions')}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {components.map((component) => {
            const values = extractResearchComponentFormValues(component);

            return (
              <Table.Tr
                key={component.id}
                style={{
                  background: 'white',
                  transition: 'all 0.2s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                  e.currentTarget.style.transform = 'scale(1.001)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Table.Td
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e5e7eb',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: 'var(--emr-text-primary, #1a202c)',
                  }}
                >
                  {values.code || '-'}
                </Table.Td>
                <Table.Td
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e5e7eb',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    color: 'var(--emr-text-secondary, #4a5568)',
                  }}
                >
                  {values.gisCode || '-'}
                </Table.Td>
                <Table.Td
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--emr-text-primary, #1a202c)',
                    maxWidth: '400px',
                  }}
                >
                  {values.name}
                </Table.Td>
                <Table.Td
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '13px',
                    color: 'var(--emr-text-secondary, #4a5568)',
                  }}
                >
                  {values.type}
                </Table.Td>
                <Table.Td
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '13px',
                    color: 'var(--emr-text-secondary, #4a5568)',
                  }}
                >
                  {values.unit}
                </Table.Td>
                <Table.Td
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '13px',
                    color: 'var(--emr-text-secondary, #4a5568)',
                  }}
                >
                  {values.department || '-'}
                </Table.Td>
                <Table.Td
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e5e7eb',
                    textAlign: 'center',
                  }}
                >
                  {onEdit && (
                    <Tooltip label="რედაქტირება" position="top">
                      <ActionIcon
                        onClick={() => onEdit(component)}
                        aria-label="Edit component"
                        style={{
                          background:
                            'var(--emr-gradient-primary, linear-gradient(135deg, #1a365d, #2b6cb0, #3182ce))',
                          color: 'white',
                          border: 'none',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          transition: 'all 0.2s ease',
                          minWidth: '32px',
                          minHeight: '32px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        }}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  {onDelete && (
                    <Tooltip label="წაშლა" position="top">
                      <ActionIcon
                        onClick={() => onDelete(component)}
                        ml="xs"
                        aria-label="Delete component"
                        style={{
                          background: 'linear-gradient(135deg, #dc2626, #ef4444, #f87171)',
                          color: 'white',
                          border: 'none',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          transition: 'all 0.2s ease',
                          minWidth: '32px',
                          minHeight: '32px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
