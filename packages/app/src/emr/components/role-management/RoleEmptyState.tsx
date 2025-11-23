// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Box, Stack, Text, Button, Group, Paper, ThemeIcon, SimpleGrid } from '@mantine/core';
import {
  IconShieldLock,
  IconPlus,
  IconUserShield,
  IconStethoscope,
  IconNurse,
  IconFlask,
  IconBuildingHospital,
  IconClipboardList,
} from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';

interface RoleEmptyStateProps {
  onCreateRole: () => void;
  onUseTemplate?: (templateCode: string) => void;
}

interface RoleTemplate {
  code: string;
  icon: typeof IconUserShield;
  nameKey: string;
  descriptionKey: string;
  color: string;
}

const roleTemplates: RoleTemplate[] = [
  {
    code: 'admin',
    icon: IconUserShield,
    nameKey: 'roleManagement.templates.admin',
    descriptionKey: 'roleManagement.templates.adminDesc',
    color: 'var(--emr-primary)',
  },
  {
    code: 'physician',
    icon: IconStethoscope,
    nameKey: 'roleManagement.templates.physician',
    descriptionKey: 'roleManagement.templates.physicianDesc',
    color: 'var(--emr-secondary)',
  },
  {
    code: 'nurse',
    icon: IconNurse,
    nameKey: 'roleManagement.templates.nurse',
    descriptionKey: 'roleManagement.templates.nurseDesc',
    color: '#10b981',
  },
  {
    code: 'lab-tech',
    icon: IconFlask,
    nameKey: 'roleManagement.templates.labTech',
    descriptionKey: 'roleManagement.templates.labTechDesc',
    color: '#8b5cf6',
  },
  {
    code: 'receptionist',
    icon: IconBuildingHospital,
    nameKey: 'roleManagement.templates.receptionist',
    descriptionKey: 'roleManagement.templates.receptionistDesc',
    color: '#f59e0b',
  },
  {
    code: 'auditor',
    icon: IconClipboardList,
    nameKey: 'roleManagement.templates.auditor',
    descriptionKey: 'roleManagement.templates.auditorDesc',
    color: '#6366f1',
  },
];

/**
 * Empty state component for role management with role templates
 */
export function RoleEmptyState({ onCreateRole, onUseTemplate }: RoleEmptyStateProps): JSX.Element {
  const { lang } = useTranslation();

  // Fallback translations for templates
  const getTemplateName = (nameKey: string): string => {
    const names: Record<string, Record<string, string>> = {
      'roleManagement.templates.admin': { ka: 'ადმინისტრატორი', en: 'Administrator', ru: 'Администратор' },
      'roleManagement.templates.physician': { ka: 'ექიმი', en: 'Physician', ru: 'Врач' },
      'roleManagement.templates.nurse': { ka: 'ექთანი', en: 'Nurse', ru: 'Медсестра' },
      'roleManagement.templates.labTech': { ka: 'ლაბორანტი', en: 'Lab Technician', ru: 'Лаборант' },
      'roleManagement.templates.receptionist': { ka: 'რეგისტრატორი', en: 'Receptionist', ru: 'Регистратор' },
      'roleManagement.templates.auditor': { ka: 'აუდიტორი', en: 'Auditor', ru: 'Аудитор' },
    };
    return names[nameKey]?.[lang] || names[nameKey]?.en || nameKey;
  };

  const getTemplateDesc = (descKey: string): string => {
    const descs: Record<string, Record<string, string>> = {
      'roleManagement.templates.adminDesc': {
        ka: 'სრული წვდომა სისტემის მართვაზე',
        en: 'Full system administration access',
        ru: 'Полный административный доступ',
      },
      'roleManagement.templates.physicianDesc': {
        ka: 'პაციენტის ისტორია, დანიშვნები, რეცეპტები',
        en: 'Patient records, appointments, prescriptions',
        ru: 'Истории пациентов, назначения, рецепты',
      },
      'roleManagement.templates.nurseDesc': {
        ka: 'პაციენტის მონაცემები, ვიტალური ნიშნები',
        en: 'Patient data, vital signs, care notes',
        ru: 'Данные пациентов, витальные показатели',
      },
      'roleManagement.templates.labTechDesc': {
        ka: 'ლაბორატორიული შედეგები, ანალიზები',
        en: 'Lab results, test orders, specimens',
        ru: 'Лабораторные результаты, анализы',
      },
      'roleManagement.templates.receptionistDesc': {
        ka: 'რეგისტრაცია, ჩაწერა, გადახდები',
        en: 'Registration, scheduling, billing',
        ru: 'Регистрация, запись, счета',
      },
      'roleManagement.templates.auditorDesc': {
        ka: 'მხოლოდ წაკითხვა, აუდიტის ჟურნალები',
        en: 'Read-only access, audit logs',
        ru: 'Только чтение, журналы аудита',
      },
    };
    return descs[descKey]?.[lang] || descs[descKey]?.en || descKey;
  };

  const emptyStateText: Record<string, Record<string, string>> = {
    title: {
      ka: 'როლები ჯერ არ არის შექმნილი',
      en: 'No Roles Created Yet',
      ru: 'Роли еще не созданы',
    },
    description: {
      ka: 'შექმენით როლები თქვენი გუნდის წვდომის მართვისთვის. აირჩიეთ შაბლონი ან შექმენით ნულიდან.',
      en: 'Create roles to manage access for your team. Choose a template or start from scratch.',
      ru: 'Создайте роли для управления доступом вашей команды. Выберите шаблон или начните с нуля.',
    },
    quickStart: {
      ka: 'სწრაფი დაწყება შაბლონებით',
      en: 'Quick Start with Templates',
      ru: 'Быстрый старт с шаблонами',
    },
    orCreateCustom: {
      ka: 'ან შექმენით საკუთარი როლი',
      en: 'Or create a custom role',
      ru: 'Или создайте свою роль',
    },
    createCustomRole: {
      ka: 'საკუთარი როლის შექმნა',
      en: 'Create Custom Role',
      ru: 'Создать свою роль',
    },
    useTemplate: {
      ka: 'გამოყენება',
      en: 'Use',
      ru: 'Использовать',
    },
  };

  return (
    <Box py={48}>
      <Stack align="center" gap="xl">
        {/* Illustration */}
        <Box
          style={{
            width: 140,
            height: 140,
            borderRadius: 'var(--emr-border-radius-2xl)',
            background: 'var(--emr-gradient-accent-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed var(--emr-gray-300)',
            animation: 'emptyStatePulse 2s ease-in-out infinite',
          }}
        >
          <IconShieldLock
            size={64}
            style={{
              color: 'var(--emr-secondary)',
              opacity: 0.8,
            }}
          />
        </Box>

        {/* Title & Description */}
        <Stack align="center" gap="xs">
          <Text
            size="xl"
            fw={600}
            style={{ color: 'var(--emr-text-primary)' }}
          >
            {emptyStateText.title[lang] || emptyStateText.title.en}
          </Text>
          <Text
            size="sm"
            c="dimmed"
            ta="center"
            maw={400}
          >
            {emptyStateText.description[lang] || emptyStateText.description.en}
          </Text>
        </Stack>

        {/* Quick Start Templates */}
        <Stack gap="md" w="100%" maw={800}>
          <Text
            size="sm"
            fw={600}
            c="dimmed"
            ta="center"
            tt="uppercase"
            style={{ letterSpacing: '0.05em' }}
          >
            {emptyStateText.quickStart[lang] || emptyStateText.quickStart.en}
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {roleTemplates.map((template) => (
              <Paper
                key={template.code}
                p="md"
                withBorder
                style={{
                  cursor: 'pointer',
                  transition: 'var(--emr-transition-smooth)',
                  borderColor: 'var(--emr-gray-200)',
                  background: 'var(--emr-text-inverse)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = template.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--emr-shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--emr-gray-200)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => onUseTemplate?.(template.code)}
              >
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon
                    size={44}
                    radius="md"
                    variant="light"
                    style={{
                      background: `${template.color}15`,
                      color: template.color,
                    }}
                  >
                    <template.icon size={22} />
                  </ThemeIcon>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text fw={600} size="sm" lineClamp={1}>
                      {getTemplateName(template.nameKey)}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={2}>
                      {getTemplateDesc(template.descriptionKey)}
                    </Text>
                  </Box>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>

        {/* Divider with "or" */}
        <Group w="100%" maw={400} gap="md">
          <Box style={{ flex: 1, height: 1, background: 'var(--emr-gray-200)' }} />
          <Text size="xs" c="dimmed" tt="uppercase">
            {emptyStateText.orCreateCustom[lang] || emptyStateText.orCreateCustom.en}
          </Text>
          <Box style={{ flex: 1, height: 1, background: 'var(--emr-gray-200)' }} />
        </Group>

        {/* Create Custom Role Button */}
        <Button
          size="lg"
          leftSection={<IconPlus size={18} />}
          onClick={onCreateRole}
          style={{
            background: 'var(--emr-gradient-primary)',
            minHeight: '48px',
          }}
        >
          {emptyStateText.createCustomRole[lang] || emptyStateText.createCustomRole.en}
        </Button>
      </Stack>
    </Box>
  );
}
