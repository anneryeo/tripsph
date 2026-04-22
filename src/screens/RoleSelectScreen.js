/**
 * Role Select Screen
 *
 * Entry point for the app. Users choose between Motorist mode
 * and Enforcer mode (requires authorization).
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius, Gradients } from '../constants/theme';

export default function RoleSelectScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundTint} />
      <LinearGradient
        colors={Gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      >
      <View style={styles.bgOrbA} />
      <View style={styles.bgOrbB} />

      {/* ── Logo / Brand ── */}
      <View style={styles.brand}>
        <Text style={styles.eyebrow}>Urban routing and enforcement</Text>
        <View style={styles.logoBadge}>
          <Image
            source={require('../../assets/TRIPSPH-logo-white.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.tagline}>
          Traffic Routing & Intelligent Parking System
        </Text>
        <Text style={styles.subtitle}>
          Choose an operational mode to continue
        </Text>
      </View>

      {/* ── Role Selection ── */}
      <View style={styles.roleSection}>
        <Text style={styles.prompt}>Select mode</Text>

        {/* Motorist Button */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => navigation.navigate('MotoristApp')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Continue as Motorist"
        >
          <View style={[styles.roleIconWrap, styles.motoristIcon]}>
            <Text style={styles.roleIconLabel}>M</Text>
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>Motorist</Text>
            <Text style={styles.roleDesc}>
              Route guidance, parking risk, and reporting
            </Text>
          </View>
          <Text style={styles.roleArrow}>GO</Text>
        </TouchableOpacity>

        {/* Enforcer Button */}
        <TouchableOpacity
          style={[styles.roleCard, styles.enforcerCard]}
          onPress={() => navigation.navigate('EnforcerLogin')}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Continue as MMDA Enforcer"
        >
          <View style={[styles.roleIconWrap, styles.enforcerIcon]}>
            <Text style={styles.roleIconLabel}>E</Text>
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>MMDA Enforcer</Text>
            <Text style={styles.roleDesc}>
              Secure triage, evidence review, and dispatch
            </Text>
          </View>
          <Text style={styles.roleArrow}>GO</Text>
        </TouchableOpacity>
      </View>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          MMITS Bagong Gawi, Bagong Galaw Challenge 2026
        </Text>
        <Text style={styles.footerText}>MMDA · JICA</Text>
      </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkAzure,
  },
  gradientBg: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    position: 'relative',
  },
  bgOrbA: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    top: -70,
    left: -40,
    backgroundColor: 'rgba(47,212,255,0.14)',
  },
  bgOrbB: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 999,
    bottom: 80,
    right: -80,
    backgroundColor: 'rgba(12,127,166,0.16)',
  },
  brand: {
    alignItems: 'flex-start',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  eyebrow: {
    ...Typography.caption,
    color: Colors.routeTeal,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: Spacing.md,
  },
  logoBadge: {
    width: 228,
    height: 72,
    borderRadius: Radius.lg,
    backgroundColor: Colors.azure,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    shadowColor: Colors.darkAzure,
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  logoImage: {
    width: '90%',
    height: '74%',
  },
  tagline: {
    ...Typography.heading1,
    color: Colors.textPrimary,
    textAlign: 'left',
    maxWidth: 300,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    maxWidth: 280,
  },
  roleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  prompt: {
    ...Typography.caption,
    textAlign: 'left',
    marginBottom: Spacing.md,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.textTertiary,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.whiteTranslucent,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.edgeHighlight,
    shadowColor: Colors.routeTeal,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  enforcerCard: {
    borderColor: 'rgba(255,154,74,0.28)',
  },
  roleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  motoristIcon: {
    backgroundColor: 'rgba(47,212,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(47,212,255,0.25)',
  },
  enforcerIcon: {
    backgroundColor: 'rgba(255,154,74,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,154,74,0.24)',
  },
  roleIconLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  roleDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  roleArrow: {
    ...Typography.caption,
    color: Colors.routeTeal,
    fontWeight: '700',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
});
