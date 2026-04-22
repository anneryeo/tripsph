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
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

export default function RoleSelectScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkAzure} />

      {/* ── Logo / Brand ── */}
      <View style={styles.brand}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>🚗</Text>
        </View>
        <Text style={styles.appName}>TRIPS PH</Text>
        <Text style={styles.tagline}>
          Traffic Routing &amp; Intelligent Parking System
        </Text>
        <Text style={styles.subtitle}>
          Bagong Gawi · Bagong Galaw
        </Text>
      </View>

      {/* ── Role Selection ── */}
      <View style={styles.roleSection}>
        <Text style={styles.prompt}>Select your role to continue</Text>

        {/* Motorist Button */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => navigation.navigate('MotoristApp')}
          activeOpacity={0.85}
        >
          <Text style={styles.roleIcon}>🚘</Text>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>Motorist</Text>
            <Text style={styles.roleDesc}>
              Live parking risk map · Real-time OIE verdicts ·{'\n'}
              Report violations with AI verification
            </Text>
          </View>
          <Text style={styles.roleArrow}>›</Text>
        </TouchableOpacity>

        {/* Enforcer Button */}
        <TouchableOpacity
          style={[styles.roleCard, styles.enforcerCard]}
          onPress={() => navigation.navigate('EnforcerLogin')}
          activeOpacity={0.85}
        >
          <Text style={styles.roleIcon}>🛡</Text>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>MMDA Enforcer</Text>
            <Text style={styles.roleDesc}>
              Authorized access only · AI-prioritized reports ·{'\n'}
              NCAP dispatch &amp; ticketing
            </Text>
          </View>
          <Text style={styles.roleArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          MMITS Bagong Gawi, Bagong Galaw Challenge 2026
        </Text>
        <Text style={styles.footerText}>MMDA · JICA</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkAzure,
    paddingHorizontal: Spacing.lg,
  },
  brand: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.azure,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 3,
    borderColor: Colors.grayGreen,
  },
  logoText: { fontSize: 42 },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 4,
  },
  tagline: {
    ...Typography.body,
    color: Colors.grayGreen,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.gray,
    marginTop: 4,
    letterSpacing: 2,
  },
  roleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  prompt: {
    ...Typography.caption,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.azure,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.grayGreen + '44',
  },
  enforcerCard: {
    borderColor: Colors.orange + '66',
  },
  roleIcon: {
    fontSize: 36,
    marginRight: Spacing.md,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    ...Typography.heading3,
    marginBottom: 4,
  },
  roleDesc: {
    ...Typography.caption,
    lineHeight: 18,
  },
  roleArrow: {
    fontSize: 28,
    color: Colors.grayGreen,
    fontWeight: '300',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.grayDark,
    marginBottom: 2,
  },
});
