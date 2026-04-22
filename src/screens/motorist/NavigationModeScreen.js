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
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
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
  const flashAnim = useRef(new Animated.Value(1)).current;
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.darkAzure} />

      {/* ── Top Nav Bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.navTitle}>Navigation Mode</Text>
          <Text style={styles.destLabel}>→ {DESTINATION.name}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      {/* ── Map ── */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={INITIAL_REGION}
          customMapStyle={darkMapStyle}
          showsUserLocation
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
              <Text style={styles.destMarkerText}>🏁</Text>
            </View>
          </Marker>
        </MapView>

        {/* ETA / Distance overlay */}
        <View style={styles.etaCard}>
          <Text style={styles.etaTime}>{eta}</Text>
          <Text style={styles.etaDist}>{distance}</Text>
        </View>
      </View>

      {/* ── OIE Risk Banner (flashes for HIGH RISK) ── */}
      <Animated.View
        style={[
          styles.riskBanner,
          { backgroundColor: bannerColor },
          isHighRisk && { opacity: flashAnim },
        ]}
      >
        <View style={styles.bannerContent}>
          <Text style={styles.bannerIcon}>{isHighRisk ? '⚠' : '✓'}</Text>
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
    backgroundColor: Colors.darkAzure,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.azure,
  },
  backBtn: {
    width: 60,
  },
  backText: {
    ...Typography.bodyBold,
    color: Colors.grayGreen,
  },
  topCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navTitle: {
    ...Typography.bodyBold,
    fontSize: 15,
  },
  destLabel: {
    ...Typography.caption,
    color: Colors.grayGreen,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  etaCard: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.azureTranslucent,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  etaTime: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  etaDist: {
    ...Typography.caption,
    color: Colors.grayGreen,
  },
  destMarker: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destMarkerText: { fontSize: 28 },
  riskBanner: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 80,
    justifyContent: 'center',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    fontSize: 28,
    marginRight: Spacing.sm,
  },
  bannerText: {
    ...Typography.bodyBold,
    fontSize: 15,
    lineHeight: 20,
  },
  bannerZone: {
    ...Typography.caption,
    marginTop: 2,
  },
  bannerSub: {
    ...Typography.caption,
    marginTop: 4,
  },
});
