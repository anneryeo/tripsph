/**
 * Enforcer Login Screen
 *
 * Authorized access only. Validates MMDA badge number and PIN.
 * In production this authenticates against the MMDA identity provider.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Typography, Spacing, Radius, Gradients } from '../../constants/theme';

// Demo credentials
const DEMO_BADGE = 'MMDA-2026';
const DEMO_PIN   = '1234';

export default function EnforcerLoginScreen({ navigation }) {
  const [badge, setBadge]       = useState('');
  const [pin, setPin]           = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!badge.trim() || !pin.trim()) {
      Alert.alert('Missing Fields', 'Please enter your Badge ID and PIN.');
      return;
    }
    setLoading(true);
    // Simulate auth round-trip
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);

    if (badge.toUpperCase().trim() === DEMO_BADGE && pin === DEMO_PIN) {
      navigation.replace('EnforcerDashboard', { enforcerId: badge.trim() });
    } else {
      Alert.alert(
        'Authentication Failed',
        'Invalid Badge ID or PIN.\n\nDemo credentials:\nBadge: MMDA-2026\nPIN: 1234',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundTint} />
      <LinearGradient
        colors={Gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      >
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Back ── */}
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Return</Text>
        </TouchableOpacity>

        {/* ── Shield icon ── */}
        <View style={styles.iconWrap}>
          <View style={styles.logoBadge}>
            <Image
              source={require('../../../assets/TRIPSPH-logo-white.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.shieldIcon}>
            <Text style={styles.shieldLabel}>E</Text>
          </View>
          <Text style={styles.eyebrow}>Secure officer access</Text>
          <Text style={styles.title}>Enforcer Access</Text>
          <Text style={styles.subtitle}>Verified personnel only</Text>
        </View>

        {/* ── Form ── */}
        <View style={styles.form}>
          <Text style={styles.label}>MMDA Badge ID</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. MMDA-2026"
            placeholderTextColor={Colors.textSecondary}
            value={badge}
            onChangeText={setBadge}
            autoCapitalize="characters"
            autoCorrect={false}
            accessibilityLabel="MMDA Badge ID"
          />

          <Text style={[styles.label, { marginTop: Spacing.md }]}>PIN</Text>
          <TextInput
            style={styles.input}
            placeholder="4-digit PIN"
            placeholderTextColor={Colors.textSecondary}
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            accessibilityLabel="PIN"
          />

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Authenticate as enforcer"
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.loginBtnText}>Authenticate</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Demo hint */}
        <Text style={styles.demoHint}>
          Demo: Badge MMDA-2026 · PIN 1234
        </Text>
      </KeyboardAvoidingView>
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
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  back: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backText: {
    ...Typography.bodyBold,
    color: Colors.routeTeal,
  },
  iconWrap: {
    alignItems: 'center',
    marginTop: Spacing.xl,
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
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.edgeHighlight,
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
  shieldIcon: {
    width: 74,
    height: 74,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(47,212,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  shieldLabel: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.routeTeal,
  },
  eyebrow: {
    ...Typography.caption,
    color: Colors.routeTeal,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.heading1,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  form: {
    backgroundColor: Colors.whiteTranslucent,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.edgeHighlight,
    shadowColor: Colors.routeTeal,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  label: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surfaceBase,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  loginBtn: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.azure,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: Colors.routeTeal,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  loginBtnText: {
    ...Typography.bodyBold,
    color: Colors.white,
    fontSize: 16,
  },
  demoHint: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.lg,
    color: Colors.textTertiary,
  },
});
