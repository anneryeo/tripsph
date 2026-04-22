/**
 * Report Detail Screen
 *
 * Displays citizen photo evidence + AI score for a selected violation report.
 *
 * Action Panel:
 * - [Dispatch Towing]
 * - [Issue NCAP Violation] → POST to MMDA ticketing system
 * - [Mark as False Alarm]
 *
 * Enforcer Response Time target: ≤ 5 minutes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
import { issueNCAPViolation } from '../../services/AIReportService';
import { ConfidenceBar, Card } from '../../components/UIComponents';

const { width } = Dimensions.get('window');

export default function ReportDetailScreen({ navigation, route }) {
  const { report, enforcerId } = route.params ?? {};
  const [actionLoading, setActionLoading] = useState(null); // 'tow' | 'ncap' | 'false'
  const [actionDone, setActionDone]       = useState(null);
  const [elapsed, setElapsed]             = useState(0);
  const [ncapTicket, setNcapTicket]       = useState(null);

  // ── Enforcer response timer ───────────────────────────────────────────────
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
  const timerColor = timeRemaining < 60 ? Colors.alarmRed
    : timeRemaining < 120 ? Colors.orange
    : Colors.grayGreen;

  // ── Action handlers ───────────────────────────────────────────────────────
  const handleDispatchTow = async () => {
    setActionLoading('tow');
    await new Promise((r) => setTimeout(r, 600));
    setActionLoading(null);
    setActionDone('tow');
    Alert.alert(
      'Towing Dispatched',
      `Tow truck dispatched to:\n${report.address}\nPlate: ${report.plateNumber}`,
    );
  };

  const handleNCAPViolation = async () => {
    setActionLoading('ncap');
    try {
      const result = await issueNCAPViolation({
        plateNumber:   report.plateNumber,
        violationType: report.violationType,
        latitude:      report.latitude,
        longitude:     report.longitude,
        timestamp:     report.timestamp,
        photoUrl:      report.photoUrl ?? 'https://storage.tripsph.mmda.gov.ph/' + report.id,
        enforcerId,
        confidence:    report.confidence,
      });

      setNcapTicket(result.ticketNumber);
      setActionDone('ncap');
      Alert.alert(
        'NCAP Violation Issued ✓',
        `Ticket: ${result.ticketNumber}\nPlate: ${report.plateNumber}\nResponse: ${result.enforcerResponseMs} ms\n\nAll data pre-filled – no manual re-entry required.`,
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
      'This will remove the report from the queue and downgrade the AI model confidence for similar detections.',
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

  const timeAgo = Math.floor(
    (Date.now() - new Date(report?.timestamp ?? Date.now())) / 60000,
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkAzure} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹ Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Violation Report</Text>
        {/* Response timer */}
        <View style={[styles.timerBadge, { borderColor: timerColor }]}>
          <Text style={[styles.timerText, { color: timerColor }]}>
            {formatElapsed(elapsed)}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ── Photo placeholder ── */}
        <View style={styles.photoCard}>
          {report?.photoUrl ? (
            // In production: <Image source={{ uri: report.photoUrl }} style={styles.photo} />
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoIcon}>📸</Text>
              <Text style={styles.photoCaption}>Citizen Photo Evidence</Text>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoIcon}>📸</Text>
              <Text style={styles.photoCaption}>Citizen Photo Evidence</Text>
              <Text style={styles.photoSub}>(Photo stored on MMDA backend)</Text>
            </View>
          )}

          {/* AI Verified badge */}
          {report?.aiVerified && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>🤖 AI Verified</Text>
            </View>
          )}
        </View>

        {/* ── Violation Details ── */}
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
            <Text style={styles.detailValue} numberOfLines={2}>
              {report?.address}
            </Text>
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

          {/* AI Confidence */}
          <ConfidenceBar
            value={report?.confidence ?? 0}
            label="AI Detection Confidence"
          />

          {/* NCAP ticket if issued */}
          {ncapTicket && (
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>NCAP Ticket</Text>
              <Text style={styles.ticketNum}>{ncapTicket}</Text>
            </View>
          )}
        </Card>

        {/* ── Timer card ── */}
        <Card style={styles.timerCard}>
          <Text style={styles.timerCardTitle}>Enforcer Response Timer</Text>
          <View style={styles.timerRow}>
            <Text style={[styles.timerBig, { color: timerColor }]}>
              {formatElapsed(elapsed)}
            </Text>
            <Text style={styles.timerTarget}>
              Target: ≤ {Targets.enforcerResponseTimeSec / 60} min
            </Text>
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

        {/* ── Action Panel ── */}
        {actionDone ? (
          <View style={styles.doneCard}>
            <Text style={styles.doneIcon}>
              {actionDone === 'tow' ? '🚚' : actionDone === 'ncap' ? '📋' : '❌'}
            </Text>
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

            {/* Dispatch Towing */}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.azure }]}
              onPress={handleDispatchTow}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'tow' ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.actionBtnIcon}>🚚</Text>
                  <Text style={styles.actionBtnText}>Dispatch Towing</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Issue NCAP Violation */}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.azure, borderColor: Colors.grayGreen, borderWidth: 2 }]}
              onPress={handleNCAPViolation}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'ncap' ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.actionBtnIcon}>📋</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actionBtnText}>Issue NCAP Violation</Text>
                    <Text style={styles.actionBtnSub}>
                      Pre-fills plate, GPS, timestamp, photo – no manual entry
                    </Text>
                  </View>
                </>
              )}
            </TouchableOpacity>

            {/* Mark as False Alarm */}
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.grayDark }]}
              onPress={handleFalseAlarm}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'false' ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.actionBtnIcon}>❌</Text>
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
    minWidth: 80,
  },
  headerTitle: {
    ...Typography.heading3,
    fontSize: 15,
  },
  timerBadge: {
    borderWidth: 2,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 60,
    alignItems: 'center',
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
    backgroundColor: Colors.azure,
    position: 'relative',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: { fontSize: 56 },
  photoCaption: {
    ...Typography.bodyBold,
    color: Colors.grayGreen,
    marginTop: Spacing.xs,
  },
  photoSub: {
    ...Typography.caption,
    color: Colors.gray,
    marginTop: 4,
  },
  aiBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.alarmRed,
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
    borderBottomColor: Colors.grayDark,
  },
  detailLabel: {
    ...Typography.caption,
    color: Colors.gray,
    width: 80,
    flexShrink: 0,
  },
  detailValue: {
    ...Typography.bodyBold,
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
  },
  ticketRow: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.grayGreen + '22',
    borderRadius: Radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.grayGreen,
  },
  ticketLabel: {
    ...Typography.caption,
    color: Colors.grayGreen,
  },
  ticketNum: {
    ...Typography.bodyBold,
    color: Colors.grayGreen,
    letterSpacing: 1,
  },
  timerCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  timerCardTitle: {
    ...Typography.label,
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
    color: Colors.gray,
  },
  timerBarBg: {
    height: 6,
    backgroundColor: Colors.grayDark,
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
  actionBtnIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
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
    backgroundColor: Colors.azure,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  doneIcon: { fontSize: 48, marginBottom: Spacing.sm },
  doneText: {
    ...Typography.heading3,
    color: Colors.grayGreen,
  },
});
