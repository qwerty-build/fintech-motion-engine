// ============================================================
// samplePayload.ts
// Local test payload for Remotion Studio.
//
// IMPORTANT — durationInFrames is intentionally OMITTED here.
// It is computed automatically by calculateMetadata.ts based on:
//   series.length * FRAMES_PER_CANDLE + max(annotation ends) + HOLD_FRAMES
//
// To wire this up in your Root.tsx:
//
//   import { Composition } from "remotion";
//   import { RootRouter } from "./RootRouter";
//   import { calculateMetadata } from "./calculateMetadata";
//   import { samplePayload } from "./samplePayload";
//
//   export const RemotionRoot = () => (
//     <Composition
//       id="FintechEducationalShort"
//       component={RootRouter}
//       calculateMetadata={calculateMetadata}
//       defaultProps={{ payload: samplePayload }}
//       // These are fallbacks only — calculateMetadata overrides them:
//       durationInFrames={300}
//       fps={60}
//       width={1080}
//       height={1920}
//     />
//   );
// ============================================================

import type { VideoPayload } from "./types/schema";

export const samplePayload: VideoPayload = {
  specVersion: "1.0.0",
  config: {
    compositionId: "FintechEducationalShort",
    // durationInFrames is overridden at runtime by calculateMetadata.
    // This fallback (800) only applies if calculateMetadata is not yet
    // wired into Root.tsx — keeps Remotion Studio usable in that case.
    durationInFrames: 800,
    fps: 60,
    dimensions: { width: 1080, height: 1920 },
    theme: {
      background: "#0B0E14",
      bullishColor: "#00FF7F",
      bearishColor: "#FF3366",
      neutralColor: "#888888",
      fontFamily: "Inter, sans-serif",
    },
  },
  routing: {
    templateId: "chart_pattern_breakdown",
    chapterMarkers: [
      { frame: 0, label: "Hook" },
      { frame: 300, label: "Pattern Definition" },
      { frame: 900, label: "Live Chart Walkthrough" },
      { frame: 1500, label: "Entry Setup" },
    ],
  },
  financialData: {
    asset: { ticker: "ETH/USD", exchange: "Crypto" },
    timeframe: "15m",
    series: [
      { index: 0, time: "2024-01-15T09:00:00Z", open: 2210, high: 2248, low: 2198, close: 2240, volume: 12400 },
      { index: 1, time: "2024-01-15T09:15:00Z", open: 2240, high: 2265, low: 2230, close: 2258, volume: 15800 },
      { index: 2, time: "2024-01-15T09:30:00Z", open: 2258, high: 2270, low: 2241, close: 2245, volume: 9200 },
      { index: 3, time: "2024-01-15T09:45:00Z", open: 2245, high: 2252, low: 2228, close: 2233, volume: 8100 },
      { index: 4, time: "2024-01-15T10:00:00Z", open: 2233, high: 2290, low: 2229, close: 2285, volume: 24600 },
      { index: 5, time: "2024-01-15T10:15:00Z", open: 2285, high: 2310, low: 2278, close: 2305, volume: 31200 },
    ],
  },
  annotations: [
    {
      id: "flag_zone",
      type: "zone",
      startIndex: 1,
      endIndex: 3,
      priceLow: 2228,
      priceHigh: 2270,
      style: { fill: "#FFFFFF", opacity: 0.1 },
      animation: { startFrame: 300, duration: 45, easing: "linear" },
    },
    {
      id: "breakout_trendline",
      type: "trendline",
      startIndex: 0,
      endIndex: 4,
      style: { stroke: "#00FF7F", strokeWidth: 2, opacity: 0.8, dashed: false },
      animation: { startFrame: 500, duration: 60, easing: "easeOut" },
    },
    {
      id: "entry_callout",
      type: "callout",
      targetIndex: 4,
      text: "High Volume Breakout",
      style: { color: "#00FF7F", fontSize: 48 },
      animation: { startFrame: 650, duration: 30, easing: "spring" },
    },
    {
      id: "resistance_line",
      type: "horizontal_line",
      price: 2270,
      label: "Resistance",
      style: { stroke: "#FF3366", strokeWidth: 1.5, opacity: 0.7, dashed: true },
      animation: { startFrame: 200, duration: 40, easing: "linear" },
    },
  ],
};
