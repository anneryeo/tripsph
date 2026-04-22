import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Typography, Spacing, Radius, OIEVerdict } from '../../constants/theme';
import { queryOIE, getBannerText, getBannerColor } from '../../services/OIEService';

const DESTINATION = {
  name: 'Robinsons Galleria',
};

export default function NavigationModeScreen({ navigation, route }) {
  const initialVerdict = route.params?.verdict ?? null;
  const [verdict, setVerdict] = useState(initialVerdict);
  const [eta] = useState('12 min');
  const [distance] = useState('4.2 km');

  useEffect(() => {
    const poll = async () => {
      const lat = 14.5720 + (Math.random() - 0.5) * 0.03;
      const lon = 121.0450 + (Math.random() - 0.5) * 0.03;
      const result = await queryOIE(lat, lon);
      setVerdict(result);
    };

    poll();
    const timer = setInterval(poll, 30000);
    return () => clearInterval(timer);
  }, []);

  const bannerColor = verdict ? getBannerColor(verdict.verdict) : Colors.azure;
  const bannerText = verdict ? getBannerText(verdict.verdict) : 'Calculating route...';
  const isHighRisk = verdict?.verdict === OIEVerdict.ILLEGAL || verdict?.verdict === OIEVerdict.RISK;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundTint} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{'< Back'}</Text>
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.navTitle}>Navigation Mode</Text>
          <Text style={styles.destLabel}>to {DESTINATION.name}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.mapPlaceholder}>
        <View style={styles.etaCard}>
          <Text style={styles.etaTime}>{eta}</Text>
          <Text style={styles.etaDist}>{distance}</Text>
        </View>
        <Text style={styles.placeholderTitle}>Web Prototype Map Placeholder</Text>
        <Text style={styles.placeholderSub}>Use Android/iOS build for live route map interactions.</Text>
      </View>

      <View style={[styles.riskBanner, { backgroundColor: bannerColor }]}> 
        <View style={styles.bannerContent}>
          <View style={[styles.bannerIcon, isHighRisk ? styles.bannerIconRisk : styles.bannerIconSafe]}>
            <Text style={styles.bannerIconText}>{isHighRisk ? '!' : 'OK'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerText}>{bannerText}</Text>
            {verdict?.zone && <Text style={styles.bannerZone}>{verdict.zone}</Text>}
          </View>
        </View>

        {verdict?.verdict === OIEVerdict.LEGAL && (
          <Text style={styles.bannerSub}>Enforcement Level: {verdict?.enforcementLevel ?? 'LOW'}</Text>
        )}
      </View>
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
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.overlayLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSoft,
  },
  backBtn: {
    width: 60,
  },
  backText: {
    ...Typography.bodyBold,
    color: Colors.azure,
  },
  topCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navTitle: {
    ...Typography.bodyBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  destLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
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
    position: 'relative',
  },
  etaCard: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.surfaceBase,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSoft,
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
    color: Colors.white,
  },
  bannerZone: {
    ...Typography.caption,
    marginTop: 2,
    color: Colors.white,
  },
  bannerSub: {
    ...Typography.caption,
    marginTop: 4,
    color: Colors.white,
  },
});