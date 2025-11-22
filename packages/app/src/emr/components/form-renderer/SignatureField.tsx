// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Group,
  Modal,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Image,
  Alert,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconSignature, IconTrash, IconCheck, IconAlertCircle, IconPencil } from '@tabler/icons-react';
import SignatureCanvas from 'react-signature-canvas';
import type { SignatureData, SignatureType, SignatureIntent } from '../../types/form-renderer';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Props for SignatureField component
 */
export interface SignatureFieldProps {
  /** Unique field ID */
  fieldId: string;
  /** Field label */
  fieldLabel: string;
  /** Current signature value */
  value?: SignatureData;
  /** Called when signature changes */
  onChange: (value: SignatureData | undefined) => void;
  /** Error message */
  error?: string;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Whether field is required */
  required?: boolean;
  /** Current user reference for signature attribution */
  currentUserRef?: string;
  /** Patient ID for audit context */
  patientId?: string;
  /** Signature intent */
  intent?: SignatureIntent;
  /** Callback when signature is captured */
  onCapture?: (signature: SignatureData) => void;
}

/**
 * SignatureField Component
 *
 * Provides digital signature capture with:
 * - Hand-drawn signature via canvas (mouse/touch)
 * - Typed signature option
 * - Mobile-responsive design
 * - E-SIGN Act compliant intent confirmation
 *
 * @example
 * ```tsx
 * <SignatureField
 *   fieldId="patient-consent"
 *   fieldLabel="Patient Signature"
 *   value={signatureData}
 *   onChange={setSignatureData}
 *   currentUserRef="Patient/123"
 *   intent="consent"
 * />
 * ```
 */
export function SignatureField({
  fieldId,
  fieldLabel,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  currentUserRef,
  patientId,
  intent = 'consent',
  onCapture,
}: SignatureFieldProps): JSX.Element {
  const { t } = useTranslation();
  const [opened, { open, close }] = useDisclosure(false);
  const [signatureType, setSignatureType] = useState<SignatureType>('drawn');
  const [typedName, setTypedName] = useState('');
  const [intentConfirmed, setIntentConfirmed] = useState(false);
  const sigCanvasRef = useRef<SignatureCanvas>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Clear canvas
  const handleClear = useCallback(() => {
    sigCanvasRef.current?.clear();
    setTypedName('');
  }, []);

  // Check if signature canvas is empty
  const isCanvasEmpty = useCallback((): boolean => {
    if (!sigCanvasRef.current) return true;
    return sigCanvasRef.current.isEmpty();
  }, []);

  // Save signature
  const handleSave = useCallback(() => {
    if (!intentConfirmed) {
      return;
    }

    let signatureData: string | undefined;

    if (signatureType === 'drawn') {
      if (isCanvasEmpty()) {
        return;
      }
      // Get signature as PNG base64
      signatureData = sigCanvasRef.current?.getTrimmedCanvas().toDataURL('image/png');
    } else if (signatureType === 'typed') {
      if (!typedName.trim()) {
        return;
      }
      // Create canvas with typed name
      signatureData = createTypedSignatureImage(typedName);
    }

    if (!signatureData) {
      return;
    }

    const signature: SignatureData = {
      fieldId,
      fieldLabel,
      signatureType,
      signatureData,
      timestamp: new Date().toISOString(),
      signedBy: currentUserRef ? { reference: currentUserRef } : { display: typedName || 'Unknown' },
      intent,
    };

    onChange(signature);
    onCapture?.(signature);
    close();

    // Reset state
    setIntentConfirmed(false);
    setTypedName('');
  }, [
    fieldId,
    fieldLabel,
    signatureType,
    typedName,
    intentConfirmed,
    currentUserRef,
    intent,
    isCanvasEmpty,
    onChange,
    onCapture,
    close,
  ]);

  // Remove signature
  const handleRemove = useCallback(() => {
    onChange(undefined);
  }, [onChange]);

  // Open modal to capture signature
  const handleOpenCapture = useCallback(() => {
    if (!disabled) {
      setIntentConfirmed(false);
      setTypedName('');
      open();
    }
  }, [disabled, open]);

  // Render signature preview
  const renderPreview = (): JSX.Element | null => {
    if (!value?.signatureData) {
      return null;
    }

    return (
      <Paper p="sm" withBorder bg="gray.0">
        <Stack gap="xs">
          <Image
            src={value.signatureData}
            alt="Signature"
            h={60}
            fit="contain"
          />
          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">
              {value.signatureType === 'typed' ? 'Typed' : 'Hand-drawn'} signature
              {value.timestamp && ` - ${new Date(value.timestamp).toLocaleString()}`}
            </Text>
            {!disabled && (
              <Button
                variant="subtle"
                color="red"
                size="xs"
                leftSection={<IconTrash size={14} />}
                onClick={handleRemove}
              >
                Remove
              </Button>
            )}
          </Group>
        </Stack>
      </Paper>
    );
  };

  // Get intent description for E-SIGN compliance
  const getIntentDescription = (): string => {
    const descriptions: Record<SignatureIntent, string> = {
      consent: t('signature.intentConsent') || 'I understand and consent to the above information.',
      witness: t('signature.intentWitness') || 'I confirm that I have witnessed this signature.',
      practitioner: t('signature.intentPractitioner') || 'I confirm my professional assessment and recommendations.',
      verification: t('signature.intentVerification') || 'I verify the accuracy of the information above.',
    };
    return descriptions[intent];
  };

  return (
    <Box>
      {/* Field label */}
      <Text size="sm" fw={500} mb="xs">
        {fieldLabel}
        {required && <Text span c="red" ml={4}>*</Text>}
      </Text>

      {/* Error message */}
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" mb="xs">
          {error}
        </Alert>
      )}

      {/* Signature preview or capture button */}
      {value?.signatureData ? (
        renderPreview()
      ) : (
        <Button
          variant="outline"
          leftSection={<IconSignature size={18} />}
          onClick={handleOpenCapture}
          disabled={disabled}
          fullWidth={isMobile}
          size="md"
          styles={{ root: { minHeight: '44px' } }}
        >
          {t('signature.capture') || 'Add Signature'}
        </Button>
      )}

      {/* Signature capture modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={fieldLabel}
        size="lg"
        fullScreen={isMobile}
        centered
      >
        <Stack gap="md">
          {/* Signature type selector */}
          <SegmentedControl
            value={signatureType}
            onChange={(val) => setSignatureType(val as SignatureType)}
            data={[
              {
                value: 'drawn',
                label: (
                  <Group gap="xs">
                    <IconPencil size={16} />
                    <span>{t('signature.draw') || 'Draw'}</span>
                  </Group>
                ),
              },
              {
                value: 'typed',
                label: (
                  <Group gap="xs">
                    <IconSignature size={16} />
                    <span>{t('signature.type') || 'Type'}</span>
                  </Group>
                ),
              },
            ]}
            fullWidth
          />

          {/* Signature input area */}
          {signatureType === 'drawn' ? (
            <Paper withBorder p={0} style={{ touchAction: 'none' }}>
              <SignatureCanvas
                ref={sigCanvasRef}
                penColor="black"
                canvasProps={{
                  width: isMobile ? window.innerWidth - 48 : 500,
                  height: 200,
                  className: 'signature-canvas',
                  style: {
                    width: '100%',
                    height: '200px',
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                  },
                }}
              />
              <Group justify="flex-end" p="xs">
                <Button
                  variant="subtle"
                  size="xs"
                  leftSection={<IconTrash size={14} />}
                  onClick={handleClear}
                >
                  {t('signature.clear') || 'Clear'}
                </Button>
              </Group>
            </Paper>
          ) : (
            <TextInput
              label={t('signature.typeName') || 'Type your name'}
              placeholder={t('signature.typeNamePlaceholder') || 'Enter your full name'}
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              size="md"
              styles={{
                input: {
                  fontFamily: "'Brush Script MT', cursive",
                  fontSize: '24px',
                  minHeight: '60px',
                },
              }}
            />
          )}

          {/* E-SIGN Act compliance - Intent confirmation */}
          <Paper p="md" bg="blue.0" withBorder>
            <Stack gap="sm">
              <Text size="sm" fw={500}>
                {t('signature.intentTitle') || 'By signing, you agree to:'}
              </Text>
              <Text size="sm" c="dimmed">
                {getIntentDescription()}
              </Text>
              <Group>
                <Button
                  variant={intentConfirmed ? 'filled' : 'outline'}
                  color={intentConfirmed ? 'green' : 'gray'}
                  leftSection={intentConfirmed ? <IconCheck size={16} /> : undefined}
                  onClick={() => setIntentConfirmed(!intentConfirmed)}
                  size="sm"
                >
                  {intentConfirmed
                    ? t('signature.confirmed') || 'I Agree'
                    : t('signature.confirm') || 'Click to Agree'}
                </Button>
              </Group>
            </Stack>
          </Paper>

          {/* Action buttons */}
          <Group justify="flex-end" gap="md">
            <Button variant="default" onClick={close}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              leftSection={<IconCheck size={16} />}
              onClick={handleSave}
              disabled={
                !intentConfirmed ||
                (signatureType === 'drawn' && isCanvasEmpty()) ||
                (signatureType === 'typed' && !typedName.trim())
              }
            >
              {t('signature.save') || 'Save Signature'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

/**
 * Create a canvas image from typed text
 */
function createTypedSignatureImage(name: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 100;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }

  // Clear canvas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw signature
  ctx.fillStyle = '#000000';
  ctx.font = '36px "Brush Script MT", cursive';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(name, canvas.width / 2, canvas.height / 2);

  // Draw underline
  const textWidth = ctx.measureText(name).width;
  ctx.beginPath();
  ctx.moveTo((canvas.width - textWidth) / 2, canvas.height / 2 + 20);
  ctx.lineTo((canvas.width + textWidth) / 2, canvas.height / 2 + 20);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

export default SignatureField;
