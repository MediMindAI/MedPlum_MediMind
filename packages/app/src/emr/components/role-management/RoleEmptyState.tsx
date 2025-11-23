// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Box, Stack, Text, Button, Group, Paper, ThemeIcon, SimpleGrid, Badge, Tooltip } from '@mantine/core';
import {
  IconShieldLock,
  IconPlus,
  IconUserShield,
  IconStethoscope,
  IconNurse,
  IconFlask,
  IconBuildingHospital,
  IconClipboardList,
  IconSparkles,
  IconKey,
  IconArrowRight,
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
  permissionCount: number;
  recommended?: boolean;
}

const roleTemplates: RoleTemplate[] = [
  {
    code: 'admin',
    icon: IconUserShield,
    nameKey: 'roleManagement.templates.admin',
    descriptionKey: 'roleManagement.templates.adminDesc',
    color: 'var(--emr-primary)',
    permissionCount: 32,
  },
  {
    code: 'physician',
    icon: IconStethoscope,
    nameKey: 'roleManagement.templates.physician',
    descriptionKey: 'roleManagement.templates.physicianDesc',
    color: 'var(--emr-secondary)',
    permissionCount: 24,
    recommended: true,
  },
  {
    code: 'nurse',
    icon: IconNurse,
    nameKey: 'roleManagement.templates.nurse',
    descriptionKey: 'roleManagement.templates.nurseDesc',
    color: '#10b981',
    permissionCount: 18,
  },
  {
    code: 'lab-tech',
    icon: IconFlask,
    nameKey: 'roleManagement.templates.labTech',
    descriptionKey: 'roleManagement.templates.labTechDesc',
    color: '#8b5cf6',
    permissionCount: 12,
  },
  {
    code: 'receptionist',
    icon: IconBuildingHospital,
    nameKey: 'roleManagement.templates.receptionist',
    descriptionKey: 'roleManagement.templates.receptionistDesc',
    color: '#f59e0b',
    permissionCount: 15,
  },
  {
    code: 'auditor',
    icon: IconClipboardList,
    nameKey: 'roleManagement.templates.auditor',
    descriptionKey: 'roleManagement.templates.auditorDesc',
    color: '#6366f1',
    permissionCount: 8,
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

  const permissionsLabel: Record<string, string> = {
    ka: 'უფლება',
    en: 'permissions',
    ru: 'разрешений',
  };

  const recommendedLabel: Record<string, string> = {
    ka: 'რეკომენდებული',
    en: 'Recommended',
    ru: 'Рекомендуется',
  };

  return (
    <Box py={32}>
      <Stack align="center" gap={32}>
        {/* Hero Section with Decorative Background */}
        <Box
          style={{
            position: 'relative',
            width: '100%',
            padding: '40px 20px',
            borderRadius: 'var(--emr-border-radius-xl)',
            background: 'linear-gradient(135deg, rgba(43, 108, 176, 0.03) 0%, rgba(99, 179, 237, 0.06) 50%, rgba(43, 108, 176, 0.03) 100%)',
            border: '1px solid rgba(99, 179, 237, 0.15)',
          }}
        >
          {/* Decorative floating elements */}
          <Box
            style={{
              position: 'absolute',
              top: 20,
              right: 40,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(99, 179, 237, 0.1), rgba(43, 108, 176, 0.05))',
              opacity: 0.6,
            }}
          />
          <Box
            style={{
              position: 'absolute',
              bottom: 30,
              left: 60,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(99, 179, 237, 0.05))',
              opacity: 0.5,
            }}
          />

          <Stack align="center" gap="xl" style={{ position: 'relative', zIndex: 1 }}>
            {/* Premium Shield Illustration */}
            <Box
              style={{
                width: 160,
                height: 160,
                borderRadius: 24,
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 40px rgba(43, 108, 176, 0.12), 0 8px 16px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(99, 179, 237, 0.2)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Gradient overlay */}
              <Box
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, transparent 40%, rgba(99, 179, 237, 0.08) 100%)',
                }}
              />
              {/* Animated ring */}
              <Box
                style={{
                  position: 'absolute',
                  inset: 8,
                  borderRadius: 20,
                  border: '2px dashed rgba(43, 108, 176, 0.15)',
                  animation: 'emptyStatePulse 3s ease-in-out infinite',
                }}
              />
              <IconShieldLock
                size={72}
                style={{
                  color: 'var(--emr-secondary)',
                  position: 'relative',
                  zIndex: 1,
                  filter: 'drop-shadow(0 4px 8px rgba(43, 108, 176, 0.2))',
                }}
              />
            </Box>

            {/* Title & Description */}
            <Stack align="center" gap={8}>
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: 'var(--emr-text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                {emptyStateText.title[lang] || emptyStateText.title.en}
              </Text>
              <Text
                size="md"
                c="dimmed"
                ta="center"
                maw={480}
                style={{ lineHeight: 1.6 }}
              >
                {emptyStateText.description[lang] || emptyStateText.description.en}
              </Text>
            </Stack>
          </Stack>
        </Box>

        {/* Quick Start Templates Section */}
        <Stack gap="lg" w="100%" maw={920}>
          <Group justify="center" gap="xs">
            <IconSparkles size={18} style={{ color: 'var(--emr-secondary)' }} />
            <Text
              size="sm"
              fw={600}
              style={{
                color: 'var(--emr-secondary)',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              {emptyStateText.quickStart[lang] || emptyStateText.quickStart.en}
            </Text>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {roleTemplates.map((template) => (
              <Paper
                key={template.code}
                p={0}
                withBorder
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderColor: template.recommended ? 'var(--emr-secondary)' : 'var(--emr-gray-200)',
                  borderWidth: template.recommended ? 2 : 1,
                  background: 'var(--emr-text-inverse)',
                  borderRadius: 'var(--emr-border-radius-lg)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = template.color;
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
                  e.currentTarget.style.boxShadow = `0 12px 24px rgba(0, 0, 0, 0.1), 0 0 0 1px ${template.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = template.recommended ? 'var(--emr-secondary)' : 'var(--emr-gray-200)';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => onUseTemplate?.(template.code)}
              >
                {/* Left color accent bar */}
                <Box
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    background: template.color,
                    borderRadius: 'var(--emr-border-radius-lg) 0 0 var(--emr-border-radius-lg)',
                  }}
                />

                {/* Recommended badge */}
                {template.recommended && (
                  <Badge
                    size="sm"
                    variant="filled"
                    leftSection={<IconSparkles size={12} />}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'var(--emr-stat-success)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {recommendedLabel[lang] || recommendedLabel.en}
                  </Badge>
                )}

                <Box p="md" pl={20}>
                  <Group gap="md" wrap="nowrap" align="flex-start">
                    {/* Icon container with gradient background */}
                    <Box
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 12,
                        background: `linear-gradient(135deg, ${template.color}15 0%, ${template.color}08 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: `1px solid ${template.color}20`,
                      }}
                    >
                      <template.icon
                        size={26}
                        style={{ color: template.color }}
                      />
                    </Box>

                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={600} size="sm" lineClamp={1} mb={4}>
                        {getTemplateName(template.nameKey)}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={2} mb={8} style={{ lineHeight: 1.5 }}>
                        {getTemplateDesc(template.descriptionKey)}
                      </Text>

                      {/* Permission count badge */}
                      <Tooltip label={`${template.permissionCount} ${permissionsLabel[lang] || permissionsLabel.en}`}>
                        <Badge
                          size="sm"
                          variant="light"
                          leftSection={<IconKey size={12} />}
                          style={{
                            background: 'var(--emr-gray-100)',
                            color: 'var(--emr-gray-600)',
                            border: '1px solid var(--emr-gray-200)',
                          }}
                        >
                          {template.permissionCount}
                        </Badge>
                      </Tooltip>
                    </Box>
                  </Group>
                </Box>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>

        {/* Elegant Divider */}
        <Group w="100%" maw={500} gap="lg" my={8}>
          <Box
            style={{
              flex: 1,
              height: 1,
              background: 'linear-gradient(90deg, transparent, var(--emr-gray-300), transparent)',
            }}
          />
          <Text
            size="xs"
            c="dimmed"
            tt="uppercase"
            fw={500}
            style={{ letterSpacing: '0.05em' }}
          >
            {emptyStateText.orCreateCustom[lang] || emptyStateText.orCreateCustom.en}
          </Text>
          <Box
            style={{
              flex: 1,
              height: 1,
              background: 'linear-gradient(90deg, transparent, var(--emr-gray-300), transparent)',
            }}
          />
        </Group>

        {/* Premium Create Custom Role Button */}
        <Button
          size="lg"
          leftSection={<IconPlus size={18} stroke={2.5} />}
          rightSection={<IconArrowRight size={16} />}
          onClick={onCreateRole}
          style={{
            background: 'var(--emr-gradient-primary)',
            minHeight: 52,
            paddingLeft: 28,
            paddingRight: 28,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '0.01em',
            boxShadow: '0 4px 14px rgba(26, 54, 93, 0.25)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(26, 54, 93, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(26, 54, 93, 0.25)';
          }}
        >
          {emptyStateText.createCustomRole[lang] || emptyStateText.createCustomRole.en}
        </Button>
      </Stack>
    </Box>
  );
}
