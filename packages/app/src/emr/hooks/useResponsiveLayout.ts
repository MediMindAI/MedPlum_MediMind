// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @module useResponsiveLayout
 * @description Hook for managing responsive layout states across form builder components.
 * Provides device detection, breakpoint management, and layout utilities.
 */

import { useMediaQuery } from '@mantine/hooks';
import { useMemo, useCallback, useState } from 'react';

/**
 * Breakpoint values in pixels (matching theme.css)
 */
export const BREAKPOINTS = {
  xs: 576,
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1400,
} as const;

/**
 * Layout mode for form builder panels
 */
export type LayoutMode = 'mobile' | 'tablet' | 'desktop';

/**
 * Panel visibility state for form builder
 */
export interface PanelVisibility {
  palette: boolean;
  canvas: boolean;
  properties: boolean;
}

/**
 * Responsive layout hook return type
 */
export interface ResponsiveLayoutState {
  /** Current device type */
  isMobile: boolean;
  /** Current device is tablet */
  isTablet: boolean;
  /** Current device is desktop */
  isDesktop: boolean;
  /** Current layout mode */
  layoutMode: LayoutMode;
  /** Panel visibility state */
  panelVisibility: PanelVisibility;
  /** Toggle palette panel visibility (mobile only) */
  togglePalette: () => void;
  /** Toggle properties panel visibility (mobile/tablet) */
  toggleProperties: () => void;
  /** Close all side panels */
  closeAllPanels: () => void;
  /** Show properties panel for selected field */
  showPropertiesPanel: () => void;
  /** Minimum touch target size (44px per Apple HIG) */
  minTouchTarget: number;
  /** Get responsive column span for grid layouts */
  getColumnSpan: (mobileSpan: number, tabletSpan: number, desktopSpan: number) => number;
  /** Get responsive padding value */
  getResponsivePadding: () => string;
  /** Whether to use stacked layout */
  useStackedLayout: boolean;
}

/**
 * Hook for managing responsive layout states in form builder.
 *
 * Features:
 * - Device detection (mobile/tablet/desktop)
 * - Panel visibility management for different screen sizes
 * - Touch-friendly settings
 * - Responsive utilities for grid and spacing
 *
 * @returns Responsive layout state and utilities
 *
 * @example
 * ```typescript
 * function FormBuilderLayout() {
 *   const {
 *     isMobile,
 *     layoutMode,
 *     panelVisibility,
 *     togglePalette,
 *     toggleProperties,
 *     minTouchTarget,
 *   } = useResponsiveLayout();
 *
 *   return (
 *     <Box>
 *       {isMobile && (
 *         <Button onClick={togglePalette} style={{ minHeight: minTouchTarget }}>
 *           Toggle Palette
 *         </Button>
 *       )}
 *       {panelVisibility.palette && <FieldPalette />}
 *       <FormCanvas />
 *       {panelVisibility.properties && <FieldProperties />}
 *     </Box>
 *   );
 * }
 * ```
 */
export function useResponsiveLayout(): ResponsiveLayoutState {
  // Media queries
  const isMobileQuery = useMediaQuery(`(max-width: ${BREAKPOINTS.sm}px)`);
  const isTabletQuery = useMediaQuery(
    `(min-width: ${BREAKPOINTS.sm + 1}px) and (max-width: ${BREAKPOINTS.md}px)`
  );

  // Device flags (handle undefined during SSR)
  const isMobile = isMobileQuery ?? false;
  const isTablet = isTabletQuery ?? false;
  const isDesktop = !isMobile && !isTablet;

  // Panel visibility state
  const [paletteVisible, setPaletteVisible] = useState(false);
  const [propertiesVisible, setPropertiesVisible] = useState(false);

  // Determine layout mode
  const layoutMode: LayoutMode = useMemo(() => {
    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    return 'desktop';
  }, [isMobile, isTablet]);

  // Panel visibility based on device
  const panelVisibility: PanelVisibility = useMemo(() => {
    if (isMobile) {
      // Mobile: Canvas always visible, palette/properties toggled
      return {
        palette: paletteVisible,
        canvas: true,
        properties: propertiesVisible,
      };
    }
    if (isTablet) {
      // Tablet: Two columns, properties as drawer
      return {
        palette: true,
        canvas: true,
        properties: propertiesVisible,
      };
    }
    // Desktop: All three panels visible
    return {
      palette: true,
      canvas: true,
      properties: true,
    };
  }, [isMobile, isTablet, paletteVisible, propertiesVisible]);

  // Toggle functions
  const togglePalette = useCallback(() => {
    setPaletteVisible((prev) => !prev);
    // Close properties when opening palette on mobile
    if (isMobile) {
      setPropertiesVisible(false);
    }
  }, [isMobile]);

  const toggleProperties = useCallback(() => {
    setPropertiesVisible((prev) => !prev);
    // Close palette when opening properties on mobile
    if (isMobile) {
      setPaletteVisible(false);
    }
  }, [isMobile]);

  const closeAllPanels = useCallback(() => {
    setPaletteVisible(false);
    setPropertiesVisible(false);
  }, []);

  const showPropertiesPanel = useCallback(() => {
    setPropertiesVisible(true);
    if (isMobile) {
      setPaletteVisible(false);
    }
  }, [isMobile]);

  // Minimum touch target (44px per Apple HIG)
  const minTouchTarget = 44;

  // Responsive column span utility
  const getColumnSpan = useCallback(
    (mobileSpan: number, tabletSpan: number, desktopSpan: number): number => {
      if (isMobile) return mobileSpan;
      if (isTablet) return tabletSpan;
      return desktopSpan;
    },
    [isMobile, isTablet]
  );

  // Responsive padding utility
  const getResponsivePadding = useCallback((): string => {
    if (isMobile) return 'var(--emr-spacing-sm)';
    if (isTablet) return 'var(--emr-spacing-md)';
    return 'var(--emr-spacing-lg)';
  }, [isMobile, isTablet]);

  // Whether to use stacked layout
  const useStackedLayout = isMobile;

  return {
    isMobile,
    isTablet,
    isDesktop,
    layoutMode,
    panelVisibility,
    togglePalette,
    toggleProperties,
    closeAllPanels,
    showPropertiesPanel,
    minTouchTarget,
    getColumnSpan,
    getResponsivePadding,
    useStackedLayout,
  };
}

/**
 * CSS class names for responsive layouts
 */
export const responsiveClasses = {
  /** Hide on mobile devices */
  hideOnMobile: 'emr-hide-mobile',
  /** Hide on tablet devices */
  hideOnTablet: 'emr-hide-tablet',
  /** Hide on desktop devices */
  hideOnDesktop: 'emr-hide-desktop',
  /** Show only on mobile */
  showOnlyMobile: 'emr-show-only-mobile',
  /** Stack children vertically on mobile */
  stackOnMobile: 'emr-stack-mobile',
  /** Touch-friendly sizing */
  touchTarget: 'emr-touch-target',
} as const;

/**
 * Inline styles for responsive layouts (for use when CSS classes aren't available)
 */
export const responsiveStyles = {
  /**
   * Touch-friendly button styles
   */
  touchButton: {
    minHeight: '44px',
    minWidth: '44px',
    padding: '12px 16px',
  },
  /**
   * Mobile drawer overlay
   */
  mobileDrawerOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  /**
   * Mobile drawer panel
   */
  mobileDrawerPanel: {
    position: 'fixed' as const,
    top: 0,
    right: 0,
    bottom: 0,
    width: '85%',
    maxWidth: '320px',
    backgroundColor: 'var(--emr-gray-50)',
    boxShadow: 'var(--emr-shadow-xl)',
    zIndex: 1001,
    overflowY: 'auto' as const,
    WebkitOverflowScrolling: 'touch' as const,
  },
  /**
   * Floating action button (FAB)
   */
  floatingActionButton: {
    position: 'fixed' as const,
    bottom: '24px',
    right: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--emr-shadow-lg)',
    zIndex: 999,
  },
} as const;

export default useResponsiveLayout;
