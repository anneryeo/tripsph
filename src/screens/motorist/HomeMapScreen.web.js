import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Typography, Spacing, Radius, Targets } from '../../constants/theme';
import { getBannerText, getBannerColor } from '../../services/OIEService';
import { wsService } from '../../services/WebSocketService';
import { VerdictBadge } from '../../components/UIComponents';

export default function HomeMapScreen({ navigation }) {
  const [verdict, setVerdict] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [connected, setConnected] = useState(false);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundTint} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleReturn} style={styles.returnBtn} accessibilityRole="button" accessibilityLabel="Return">
          <Text style={styles.returnText}>Return</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.appTitle}>TRIPS PH</Text>
          <Text style={styles.appSubtitle}>Live Risk Map (Web Prototype)</Text>
        </View>
        <View style={styles.topRight}>
          <View style={[styles.wsDot, { backgroundColor: connected ? Colors.grayGreen : Colors.orange }]} />
          <Text style={styles.wsLabel}>{connected ? 'OIE Live' : 'OIE Polling'}</Text>
        </View>
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

      <TouchableOpacity
        style={[styles.banner, { backgroundColor: bannerColor }]}
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
  returnBtn: {
    marginRight: Spacing.sm,
  },
  returnText: {
    ...Typography.bodyBold,
    color: Colors.azure,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 2,
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
    borderColor: Colors.borderSoft,
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
  mapPlaceholderWrap: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  mapPlaceholder: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
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
    borderColor: Colors.borderSoft,
    backgroundColor: '#e6f2ef',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  road: {
    position: 'absolute',
    backgroundColor: 'rgba(31,82,92,0.2)',
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
    borderColor: Colors.white,
  },
  navigateBtnText: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
  banner: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  bannerText: {
    ...Typography.bodyBold,
    color: Colors.white,
    flex: 1,
    fontSize: 13,
  },
  bannerSub: {
    ...Typography.caption,
    color: Colors.white,
    fontSize: 11,
  },
});