/**
 * Reusable UI components for TRIPS PH.
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

// ── Primary Button ────────────────────────────────────────────────────────────
export function PrimaryButton({ title, onPress, loading, style, textStyle }) {
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, style]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={[styles.primaryBtnText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// ── Danger Button ─────────────────────────────────────────────────────────────
export function DangerButton({ title, onPress, style }) {
  return (
    <TouchableOpacity
      style={[styles.dangerBtn, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.primaryBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

// ── Ghost Button ──────────────────────────────────────────────────────────────
export function GhostButton({ title, onPress, style }) {
  return (
    <TouchableOpacity
      style={[styles.ghostBtn, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.ghostBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

// ── Verdict Badge ─────────────────────────────────────────────────────────────
export function VerdictBadge({ verdict }) {
  const colorMap = {
    LEGAL:   Colors.grayGreen,
    RISK:    Colors.orange,
    ILLEGAL: Colors.alarmRed,
  };
  const color = colorMap[verdict] ?? Colors.gray;
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{verdict}</Text>
    </View>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── Section Header ────────────────────────────────────────────────────────────
export function SectionHeader({ title }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

// ── Loading Overlay ───────────────────────────────────────────────────────────
export function LoadingOverlay({ visible, message }) {
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={Colors.grayGreen} />
      {message ? (
        <Text style={[Typography.body, { marginTop: Spacing.sm }]}>{message}</Text>
      ) : null}
    </View>
  );
}

// ── ConfidenceBar ─────────────────────────────────────────────────────────────
export function ConfidenceBar({ value, label }) {
  const pct = Math.round(value * 100);
  const barColor = value >= 0.85 ? Colors.grayGreen : Colors.orange;
  return (
    <View style={{ marginVertical: Spacing.xs }}>
      {label ? (
        <Text style={Typography.caption}>{label}</Text>
      ) : null}
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={[Typography.caption, { textAlign: 'right', marginTop: 2 }]}>
        {pct}%
      </Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  primaryBtn: {
    backgroundColor: Colors.azure,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.darkAzure,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  primaryBtnText: {
    ...Typography.bodyBold,
    fontSize: 16,
  },
  dangerBtn: {
    backgroundColor: Colors.alarmRed,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBtn: {
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    backgroundColor: Colors.surfaceBase,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBtnText: {
    ...Typography.bodyBold,
    color: Colors.azure,
    fontSize: 16,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.white,
    fontSize: 11,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: Colors.whiteTranslucent,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    shadowColor: Colors.darkAzure,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  sectionHeader: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlayDark,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  barBg: {
    height: 8,
    backgroundColor: Colors.grayDark,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginTop: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
});
