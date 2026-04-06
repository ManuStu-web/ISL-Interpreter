/**
 * ISL Alphabet Labels (A-Z) — 26 classes
 * Index maps directly to model output class index.
 */
export const ISL_LABELS = [
  'A','B','C','D','E','F','G','H','I','J',
  'K','L','M','N','O','P','Q','R','S','T',
  'U','V','W','X','Y','Z'
];

export const NUM_CLASSES = ISL_LABELS.length; // 26
export const NUM_LANDMARKS = 21;
export const NUM_COORDS = 3; // x, y, z per landmark
export const INPUT_SIZE = NUM_LANDMARKS * NUM_COORDS; // 63

/**
 * Normalize raw MediaPipe landmarks to a translation- and scale-invariant
 * 63-dim float vector. Steps:
 *   1. Subtract wrist (landmark 0) to make translation-invariant
 *   2. Divide by the max absolute value so scale-invariant
 *   3. Flatten [x0,y0,z0, x1,y1,z1, ...]
 */
export function normalizeLandmarks(landmarks) {
  if (!landmarks || landmarks.length === 0) return null;

  const wrist = landmarks[0];
  const centered = landmarks.map(lm => ({
    x: lm.x - wrist.x,
    y: lm.y - wrist.y,
    z: (lm.z || 0) - (wrist.z || 0),
  }));

  // Find max abs value for scale normalization
  let maxVal = 0;
  for (const lm of centered) {
    maxVal = Math.max(maxVal, Math.abs(lm.x), Math.abs(lm.y), Math.abs(lm.z));
  }
  if (maxVal === 0) maxVal = 1;

  const flat = [];
  for (const lm of centered) {
    flat.push(lm.x / maxVal, lm.y / maxVal, lm.z / maxVal);
  }
  return flat; // length 63
}