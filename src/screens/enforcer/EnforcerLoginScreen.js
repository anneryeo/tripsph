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
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

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
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundTint} />
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Back ── */}
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'< Back'}</Text>
        </TouchableOpacity>

        {/* ── Shield icon ── */}
        <View style={styles.iconWrap}>
          <View style={styles.shieldIcon}>
            <Text style={styles.shieldLabel}>E</Text>
          </View>
          <Text style={styles.title}>Enforcer Access</Text>
          <Text style={styles.subtitle}>MMDA Authorized Personnel Only</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundTint,
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
    color: Colors.azure,
  },
  iconWrap: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  shieldIcon: {
    width: 74,
    height: 74,
    borderRadius: Radius.lg,
    backgroundColor: Colors.glowAzure,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  shieldLabel: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.azure,
  },
  title: {
    ...Typography.heading1,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.orange,
    marginTop: Spacing.xs,
    letterSpacing: 1,
  },
  form: {
    backgroundColor: Colors.whiteTranslucent,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    shadowColor: Colors.darkAzure,
    shadowOpacity: 0.1,
    shadowRadius: 20,
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
    borderRadius: Radius.sm,
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
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.darkAzure,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
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
    color: Colors.textSecondary,
  },
});
