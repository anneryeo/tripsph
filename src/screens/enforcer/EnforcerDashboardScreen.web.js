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
          <Text style={styles.placeholderTitle}>Web Prototype Map Placeholder</Text>
          <Text style={styles.placeholderSub}>Open mobile build for live pin/map interactions.</Text>
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
    justifyContent: 'center',
    padding: Spacing.xl,
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