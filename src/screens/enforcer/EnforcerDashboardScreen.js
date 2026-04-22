/**
 * Enforcer Dashboard Screen
 *
 * MMDA dedicated map view showing:
 * - AI-Verified reports
 * - Unverified reports in the manual review queue
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';

import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { MOCK_REPORTS } from '../../services/MockReports';
import { getOrdinanceZones } from '../../services/OIEService';

const INITIAL_REGION = {
  latitude: 14.5765,
  longitude: 121.0339,
  latitudeDelta: 0.08,
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
        <Text style={styles.pinText}>{report.aiVerified ? '!' : '?'}</Text>
      </Animated.View>
    </Marker>
  );
}

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
        <Text style={styles.rowAddress} numberOfLines={1}>
          LOC {report.address}
        </Text>
      </View>
      <View style={styles.rowMeta}>
        <Text
          style={[
            styles.rowBadge,
            {
              backgroundColor: report.aiVerified ? Colors.alarmRed + '22' : Colors.surfaceMuted,
              color: report.aiVerified ? Colors.alarmRed : Colors.textSecondary,
            },
          ]}
        >
          {report.aiVerified ? 'AI' : 'MANUAL'}
        </Text>
        <Text style={styles.rowConf}>{Math.round(report.confidence * 100)}%</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function EnforcerDashboardScreen({ navigation, route }) {
  const enforcerId = route.params?.enforcerId ?? 'ENFORCER';
  const [reports] = useState(MOCK_REPORTS);
  const [view, setView] = useState('map');
  const [mapRegion, setMapRegion] = useState(INITIAL_REGION);
  const zones = getOrdinanceZones();
  const mapRef = React.useRef(null);

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const aiCount = reports.filter((r) => r.aiVerified).length;
  const manualCount = Math.max(pendingCount - aiCount, 0);

  const openReport = (report) => {
    navigation.navigate('ReportDetail', { report, enforcerId });
  };

  const orderedReports = [...reports].sort(
    (a, b) => b.aiVerified - a.aiVerified || new Date(b.timestamp) - new Date(a.timestamp),
  );

  const zoomMap = (factor) => {
    if (!mapRef.current || !mapRegion) return;
    const nextRegion = {
      ...mapRegion,
      latitudeDelta: Math.min(2, Math.max(0.002, mapRegion.latitudeDelta * factor)),
      longitudeDelta: Math.min(2, Math.max(0.002, mapRegion.longitudeDelta * factor)),
    };
    mapRef.current.animateToRegion(nextRegion, 180);
    setMapRegion(nextRegion);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundTint} />

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
            <Text style={[styles.statNum, { color: Colors.textSecondary }]}>{manualCount}</Text>
            <Text style={styles.statLabel}>Manual</Text>
          </View>
        </View>
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, view === 'map' && styles.toggleActive]}
          onPress={() => setView('map')}
          accessibilityRole="button"
          accessibilityLabel="Show map view"
        >
          <Text style={[styles.toggleText, view === 'map' && styles.toggleTextActive]}>MAP</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, view === 'list' && styles.toggleActive]}
          onPress={() => setView('list')}
          accessibilityRole="button"
          accessibilityLabel="Show queue view"
        >
          <Text style={[styles.toggleText, view === 'list' && styles.toggleTextActive]}>QUEUE</Text>
        </TouchableOpacity>
      </View>

      {view === 'map' && (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={INITIAL_REGION}
            customMapStyle={darkMapStyle}
            onRegionChangeComplete={setMapRegion}
          >
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

            {reports.map((report) => (
              <ReportPin key={report.id} report={report} onPress={() => openReport(report)} />
            ))}
          </MapView>

          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <View style={[styles.legendPin, { backgroundColor: Colors.alarmRed }]}>
                <Text style={styles.legendPinText}>!</Text>
              </View>
              <Text style={styles.legendText}>AI Verified</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendPin, { backgroundColor: Colors.gray }]}>
                <Text style={styles.legendPinText}>?</Text>
              </View>
              <Text style={styles.legendText}>Manual Review</Text>
            </View>
          </View>

          <View style={styles.zoomControls}>
            <TouchableOpacity
              style={styles.zoomBtn}
              onPress={() => zoomMap(0.7)}
              accessibilityRole="button"
              accessibilityLabel="Zoom in"
            >
              <Text style={styles.zoomBtnText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.zoomBtn}
              onPress={() => zoomMap(1.4)}
              accessibilityRole="button"
              accessibilityLabel="Zoom out"
            >
              <Text style={styles.zoomBtnText}>-</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {view === 'list' && (
        <FlatList
          data={orderedReports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReportRow report={item} onPress={() => openReport(item)} />}
          contentContainerStyle={{ paddingBottom: Spacing.xxl }}
          ListHeaderComponent={
            <Text style={styles.queueHeader}>Ordered by priority · {pendingCount} pending</Text>
          }
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
    backgroundColor: Colors.whiteTranslucent,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  zoomControls: {
    position: 'absolute',
    right: Spacing.sm,
    bottom: Spacing.md,
    gap: Spacing.xs,
  },
  zoomBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.whiteTranslucent,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomBtnText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 20,
    lineHeight: 20,
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
    fontWeight: '800',
  },
  legendText: {
    ...Typography.caption,
    color: Colors.textPrimary,
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
    fontWeight: '800',
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
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});