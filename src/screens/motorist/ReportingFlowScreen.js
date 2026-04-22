/**
 * Reporting Flow Screen - Camera Capture
 */

import React, { useState, useRef } from 'react';
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

const { width } = Dimensions.get('window');

export default function ReportingFlowScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [flash, setFlash] = useState('off');
  const cameraRef = useRef(null);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredMsg}>
          <Text style={styles.centerMsgText}>Checking camera permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundTint} />
        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <Text style={styles.permissionIconText}>CAM</Text>
          </View>
          <Text style={styles.permTitle}>Camera Access Required</Text>
          <Text style={styles.permDesc}>
            TRIPS PH needs camera access to capture violation photos for AI verification.
          </Text>
          <TouchableOpacity
            style={styles.permBtn}
            onPress={requestPermission}
            accessibilityRole="button"
            accessibilityLabel="Grant camera permission"
          >
            <Text style={styles.permBtnText}>Grant Camera Access</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);

    try {
      const timestamp = Date.now();
      const gpsCoords = {
        latitude: 14.5876,
        longitude: 121.0607,
        accuracy: 5,
      };

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: false,
        exif: false,
        skipProcessing: Platform.OS === 'android',
      });

      navigation.navigate('ReportConfirm', {
        imageUri: photo.uri,
        timestamp,
        latitude: gpsCoords.latitude,
        longitude: gpsCoords.longitude,
      });
    } catch {
      Alert.alert('Capture Failed', 'Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <CameraView ref={cameraRef} style={styles.camera} facing="back" flash={flash}>
        <View style={styles.overlay}>
          <View style={styles.topOverlay}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <Text style={styles.backText}>{'< Back'}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Capture Violation</Text>
            <Text style={styles.headerSub}>Center the vehicle plate and violation area</Text>
          </View>

          <View style={styles.frameArea}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}
              accessibilityRole="button"
              accessibilityLabel="Toggle flash"
            >
              <Text style={styles.controlLabel}>{flash === 'off' ? 'FLASH OFF' : 'FLASH ON'}</Text>
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
      </CameraView>

      <View style={styles.infoBar}>
        <Text style={styles.infoText}>GPS and UTC timestamp captured automatically</Text>
        <Text style={styles.infoSub}>On-device AI scan target: under 500ms</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundTint,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  permissionCard: {
    width: '100%',
    backgroundColor: Colors.whiteTranslucent,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: Colors.darkAzure,
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  permissionIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    backgroundColor: Colors.glowAzure,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  permissionIconText: {
    fontWeight: '800',
    color: Colors.azure,
    letterSpacing: 1,
  },
  centeredMsg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.darkAzure,
  },
  centerMsgText: {
    ...Typography.body,
    color: Colors.white,
  },
  permTitle: {
    ...Typography.heading2,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  permDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
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
    color: Colors.white,
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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.35)',
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
  frameArea: {
    alignSelf: 'center',
    width: width * 0.78,
    height: width * 0.56,
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
    paddingTop: Spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.35)',
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