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

// ============================================================
// calculateMetadata.ts
// Remotion pre-render hook — computes durationInFrames from
// the payload so it never needs to be hardcoded.
//
// Supports both spec 1.0.0 (single-panel) and 1.1.0 (multi-panel).
//
// DURATION FORMULA:
//   candleRevealEnd     = longestSeries.length * FRAMES_PER_CANDLE
//   latestAnnotationEnd = max(startFrame + duration) across all annotations
//   durationInFrames    = max(candleRevealEnd, latestAnnotationEnd) + HOLD_FRAMES
// ============================================================

import type { CalculateMetadataFunction } from "remotion";
import type { VideoPayload, Annotation, PanelData } from "./types/schema";
import { FRAMES_PER_CANDLE, HOLD_FRAMES } from "./config/timingConstants";

// ------------------------------------------------------------
// Helper — latest end frame across an annotation array
// ------------------------------------------------------------

function latestEndFrame(annotations: Annotation[]): number {
  if (!annotations || annotations.length === 0) return 0;
  return Math.max(
    ...annotations.map((a) => a.animation.startFrame + a.animation.duration)
  );
}

// ------------------------------------------------------------
// calculateMetadata
// Uses Record<string,unknown> generic to satisfy Remotion's
// Composition type constraint — payload is cast internally.
// ------------------------------------------------------------

export const calculateMetadata: CalculateMetadataFunction<
  Record<string, unknown>
> = ({ props }) => {
  const payload = (props as { payload: VideoPayload }).payload;
  const { fps, dimensions } = payload.config;

  const hasMultiplePanels =
    Array.isArray(payload.panels) && payload.panels.length > 0;

  // ── Candle reveal end ──────────────────────────────────────
  let candleRevealEnd: number;

  if (hasMultiplePanels) {
    // Use the longest panel series so all panels finish before the video ends
    candleRevealEnd =
      Math.max(
        ...(payload.panels as PanelData[]).map(
          (p) => p.financialData.series.length
        )
      ) * FRAMES_PER_CANDLE;
  } else {
    candleRevealEnd =
      payload.financialData.series.length * FRAMES_PER_CANDLE;
  }

  // ── Latest annotation end ──────────────────────────────────
  // Scan top-level annotations first
  let latestAnnotationEnd = latestEndFrame(payload.annotations);

  // Then scan every panel's annotation array if panels are present
  if (hasMultiplePanels) {
    for (const panel of payload.panels as PanelData[]) {
      const panelEnd = latestEndFrame(panel.annotations);
      if (panelEnd > latestAnnotationEnd) {
        latestAnnotationEnd = panelEnd;
      }
    }
  }

  // ── Final duration ─────────────────────────────────────────
  let durationInFrames =
    Math.max(candleRevealEnd, latestAnnotationEnd) + HOLD_FRAMES;

  // For viral_trade_breakdown, duration may be driven by chapters
  if (payload.routing.chapters && payload.routing.chapters.length > 0) {
    const lastChapter = payload.routing.chapters[payload.routing.chapters.length - 1];
    durationInFrames = Math.max(durationInFrames, lastChapter.endFrame);
  }

  return {
    durationInFrames,
    fps,
    width: dimensions.width,
    height: dimensions.height,
    props,
  };
};