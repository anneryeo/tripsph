/**
 * Report Confirm Screen – Step 2 & 3 of Reporting Flow
 *
 * Displays the captured photo with AI annotation overlay:
 * - License plate OCR result with confidence
 * - Violation classification with confidence bar
 * - Gray Green (✓) checkmarks for high-confidence detections
 *
 * Submission path:
 * - High-confidence (≥ 85 %) → Azure "Submit Verified Report to MMDA" button
 * - Low-confidence  (< 85 %) → submitted as Gray pin (manual review)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

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

  // ── Run AI pipeline on mount ──────────────────────────────────────────────
  useEffect(() => {
    async function runScan() {
      const result = await runAIPipeline(imageUri);
      setAiResult(result);
      setScanning(false);
    }
    runScan();
  }, [imageUri]);

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = async (asManual = false) => {
    if (!aiResult) return;
    setSubmitting(true);
    try {
      const { success, reportId: id } = await submitReport({
        imageUri,
        plateNumber:   aiResult.plateNumber,
        violationType: aiResult.violationType,
        latitude,
        longitude,
        timestamp,
        confidence:    aiResult.violationConfidence,
        aiVerified:    aiResult.highConfidence && !asManual,
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

  // ── Submitted confirmation screen ─────────────────────────────────────────
  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.darkAzure} />
        <View style={styles.successScreen}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Report Submitted!</Text>
          <Text style={styles.successSub}>
            {aiResult?.highConfidence
              ? 'AI-Verified Report sent to MMDA for immediate action.'
              : 'Report sent as Manual Review (Gray Pin) to MMDA queue.'}
          </Text>
          <Text style={styles.reportIdLabel}>Report ID</Text>
          <Text style={styles.reportId}>{reportId}</Text>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.navigate('MotoristApp')}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkAzure} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹ Retake</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Verification</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>

        {/* ── Photo ── */}
        <View style={styles.photoContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Text style={{ fontSize: 48 }}>📷</Text>
              <Text style={[Typography.caption, { marginTop: 8 }]}>No image captured</Text>
            </View>
          )}

          {/* AI scanning overlay */}
          {scanning && (
            <View style={styles.scanningOverlay}>
              <ActivityIndicator size="large" color={Colors.grayGreen} />
              <Text style={styles.scanningText}>
                On-device AI scanning…
              </Text>
              <Text style={styles.scanningTarget}>
                &lt; 500ms inference budget
              </Text>
            </View>
          )}

          {/* AI annotation overlay (after scan) */}
          {!scanning && aiResult && (
            <View style={styles.annotationOverlay}>
              <View style={styles.plateBadge}>
                <Text style={styles.plateText}>{aiResult.plateNumber}</Text>
                <Text style={styles.plateCheck}>
                  {aiResult.plateConfidence >= Targets.aiDetectionConfidence ? '✓' : '?'}
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
                    ? '✓ Verified'
                    : '⚠ Low Confidence'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ── AI Results Card ── */}
        {!scanning && aiResult && (
          <Card style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>AI Analysis Results</Text>
            <Text style={styles.inferenceTime}>
              Inference: {aiResult.inferenceTimeMs} ms
            </Text>

            <View style={styles.divider} />

            {/* Plate OCR */}
            <Text style={[Typography.label, { marginBottom: 4 }]}>
              License Plate OCR
            </Text>
            <Text style={styles.resultValue}>{aiResult.plateNumber}</Text>
            <ConfidenceBar value={aiResult.plateConfidence} label="OCR Confidence" />

            <View style={styles.divider} />

            {/* Violation Classification */}
            <Text style={[Typography.label, { marginBottom: 4 }]}>
              Violation Classification
            </Text>
            <Text style={styles.resultValue}>{aiResult.violationType}</Text>
            <ConfidenceBar value={aiResult.violationConfidence} label="Detection Confidence" />

            <View style={styles.divider} />

            {/* GPS & Time metadata */}
            <Text style={[Typography.label, { marginBottom: 6 }]}>
              Capture Metadata
            </Text>
            <Text style={styles.metaText}>
              📍 {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
            </Text>
            <Text style={styles.metaText}>
              ⏱ {new Date(timestamp).toUTCString()}
            </Text>
          </Card>
        )}

        {/* ── Action Buttons ── */}
        {!scanning && aiResult && (
          <View style={styles.actions}>
            {aiResult.highConfidence ? (
              /* High-confidence: prominent Azure submit button */
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => handleSubmit(false)}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>
                      Submit Verified Report to MMDA
                    </Text>
                    <Text style={styles.submitBtnSub}>
                      High Confidence – AI Verified ✓
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              /* Low-confidence: gray manual review button */
              <TouchableOpacity
                style={styles.manualBtn}
                onPress={() => handleSubmit(true)}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <>
                    <Text style={styles.manualBtnText}>
                      Submit for Manual Review
                    </Text>
                    <Text style={styles.manualBtnSub}>
                      Low Confidence – Gray Pin · Enforcer Review Queue
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelText}>Discard &amp; Retake</Text>
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
    backgroundColor: Colors.darkAzure,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.azure,
  },
  backText: {
    ...Typography.bodyBold,
    color: Colors.grayGreen,
    width: 60,
  },
  headerTitle: {
    ...Typography.heading3,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  photoContainer: {
    position: 'relative',
    width: '100%',
    height: width * 0.75,
    backgroundColor: '#000',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.azure,
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22,59,66,0.85)',
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
  },
  plateCheck: {
    ...Typography.bodyBold,
    color: Colors.grayGreen,
    marginLeft: 6,
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
  },
  resultsTitle: {
    ...Typography.heading3,
  },
  inferenceTime: {
    ...Typography.caption,
    color: Colors.grayGreen,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.grayDark,
    marginVertical: Spacing.sm,
  },
  resultValue: {
    ...Typography.bodyBold,
    fontSize: 18,
    marginBottom: 4,
  },
  metaText: {
    ...Typography.caption,
    marginBottom: 2,
  },
  actions: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  submitBtn: {
    backgroundColor: Colors.azure,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.grayGreen,
  },
  submitBtnText: {
    ...Typography.bodyBold,
    fontSize: 16,
  },
  submitBtnSub: {
    ...Typography.caption,
    color: Colors.grayGreen,
    marginTop: 4,
  },
  manualBtn: {
    backgroundColor: Colors.grayDark,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  manualBtnText: {
    ...Typography.bodyBold,
    fontSize: 16,
    color: Colors.white,
  },
  manualBtnSub: {
    ...Typography.caption,
    color: Colors.gray,
    marginTop: 4,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  cancelText: {
    ...Typography.body,
    color: Colors.gray,
    textDecorationLine: 'underline',
  },
  successScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  successIcon: { fontSize: 72, marginBottom: Spacing.lg },
  successTitle: {
    ...Typography.heading1,
    marginBottom: Spacing.sm,
  },
  successSub: {
    ...Typography.body,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  reportIdLabel: {
    ...Typography.caption,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  reportId: {
    ...Typography.bodyBold,
    fontSize: 18,
    color: Colors.grayGreen,
    marginBottom: Spacing.xl,
    letterSpacing: 1,
  },
  doneBtn: {
    backgroundColor: Colors.azure,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  doneBtnText: {
    ...Typography.bodyBold,
    fontSize: 16,
  },
});
