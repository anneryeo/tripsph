/**
 * TRIPS PH – Design System Constants
 * Color palette, typography, and layout tokens.
 */

// ── Color Palette ──────────────────────────────────────────────────────────────
export const Colors = {
  // Core background / surface
  darkAzure: '#163b42',       // Background / Map Base
  azure: '#1f525c',           // Primary Accent / Buttons / Nav Bar

  // Status colors
  grayGreen: '#63b289',       // Safety / Availability
  alarmRed: '#e53e3e',        // High-risk / Violations
  orange: '#ed8936',          // Medium-risk warning

  // Neutrals
  white: '#ffffff',
  gray: '#9e9e9e',            // Unverified / Low-confidence pins
  grayDark: '#4a4a4a',
  overlayDark: 'rgba(22,59,66,0.85)',

  // Transparency helpers
  alarmRedTranslucent: 'rgba(229,62,62,0.35)',
  orangeTranslucent: 'rgba(237,137,54,0.35)',
  grayGreenTranslucent: 'rgba(99,178,137,0.25)',
  azureTranslucent: 'rgba(31,82,92,0.75)',
};

// ── Typography ─────────────────────────────────────────────────────────────────
export const Typography = {
  heading1: { fontSize: 24, fontWeight: '700', color: Colors.white },
  heading2: { fontSize: 20, fontWeight: '700', color: Colors.white },
  heading3: { fontSize: 18, fontWeight: '600', color: Colors.white },
  body:     { fontSize: 14, fontWeight: '400', color: Colors.white },
  bodyBold: { fontSize: 14, fontWeight: '700', color: Colors.white },
  caption:  { fontSize: 12, fontWeight: '400', color: Colors.gray },
  label:    { fontSize: 13, fontWeight: '600', color: Colors.white },
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
