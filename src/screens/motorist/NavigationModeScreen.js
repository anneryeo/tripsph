/**
 * Navigation Mode Screen – "Risk Banner"
 *
 * Active navigation overlay showing dynamic enforcement risk.
 * The OIE verdict is displayed as a flashing banner:
 *   - LOW RISK → Gray Green banner
 *   - HIGH RISK / ILLEGAL → Alarm Red flashing banner
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Circle, Marker } from 'react-native-maps';

import { Colors, Typography, Spacing, Radius, OIEVerdict } from '../../constants/theme';
import {
  queryOIE,
  getOrdinanceZones,
  getBannerText,
  getBannerColor,
} from '../../services/OIEService';

const { width } = Dimensions.get('window');

// Sample destination (Robinsons Galleria Parking)
const DESTINATION = {
  latitude:  14.5866,
  longitude: 121.0565,
  name: 'Robinsons Galleria',
};

const INITIAL_REGION = {
  latitude:      14.5720,
  longitude:     121.0450,
  latitudeDelta:  0.04,
  longitudeDelta: 0.04,
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

export default function NavigationModeScreen({ navigation, route }) {
  const initialVerdict = route.params?.verdict ?? null;
  const [verdict, setVerdict] = useState(initialVerdict);
  const [eta, setEta] = useState('12 min');
  const [distance, setDistance] = useState('4.2 km');
  const [mapRegion, setMapRegion] = useState(INITIAL_REGION);
  const flashAnim = useRef(new Animated.Value(1)).current;
  const mapRef = useRef(null);
  const zones = getOrdinanceZones();

  // ── Poll OIE every 30 s while navigating ─────────────────────────────────
  useEffect(() => {
    const poll = async () => {
      // Simulate moving location
      const lat = 14.5720 + (Math.random() - 0.5) * 0.03;
      const lon = 121.0450 + (Math.random() - 0.5) * 0.03;
      const result = await queryOIE(lat, lon);
      setVerdict(result);
    };

    poll();
    const timer = setInterval(poll, 30000);
    return () => clearInterval(timer);
  }, []);

  // ── Flashing animation for HIGH RISK / ILLEGAL ────────────────────────────
  useEffect(() => {
    const isHighRisk =
      verdict?.verdict === OIEVerdict.ILLEGAL ||
      verdict?.verdict === OIEVerdict.RISK;

    if (isHighRisk) {
      const seq = Animated.sequence([
        Animated.timing(flashAnim, { toValue: 0.4, duration: 400, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 1.0, duration: 400, useNativeDriver: true }),
      ]);
      Animated.loop(seq).start();
    } else {
      flashAnim.stopAnimation();
      flashAnim.setValue(1);
    }
  }, [verdict?.verdict, flashAnim]);

  const bannerColor = verdict ? getBannerColor(verdict.verdict) : Colors.azure;
  const bannerText  = verdict ? getBannerText(verdict.verdict) : 'Calculating route…';
  const isHighRisk  =
    verdict?.verdict === OIEVerdict.ILLEGAL || verdict?.verdict === OIEVerdict.RISK;

  const zoneColor = (v) => {
    switch (v) {
      case OIEVerdict.ILLEGAL: return Colors.alarmRedTranslucent;
      case OIEVerdict.RISK:    return Colors.orangeTranslucent;
      default:                 return Colors.grayGreenTranslucent;
    }
  };
  const zoneBorder = (v) => {
    switch (v) {
      case OIEVerdict.ILLEGAL: return Colors.alarmRed;
      case OIEVerdict.RISK:    return Colors.orange;
      default:                 return Colors.grayGreen;
    }
  };

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
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundTint} />

      {/* ── Top Nav Bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Return</Text>
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.navMeta}>Destination</Text>
          <Text style={styles.navTitle}>{DESTINATION.name}</Text>
          <Text style={styles.destLabel}>Guided route with ordinance awareness</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      {/* ── Map ── */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={INITIAL_REGION}
          customMapStyle={darkMapStyle}
          showsUserLocation
          onRegionChangeComplete={setMapRegion}
        >
          {/* Ordinance zones */}
          {zones.map((zone) => (
            <Circle
              key={zone.id}
              center={zone.coords}
              radius={zone.coords.radius}
              fillColor={zoneColor(zone.verdict)}
              strokeColor={zoneBorder(zone.verdict)}
              strokeWidth={2}
            />
          ))}

          {/* Destination marker */}
          <Marker coordinate={DESTINATION}>
            <View style={styles.destMarker}>
              <Text style={styles.destMarkerText}>D</Text>
            </View>
          </Marker>
        </MapView>

        {/* ETA / Distance overlay */}
        <View style={styles.etaCard}>
          <Text style={styles.etaTime}>{eta}</Text>
          <Text style={styles.etaDist}>{distance}</Text>
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

      {/* ── OIE Risk Banner (flashes for HIGH RISK) ── */}
      <Animated.View
        style={[
          styles.riskBanner,
          { borderColor: bannerColor },
          isHighRisk && { opacity: flashAnim },
        ]}
      >
        <View style={styles.bannerContent}>
          <View style={[styles.bannerIcon, isHighRisk ? styles.bannerIconRisk : styles.bannerIconSafe]}>
            <Text style={styles.bannerIconText}>{isHighRisk ? '!' : 'OK'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerText}>{bannerText}</Text>
            {verdict?.zone && (
              <Text style={styles.bannerZone}>{verdict.zone}</Text>
            )}
          </View>
        </View>

        {verdict?.verdict === OIEVerdict.LEGAL && (
          <Text style={styles.bannerSub}>
            Enforcement Level: {verdict?.enforcementLevel ?? 'LOW'}
          </Text>
        )}
      </Animated.View>
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
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.overlayLight,
    borderWidth: 1,
    borderColor: Colors.edgeHighlight,
    borderRadius: Radius.xl,
    margin: Spacing.md,
    marginBottom: 0,
  },
  backBtn: {
    width: 60,
  },
  backText: {
    ...Typography.bodyBold,
    color: Colors.routeTeal,
  },
  navMeta: {
    ...Typography.caption,
    color: Colors.routeTeal,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  topCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
  },
  destLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    margin: Spacing.md,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  etaCard: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.whiteTranslucent,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.edgeHighlight,
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
    borderColor: Colors.edgeHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomBtnText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 20,
    lineHeight: 20,
  },
  etaTime: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  etaDist: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  destMarker: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceBase,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.azure,
  },
  destMarkerText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.azure,
  },
  riskBanner: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 80,
    justifyContent: 'center',
    backgroundColor: Colors.overlayLight,
    borderWidth: 1,
    borderRadius: Radius.xl,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  bannerIconRisk: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  bannerIconSafe: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  bannerIconText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 12,
  },
  bannerText: {
    ...Typography.bodyBold,
    fontSize: 15,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  bannerZone: {
    ...Typography.caption,
    marginTop: 2,
    color: Colors.textSecondary,
  },
  bannerSub: {
    ...Typography.caption,
    marginTop: 4,
    color: Colors.textTertiary,
  },
});
