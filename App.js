/**
 * Traffic Routing & Intelligent Parking System
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
import { Platform, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import { Colors, Gradients } from './src/constants/theme';

if (Platform.OS === 'web') {
  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.style = [
    Text.defaultProps.style,
    { fontFamily: 'Canva Sans, Segoe UI, Helvetica Neue, Arial, sans-serif' },
  ];
}

export default function App() {
  const isWeb = Platform.OS === 'web';

  return (
    <SafeAreaProvider>
      <LinearGradient colors={Gradients.heroSky} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.root}>
        <View style={[styles.appFrame, isWeb && styles.webFrame]}>
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
        </View>
      </LinearGradient>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  appFrame: {
    flex: 1,
    width: '100%',
  },
  webFrame: {
    maxWidth: 430,
    alignSelf: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.borderSoft,
    backgroundColor: Colors.darkAzure,
  },
  appSafeArea: {
    flex: 1,
  },
});
