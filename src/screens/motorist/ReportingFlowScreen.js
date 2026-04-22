/**
 * Reporting Flow Screen
 *
 * Step 1 – Camera Capture
 *
 * The user taps the Camera icon to open this screen.
 * On capture, GPS coordinates and UTC timestamp are recorded atomically.
 * The photo is then passed to the AI pipeline screen.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export default function ReportingFlowScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [flash, setFlash] = useState('off');
  const cameraRef = useRef(null);

  // ── Permission check ──────────────────────────────────────────────────────
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredMsg}>
          <Text style={Typography.body}>Checking camera permissions…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.darkAzure} />
        <View style={styles.centeredMsg}>
          <Text style={styles.icon}>📷</Text>
          <Text style={styles.permTitle}>Camera Access Required</Text>
          <Text style={styles.permDesc}>
            TRIPS PH needs camera access to capture parking violation photos
            for AI-verified reporting to MMDA.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Grant Camera Access</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Capture handler ───────────────────────────────────────────────────────
  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);

    try {
      // Record GPS and UTC timestamp atomically with the photo
      const timestamp = Date.now();

      // Demo: fixed GPS coordinates in Ortigas Center area.
      // Production: replace with expo-location getCurrentPositionAsync().
      const gpsCoords = {
        latitude:  14.5876,
        longitude: 121.0607,
        accuracy:  5,
      };

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: false,
        exif: false,
        skipProcessing: Platform.OS === 'android',
      });

      // Navigate to AI confirmation screen
      navigation.navigate('ReportConfirm', {
        imageUri:  photo.uri,
        timestamp,
        latitude:  gpsCoords.latitude,
        longitude: gpsCoords.longitude,
      });
    } catch (err) {
      Alert.alert('Capture Failed', 'Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Camera Viewfinder ── */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        flash={flash}
      >
        {/* Overlay: Corner guides */}
        <View style={styles.overlay}>
          <View style={styles.topOverlay}>
            <Text style={styles.headerTitle}>Capture Violation</Text>
            <Text style={styles.headerSub}>
              Point camera at the illegally parked vehicle
            </Text>
          </View>

          {/* Viewfinder frame */}
          <View style={styles.frameArea}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {/* Flash toggle */}
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}
            >
              <Text style={styles.controlIcon}>
                {flash === 'off' ? '⚡' : '☀'}
              </Text>
            </TouchableOpacity>

            {/* Shutter */}
            <TouchableOpacity
              style={[styles.shutterOuter, capturing && styles.shutterCapturing]}
              onPress={handleCapture}
              disabled={capturing}
            >
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            {/* Spacer */}
            <View style={styles.controlBtn} />
          </View>
        </View>
      </CameraView>

      {/* ── Info bar ── */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          📍 GPS · ⏱ UTC Timestamp captured automatically
        </Text>
        <Text style={styles.infoSub}>
          {'On-device AI will scan for violations in <500ms'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centeredMsg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.darkAzure,
  },
  icon: { fontSize: 64, marginBottom: Spacing.md },
  permTitle: {
    ...Typography.heading2,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  permDesc: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.gray,
    marginBottom: Spacing.xl,
  },
  permBtn: {
    backgroundColor: Colors.azure,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  permBtnText: {
    ...Typography.bodyBold,
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topOverlay: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.heading2,
  },
  headerSub: {
    ...Typography.caption,
    color: Colors.grayGreen,
    marginTop: 4,
  },
  frameArea: {
    alignSelf: 'center',
    width: width * 0.75,
    height: width * 0.55,
    position: 'relative',
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingTop: Spacing.lg,
  },
  controlBtn: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIcon: { fontSize: 28 },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
    backgroundColor: Colors.azure,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.white,
  },
  infoSub: {
    ...Typography.caption,
    color: Colors.gray,
    marginTop: 2,
    fontSize: 11,
  },
});
