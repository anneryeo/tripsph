/**
 * Report Detail Screen - Enforcer Actions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
import { issueNCAPViolation } from '../../services/AIReportService';
import { ConfidenceBar, Card } from '../../components/UIComponents';

const { width } = Dimensions.get('window');

export default function ReportDetailScreen({ navigation, route }) {
  const { report, enforcerId } = route.params ?? {};
  const [actionLoading, setActionLoading] = useState(null);
  const [actionDone, setActionDone] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [ncapTicket, setNcapTicket] = useState(null);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000);
      setElapsed(s);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatElapsed = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const timeRemaining = Math.max(0, Targets.enforcerResponseTimeSec - elapsed);
  const timerColor = timeRemaining < 60 ? Colors.alarmRed : timeRemaining < 120 ? Colors.orange : Colors.grayGreen;

  const handleDispatchTow = async () => {
    setActionLoading('tow');
    await new Promise((r) => setTimeout(r, 600));
    setActionLoading(null);
    setActionDone('tow');
    Alert.alert('Towing Dispatched', `Tow truck sent to:\n${report.address}\nPlate: ${report.plateNumber}`);
  };

  const handleNCAPViolation = async () => {
    setActionLoading('ncap');
    try {
      const result = await issueNCAPViolation({
        plateNumber: report.plateNumber,
        violationType: report.violationType,
        latitude: report.latitude,
        longitude: report.longitude,
        timestamp: report.timestamp,
        photoUrl: report.photoUrl ?? `https://storage.tripsph.mmda.gov.ph/${report.id}`,
        enforcerId,
        confidence: report.confidence,
      });

      setNcapTicket(result.ticketNumber);
      setActionDone('ncap');
      Alert.alert(
        'NCAP Violation Issued',
        `Ticket: ${result.ticketNumber}\nPlate: ${report.plateNumber}\nResponse: ${result.enforcerResponseMs} ms`,
      );
    } catch {
      Alert.alert('Error', 'Failed to issue NCAP violation. Check connection.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFalseAlarm = async () => {
    Alert.alert(
      'Mark as False Alarm?',
      'This removes the report from queue and marks this detection pattern as lower confidence.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            setActionLoading('false');
            await new Promise((r) => setTimeout(r, 400));
            setActionLoading(null);
            setActionDone('false');
            navigation.goBack();
          },
        },
      ],
    );
  };

  const timeAgo = Math.floor((Date.now() - new Date(report?.timestamp ?? Date.now())) / 60000);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundTint} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back to dashboard"
        >
          <Text style={styles.backText}>Return</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Violation Report</Text>
        <View style={[styles.timerBadge, { borderColor: timerColor }]}>
          <Text style={[styles.timerText, { color: timerColor }]}>{formatElapsed(elapsed)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.photoCard}>
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoGlyph}>EVIDENCE</Text>
            <Text style={styles.photoCaption}>Citizen Photo Evidence</Text>
            {!report?.photoUrl && <Text style={styles.photoSub}>Photo stored on MMDA backend</Text>}
          </View>

          {report?.aiVerified && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI VERIFIED</Text>
            </View>
          )}
        </View>

        <Card style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plate</Text>
            <Text style={styles.detailValue}>{report?.plateNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Violation</Text>
            <Text style={styles.detailValue}>{report?.violationType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue} numberOfLines={2}>{report?.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reported</Text>
            <Text style={styles.detailValue}>{timeAgo} min ago</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>GPS</Text>
            <Text style={styles.detailValue}>
              {report?.latitude?.toFixed(5)}, {report?.longitude?.toFixed(5)}
            </Text>
          </View>

          <ConfidenceBar value={report?.confidence ?? 0} label="AI Detection Confidence" />

          {ncapTicket && (
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>NCAP Ticket</Text>
              <Text style={styles.ticketNum}>{ncapTicket}</Text>
            </View>
          )}
        </Card>

        <Card style={styles.timerCard}>
          <Text style={styles.timerCardTitle}>Enforcer Response Timer</Text>
          <View style={styles.timerRow}>
            <Text style={[styles.timerBig, { color: timerColor }]}>{formatElapsed(elapsed)}</Text>
            <Text style={styles.timerTarget}>Target: 5 min</Text>
          </View>
          <View style={styles.timerBarBg}>
            <View
              style={[
                styles.timerBarFill,
                {
                  width: `${Math.min(100, (elapsed / Targets.enforcerResponseTimeSec) * 100)}%`,
                  backgroundColor: timerColor,
                },
              ]}
            />
          </View>
        </Card>

        {actionDone ? (
          <View style={styles.doneCard}>
            <View style={styles.doneGlyph}>
              <Text style={styles.doneGlyphText}>
                {actionDone === 'tow' ? 'TOW' : actionDone === 'ncap' ? 'NCAP' : 'VOID'}
              </Text>
            </View>
            <Text style={styles.doneText}>
              {actionDone === 'tow'
                ? 'Tow Dispatched'
                : actionDone === 'ncap'
                ? 'NCAP Violation Issued'
                : 'Marked as False Alarm'}
            </Text>
          </View>
        ) : (
          <View style={styles.actionPanel}>
            <Text style={styles.actionTitle}>Action Panel</Text>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionPrimary]}
              onPress={handleDispatchTow}
              disabled={actionLoading !== null}
              accessibilityRole="button"
              accessibilityLabel="Dispatch towing"
            >
              {actionLoading === 'tow' ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <View style={styles.actionIcon}><Text style={styles.actionIconText}>T</Text></View>
                  <Text style={styles.actionBtnText}>Dispatch Towing</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionNcap]}
              onPress={handleNCAPViolation}
              disabled={actionLoading !== null}
              accessibilityRole="button"
              accessibilityLabel="Issue NCAP violation"
            >
              {actionLoading === 'ncap' ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <View style={styles.actionIcon}><Text style={styles.actionIconText}>N</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actionBtnText}>Issue NCAP Violation</Text>
                    <Text style={styles.actionBtnSub}>Pre-fills plate, GPS, time, and photo</Text>
                  </View>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionGhost]}
              onPress={handleFalseAlarm}
              disabled={actionLoading !== null}
              accessibilityRole="button"
              accessibilityLabel="Mark as false alarm"
            >
              {actionLoading === 'false' ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <View style={styles.actionIcon}><Text style={styles.actionIconText}>X</Text></View>
                  <Text style={styles.actionBtnText}>Mark as False Alarm</Text>
                </>
              )}
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
    minWidth: 95,
  },
  headerTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  timerBadge: {
    borderWidth: 2,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 60,
    alignItems: 'center',
    backgroundColor: Colors.surfaceBase,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  photoCard: {
    width: '100%',
    height: width * 0.6,
    backgroundColor: Colors.surfaceMuted,
    position: 'relative',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoGlyph: {
    ...Typography.bodyBold,
    color: Colors.white,
    letterSpacing: 1,
  },
  photoCaption: {
    ...Typography.bodyBold,
    color: Colors.grayGreen,
    marginTop: Spacing.xs,
  },
  photoSub: {
    ...Typography.caption,
    color: Colors.surfaceMuted,
    marginTop: 4,
  },
  aiBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(255,91,110,0.18)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  aiBadgeText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.white,
  },
  detailCard: {
    margin: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSoft,
  },
  detailLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    width: 80,
    flexShrink: 0,
  },
  detailValue: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
  },
  ticketRow: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: 'rgba(49,184,123,0.14)',
    borderRadius: Radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.grayGreen,
  },
  ticketLabel: {
    ...Typography.caption,
    color: Colors.azure,
  },
  ticketNum: {
    ...Typography.bodyBold,
    color: Colors.azure,
    letterSpacing: 1,
  },
  timerCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  timerCardTitle: {
    ...Typography.label,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  timerBig: {
    fontSize: 28,
    fontWeight: '800',
  },
  timerTarget: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  timerBarBg: {
    height: 6,
    backgroundColor: Colors.borderSoft,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  timerBarFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  actionPanel: {
    marginHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  actionTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    minHeight: 60,
  },
  actionPrimary: {
    backgroundColor: Colors.azure,
  },
  actionNcap: {
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  actionGhost: {
    backgroundColor: 'rgba(255,91,110,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,91,110,0.24)',
  },
  actionIcon: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  actionIconText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 12,
  },
  actionBtnText: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.white,
  },
  actionBtnSub: {
    ...Typography.caption,
    color: Colors.grayGreen,
    marginTop: 2,
  },
  doneCard: {
    margin: Spacing.md,
    backgroundColor: Colors.whiteTranslucent,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  doneGlyph: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.glowGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  doneGlyphText: {
    color: Colors.azure,
    fontWeight: '800',
    fontSize: 12,
  },
  doneText: {
    ...Typography.heading3,
    color: Colors.textPrimary,
  },
});