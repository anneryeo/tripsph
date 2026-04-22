/**
 * Theme constants unit tests
 *
 * Validates the design-system tokens are present and correct.
 */

import { Colors, OIEVerdict, Targets } from '../src/constants/theme';

describe('Colors', () => {
  it('darkAzure is #163b42', () => {
    expect(Colors.darkAzure).toBe('#163b42');
  });

  it('azure is #1f525c', () => {
    expect(Colors.azure).toBe('#1f525c');
  });

  it('grayGreen is #63b289', () => {
    expect(Colors.grayGreen).toBe('#63b289');
  });

  it('white is #ffffff', () => {
    expect(Colors.white).toBe('#ffffff');
  });

  it('alarmRed is defined', () => {
    expect(typeof Colors.alarmRed).toBe('string');
    expect(Colors.alarmRed).toBeTruthy();
  });
});

describe('OIEVerdict', () => {
  it('has LEGAL, RISK, and ILLEGAL values', () => {
    expect(OIEVerdict.LEGAL).toBe('LEGAL');
    expect(OIEVerdict.RISK).toBe('RISK');
    expect(OIEVerdict.ILLEGAL).toBe('ILLEGAL');
  });
});

describe('Targets', () => {
  it('OIE response time target is ≤ 200 ms', () => {
    expect(Targets.oieResponseTimeMs).toBeLessThanOrEqual(200);
  });

  it('AI detection confidence target is ≥ 85 %', () => {
    expect(Targets.aiDetectionConfidence).toBeGreaterThanOrEqual(0.85);
  });

  it('AI inference budget is < 500 ms', () => {
    expect(Targets.aiInferenceBudgetMs).toBeLessThan(500);
  });

  it('enforcer response time target is ≤ 5 minutes (300 s)', () => {
    expect(Targets.enforcerResponseTimeSec).toBeLessThanOrEqual(300);
  });

  it('map refresh rate is ≤ 60 seconds', () => {
    expect(Targets.mapRefreshRateSec).toBeLessThanOrEqual(60);
  });
});
