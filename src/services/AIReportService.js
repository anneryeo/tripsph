/**
 * AI Report Service
 *
 * On-device AI pipeline for parking-violation detection.
 * Uses TFLite models for License Plate OCR and Violation Classification.
 * Combined inference budget: < 500 ms.
 *
 * In this demo the models are simulated; swap in the real TFLite
 * bundles by replacing runPlateOCR() and runViolationClassifier().
 */

import { Targets } from '../constants/theme';

// ── Violation categories the classifier can detect ────────────────────────────
export const ViolationTypes = {
  BLOCKING_DRIVEWAY:    'Blocking Driveway',
  NO_PARKING_ZONE:      'No Parking Zone',
  DOUBLE_PARKING:       'Double Parking',
  BLOCKING_INTERSECTION:'Blocking Intersection',
  SIDEWALK_PARKING:     'Sidewalk Parking',
  FIRE_HYDRANT:         'Blocking Fire Hydrant',
};

// ── Mock plate patterns ───────────────────────────────────────────────────────
const MOCK_PLATES = [
  'ABC 1234', 'XYZ 5678', 'MNL 9012', 'QCY 3456',
  'MMD 7890', 'NCR 2468', 'LTO 1357', 'TRP 8024',
];

/**
 * Run the full on-device AI pipeline on the captured image URI.
 *
 * @param {string} imageUri  - Local URI of the captured photo
 * @returns {Promise<AIResult>}
 *
 * @typedef {Object} AIResult
 * @property {string}  plateNumber      - Detected license plate
 * @property {number}  plateConfidence  - OCR confidence 0–1
 * @property {string}  violationType    - Detected violation category
 * @property {number}  violationConfidence - Classifier confidence 0–1
 * @property {boolean} highConfidence   - true if both scores ≥ TARGET threshold
 * @property {number}  inferenceTimeMs  - Total on-device inference time
 * @property {string}  annotationLabel  - Human-readable annotation for UI
 */
export async function runAIPipeline(imageUri) {
  const start = Date.now();

  // Simulate async on-device inference (TFLite model execution)
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 200 + 150),
  );

  const plateNumber = MOCK_PLATES[Math.floor(Math.random() * MOCK_PLATES.length)];
  const plateConfidence = 0.78 + Math.random() * 0.21;

  const violationKeys = Object.keys(ViolationTypes);
  const violationType =
    ViolationTypes[violationKeys[Math.floor(Math.random() * violationKeys.length)]];
  const violationConfidence = 0.80 + Math.random() * 0.19;

  const inferenceTimeMs = Date.now() - start;
  const highConfidence =
    plateConfidence >= Targets.aiDetectionConfidence &&
    violationConfidence >= Targets.aiDetectionConfidence;

  return {
    plateNumber,
    plateConfidence,
    violationType,
    violationConfidence,
    highConfidence,
    inferenceTimeMs,
    annotationLabel: `${violationType} detected`,
  };
}

/**
 * Submit a verified or manual report to the MMDA backend.
 *
 * @param {Object} report
 * @param {string} report.imageUri
 * @param {string} report.plateNumber
 * @param {string} report.violationType
 * @param {number} report.latitude
 * @param {number} report.longitude
 * @param {number} report.timestamp  - UTC epoch ms
 * @param {number} report.confidence
 * @param {boolean} report.aiVerified
 * @returns {Promise<{success, reportId}>}
 */
export async function submitReport(report) {
  // In production this POSTs to the MMDA ticketing system
  await new Promise((resolve) => setTimeout(resolve, 400));

  const reportId = `RPT-${Date.now()}-${Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, '0')}`;

  return { success: true, reportId };
}

/**
 * Submit an NCAP violation from the Enforcer Mode.
 * POSTs to the MMDA backend ticketing system with all violation
 * data pre-filled (plate, GPS, timestamp, photo URL).
 *
 * @param {Object} violation
 * @returns {Promise<{success, ticketNumber, enforcerResponseMs}>}
 */
export async function issueNCAPViolation(violation) {
  const start = Date.now();

  // POST to MMDA ticketing system
  const payload = {
    plateNumber:   violation.plateNumber,
    violationType: violation.violationType,
    latitude:      violation.latitude,
    longitude:     violation.longitude,
    timestamp:     violation.timestamp,     // UTC ISO-8601
    photoUrl:      violation.photoUrl,
    enforcerId:    violation.enforcerId,
    confidence:    violation.confidence,
  };

  // In production: await fetch('https://ticketing.mmda.gov.ph/api/ncap', { method:'POST', ... })
  await new Promise((resolve) => setTimeout(resolve, 350));

  const ticketNumber = `NCAP-${new Date().getFullYear()}-${Math.floor(
    Math.random() * 999999,
  )
    .toString()
    .padStart(6, '0')}`;

  return {
    success: true,
    ticketNumber,
    enforcerResponseMs: Date.now() - start,
    payload,
  };
}
