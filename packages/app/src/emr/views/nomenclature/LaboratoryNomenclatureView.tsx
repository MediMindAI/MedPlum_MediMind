// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { Box, Tabs } from '@mantine/core';
import { useTranslation } from '../../hooks/useTranslation';
import type { LaboratoryTab } from '../../types/laboratory';
import { SamplesTab } from '../../components/laboratory/tabs/SamplesTab';
import { ManipulationsTab } from '../../components/laboratory/tabs/ManipulationsTab';
import { SyringesTab } from '../../components/laboratory/tabs/SyringesTab';
import { ResearchComponentsTab } from '../../components/laboratory/tabs/ResearchComponentsTab';

/**
 * Laboratory Nomenclature View
 *
 * Main page component for laboratory nomenclature management.
 * Provides 4 tabs for managing different laboratory nomenclature systems:
 * - Research Components (კვლევის კომპონენტები)
 * - Samples (ნიმუშები)
 * - Manipulations (მანიპულაციები)
 * - Syringes (სინჯარები)
 */
export function LaboratoryNomenclatureView(): JSX.Element {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<LaboratoryTab>('components');

  return (
    <Box
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Page Title */}
      <Box
        p="md"
        style={{
          borderBottom: '1px solid #dee2e6',
          backgroundColor: '#f8f9fa',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
          {t('laboratory.title')}
        </h2>
      </Box>

      {/* Tab Navigation */}
      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value as LaboratoryTab)}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Tabs.List
          style={{
            background: 'var(--emr-gradient-submenu)',
            borderBottom: 'none',
            padding: '0',
          }}
        >
          <Tabs.Tab
            value="components"
            style={{
              color: activeTab === 'components' ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
              fontWeight: activeTab === 'components' ? 600 : 400,
              borderBottom: activeTab === 'components' ? '3px solid #ffffff' : 'none',
              padding: '12px 24px',
            }}
          >
            {t('laboratory.tabs.components')}
          </Tabs.Tab>
          <Tabs.Tab
            value="samples"
            style={{
              color: activeTab === 'samples' ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
              fontWeight: activeTab === 'samples' ? 600 : 400,
              borderBottom: activeTab === 'samples' ? '3px solid #ffffff' : 'none',
              padding: '12px 24px',
            }}
          >
            {t('laboratory.tabs.samples')}
          </Tabs.Tab>
          <Tabs.Tab
            value="manipulations"
            style={{
              color: activeTab === 'manipulations' ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
              fontWeight: activeTab === 'manipulations' ? 600 : 400,
              borderBottom: activeTab === 'manipulations' ? '3px solid #ffffff' : 'none',
              padding: '12px 24px',
            }}
          >
            {t('laboratory.tabs.manipulations')}
          </Tabs.Tab>
          <Tabs.Tab
            value="syringes"
            style={{
              color: activeTab === 'syringes' ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
              fontWeight: activeTab === 'syringes' ? 600 : 400,
              borderBottom: activeTab === 'syringes' ? '3px solid #ffffff' : 'none',
              padding: '12px 24px',
            }}
          >
            {t('laboratory.tabs.syringes')}
          </Tabs.Tab>
        </Tabs.List>

        {/* Tab Content */}
        <Box style={{ flex: 1, overflow: 'auto' }}>
          <Tabs.Panel value="components">
            <ResearchComponentsTab />
          </Tabs.Panel>

          <Tabs.Panel value="samples">
            <SamplesTab />
          </Tabs.Panel>

          <Tabs.Panel value="manipulations">
            <ManipulationsTab />
          </Tabs.Panel>

          <Tabs.Panel value="syringes">
            <SyringesTab />
          </Tabs.Panel>
        </Box>
      </Tabs>
    </Box>
  );
}
