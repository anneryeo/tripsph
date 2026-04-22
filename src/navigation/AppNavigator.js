/**
 * App Navigator
 *
 * Root navigation structure for TRIPS PH.
 * Two top-level modes: Motorist and Enforcer (authorized access only).
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

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
  const icons = {
    Map:    '🗺',
    Report: '📷',
    Info:   'ℹ',
  };
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 22 }}>{icons[label] ?? '●'}</Text>
      <Text
        style={{
          fontSize: 10,
          color: focused ? Colors.grayGreen : Colors.gray,
          marginTop: 2,
        }}
      >
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
        tabBarStyle: {
          backgroundColor: Colors.azure,
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 8,
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
