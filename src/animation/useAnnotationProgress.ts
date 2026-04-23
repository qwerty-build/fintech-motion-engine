// ============================================================
// useAnnotationProgress.ts
// Shared hook that converts an annotation's AnimationConfig
// into a single progress value (0 → 1) at the current frame.
//
// WHY ONE HOOK FOR ALL ANNOTATIONS:
// All 4 annotation types (trendline, zone, callout, h-line)
// need the same logic: "has this annotation started yet, and
// how far through its animation is it?" Centralising this
// prevents 4 slightly-different implementations drifting apart.
//
// EASING:
// - linear / easeIn / easeOut / easeInOut → interpolate()
// - spring → Remotion's spring() function
//   Spring ignores duration and settles naturally — duration
//   is used only as a soft guide for durationInFrames.
// ============================================================

import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import type { AnimationConfig, EasingFunction } from "../types/schema";

// Maps our schema EasingFunction strings to interpolate() easing fns
const EASING_MAP: Record<
  Exclude<EasingFunction, "spring">,
  (t: number) => number
> = {
  linear:     (t) => t,
  easeIn:     (t) => t * t,
  easeOut:    (t) => t * (2 - t),
  easeInOut:  (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
};

export const useAnnotationProgress = (
  animation: AnimationConfig
): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { startFrame, duration, easing } = animation;
  const framesSinceStart = frame - startFrame;

  // Annotation hasn't reached its startFrame yet
  if (framesSinceStart < 0) return 0;
  // Annotation fully complete (non-spring easings)
  if (easing !== "spring" && framesSinceStart >= duration) return 1;

  if (easing === "spring") {
    // spring() drives itself to completion — we clamp its output
    const value = spring({
      frame: framesSinceStart,
      fps,
      config: { damping: 12, stiffness: 100, mass: 1 },
      durationInFrames: duration,
    });
    return Math.min(Math.max(value, 0), 1);
  }

  // All other easings use interpolate with the mapped fn
  return interpolate(
    framesSinceStart,
    [0, duration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASING_MAP[easing],
    }
  );
};
