/**
 * App Navigator
 *
 * Root navigation structure for the app.
 * Two top-level modes: Motorist and Enforcer (authorized access only).
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '../constants/theme';

// Screens
import RoleSelectScreen    from '../screens/RoleSelectScreen';
import HomeMapScreen       from '../screens/motorist/HomeMapScreen';
import NavigationModeScreen from '../screens/motorist/NavigationModeScreen';
import ReportingFlowScreen from '../screens/motorist/ReportingFlowScreen';
import ReportConfirmScreen from '../screens/motorist/ReportConfirmScreen';
import EnforcerLoginScreen from '../screens/enforcer/EnforcerLoginScreen';
import EnforcerDashboardScreen from '../screens/enforcer/EnforcerDashboardScreen';
import ReportDetailScreen  from '../screens/enforcer/ReportDetailScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Tab icon helper ───────────────────────────────────────────────────────────
function TabIcon({ label, focused }) {
  const iconColor = focused ? Colors.grayGreen : 'rgba(255,255,255,0.85)';
  return (
    <View style={styles.tabWrap}>
      <View style={[styles.tabGlyphShell, focused && styles.tabGlyphShellFocused]}>
        {label === 'Map' ? (
          <View style={styles.mapGlyph}>
            <View style={[styles.mapStroke, { backgroundColor: iconColor }]} />
            <View style={[styles.mapStroke, { backgroundColor: iconColor }]} />
            <View style={[styles.mapStroke, { backgroundColor: iconColor }]} />
          </View>
        ) : (
          <View style={[styles.cameraGlyph, { borderColor: iconColor }]}> 
            <View style={[styles.cameraLens, { borderColor: iconColor }]} />
          </View>
        )}
      </View>
      <Text style={[styles.tabLabel, { color: iconColor }]}>
        {label}
      </Text>
    </View>
  );
}

// ── Motorist Tab Navigator ────────────────────────────────────────────────────
function MotoristTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: Colors.darkAzure,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: 16,
          backgroundColor: 'rgba(7,20,27,0.88)',
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: Colors.edgeHighlight,
          borderRadius: 26,
          height: 72,
          paddingBottom: 10,
          paddingTop: 10,
          shadowColor: Colors.routeTeal,
          shadowOpacity: 0.16,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 12 },
          elevation: 8,
        },
        tabBarActiveTintColor: Colors.grayGreen,
        tabBarInactiveTintColor: Colors.white,
      }}
    >
      <Tab.Screen
        name="Map"
        component={HomeMapScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Map" focused={focused} />,
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportingFlowScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Report" focused={focused} />,
          tabBarLabel: () => null,
        }}
      />
    </Tab.Navigator>
  );
}

// ── Root Stack Navigator ──────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="RoleSelect"
      screenOptions={{ headerShown: false }}
    >
      {/* ── Shared ── */}
      <Stack.Screen name="RoleSelect"    component={RoleSelectScreen} />

      {/* ── Motorist Flow ── */}
      <Stack.Screen name="MotoristApp"   component={MotoristTabs} />
      <Stack.Screen name="NavigationMode" component={NavigationModeScreen} />
      <Stack.Screen name="ReportConfirm"  component={ReportConfirmScreen} />

      {/* ── Enforcer Flow ── */}
      <Stack.Screen name="EnforcerLogin"     component={EnforcerLoginScreen} />
      <Stack.Screen name="EnforcerDashboard" component={EnforcerDashboardScreen} />
      <Stack.Screen name="ReportDetail"      component={ReportDetailScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabGlyphShell: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.edgeHighlight,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabGlyphShellFocused: {
    backgroundColor: 'rgba(47,212,255,0.16)',
    borderColor: 'rgba(47,212,255,0.4)',
  },
  mapGlyph: {
    width: 14,
    gap: 2,
  },
  mapStroke: {
    height: 2,
    borderRadius: 999,
  },
  cameraGlyph: {
    width: 14,
    height: 10,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraLens: {
    width: 5,
    height: 5,
    borderRadius: 999,
    borderWidth: 1.2,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
