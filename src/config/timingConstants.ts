// ============================================================
// config/timingConstants.ts
// Single source of truth for all frame-timing values.
//
// WHY A SEPARATE FILE:
// FRAMES_PER_CANDLE is used in two completely separate places:
//   1. useAnimatedCandles.ts — to decide when each candle appears
//   2. calculateMetadata.ts  — to compute total video duration
// If these two diverge (e.g. someone edits one but not the other)
// the video will either cut off before all candles are shown, or
// have dead frames at the end. One file eliminates that risk.
//
// HOW TO TUNE:
// Increasing FRAMES_PER_CANDLE slows the reveal — more dramatic,
// better for longer series. Decreasing it speeds up the reveal —
// better for short educational clips. HOLD_FRAMES controls how
// long the completed chart stays on screen before the video ends.
// ============================================================

// Frames between each new candle appearing in the reveal animation
export const FRAMES_PER_CANDLE = 8;

// Frames over which each candle fades in (spring physics window)
export const FADE_DURATION = 6;

// Frames the fully-revealed chart holds before the video ends.
// At 60fps, 120 = 2 seconds. Gives the viewer time to read the
// final state before the video loops or ends.
export const HOLD_FRAMES = 120;
