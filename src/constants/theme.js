/**
 * Design system constants
 * Color palette, typography, and layout tokens.
 */

import { Platform } from 'react-native';

// ── Color Palette ──────────────────────────────────────────────────────────────
export const Colors = {
  // Core background / surface
  darkAzure: '#0f3444',       // Background / Deep Brand Base
  azure: '#0c7fa6',           // Primary Accent / Buttons / Nav Bar
  azureLight: '#3ab3d9',      // Secondary gradient stop
  backgroundTint: '#f2fbff',  // Light app background
  surfaceBase: '#ffffff',     // Card / panel base
  surfaceMuted: '#e4f4fb',    // Secondary card fill
  borderSoft: '#c4deea',      // Soft border on light surfaces
  textPrimary: '#0f2e3a',     // Main readable text on light surfaces
  textSecondary: '#3f6170',   // Supporting text on light surfaces

  // Status colors
  grayGreen: '#31b87b',       // Safety / Availability
  alarmRed: '#e53e3e',        // High-risk / Violations
  orange: '#f28a2f',          // Medium-risk warning

  // Neutrals
  white: '#ffffff',
  gray: '#9e9e9e',            // Unverified / Low-confidence pins
  grayDark: '#4a4a4a',
  overlayDark: 'rgba(9,39,52,0.84)',
  overlayLight: 'rgba(255,255,255,0.78)',

  // Transparency helpers
  alarmRedTranslucent: 'rgba(229,62,62,0.32)',
  orangeTranslucent: 'rgba(242,138,47,0.3)',
  grayGreenTranslucent: 'rgba(49,184,123,0.26)',
  azureTranslucent: 'rgba(12,127,166,0.72)',
  whiteTranslucent: 'rgba(255,255,255,0.72)',
  focusRing: 'rgba(12,127,166,0.4)',
  glowAzure: 'rgba(12,127,166,0.24)',
  glowGreen: 'rgba(49,184,123,0.28)',
};

export const Gradients = {
  brand: ['#0b6f93', '#2a98c2', '#65c4e4'],
  coolGlass: ['rgba(255,255,255,0.92)', 'rgba(239,250,255,0.72)'],
  heroSky: ['#e6f6fd', '#f5fbff'],
};

// ── Typography ─────────────────────────────────────────────────────────────────
const FONT_FAMILY = Platform.select({
  web: 'Canva Sans, Segoe UI, Helvetica Neue, Arial, sans-serif',
  default: 'Canva Sans',
});
const LETTER_SPACING = -0.94;

export const Typography = {
  heading1: {
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    lineHeight: Math.round(24 * 1.4),
    letterSpacing: LETTER_SPACING,
    fontWeight: '700',
    color: Colors.white,
  },
  heading2: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    lineHeight: Math.round(20 * 1.4),
    letterSpacing: LETTER_SPACING,
    fontWeight: '700',
    color: Colors.white,
  },
  heading3: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    lineHeight: Math.round(18 * 1.4),
    letterSpacing: LETTER_SPACING,
    fontWeight: '700',
    color: Colors.white,
  },
  body: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    lineHeight: Math.round(14 * 1.4),
    letterSpacing: LETTER_SPACING,
    fontWeight: '400',
    color: Colors.white,
  },
  bodyBold: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    lineHeight: Math.round(14 * 1.4),
    letterSpacing: LETTER_SPACING,
    fontWeight: '700',
    color: Colors.white,
  },
  caption: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    lineHeight: Math.round(12 * 1.4),
    letterSpacing: LETTER_SPACING,
    fontWeight: '400',
    color: Colors.gray,
  },
  label: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    lineHeight: Math.round(13 * 1.4),
    letterSpacing: LETTER_SPACING,
    fontWeight: '700',
    color: Colors.white,
  },
};

// ── Spacing ────────────────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ── Border Radius ──────────────────────────────────────────────────────────────
export const Radius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 9999,
};

// ── OIE Verdict Enum ───────────────────────────────────────────────────────────
export const OIEVerdict = {
  LEGAL:   'LEGAL',
  RISK:    'RISK',
  ILLEGAL: 'ILLEGAL',
};

// ── Performance Targets ────────────────────────────────────────────────────────
export const Targets = {
  oieResponseTimeMs:         200,   // ≤ 200 ms
  mapRefreshRateSec:          60,   // ≤ 60 seconds
  aiDetectionConfidence:      0.85, // ≥ 85 %
  aiInferenceBudgetMs:       499,   // < 500 ms
  enforcerResponseTimeSec:   300,   // ≤ 5 minutes
};
