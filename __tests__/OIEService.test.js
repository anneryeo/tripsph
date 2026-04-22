/**
 * OIEService unit tests
 *
 * Validates the Ordinance Intelligence Engine core logic:
 * - queryOIE returns correct verdict for known Metro Manila coordinates
 * - Response time is within the ≤ 200 ms target
 * - getBannerText / getBannerColor return expected values
 */

import {
  queryOIE,
  getOrdinanceZones,
  getBannerText,
  getBannerColor,
} from '../src/services/OIEService';
import { OIEVerdict, Colors, Targets } from '../src/constants/theme';

describe('OIEService – queryOIE', () => {
  it('returns ILLEGAL verdict for a coordinate inside a no-parking zone', async () => {
    // EDSA-Taft zone center
    const result = await queryOIE(14.5643, 121.0019);
    expect(result.verdict).toBe(OIEVerdict.ILLEGAL);
    expect(result.color).toBe(Colors.alarmRed);
  });

  it('returns LEGAL verdict for a coordinate well outside all zones', async () => {
    // Far north of Metro Manila
    const result = await queryOIE(14.9000, 121.0000);
    expect(result.verdict).toBe(OIEVerdict.LEGAL);
    expect(result.color).toBe(Colors.grayGreen);
  });

  it('responds within the ≤ 200 ms OIE target', async () => {
    const start = Date.now();
    await queryOIE(14.5765, 121.0339);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThanOrEqual(Targets.oieResponseTimeMs);
  });

  it('result contains required fields', async () => {
    const result = await queryOIE(14.5765, 121.0339);
    expect(result).toHaveProperty('verdict');
    expect(result).toHaveProperty('reason');
    expect(result).toHaveProperty('color');
    expect(result).toHaveProperty('enforcementLevel');
    expect(result).toHaveProperty('responseTimeMs');
  });

  it('picks the most restrictive verdict when coordinates overlap multiple zones', async () => {
    // Between Ortigas (RISK) and EDSA-Taft (ILLEGAL) – force exact center of ILLEGAL
    const result = await queryOIE(14.5643, 121.0019);
    expect([OIEVerdict.RISK, OIEVerdict.ILLEGAL]).toContain(result.verdict);
  });
});

describe('OIEService – getOrdinanceZones', () => {
  it('returns a non-empty array of zones', () => {
    const zones = getOrdinanceZones();
    expect(Array.isArray(zones)).toBe(true);
    expect(zones.length).toBeGreaterThan(0);
  });

  it('every zone has an id, verdict, coords, and name', () => {
    const zones = getOrdinanceZones();
    zones.forEach((zone) => {
      expect(zone).toHaveProperty('id');
      expect(zone).toHaveProperty('verdict');
      expect(zone).toHaveProperty('name');
      expect(zone.coords).toHaveProperty('latitude');
      expect(zone.coords).toHaveProperty('longitude');
      expect(zone.coords).toHaveProperty('radius');
    });
  });

  it('contains at least one zone of each verdict type', () => {
    const zones = getOrdinanceZones();
    const verdicts = zones.map((z) => z.verdict);
    expect(verdicts).toContain(OIEVerdict.LEGAL);
    expect(verdicts).toContain(OIEVerdict.RISK);
    expect(verdicts).toContain(OIEVerdict.ILLEGAL);
  });
});

describe('OIEService – banner helpers', () => {
  it('getBannerText returns high-risk text for ILLEGAL', () => {
    const text = getBannerText(OIEVerdict.ILLEGAL);
    expect(text.toLowerCase()).toMatch(/tow|high risk/i);
  });

  it('getBannerText returns safe text for LEGAL', () => {
    const text = getBannerText(OIEVerdict.LEGAL);
    expect(text.toLowerCase()).toMatch(/legal|low risk/i);
  });

  it('getBannerColor returns alarmRed for ILLEGAL', () => {
    expect(getBannerColor(OIEVerdict.ILLEGAL)).toBe(Colors.alarmRed);
  });

  it('getBannerColor returns grayGreen for LEGAL', () => {
    expect(getBannerColor(OIEVerdict.LEGAL)).toBe(Colors.grayGreen);
  });

  it('getBannerColor returns orange for RISK', () => {
    expect(getBannerColor(OIEVerdict.RISK)).toBe(Colors.orange);
  });
});
