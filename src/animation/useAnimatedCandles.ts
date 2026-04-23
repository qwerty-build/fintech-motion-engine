// ============================================================
// useAnimatedCandles.ts
// Custom Remotion hook for sequential candle reveal animation.
//
// WHAT IT DOES:
// Given the full series and the current frame, returns:
//   - visibleCandles: all candles that have started revealing
//   - getOpacity(index): 0→1 opacity for each candle
//
// HOW THE TIMING WORKS:
//   Each candle gets a slot of FRAMES_PER_CANDLE frames.
//   Candle[i] starts revealing at frame: i * FRAMES_PER_CANDLE
//   It fades in over FADE_DURATION frames using spring physics.
//   All prior candles are fully opaque (opacity = 1).
//
// WHY A HOOK NOT A COMPONENT:
//   Keeps animation math out of JSX. ChartPatternBreakdown
//   stays a pure renderer — it just reads what this hook says.
// ============================================================

import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import type { OHLCVCandle } from "../types/schema";
import { FRAMES_PER_CANDLE, FADE_DURATION } from "../config/timingConstants";
// Imported from timingConstants.ts — edit values there, not here.
// calculateMetadata.ts reads the same constants to compute duration.

interface AnimatedCandleState {
  // The subset of candles visible at the current frame
  visibleCandles: OHLCVCandle[];
  // Call with a candle's index to get its current opacity (0–1)
  getOpacity: (candleIndex: number) => number;
}

export const useAnimatedCandles = (
  series: OHLCVCandle[]
): AnimatedCandleState => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // How many candles should be visible or in-progress at this frame
  // +1 because we want the currently-revealing candle included
  const revealedCount = Math.min(
    Math.floor(frame / FRAMES_PER_CANDLE) + 1,
    series.length
  );

  const visibleCandles = series.slice(0, revealedCount);

  const getOpacity = (candleIndex: number): number => {
    const candleStartFrame = candleIndex * FRAMES_PER_CANDLE;
    const framesSinceReveal = frame - candleStartFrame;

    // Candle hasn't started yet — shouldn't happen since we slice,
    // but guard defensively
    if (framesSinceReveal < 0) return 0;

    // Candle is fully revealed — all prior candles hit this path
    if (framesSinceReveal >= FADE_DURATION) return 1;

    // Candle is mid-reveal — use spring for organic feel.
    // spring() returns a value that goes from 0 → ~1 with
    // natural overshoot/settle based on damping + stiffness.
    const springValue = spring({
      frame: framesSinceReveal,
      fps,
      config: {
        damping: 14,    // Higher = less bounce, settles faster
        stiffness: 120, // Higher = faster initial acceleration
        mass: 0.8,      // Lower = lighter, snappier feel
      },
      // Clamp to [0, 1] so spring overshoot doesn't cause
      // opacity > 1 which would look like a flash
      durationInFrames: FADE_DURATION,
    });

    // interpolate clamps the spring output to a clean 0→1 range
    return interpolate(springValue, [0, 1], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  };

  return { visibleCandles, getOpacity };
};
