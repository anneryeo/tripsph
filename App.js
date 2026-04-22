/**
 * TRIPS PH – Traffic Routing & Intelligent Parking System
 *
 * Submission for MMITS Bagong Gawi, Bagong Galaw Challenge 2026
 * Hosted by MMDA and JICA
 *
 * Architecture:
 * - Ordinance Intelligence Engine (OIE) via persistent WebSocket
 * - On-device TFLite AI for license plate OCR + violation classification
 * - Dual-mode: Motorist (Live Risk Map) + Enforcer (NCAP Dashboard)
 */

import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/constants/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary:      Colors.grayGreen,
            background:   Colors.darkAzure,
            card:         Colors.azure,
            text:         Colors.white,
            border:       Colors.grayDark,
            notification: Colors.alarmRed,
          },
        }}
      >
        <SafeAreaView style={styles.appSafeArea} edges={['top']}>
          <StatusBar style="light" backgroundColor={Colors.darkAzure} translucent={false} />
          <AppNavigator />
        </SafeAreaView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appSafeArea: {
    flex: 1,
  },
});
