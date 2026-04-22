/**
 * Home Map Screen - Live Risk Map
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Circle, Marker } from 'react-native-maps';

import { Colors, Typography, Spacing, Radius, OIEVerdict, Targets } from '../../constants/theme';
import { getOrdinanceZones, PARKING_STRUCTURES, getBannerText, getBannerColor } from '../../services/OIEService';
import { wsService } from '../../services/WebSocketService';
import { VerdictBadge } from '../../components/UIComponents';

const DEFAULT_REGION = {
  latitude: 14.5765,
  longitude: 121.0339,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

function ParkingMarker({ structure }) {
  const full = structure.occupancy >= 90;
  return (
    <View style={[styles.parkingMarker, full && styles.parkingMarkerFull]}>
      <Text style={styles.parkingMarkerP}>P</Text>
      <Text style={styles.parkingMarkerOcc}>{structure.occupancy}%</Text>
    </View>
  );
}

export default function HomeMapScreen({ navigation }) {
  const [userLocation, setUserLoc] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [connected, setConnected] = useState(false);
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
  const zones = getOrdinanceZones();
  const mapRef = useRef(null);
  const refreshTimer = useRef(null);

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

    refreshTimer.current = setInterval(() => {
      if (userLocation) {
        wsService.sendLocation(userLocation.latitude, userLocation.longitude);
      }
    }, Targets.mapRefreshRateSec * 1000);

    return () => {
      wsService.removeListener(handleWsMessage);
      clearInterval(refreshTimer.current);
    };
  }, [handleWsMessage, userLocation]);

  useEffect(() => {
    const mockLoc = {
      latitude: 14.5876,
      longitude: 121.0607,
    };
    setUserLoc(mockLoc);
    wsService.sendLocation(mockLoc.latitude, mockLoc.longitude);
  }, []);

  const zoneStrokeColor = (v) => {
    switch (v) {
      case OIEVerdict.ILLEGAL: return Colors.alarmRed;
      case OIEVerdict.RISK: return Colors.orange;
      default: return Colors.grayGreen;
    }
  };

  const zoneFillColor = (v) => {
    switch (v) {
      case OIEVerdict.ILLEGAL: return Colors.alarmRedTranslucent;
      case OIEVerdict.RISK: return Colors.orangeTranslucent;
      default: return Colors.grayGreenTranslucent;
    }
  };

  const bannerColor = verdict ? getBannerColor(verdict.verdict) : Colors.azure;
  const bannerText = verdict
    ? getBannerText(verdict.verdict)
    : 'Querying Ordinance Intelligence Engine...';

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

      <View style={styles.topBar}>
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

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={DEFAULT_REGION}
          customMapStyle={darkMapStyle}
          showsUserLocation
          showsMyLocationButton={false}
          onRegionChangeComplete={setMapRegion}
        >
          {zones.map((zone) => (
            <Circle
              key={zone.id}
              center={zone.coords}
              radius={zone.coords.radius}
              fillColor={zoneFillColor(zone.verdict)}
              strokeColor={zoneStrokeColor(zone.verdict)}
              strokeWidth={2}
            />
          ))}

          {zones
            .filter((z) => z.verdict === OIEVerdict.ILLEGAL)
            .map((zone) => (
              <Marker key={`x-${zone.id}`} coordinate={zone.coords} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={styles.illegalMarker}>
                  <Text style={styles.illegalX}>X</Text>
                </View>
              </Marker>
            ))}

          {PARKING_STRUCTURES.map((ps) => (
            <Marker
              key={ps.id}
              coordinate={ps.coordinate}
              title={ps.name}
              description={`${ps.occupancy}% Full | ${ps.rate}`}
            >
              <ParkingMarker structure={ps} />
            </Marker>
          ))}
        </MapView>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.grayGreen }]} />
            <Text style={styles.legendText}>Legal</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.orange }]} />
            <Text style={styles.legendText}>Risk</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.alarmRed }]} />
            <Text style={styles.legendText}>Illegal</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendP}>P</Text>
            <Text style={styles.legendText}>Parking</Text>
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

        <TouchableOpacity
          style={styles.navigateBtn}
          onPress={() => navigation.navigate('NavigationMode', { verdict })}
          accessibilityRole="button"
          accessibilityLabel="Start navigation mode"
        >
          <Text style={styles.navigateBtnText}>Start Navigation</Text>
        </TouchableOpacity>
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
        accessibilityRole="button"
        accessibilityLabel="View ordinance verdict details"
      >
        <Text style={styles.bannerText}>{bannerText}</Text>
        {lastRefresh && <Text style={styles.bannerSub}>Updated {lastRefresh.toLocaleTimeString()}</Text>}
        {verdict && <VerdictBadge verdict={verdict.verdict} />}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#163b42' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#163b42' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1f525c' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0d2f35' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d2f35' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];

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
    paddingVertical: Spacing.md,
    backgroundColor: Colors.overlayLight,
    borderBottomWidth: 0,
    borderWidth: 1,
    borderColor: Colors.edgeHighlight,
    borderRadius: Radius.xl,
    margin: Spacing.md,
    marginBottom: Spacing.sm,
  },
  appTitle: {
    display: 'none',
  },
  brandBlock: {
    justifyContent: 'center',
  },
  topEyebrow: {
    ...Typography.caption,
    color: Colors.routeTeal,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
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
  mapContainer: {
    flex: 1,
    position: 'relative',
    marginHorizontal: Spacing.md,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  legend: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.whiteTranslucent,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
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
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendP: {
    width: 10,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.azure,
    marginRight: 6,
    textAlign: 'center',
  },
  legendText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textPrimary,
  },
  navigateBtn: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.azure,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: Colors.routeTeal,
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  navigateBtnText: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
  illegalMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.alarmRed,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  illegalX: {
    color: Colors.white,
    fontWeight: '900',
    fontSize: 15,
  },
  parkingMarker: {
    alignItems: 'center',
    backgroundColor: Colors.azure,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  parkingMarkerFull: {
    borderColor: Colors.orange,
  },
  parkingMarkerP: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.white,
  },
  parkingMarkerOcc: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.grayGreen,
  },
  banner: {
    margin: Spacing.md,
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