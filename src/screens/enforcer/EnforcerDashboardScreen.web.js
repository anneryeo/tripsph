import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { MOCK_REPORTS } from '../../services/MockReports';

function ReportRow({ report, onPress }) {
  const timeAgo = Math.floor((Date.now() - new Date(report.timestamp)) / 60000);
  return (
    <TouchableOpacity style={styles.reportRow} onPress={onPress} activeOpacity={0.85}>
      <View
        style={[
          styles.rowIndicator,
          { backgroundColor: report.aiVerified ? Colors.alarmRed : Colors.gray },
        ]}
      />
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={styles.rowPlate}>{report.plateNumber}</Text>
          <Text style={styles.rowTime}>{timeAgo}m ago</Text>
        </View>
        <Text style={styles.rowViolation}>{report.violationType}</Text>
        <Text style={styles.rowAddress} numberOfLines={1}>LOC {report.address}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function EnforcerDashboardScreen({ navigation, route }) {
  const enforcerId = route.params?.enforcerId ?? 'ENFORCER';
  const [reports] = useState(MOCK_REPORTS);
  const [view, setView] = useState('map');

  const handleReturn = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('RoleSelect');
  };

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const aiCount = reports.filter((r) => r.aiVerified).length;
  const manualCount = Math.max(pendingCount - aiCount, 0);

  const openReport = (report) => {
    navigation.navigate('ReportDetail', { report, enforcerId });
  };

  const orderedReports = [...reports].sort(
    (a, b) => b.aiVerified - a.aiVerified || new Date(b.timestamp) - new Date(a.timestamp),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundTint} />

      <View style={styles.topBar}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleReturn} style={styles.returnBtn} accessibilityRole="button" accessibilityLabel="Return">
            <Text style={styles.returnText}>Return</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Enforcer Dashboard</Text>
          <Text style={styles.topSub}>Badge: {enforcerId}</Text>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statBadge}>
            <Text style={[styles.statNum, { color: Colors.alarmRed }]}>{aiCount}</Text>
            <Text style={styles.statLabel}>AI Verified</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={[styles.statNum, { color: Colors.textSecondary }]}>{manualCount}</Text>
            <Text style={styles.statLabel}>Manual</Text>
          </View>
        </View>
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity style={[styles.toggleBtn, view === 'map' && styles.toggleActive]} onPress={() => setView('map')}>
          <Text style={[styles.toggleText, view === 'map' && styles.toggleTextActive]}>MAP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, view === 'list' && styles.toggleActive]} onPress={() => setView('list')}>
          <Text style={[styles.toggleText, view === 'list' && styles.toggleTextActive]}>QUEUE</Text>
        </TouchableOpacity>
      </View>

      {view === 'map' ? (
        <View style={styles.mapPlaceholder}>
          <View style={styles.incidentMap}>
            <View style={styles.incidentRoad} />
            <View style={[styles.incidentPin, styles.incidentAi]}>
              <Text style={styles.pinGlyph}>AI</Text>
            </View>
            <View style={[styles.incidentPin, styles.incidentManual]}>
              <Text style={styles.pinGlyph}>M</Text>
            </View>
            <View style={[styles.incidentPin, styles.incidentTow]}>
              <Text style={styles.pinGlyph}>T</Text>
            </View>
            <View style={styles.legendWrap}>
              <Text style={styles.legendText}>AI Verified</Text>
              <Text style={styles.legendText}>Manual Review</Text>
            </View>
          </View>
          <Text style={styles.placeholderTitle}>Enforcer Incident Preview</Text>
          <Text style={styles.placeholderSub}>Pin priority and queue semantics are visible on web while live map layers stay native-focused.</Text>
        </View>
      ) : (
        <FlatList
          data={orderedReports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReportRow report={item} onPress={() => openReport(item)} />}
          contentContainerStyle={{ paddingBottom: Spacing.xxl }}
          ListHeaderComponent={<Text style={styles.queueHeader}>Ordered by priority · {pendingCount} pending</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundTint,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.overlayLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSoft,
  },
  headerLeft: {
    flex: 1,
  },
  returnBtn: {
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  returnText: {
    ...Typography.bodyBold,
    color: Colors.azure,
    fontSize: 13,
  },
  topTitle: {
    ...Typography.heading3,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  topSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBadge: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceBase,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceBase,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSoft,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  toggleActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.azure,
  },
  toggleText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.azure,
    fontWeight: '700',
  },
  mapPlaceholder: {
    flex: 1,
    margin: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    backgroundColor: Colors.whiteTranslucent,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.xl,
  },
  incidentMap: {
    width: '100%',
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    backgroundColor: '#e6f2ef',
    marginBottom: Spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  incidentRoad: {
    position: 'absolute',
    width: '88%',
    height: 16,
    top: '48%',
    left: '6%',
    borderRadius: Radius.full,
    backgroundColor: 'rgba(31,82,92,0.2)',
    transform: [{ rotate: '-8deg' }],
  },
  incidentPin: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.white,
  },
  incidentAi: {
    top: '28%',
    left: '22%',
    backgroundColor: Colors.alarmRed,
  },
  incidentManual: {
    top: '58%',
    left: '50%',
    backgroundColor: Colors.gray,
  },
  incidentTow: {
    top: '22%',
    right: '18%',
    backgroundColor: Colors.azure,
  },
  pinGlyph: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '800',
    fontSize: 10,
  },
  legendWrap: {
    position: 'absolute',
    left: Spacing.sm,
    bottom: Spacing.sm,
    backgroundColor: Colors.whiteTranslucent,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  legendText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontSize: 10,
  },
  placeholderTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  placeholderSub: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  queueHeader: {
    ...Typography.caption,
    padding: Spacing.md,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.textSecondary,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    overflow: 'hidden',
  },
  rowIndicator: {
    width: 5,
    alignSelf: 'stretch',
  },
  rowContent: {
    flex: 1,
    padding: Spacing.sm,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  rowPlate: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  rowTime: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  rowViolation: {
    ...Typography.body,
    color: Colors.azure,
    marginBottom: 2,
  },
  rowAddress: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});