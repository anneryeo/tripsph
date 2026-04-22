/**
 * Reporting Flow Screen (Web)
 *
 * Uses a deterministic mock camera scene for web previews to avoid
 * relying on native camera/webcam feeds.
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

export default function ReportingFlowScreen({ navigation }) {
  const [capturing, setCapturing] = useState(false);

  const mockImageUri = useMemo(() => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'>
      <defs>
        <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='#1f525c'/>
          <stop offset='100%' stop-color='#2c6e7a'/>
        </linearGradient>
      </defs>
      <rect width='1200' height='800' fill='url(#bg)'/>
      <rect x='40' y='560' width='1120' height='160' fill='rgba(18,50,57,0.35)'/>
      <rect x='200' y='320' rx='28' ry='28' width='800' height='280' fill='#1f525c'/>
      <rect x='280' y='250' rx='24' ry='24' width='640' height='120' fill='#2c6e7a'/>
      <rect x='350' y='276' rx='14' ry='14' width='190' height='72' fill='#d8ece8'/>
      <rect x='660' y='276' rx='14' ry='14' width='190' height='72' fill='#d8ece8'/>
      <circle cx='340' cy='620' r='72' fill='#1b2325'/>
      <circle cx='860' cy='620' r='72' fill='#1b2325'/>
      <circle cx='340' cy='620' r='36' fill='#9fb6b1'/>
      <circle cx='860' cy='620' r='36' fill='#9fb6b1'/>
      <rect x='455' y='472' rx='10' ry='10' width='290' height='84' fill='#ffffff'/>
      <text x='600' y='525' text-anchor='middle' font-family='Arial, sans-serif' font-size='44' font-weight='700' fill='#123239'>NCA 6021</text>
      <rect x='492' y='408' rx='7' ry='7' width='216' height='24' fill='rgba(255,255,255,0.35)'/>
      <circle cx='248' cy='454' r='24' fill='#ed8936'/>
      <circle cx='952' cy='454' r='24' fill='#ed8936'/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, []);

  const handleReturn = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('RoleSelect');
  };

  const handleCapture = () => {
    if (capturing) return;
    setCapturing(true);

    const timestamp = Date.now();
    navigation.navigate('ReportConfirm', {
      imageUri: mockImageUri,
      timestamp,
      latitude: 14.5876,
      longitude: 121.0607,
    });

    setCapturing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkAzure} translucent={false} />

      <View style={styles.overlay}>
        <View style={styles.topOverlay}>
          <TouchableOpacity
            onPress={handleReturn}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Return"
          >
            <Text style={styles.backText}>Return</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Capture Violation</Text>
          <Text style={styles.headerSub}>Web camera preview with visible plate framing</Text>
        </View>

        <View style={styles.previewArea}>
          <View style={styles.mockRoad} />
          <View style={styles.mockCarBody}>
            <View style={styles.mockCarRoof}>
              <View style={styles.mockWindow} />
              <View style={styles.mockWindow} />
            </View>
            <View style={styles.mockPlateWrap}>
              <Text style={styles.mockPlateText}>NCA 6021</Text>
            </View>
            <View style={[styles.mockLamp, styles.mockLampLeft]} />
            <View style={[styles.mockLamp, styles.mockLampRight]} />
            <View style={[styles.mockWheel, styles.mockWheelLeft]} />
            <View style={[styles.mockWheel, styles.mockWheelRight]} />
          </View>

          <View style={styles.frameArea}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>

          <Text style={styles.sceneHint}>Align the license plate inside the frame</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlBtn}
            accessibilityRole="button"
            accessibilityLabel="Web flash simulation"
          >
            <Text style={styles.controlLabel}>FLASH OFF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shutterOuter, capturing && styles.shutterCapturing]}
            onPress={handleCapture}
            disabled={capturing}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <View style={styles.controlBtn} />
        </View>
      </View>

      <View style={styles.infoBar}>
        <Text style={styles.infoText}>Web preview uses a sample vehicle plate scene</Text>
        <Text style={styles.infoSub}>GPS and UTC timestamp are attached on submit</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkAzure,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topOverlay: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
  },
  backText: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
  headerTitle: {
    ...Typography.heading2,
    color: Colors.white,
    marginTop: Spacing.sm,
  },
  headerSub: {
    ...Typography.caption,
    color: Colors.grayGreen,
    marginTop: 4,
  },
  previewArea: {
    flex: 1,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: Colors.azure,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mockRoad: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    backgroundColor: 'rgba(18,50,57,0.35)',
  },
  mockCarBody: {
    width: '84%',
    height: '42%',
    minHeight: 180,
    backgroundColor: Colors.azure,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mockCarRoof: {
    position: 'absolute',
    top: -54,
    width: '70%',
    height: 62,
    borderRadius: Radius.md,
    backgroundColor: Colors.azureLight,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  mockWindow: {
    width: 72,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: '#d8ece8',
  },
  mockPlateWrap: {
    width: 160,
    height: 52,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  mockPlateText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  mockLamp: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    top: '48%',
    backgroundColor: Colors.orange,
  },
  mockLampLeft: {
    left: 14,
  },
  mockLampRight: {
    right: 14,
  },
  mockWheel: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    bottom: -22,
    backgroundColor: '#1b2325',
    borderWidth: 2,
    borderColor: '#8ba3a0',
  },
  mockWheelLeft: {
    left: 26,
  },
  mockWheelRight: {
    right: 26,
  },
  frameArea: {
    position: 'absolute',
    width: '70%',
    aspectRatio: 1.5,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: Colors.grayGreen,
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  sceneHint: {
    ...Typography.caption,
    color: Colors.white,
    position: 'absolute',
    bottom: Spacing.md,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  controlBtn: {
    width: 72,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlLabel: {
    ...Typography.caption,
    color: Colors.white,
    textAlign: 'center',
  },
  shutterOuter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterCapturing: {
    borderColor: Colors.grayGreen,
    opacity: 0.7,
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
  },
  infoBar: {
    backgroundColor: Colors.overlayLight,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSoft,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  infoSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    fontSize: 11,
  },
});