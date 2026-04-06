/**
 * drawHandSkeleton.js
 *
 * Draws the 21-point MediaPipe hand skeleton onto a 2D canvas context.
 * Connections follow the standard MediaPipe Hands topology.
 *
 * Usage:
 *   drawHandSkeleton(ctx, landmarks, videoWidth, videoHeight, canvasWidth, canvasHeight)
 */

// MediaPipe Hands connection pairs (landmark index pairs)
const CONNECTIONS = [
  // Thumb
  [0,1],[1,2],[2,3],[3,4],
  // Index
  [0,5],[5,6],[6,7],[7,8],
  // Middle
  [0,9],[9,10],[10,11],[11,12],
  // Ring
  [0,13],[13,14],[14,15],[15,16],
  // Pinky
  [0,17],[17,18],[18,19],[19,20],
  // Palm
  [5,9],[9,13],[13,17],
];

const FINGER_COLORS = [
  '#FF6B6B', // Thumb
  '#4ECDC4', // Index
  '#45B7D1', // Middle
  '#96CEB4', // Ring
  '#FFEAA7', // Pinky + palm
];

const CONNECTION_COLOR_MAP = [
  0,0,0,0,       // Thumb (4 connections)
  1,1,1,1,       // Index
  2,2,2,2,       // Middle
  3,3,3,3,       // Ring
  4,4,4,4,       // Pinky
  4,4,4,         // Palm
];

/**
 * Maps a landmark {x, y} from [0,1] normalized space OR pixel space
 * to the canvas coordinate space.
 *
 * MediaPipe returns keypoints in pixel coordinates (image space).
 * We scale them to match the canvas dimensions.
 */
function toCanvas(lm, videoW, videoH, canvasW, canvasH) {
  // keypoints from hand-pose-detection are in pixel coords of the video
  const scaleX = canvasW / videoW;
  const scaleY = canvasH / videoH;
  // Mirror because we set flipHorizontal: true in detection
  return {
    x: canvasW - (lm.x * scaleX),
    y: lm.y * scaleY,
  };
}

export function drawHandSkeleton(ctx, landmarks, videoW, videoH, canvasW, canvasH) {
  if (!ctx || !landmarks || landmarks.length < 21) return;

  ctx.clearRect(0, 0, canvasW, canvasH);

  // Draw connections
  CONNECTIONS.forEach(([i, j], connIdx) => {
    const a = toCanvas(landmarks[i], videoW, videoH, canvasW, canvasH);
    const b = toCanvas(landmarks[j], videoW, videoH, canvasW, canvasH);
    const color = FINGER_COLORS[CONNECTION_COLOR_MAP[connIdx]] || '#ffffff';

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.85;
    ctx.stroke();
  });

  // Draw landmark dots
  landmarks.forEach((lm, idx) => {
    const pt = toCanvas(lm, videoW, videoH, canvasW, canvasH);
    const isTip = [4, 8, 12, 16, 20].includes(idx);
    const isWrist = idx === 0;

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, isTip ? 7 : isWrist ? 6 : 4, 0, 2 * Math.PI);
    ctx.fillStyle = isTip ? '#ffffff' : isWrist ? '#FFD700' : 'rgba(255,255,255,0.75)';
    ctx.globalAlpha = 1;
    ctx.fill();

    // Colored ring on fingertips
    if (isTip) {
      const fingerIdx = [4,8,12,16,20].indexOf(idx);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 7, 0, 2 * Math.PI);
      ctx.strokeStyle = FINGER_COLORS[fingerIdx];
      ctx.lineWidth = 2;
      ctx.globalAlpha = 1;
      ctx.stroke();
    }
  });

  ctx.globalAlpha = 1;
}