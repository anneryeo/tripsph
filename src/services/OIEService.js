/**
 * Ordinance Intelligence Engine (OIE) Service
 *
 * Simulates the geofenced digital-ordinance rules engine.
 * In production this communicates over a persistent WebSocket
 * connection to achieve ≤ 200 ms response times.
 */

import { OIEVerdict, Colors } from '../constants/theme';

// ── Mock ordinance zones around Metro Manila ──────────────────────────────────
const ORDINANCE_ZONES = [
  // Tow-away / No-parking zones (ILLEGAL)
  {
    id: 'zone-edsa-taft',
    name: 'EDSA–Taft Intersection',
    verdict: OIEVerdict.ILLEGAL,
    reason: 'No Stopping / No Parking – MMDA Ordinance 2019-001',
    coords: { latitude: 14.5643, longitude: 121.0019, radius: 250 },
    enforcementLevel: 'HIGH',
  },
  {
    id: 'zone-ayala-cbd',
    name: 'Ayala Avenue CBD',
    verdict: OIEVerdict.ILLEGAL,
    reason: 'Tow-Away Zone 7am–8pm – Makati Ord. 2020-011',
    coords: { latitude: 14.5547, longitude: 121.0244, radius: 400 },
    enforcementLevel: 'HIGH',
  },
  // High-risk zones (RISK)
  {
    id: 'zone-ortigas',
    name: 'Ortigas Center',
    verdict: OIEVerdict.RISK,
    reason: 'Active towing patrols 7am–9pm – High enforcement heat',
    coords: { latitude: 14.5876, longitude: 121.0607, radius: 350 },
    enforcementLevel: 'MEDIUM',
  },
  {
    id: 'zone-quiapo',
    name: 'Quiapo – Quezon Blvd',
    verdict: OIEVerdict.RISK,
    reason: 'No Parking 6am–10pm – Manila Ord. 8425',
    coords: { latitude: 14.5975, longitude: 120.9839, radius: 300 },
    enforcementLevel: 'MEDIUM',
  },
  // Legal / Available zones
  {
    id: 'zone-bgc-north',
    name: 'BGC North Parking Strip',
    verdict: OIEVerdict.LEGAL,
    reason: 'Designated paid parking – Occupancy 42%',
    coords: { latitude: 14.5512, longitude: 121.0494, radius: 200 },
    enforcementLevel: 'LOW',
  },
  {
    id: 'zone-eastwood',
    name: 'Eastwood City Parking',
    verdict: OIEVerdict.LEGAL,
    reason: 'Designated paid parking – Occupancy 71%',
    coords: { latitude: 14.6065, longitude: 121.0778, radius: 180 },
    enforcementLevel: 'LOW',
  },
];

// ── Paid-parking structures ───────────────────────────────────────────────────
export const PARKING_STRUCTURES = [
  {
    id: 'ps-robinsons-galleria',
    name: 'Robinsons Galleria',
    coordinate: { latitude: 14.5866, longitude: 121.0565 },
    occupancy: 85,
    rate: '₱50/hr',
  },
  {
    id: 'ps-sm-aura',
    name: 'SM Aura Premier',
    coordinate: { latitude: 14.5486, longitude: 121.0537 },
    occupancy: 62,
    rate: '₱40/hr',
  },
  {
    id: 'ps-ayala-malls',
    name: 'Ayala Malls Manila Bay',
    coordinate: { latitude: 14.5236, longitude: 120.9927 },
    occupancy: 48,
    rate: '₱45/hr',
  },
  {
    id: 'ps-megamall',
    name: 'SM Megamall',
    coordinate: { latitude: 14.5845, longitude: 121.0569 },
    occupancy: 91,
    rate: '₱30/hr',
  },
  {
    id: 'ps-glorietta',
    name: 'Glorietta Parking',
    coordinate: { latitude: 14.5511, longitude: 121.0195 },
    occupancy: 55,
    rate: '₱50/hr',
  },
];

// ── Haversine distance helper ─────────────────────────────────────────────────
function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Core OIE query ────────────────────────────────────────────────────────────
/**
 * Returns a parking legality verdict for the given GPS coordinate.
 * Simulates ≤ 200 ms WebSocket round-trip with a small artificial delay.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{verdict, zone, reason, color, enforcementLevel}>}
 */
export async function queryOIE(latitude, longitude) {
  const start = Date.now();

  // Simulate async network call (fixed demo delay; production uses real WebSocket)
  await new Promise((resolve) => setTimeout(resolve, 50));

  let result = {
    verdict: OIEVerdict.LEGAL,
    zone: null,
    reason: 'No active restrictions. Parking appears legal at this location.',
    color: Colors.grayGreen,
    enforcementLevel: 'LOW',
    responseTimeMs: 0,
  };

  // Find the most restrictive overlapping zone
  let worstPriority = -1;
  const priority = {
    [OIEVerdict.LEGAL]: 0,
    [OIEVerdict.RISK]: 1,
    [OIEVerdict.ILLEGAL]: 2,
  };

  for (const zone of ORDINANCE_ZONES) {
    const dist = haversineMeters(
      latitude, longitude,
      zone.coords.latitude, zone.coords.longitude,
    );
    if (dist <= zone.coords.radius && priority[zone.verdict] > worstPriority) {
      worstPriority = priority[zone.verdict];
      result = {
        verdict: zone.verdict,
        zone: zone.name,
        reason: zone.reason,
        color:
          zone.verdict === OIEVerdict.ILLEGAL
            ? Colors.alarmRed
            : zone.verdict === OIEVerdict.RISK
            ? Colors.orange
            : Colors.grayGreen,
        enforcementLevel: zone.enforcementLevel,
        responseTimeMs: Date.now() - start,
      };
    }
  }

  result.responseTimeMs = Date.now() - start;
  return result;
}

// ── All ordinance zones (for map rendering) ───────────────────────────────────
export function getOrdinanceZones() {
  return ORDINANCE_ZONES;
}

// ── Verdict → banner text helpers ─────────────────────────────────────────────
export function getBannerText(verdict) {
  switch (verdict) {
    case OIEVerdict.ILLEGAL:
      return 'HIGH RISK ZONE – Tow Away Area. Do Not Stop.';
    case OIEVerdict.RISK:
      return 'CAUTION – Active Enforcement. Park with Care.';
    default:
      return 'Low Risk Zone – Parking Likely Legal.';
  }
}

export function getBannerColor(verdict) {
  switch (verdict) {
    case OIEVerdict.ILLEGAL:
      return Colors.alarmRed;
    case OIEVerdict.RISK:
      return Colors.orange;
    default:
      return Colors.grayGreen;
  }
}
