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
import { Colors, Typography, Spacing, Radius } from '../constants/theme';

export default function RoleSelectScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundTint} />

      {/* ── Logo / Brand ── */}
      <View style={styles.brand}>
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
          accessibilityRole="button"
          accessibilityLabel="Continue as Motorist"
        >
          <View style={[styles.roleIconWrap, styles.motoristIcon]}>
            <Text style={styles.roleIconLabel}>M</Text>
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleTitle}>Motorist</Text>
            <Text style={styles.roleDesc}>
              Live parking risk map · Real-time OIE verdicts ·{'\n'}
              Report violations with AI verification
            </Text>
          </View>
          <Text style={styles.roleArrow}>></Text>
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
              Authorized access only · AI-prioritized reports ·{'\n'}
              NCAP dispatch & ticketing
            </Text>
          </View>
          <Text style={styles.roleArrow}>></Text>
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
    backgroundColor: Colors.backgroundTint,
    paddingHorizontal: Spacing.lg,
  },
  brand: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
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
    borderColor: Colors.azureLight,
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
    ...Typography.bodyBold,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.azure,
    marginTop: 4,
    letterSpacing: 1,
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
    color: Colors.textSecondary,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.whiteTranslucent,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    shadowColor: Colors.darkAzure,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  enforcerCard: {
    borderColor: Colors.orange + '55',
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
    backgroundColor: Colors.glowGreen,
  },
  enforcerIcon: {
    backgroundColor: Colors.glowAzure,
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
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  roleArrow: {
    fontSize: 28,
    color: Colors.azure,
    fontWeight: '300',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
});
