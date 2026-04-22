/**
 * Report Confirm Screen - AI Verification and Submission
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Typography, Spacing, Radius, Targets } from '../../constants/theme';
import { runAIPipeline, submitReport } from '../../services/AIReportService';
import { ConfidenceBar, Card } from '../../components/UIComponents';

const { width } = Dimensions.get('window');

export default function ReportConfirmScreen({ navigation, route }) {
  const { imageUri, timestamp, latitude, longitude } = route.params ?? {};

  const [scanning, setScanning] = useState(true);
  const [aiResult, setAiResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState(null);

  useEffect(() => {
    async function runScan() {
      const result = await runAIPipeline(imageUri);
      setAiResult(result);
      setScanning(false);
    }
    runScan();
  }, [imageUri]);

  const handleSubmit = async (asManual = false) => {
    if (!aiResult) return;
    setSubmitting(true);
    try {
      const { success, reportId: id } = await submitReport({
        imageUri,
        plateNumber: aiResult.plateNumber,
        violationType: aiResult.violationType,
        latitude,
        longitude,
        timestamp,
        confidence: aiResult.violationConfidence,
        aiVerified: aiResult.highConfidence && !asManual,
      });
      if (success) {
        setReportId(id);
        setSubmitted(true);
      }
    } catch {
      Alert.alert('Submission Failed', 'Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundTint} />
        <View style={styles.successScreen}>
          <View style={styles.successIconWrap}>
            <Text style={styles.successIcon}>OK</Text>
          </View>
          <Text style={styles.successTitle}>Report Submitted</Text>
          <Text style={styles.successSub}>
            {aiResult?.highConfidence
              ? 'AI verified report sent to MMDA for immediate action.'
              : 'Report sent for manual review in the enforcer queue.'}
          </Text>
          <Text style={styles.reportIdLabel}>Report ID</Text>
          <Text style={styles.reportId}>{reportId}</Text>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.navigate('MotoristApp')}
            accessibilityRole="button"
            accessibilityLabel="Return to motorist app"
          >
            <Text style={styles.doneBtnText}>Return</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundTint} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Return"
        >
          <Text style={styles.backText}>Return</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Verification</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <View style={styles.photoContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Text style={styles.placeholderTitle}>NO IMAGE</Text>
              <Text style={styles.placeholderSub}>Capture a new photo to continue</Text>
            </View>
          )}

          {scanning && (
            <View style={styles.scanningOverlay}>
              <ActivityIndicator size="large" color={Colors.grayGreen} />
              <Text style={styles.scanningText}>On-device AI scanning...</Text>
              <Text style={styles.scanningTarget}>Target budget: under 500ms</Text>
            </View>
          )}

          {!scanning && aiResult && (
            <View style={styles.annotationOverlay}>
              <View style={styles.plateBadge}>
                <Text style={styles.plateText}>{aiResult.plateNumber}</Text>
                <Text style={styles.plateCheck}>
                  {aiResult.plateConfidence >= Targets.aiDetectionConfidence ? 'OK' : '?'}
                </Text>
              </View>
              <View style={styles.violationLabel}>
                <Text style={styles.violationText}>{aiResult.annotationLabel}</Text>
                <Text
                  style={[
                    styles.violationCheck,
                    {
                      color:
                        aiResult.violationConfidence >= Targets.aiDetectionConfidence
                          ? Colors.grayGreen
                          : Colors.orange,
                    },
                  ]}
                >
                  {aiResult.violationConfidence >= Targets.aiDetectionConfidence
                    ? 'Verified'
                    : 'Low confidence'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {!scanning && aiResult && (
          <Card style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>AI Analysis Results</Text>
            <Text style={styles.inferenceTime}>Inference: {aiResult.inferenceTimeMs} ms</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>License Plate OCR</Text>
            <Text style={styles.resultValue}>{aiResult.plateNumber}</Text>
            <ConfidenceBar value={aiResult.plateConfidence} label="OCR Confidence" />

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>Violation Classification</Text>
            <Text style={styles.resultValue}>{aiResult.violationType}</Text>
            <ConfidenceBar value={aiResult.violationConfidence} label="Detection Confidence" />

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>Capture Metadata</Text>
            <Text style={styles.metaText}>
              GPS {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
            </Text>
            <Text style={styles.metaText}>UTC {new Date(timestamp).toUTCString()}</Text>

            <View style={styles.nextStepsBox}>
              <Text style={styles.nextStepsTitle}>What happens after submit</Text>
              <Text style={styles.nextStepsItem}>1. MMDA receives your evidence package.</Text>
              <Text style={styles.nextStepsItem}>2. AI-verified reports are prioritized for enforcement.</Text>
              <Text style={styles.nextStepsItem}>3. Low-confidence cases enter manual enforcer review.</Text>
            </View>
          </Card>
        )}

        {!scanning && aiResult && (
          <View style={styles.actions}>
            {aiResult.highConfidence ? (
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => handleSubmit(false)}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel="Submit verified report to MMDA"
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>Submit Verified Report to MMDA</Text>
                    <Text style={styles.submitBtnSub}>High confidence - AI verified</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.manualBtn}
                onPress={() => handleSubmit(true)}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel="Submit report for manual review"
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Text style={styles.manualBtnText}>Submit for Manual Review</Text>
                    <Text style={styles.manualBtnSub}>Low confidence - enforcer review queue</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Discard and retake"
            >
              <Text style={styles.cancelText}>Discard and Retake</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundTint,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.overlayLight,
    borderWidth: 1,
    borderColor: Colors.edgeHighlight,
    borderRadius: Radius.xl,
    margin: Spacing.md,
    marginBottom: 0,
  },
  backText: {
    ...Typography.bodyBold,
    color: Colors.routeTeal,
    width: 70,
  },
  headerTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  photoContainer: {
    position: 'relative',
    width: '100%',
    height: width * 0.75,
    backgroundColor: Colors.surfaceElevated,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceMuted,
  },
  placeholderTitle: {
    ...Typography.bodyBold,
    color: Colors.white,
    letterSpacing: 1,
  },
  placeholderSub: {
    ...Typography.caption,
    color: Colors.surfaceMuted,
    marginTop: 6,
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlayDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningText: {
    ...Typography.bodyBold,
    marginTop: Spacing.sm,
    color: Colors.grayGreen,
  },
  scanningTarget: {
    ...Typography.caption,
    marginTop: 4,
    color: Colors.white,
  },
  annotationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.sm,
  },
  plateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.azureTranslucent,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.grayGreen,
  },
  plateText: {
    ...Typography.bodyBold,
    fontSize: 15,
    letterSpacing: 2,
    color: Colors.white,
  },
  plateCheck: {
    ...Typography.caption,
    color: Colors.grayGreen,
    marginLeft: 6,
    fontWeight: '700',
  },
  violationLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.azureTranslucent,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  violationText: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
  violationCheck: {
    ...Typography.caption,
    marginLeft: 8,
    fontWeight: '700',
  },
  resultsCard: {
    margin: Spacing.md,
    marginTop: Spacing.lg,
  },
  resultsTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
  },
  inferenceTime: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSoft,
    marginVertical: Spacing.sm,
  },
  resultValue: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 18,
    marginBottom: 4,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  nextStepsBox: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.edgeHighlight,
    backgroundColor: Colors.surfaceBase,
  },
  nextStepsTitle: {
    ...Typography.caption,
    color: Colors.routeTeal,
    marginBottom: 4,
    fontWeight: '700',
  },
  nextStepsItem: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  actions: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  submitBtn: {
    backgroundColor: Colors.azure,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: Colors.routeTeal,
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  submitBtnText: {
    ...Typography.bodyBold,
    color: Colors.white,
    fontSize: 16,
  },
  submitBtnSub: {
    ...Typography.caption,
    color: Colors.grayGreen,
    marginTop: 4,
  },
  manualBtn: {
    backgroundColor: Colors.grayDark,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,154,74,0.25)',
  },
  manualBtnText: {
    ...Typography.bodyBold,
    fontSize: 16,
    color: Colors.white,
  },
  manualBtnSub: {
    ...Typography.caption,
    color: Colors.surfaceMuted,
    marginTop: 4,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  cancelText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  successScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  successIconWrap: {
    width: 76,
    height: 76,
    borderRadius: Radius.full,
    backgroundColor: Colors.glowGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successIcon: {
    fontWeight: '800',
    color: Colors.azure,
    letterSpacing: 1,
  },
  successTitle: {
    ...Typography.heading1,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  successSub: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  reportIdLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  reportId: {
    ...Typography.bodyBold,
    fontSize: 18,
    color: Colors.azure,
    marginBottom: Spacing.xl,
    letterSpacing: 1,
  },
  doneBtn: {
    backgroundColor: Colors.azure,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  doneBtnText: {
    ...Typography.bodyBold,
    color: Colors.white,
    fontSize: 16,
  },
});