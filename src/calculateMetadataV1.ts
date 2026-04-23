// ============================================================
// calculateMetadata.ts
// Remotion's pre-render hook. Runs BEFORE the React tree mounts.
// Computes the exact video duration from the payload's data
// so durationInFrames never needs to be hardcoded in a payload.
//
// HOW REMOTION USES THIS:
// Export it alongside your <Composition /> in Root.tsx:
//
//   import { calculateMetadata } from "./calculateMetadata";
//
//   <Composition
//     id="FintechEducationalShort"
//     component={RootRouter}
//     calculateMetadata={calculateMetadata}
//     defaultProps={{ payload: samplePayload }}
//   />
//
// When calculateMetadata is present, Remotion IGNORES the static
// durationInFrames/fps/width/height props on <Composition /> and
// uses the values returned here instead. This means every payload
// — whether from a local file, an API, or an LLM — automatically
// gets the correct duration without any manual calculation.
//
// DURATION FORMULA:
//   candleRevealEnd    = series.length * FRAMES_PER_CANDLE
//   latestAnnotationEnd= max(annotation.startFrame + annotation.duration)
//   durationInFrames   = max(candleRevealEnd, latestAnnotationEnd) + HOLD_FRAMES
//
// The max() ensures that if annotations are timed to appear after
// all candles (which is the typical case), the video is long enough
// to show all of them fully before cutting.
// ============================================================

import type { CalculateMetadataFunction } from "remotion";
import type { VideoPayload } from "./types/schema";
import { FRAMES_PER_CANDLE, HOLD_FRAMES } from "./config/timingConstants";

// RootRouter accepts { payload: VideoPayload } as its props
export interface RootRouterProps extends Record<string, unknown> {
  payload: VideoPayload;
}

export const calculateMetadata: CalculateMetadataFunction<RootRouterProps> = ({
  props,
}) => {
  const { payload } = props;
  const { series } = payload.financialData;
  const { annotations } = payload;
  const { fps, dimensions } = payload.config;

  // -- Candle reveal end --
  // Last candle starts at (series.length - 1) * FRAMES_PER_CANDLE,
  // then needs FADE_DURATION more frames to fully appear.
  // We use series.length * FRAMES_PER_CANDLE as a clean ceiling.
  const candleRevealEnd = series.length * FRAMES_PER_CANDLE;

  // -- Latest annotation end --
  // Scan all annotations and find the frame when the last one
  // finishes. Returns 0 if there are no annotations.
  const latestAnnotationEnd = annotations.reduce((latest, annotation) => {
    const end = annotation.animation.startFrame + annotation.animation.duration;
    return Math.max(latest, end);
  }, 0);

  // -- Final duration --
  const durationInFrames =
    Math.max(candleRevealEnd, latestAnnotationEnd) + HOLD_FRAMES;

  return {
    durationInFrames,
    fps,
    width: dimensions.width,
    height: dimensions.height,
    // props is returned unchanged — calculateMetadata can also
    // mutate props here (e.g. to inject fetched OHLCV data),
    // but we keep it pure for now. Phase 5e (orchestration) will
    // handle data fetching upstream before triggering the render.
    props,
  };
};
