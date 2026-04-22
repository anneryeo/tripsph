/**
 * Design system constants
 * Color palette, typography, and layout tokens.
 */

import { Platform } from 'react-native';

// ── Color Palette ──────────────────────────────────────────────────────────────
export const Colors = {
  // Core background / surface
  darkAzure: '#07141B',       // Background / Deep Brand Base
  azure: '#0C7FA6',           // Primary Accent / Buttons / Nav Bar
  azureLight: '#2FD4FF',      // Route highlight / glow edge
  backgroundTint: '#07141B',  // App shell background
  surfaceBase: '#0C1B23',     // Card / panel base
  surfaceMuted: '#122833',    // Secondary card fill
  borderSoft: '#24414D',      // Soft border on dark surfaces
  textPrimary: '#F3FBFF',     // Main readable text on dark surfaces
  textSecondary: '#9DB5C2',   // Supporting text on dark surfaces
  textTertiary: '#6F8793',    // Quiet meta text
  routeTeal: '#2FD4FF',
  routeBlue: '#62B8FF',
  surfaceElevated: '#0F2027',

  // Status colors
  grayGreen: '#31B87B',       // Safety / Availability
  alarmRed: '#FF5B6E',        // High-risk / Violations
  orange: '#FF9A4A',          // Medium-risk warning

  // Neutrals
  white: '#ffffff',
  gray: '#6F8793',            // Unverified / Low-confidence pins
  grayDark: '#09151B',
  overlayDark: 'rgba(3,10,14,0.88)',
  overlayLight: 'rgba(12,27,35,0.78)',

  // Transparency helpers
  alarmRedTranslucent: 'rgba(255,91,110,0.24)',
  orangeTranslucent: 'rgba(255,154,74,0.24)',
  grayGreenTranslucent: 'rgba(49,184,123,0.22)',
  azureTranslucent: 'rgba(12,127,166,0.28)',
  whiteTranslucent: 'rgba(14,28,36,0.72)',
  focusRing: 'rgba(47,212,255,0.35)',
  glowAzure: 'rgba(47,212,255,0.22)',
  glowGreen: 'rgba(49,184,123,0.28)',
  edgeHighlight: 'rgba(255,255,255,0.12)',
};

export const Gradients = {
  brand: ['#07141B', '#0B2B3A', '#0C7FA6'],
  coolGlass: ['rgba(14,28,36,0.74)', 'rgba(18,38,48,0.82)'],
  heroSky: ['#08161D', '#0E2430', '#13384A'],
  routeGlow: ['#0C7FA6', '#2FD4FF'],
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
    fontSize: 30,
    lineHeight: Math.round(30 * 1.2),
    letterSpacing: LETTER_SPACING,
    fontWeight: '700',
    color: Colors.white,
  },
  heading2: {
    fontFamily: FONT_FAMILY,
    fontSize: 24,
    lineHeight: Math.round(24 * 1.25),
    letterSpacing: LETTER_SPACING,
    fontWeight: '700',
    color: Colors.white,
  },
  heading3: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    lineHeight: Math.round(18 * 1.3),
    letterSpacing: LETTER_SPACING,
    fontWeight: '700',
    color: Colors.white,
  },
  body: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    lineHeight: Math.round(15 * 1.45),
    letterSpacing: LETTER_SPACING,
    fontWeight: '400',
    color: Colors.white,
  },
  bodyBold: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    lineHeight: Math.round(15 * 1.45),
    letterSpacing: LETTER_SPACING,
    fontWeight: '700',
    color: Colors.white,
  },
  caption: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    lineHeight: Math.round(12 * 1.35),
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
  sm: 8,
  md: 16,
  lg: 24,
  xl: 30,
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
