import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Typography, Spacing, Radius, Targets } from '../../constants/theme';
import { getBannerText, getBannerColor, PARKING_STRUCTURES } from '../../services/OIEService';
import { wsService } from '../../services/WebSocketService';
import { VerdictBadge } from '../../components/UIComponents';

const TAB_BAR_CLEARANCE = 96;

export default function HomeMapScreen({ navigation }) {
  const [verdict, setVerdict] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [connected, setConnected] = useState(false);
  const [selectedParkingId, setSelectedParkingId] = useState(null);
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);

  const handleReturn = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('RoleSelect');
  };

  const handleWsMessage = useCallback((msg) => {
    if (msg.type === 'connected') setConnected(true);
    if (msg.type === 'disconnected') setConnected(false);
    if (msg.type === 'verdict') {
      setVerdict(msg.payload);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    wsService.addListener(handleWsMessage);
    wsService.connect();

    const timer = setInterval(() => {
      wsService.sendLocation(14.5876, 121.0607);
    }, Targets.mapRefreshRateSec * 1000);

    return () => {
      wsService.removeListener(handleWsMessage);
      clearInterval(timer);
    };
  }, [handleWsMessage]);

  const bannerColor = verdict ? getBannerColor(verdict.verdict) : Colors.azure;
  const bannerText = verdict
    ? getBannerText(verdict.verdict)
    : 'Querying Ordinance Intelligence Engine...';

  const visibleParking = [...PARKING_STRUCTURES]
    .filter((spot) => (showAvailableOnly ? spot.occupancy < 90 : true))
    .sort((a, b) => a.occupancy - b.occupancy);

  const getParkingStatus = (occupancy) => {
    if (occupancy >= 90) return 'Full';
    if (occupancy >= 75) return 'Limited';
    return 'Available';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundTint} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleReturn} style={styles.returnBtn} accessibilityRole="button" accessibilityLabel="Return">
          <Text style={styles.returnText}>Return</Text>
        </TouchableOpacity>
        <View style={styles.brandBlock}>
          <Text style={styles.topEyebrow}>OIE live parking map</Text>
          <View style={styles.logoBadge}>
            <Image source={require('../../../assets/TRIPSPH-logo-white.png')} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.appSubtitle}>Metro Manila risk surface</Text>
        </View>
        <View style={styles.topRight}>
          <View style={[styles.wsDot, { backgroundColor: connected ? Colors.grayGreen : Colors.orange }]} />
          <Text style={styles.wsLabel}>{connected ? 'Live' : 'Polling'}</Text>
        </View>
      </View>

      <View style={styles.goalStrip}>
        <Text style={styles.goalText}>Find legal nearby parking, then start navigation to your chosen spot.</Text>
      </View>

      <View style={styles.mapPlaceholderWrap}>
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapGrid}>
            <View style={[styles.road, styles.roadHorizontal]} />
            <View style={[styles.road, styles.roadVertical]} />
            <View style={[styles.zone, styles.zoneLegal]}>
              <Text style={styles.zoneText}>LEGAL</Text>
            </View>
            <View style={[styles.zone, styles.zoneRisk]}>
              <Text style={styles.zoneText}>RISK</Text>
            </View>
            <View style={[styles.zone, styles.zoneIllegal]}>
              <Text style={styles.zoneText}>ILLEGAL</Text>
            </View>
            <View style={[styles.pin, styles.pinParking]}>
              <Text style={styles.pinText}>P</Text>
            </View>
            <View style={[styles.pin, styles.pinAlert]}>
              <Text style={styles.pinText}>!</Text>
            </View>
          </View>
          <Text style={styles.mapTitle}>Live Risk Map Preview</Text>
          <Text style={styles.mapSub}>Web preview mirrors zoning and marker semantics while native maps remain fully interactive.</Text>
        </View>

        <TouchableOpacity
          style={styles.navigateBtn}
          onPress={() => navigation.navigate('NavigationMode', { verdict })}
          accessibilityRole="button"
          accessibilityLabel="Start navigation mode"
        >
          <Text style={styles.navigateBtnText}>Start Navigation</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.parkingPanel}>
        <View style={styles.parkingPanelHeader}>
          <Text style={styles.parkingPanelTitle}>Nearby Parking</Text>
          <TouchableOpacity
            style={styles.filterChip}
            onPress={() => setShowAvailableOnly((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel="Toggle available parking filter"
          >
            <Text style={styles.filterChipText}>{showAvailableOnly ? 'Available only' : 'Show all'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.parkingCardsRow}>
          {visibleParking.map((spot) => (
            <TouchableOpacity
              key={spot.id}
              style={[styles.parkingCard, selectedParkingId === spot.id && styles.parkingCardActive]}
              onPress={() => setSelectedParkingId(spot.id)}
              accessibilityRole="button"
              accessibilityLabel={`Inspect ${spot.name}`}
            >
              <Text style={styles.parkingName} numberOfLines={1}>{spot.name}</Text>
              <Text style={styles.parkingMeta}>{spot.occupancy}% occupied - {getParkingStatus(spot.occupancy)}</Text>
              <Text style={styles.parkingMeta}>{spot.rate}</Text>
            </TouchableOpacity>
          ))}
          {visibleParking.length === 0 && (
            <Text style={styles.parkingEmpty}>No open spots right now. Toggle to Show all to browse full car parks.</Text>
          )}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[styles.banner, { borderColor: bannerColor }]}
        onPress={() => {
          if (verdict) {
            Alert.alert(
              verdict.zone ?? 'OIE Verdict',
              `${verdict.reason}\n\nEnforcement Level: ${verdict.enforcementLevel}\nResponse Time: ${verdict.responseTimeMs ?? '-'} ms`,
            );
          }
        }}
        activeOpacity={0.9}
      >
        <Text style={styles.bannerText}>{bannerText}</Text>
        {lastRefresh && <Text style={styles.bannerSub}>Updated {lastRefresh.toLocaleTimeString()}</Text>}
        {verdict && <VerdictBadge verdict={verdict.verdict} />}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundTint,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.overlayLight,
    borderBottomWidth: 0,
    borderWidth: 1,
    borderColor: Colors.edgeHighlight,
    borderRadius: Radius.xl,
    margin: Spacing.md,
    marginBottom: 0,
  },
  returnBtn: {
    marginRight: Spacing.sm,
  },
  returnText: {
    ...Typography.bodyBold,
    color: Colors.routeTeal,
  },
  topEyebrow: {
    ...Typography.caption,
    color: Colors.routeTeal,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  appTitle: {
    display: 'none',
  },
  brandBlock: {
    justifyContent: 'center',
  },
  logoBadge: {
    width: 128,
    height: 34,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(12,127,166,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.edgeHighlight,
    marginBottom: 2,
  },
  logoImage: {
    width: 112,
    height: 24,
  },
  appSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceBase,
    borderWidth: 1,
    borderColor: Colors.edgeHighlight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  wsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  wsLabel: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  goalStrip: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    backgroundColor: Colors.overlayLight,
    borderWidth: 1,
    borderColor: Colors.edgeHighlight,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  goalText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  mapPlaceholderWrap: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  mapPlaceholder: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.edgeHighlight,
    backgroundColor: Colors.whiteTranslucent,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.xl,
  },
  mapGrid: {
    width: '100%',
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.edgeHighlight,
    backgroundColor: Colors.surfaceElevated,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  road: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  roadHorizontal: {
    height: 20,
    left: 0,
    right: 0,
    top: '42%',
  },
  roadVertical: {
    width: 20,
    top: 0,
    bottom: 0,
    left: '54%',
  },
  zone: {
    position: 'absolute',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  zoneLegal: {
    top: 14,
    left: 14,
    backgroundColor: Colors.grayGreenTranslucent,
  },
  zoneRisk: {
    top: 14,
    right: 14,
    backgroundColor: Colors.orangeTranslucent,
  },
  zoneIllegal: {
    bottom: 14,
    right: 14,
    backgroundColor: Colors.alarmRedTranslucent,
  },
  zoneText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pin: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.white,
  },
  pinParking: {
    top: '58%',
    left: '28%',
    backgroundColor: Colors.azure,
  },
  pinAlert: {
    top: '30%',
    left: '67%',
    backgroundColor: Colors.alarmRed,
  },
  pinText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '800',
  },
  mapTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  mapSub: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  navigateBtn: {
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
    backgroundColor: Colors.azure,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
  },
  navigateBtnText: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
  parkingPanel: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    backgroundColor: Colors.overlayLight,
    borderWidth: 1,
    borderColor: Colors.edgeHighlight,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.sm,
  },
  parkingPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  parkingPanelTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  filterChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.edgeHighlight,
    backgroundColor: Colors.surfaceBase,
  },
  filterChipText: {
    ...Typography.caption,
    color: Colors.routeTeal,
    fontWeight: '700',
  },
  parkingCardsRow: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  parkingCard: {
    width: 182,
    borderWidth: 1,
    borderColor: Colors.edgeHighlight,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceBase,
    padding: Spacing.sm,
  },
  parkingCardActive: {
    borderColor: Colors.routeTeal,
    backgroundColor: Colors.surfaceMuted,
  },
  parkingName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  parkingMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  parkingEmpty: {
    ...Typography.caption,
    color: Colors.textSecondary,
    width: 240,
    paddingVertical: Spacing.sm,
  },
  banner: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    backgroundColor: Colors.overlayLight,
    borderWidth: 1,
    borderRadius: Radius.xl,
  },
  bannerText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    flex: 1,
    fontSize: 13,
  },
  bannerSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
  },
});