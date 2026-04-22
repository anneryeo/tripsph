/**
 * AIReportService unit tests
 *
 * Validates:
 * - runAIPipeline returns a well-formed result with confidence scores
 * - Combined inference time is within the < 500 ms budget
 * - submitReport returns a valid report ID
 * - issueNCAPViolation POSTs pre-filled data and returns a ticket number
 */

import {
  runAIPipeline,
  submitReport,
  issueNCAPViolation,
  ViolationTypes,
} from '../src/services/AIReportService';
import { Targets } from '../src/constants/theme';

describe('AIReportService – runAIPipeline', () => {
  it('returns a result within the < 500 ms inference budget', async () => {
    const start = Date.now();
    await runAIPipeline('file:///mock/photo.jpg');
    expect(Date.now() - start).toBeLessThan(Targets.aiInferenceBudgetMs);
  });

  it('result contains all required fields', async () => {
    const result = await runAIPipeline('file:///mock/photo.jpg');
    expect(result).toHaveProperty('plateNumber');
    expect(result).toHaveProperty('plateConfidence');
    expect(result).toHaveProperty('violationType');
    expect(result).toHaveProperty('violationConfidence');
    expect(result).toHaveProperty('highConfidence');
    expect(result).toHaveProperty('inferenceTimeMs');
    expect(result).toHaveProperty('annotationLabel');
  });

  it('confidence values are between 0 and 1', async () => {
    const result = await runAIPipeline('file:///mock/photo.jpg');
    expect(result.plateConfidence).toBeGreaterThanOrEqual(0);
    expect(result.plateConfidence).toBeLessThanOrEqual(1);
    expect(result.violationConfidence).toBeGreaterThanOrEqual(0);
    expect(result.violationConfidence).toBeLessThanOrEqual(1);
  });

  it('highConfidence flag reflects the ≥ 85 % threshold', async () => {
    const result = await runAIPipeline('file:///mock/photo.jpg');
    const expected =
      result.plateConfidence >= Targets.aiDetectionConfidence &&
      result.violationConfidence >= Targets.aiDetectionConfidence;
    expect(result.highConfidence).toBe(expected);
  });

  it('violationType is a recognized violation category', async () => {
    const result = await runAIPipeline('file:///mock/photo.jpg');
    const validTypes = Object.values(ViolationTypes);
    expect(validTypes).toContain(result.violationType);
  });
});

describe('AIReportService – submitReport', () => {
  it('returns success and a report ID', async () => {
    const result = await submitReport({
      imageUri:      'file:///mock/photo.jpg',
      plateNumber:   'ABC 1234',
      violationType: 'Double Parking',
      latitude:      14.5876,
      longitude:     121.0607,
      timestamp:     Date.now(),
      confidence:    0.92,
      aiVerified:    true,
    });
    expect(result.success).toBe(true);
    expect(typeof result.reportId).toBe('string');
    expect(result.reportId).toMatch(/^RPT-/);
  });
});

describe('AIReportService – issueNCAPViolation', () => {
  const mockViolation = {
    plateNumber:   'XYZ 5678',
    violationType: 'No Parking Zone',
    latitude:      14.5643,
    longitude:     121.0019,
    timestamp:     new Date().toISOString(),
    photoUrl:      'https://storage.tripsph.mmda.gov.ph/r001',
    enforcerId:    'MMDA-2026',
    confidence:    0.88,
  };

  it('returns success and a ticket number', async () => {
    const result = await issueNCAPViolation(mockViolation);
    expect(result.success).toBe(true);
    expect(typeof result.ticketNumber).toBe('string');
    expect(result.ticketNumber).toMatch(/^NCAP-/);
  });

  it('payload contains all required NCAP fields', async () => {
    const result = await issueNCAPViolation(mockViolation);
    expect(result.payload).toHaveProperty('plateNumber', mockViolation.plateNumber);
    expect(result.payload).toHaveProperty('violationType', mockViolation.violationType);
    expect(result.payload).toHaveProperty('latitude',      mockViolation.latitude);
    expect(result.payload).toHaveProperty('longitude',     mockViolation.longitude);
    expect(result.payload).toHaveProperty('timestamp',     mockViolation.timestamp);
    expect(result.payload).toHaveProperty('photoUrl',      mockViolation.photoUrl);
    expect(result.payload).toHaveProperty('enforcerId',    mockViolation.enforcerId);
    expect(result.payload).toHaveProperty('confidence',    mockViolation.confidence);
  });

  it('enforcer response time is within the ≤ 5 minute target', async () => {
    const result = await issueNCAPViolation(mockViolation);
    expect(result.enforcerResponseMs).toBeLessThanOrEqual(
      Targets.enforcerResponseTimeSec * 1000,
    );
  });
});
