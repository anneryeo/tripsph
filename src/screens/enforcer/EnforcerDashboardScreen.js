/**
 * Enforcer Dashboard Screen
 *
 * MMDA dedicated map view showing:
 * - AI-Verified reports → flashing Alarm Red pins
 * - Unverified reports  → Gray pins (Manual Review Queue)
 *
 * Reports are ordered by proximity to active enforcers.
 * Tapping a pin opens the ReportDetailScreen.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';

import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { MOCK_REPORTS } from '../../services/MockReports';
import { getOrdinanceZones } from '../../services/OIEService';

const { width, height } = Dimensions.get('window');

const INITIAL_REGION = {
  latitude:      14.5765,
  longitude:     121.0339,
  latitudeDelta:  0.08,
  longitudeDelta: 0.08,
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#163b42' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#163b42' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1f525c' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0d2f35' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d2f35' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];

// ── Flashing Pin component ────────────────────────────────────────────────────
function ReportPin({ report, onPress }) {
  const flashAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (report.aiVerified) {
      const seq = Animated.sequence([
        Animated.timing(flashAnim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 1.0, duration: 500, useNativeDriver: true }),
      ]);
      Animated.loop(seq).start();
    }
  }, [report.aiVerified, flashAnim]);

  return (
    <Marker
      coordinate={{ latitude: report.latitude, longitude: report.longitude }}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.pin,
          report.aiVerified ? styles.pinVerified : styles.pinUnverified,
          report.aiVerified && { opacity: flashAnim },
        ]}
      >
        <Text style={styles.pinText}>
          {report.aiVerified ? '⚠' : '?'}
        </Text>
      </Animated.View>
    </Marker>
  );
}

// ── Report list row ───────────────────────────────────────────────────────────
function ReportRow({ report, onPress }) {
  const timeAgo = Math.floor((Date.now() - new Date(report.timestamp)) / 60000);
  return (
    <TouchableOpacity style={styles.reportRow} onPress={onPress} activeOpacity={0.8}>
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
        <Text style={styles.rowAddress} numberOfLines={1}>
          📍 {report.address}
        </Text>
      </View>
      <View style={styles.rowMeta}>
        <Text
          style={[
            styles.rowBadge,
            {
              backgroundColor: report.aiVerified
                ? Colors.alarmRed + '33'
                : Colors.grayDark,
              color: report.aiVerified ? Colors.alarmRed : Colors.gray,
            },
          ]}
        >
          {report.aiVerified ? 'AI ✓' : 'Manual'}
        </Text>
        <Text style={styles.rowConf}>
          {Math.round(report.confidence * 100)}%
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function EnforcerDashboardScreen({ navigation, route }) {
  const enforcerId = route.params?.enforcerId ?? 'ENFORCER';
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [view, setView] = useState('map'); // 'map' | 'list'
  const zones = getOrdinanceZones();

  const openReport = (report) => {
    navigation.navigate('ReportDetail', { report, enforcerId });
  };

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const aiCount      = reports.filter((r) => r.aiVerified).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkAzure} />

      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topTitle}>Enforcer Dashboard</Text>
          <Text style={styles.topSub}>Badge: {enforcerId}</Text>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statBadge}>
            <Text style={[styles.statNum, { color: Colors.alarmRed }]}>{aiCount}</Text>
            <Text style={styles.statLabel}>AI Verified</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={[styles.statNum, { color: Colors.gray }]}>
              {pendingCount - aiCount}
            </Text>
            <Text style={styles.statLabel}>Manual</Text>
          </View>
        </View>
      </View>

      {/* ── View toggle ── */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, view === 'map' && styles.toggleActive]}
          onPress={() => setView('map')}
        >
          <Text style={[styles.toggleText, view === 'map' && styles.toggleTextActive]}>
            🗺 Map
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, view === 'list' && styles.toggleActive]}
          onPress={() => setView('list')}
        >
          <Text style={[styles.toggleText, view === 'list' && styles.toggleTextActive]}>
            📋 Queue
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Map View ── */}
      {view === 'map' && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={INITIAL_REGION}
            customMapStyle={darkMapStyle}
          >
            {/* Enforcement zones */}
            {zones.map((zone) => (
              <Circle
                key={zone.id}
                center={zone.coords}
                radius={zone.coords.radius}
                fillColor={
                  zone.verdict === 'ILLEGAL'
                    ? Colors.alarmRedTranslucent
                    : zone.verdict === 'RISK'
                    ? Colors.orangeTranslucent
                    : Colors.grayGreenTranslucent
                }
                strokeColor={
                  zone.verdict === 'ILLEGAL'
                    ? Colors.alarmRed
                    : zone.verdict === 'RISK'
                    ? Colors.orange
                    : Colors.grayGreen
                }
                strokeWidth={1.5}
              />
            ))}

            {/* Report pins */}
            {reports.map((report) => (
              <ReportPin
                key={report.id}
                report={report}
                onPress={() => openReport(report)}
              />
            ))}
          </MapView>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <View style={[styles.legendPin, { backgroundColor: Colors.alarmRed }]}>
                <Text style={styles.legendPinText}>⚠</Text>
              </View>
              <Text style={styles.legendText}>AI Verified (Flashing)</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendPin, { backgroundColor: Colors.gray }]}>
                <Text style={styles.legendPinText}>?</Text>
              </View>
              <Text style={styles.legendText}>Manual Review</Text>
            </View>
          </View>
        </View>
      )}

      {/* ── List / Queue View ── */}
      {view === 'list' && (
        <FlatList
          data={reports.sort((a, b) =>
            b.aiVerified - a.aiVerified ||
            new Date(b.timestamp) - new Date(a.timestamp)
          )}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReportRow report={item} onPress={() => openReport(item)} />
          )}
          contentContainerStyle={{ paddingBottom: Spacing.xxl }}
          ListHeaderComponent={
            <Text style={styles.queueHeader}>
              Ordered by priority · {pendingCount} pending
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkAzure,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.azure,
  },
  topTitle: {
    ...Typography.heading3,
    fontSize: 16,
  },
  topSub: {
    ...Typography.caption,
    color: Colors.grayGreen,
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBadge: {
    alignItems: 'center',
    backgroundColor: Colors.darkAzure,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.azure,
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkAzure,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  toggleActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.grayGreen,
  },
  toggleText: {
    ...Typography.body,
    color: Colors.gray,
  },
  toggleTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  legend: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.azureTranslucent,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendPin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  legendPinText: {
    fontSize: 12,
    color: Colors.white,
  },
  legendText: {
    ...Typography.caption,
    fontSize: 11,
  },
  pin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  pinVerified: {
    backgroundColor: Colors.alarmRed,
  },
  pinUnverified: {
    backgroundColor: Colors.gray,
  },
  pinText: {
    fontSize: 16,
    color: Colors.white,
  },
  queueHeader: {
    ...Typography.caption,
    padding: Spacing.md,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: Colors.gray,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.azure,
    borderRadius: Radius.md,
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
    letterSpacing: 1,
  },
  rowTime: {
    ...Typography.caption,
    color: Colors.gray,
  },
  rowViolation: {
    ...Typography.body,
    color: Colors.grayGreen,
    marginBottom: 2,
  },
  rowAddress: {
    ...Typography.caption,
    color: Colors.gray,
  },
  rowMeta: {
    padding: Spacing.sm,
    alignItems: 'center',
  },
  rowBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginBottom: 4,
    overflow: 'hidden',
  },
  rowConf: {
    ...Typography.caption,
    fontWeight: '700',
  },
});
