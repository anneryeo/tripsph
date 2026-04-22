/**
 * TRIPS PH – Design System Constants
 * Color palette, typography, and layout tokens.
 */

// ── Color Palette ──────────────────────────────────────────────────────────────
export const Colors = {
  // Core background / surface
  darkAzure: '#163b42',       // Background / Map Base
  azure: '#1f525c',           // Primary Accent / Buttons / Nav Bar
  azureLight: '#2c6e7a',      // Secondary gradient stop
  backgroundTint: '#f4faf8',  // Light app background
  surfaceBase: '#ffffff',     // Card / panel base
  surfaceMuted: '#eaf3f1',    // Secondary card fill
  borderSoft: '#d2e4e0',      // Soft border on light surfaces
  textPrimary: '#123239',     // Main readable text on light surfaces
  textSecondary: '#45656b',   // Supporting text on light surfaces

  // Status colors
  grayGreen: '#63b289',       // Safety / Availability
  alarmRed: '#e53e3e',        // High-risk / Violations
  orange: '#ed8936',          // Medium-risk warning

  // Neutrals
  white: '#ffffff',
  gray: '#9e9e9e',            // Unverified / Low-confidence pins
  grayDark: '#4a4a4a',
  overlayDark: 'rgba(22,59,66,0.85)',
  overlayLight: 'rgba(255,255,255,0.82)',

  // Transparency helpers
  alarmRedTranslucent: 'rgba(229,62,62,0.35)',
  orangeTranslucent: 'rgba(237,137,54,0.35)',
  grayGreenTranslucent: 'rgba(99,178,137,0.25)',
  azureTranslucent: 'rgba(31,82,92,0.75)',
  whiteTranslucent: 'rgba(255,255,255,0.72)',
  focusRing: 'rgba(31,82,92,0.4)',
  glowAzure: 'rgba(31,82,92,0.2)',
  glowGreen: 'rgba(99,178,137,0.26)',
};

// ── Typography ─────────────────────────────────────────────────────────────────
const FONT_FAMILY = 'Canva Sans';
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
