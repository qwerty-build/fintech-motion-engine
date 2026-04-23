// ============================================================
// samplePayloadMTF.ts
// Test payload for MultiTimeframeAnalysis template.
//
// HOW TO USE IN Root.tsx:
//
//   import { samplePayloadMTF } from "./samplePayloadMTF";
//
//   <Composition
//     id="FintechEducationalShort"
//     component={RootRouter}
//     calculateMetadata={calculateMetadata as CalculateMetadataFunction<RootRouterProps>}
//     defaultProps={{ payload: samplePayloadMTF }}
//     durationInFrames={800}
//     fps={60}
//     width={1080}
//     height={1920}
//   />
//
// WHAT TO VERIFY IN REMOTION STUDIO:
//   Frame 0:      Only first candle of panel 0 (1H) visible
//   Frame 40:     All 5 candles of panel 0 visible
//   Frame 40–80:  Panel 1 (15m) candles reveal sequentially
//   Frame 80–120: Panel 2 (5m) candles reveal sequentially
//   Frame 120+:   All panels fully visible, annotations appear
//   Throughout:   Each panel has its own independent Y-axis scale
//                 (1H prices ~2100-2400, 15m ~2240-2310, 5m ~2270-2310)
// ============================================================

import type { VideoPayload } from "./types/schema";

export const samplePayloadMTF: VideoPayload = {
  specVersion: "1.1.0",
  config: {
    compositionId: "FintechEducationalShort",
    durationInFrames: 800, // overridden by calculateMetadata at runtime
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
    templateId: "multi_timeframe_analysis",
    chapterMarkers: [
      { frame: 0,   label: "1H Overview" },
      { frame: 40,  label: "15m Detail" },
      { frame: 80,  label: "5m Entry" },
    ],
  },
  // financialData is required by the schema but ignored by this template.
  // Populate it with the macro-level series as a fallback reference.
  financialData: {
    asset: { ticker: "ETH/USD", exchange: "Crypto" },
    timeframe: "1h",
    series: [
      { index: 0, time: "2024-01-15T05:00:00Z", open: 2100, high: 2180, low: 2090, close: 2160, volume: 45000 },
      { index: 1, time: "2024-01-15T06:00:00Z", open: 2160, high: 2240, low: 2140, close: 2220, volume: 52000 },
      { index: 2, time: "2024-01-15T07:00:00Z", open: 2220, high: 2310, low: 2210, close: 2290, volume: 61000 },
      { index: 3, time: "2024-01-15T08:00:00Z", open: 2290, high: 2380, low: 2275, close: 2350, volume: 78000 },
      { index: 4, time: "2024-01-15T09:00:00Z", open: 2350, high: 2420, low: 2330, close: 2400, volume: 91000 },
    ],
  },
  annotations: [], // top-level annotations ignored by this template

  // ── panels is what MultiTimeframeAnalysis actually reads ──
  panels: [
    // ── Panel 0: 1H macro view ──────────────────────────────
    // Wide price range (2100–2420) to show macro trend
    // 5 candles → reveals over frames 0–40 (5 * FRAMES_PER_CANDLE=8)
    {
      panelId: "panel_1h",
      financialData: {
        asset: { ticker: "ETH/USD", exchange: "Crypto" },
        timeframe: "1h",
        series: [
          { index: 0, time: "2024-01-15T05:00:00Z", open: 2100, high: 2180, low: 2090, close: 2160, volume: 45000 },
          { index: 1, time: "2024-01-15T06:00:00Z", open: 2160, high: 2240, low: 2140, close: 2220, volume: 52000 },
          { index: 2, time: "2024-01-15T07:00:00Z", open: 2220, high: 2310, low: 2210, close: 2290, volume: 61000 },
          { index: 3, time: "2024-01-15T08:00:00Z", open: 2290, high: 2380, low: 2275, close: 2350, volume: 78000 },
          { index: 4, time: "2024-01-15T09:00:00Z", open: 2350, high: 2420, low: 2330, close: 2400, volume: 91000 },
        ],
      },
      annotations: [
        {
          id: "macro_trendline",
          type: "trendline",
          startIndex: 0,
          endIndex: 4,
          style: { stroke: "#00FF7F", strokeWidth: 1.5, opacity: 0.6, dashed: false },
          // Starts after all 5 candles are revealed: 5 * 8 = frame 40
          animation: { startFrame: 42, duration: 40, easing: "easeOut" },
        },
      ],
    },

    // ── Panel 1: 15m intermediate view ──────────────────────
    // Tighter price range (2240–2315) — Y-scale should look different from 1H
    // 5 candles → reveals over frames 40–80
    {
      panelId: "panel_15m",
      financialData: {
        asset: { ticker: "ETH/USD", exchange: "Crypto" },
        timeframe: "15m",
        series: [
          { index: 0, time: "2024-01-15T09:00:00Z", open: 2240, high: 2268, low: 2232, close: 2258, volume: 12400 },
          { index: 1, time: "2024-01-15T09:15:00Z", open: 2258, high: 2278, low: 2248, close: 2270, volume: 9800  },
          { index: 2, time: "2024-01-15T09:30:00Z", open: 2270, high: 2290, low: 2261, close: 2285, volume: 11200 },
          { index: 3, time: "2024-01-15T09:45:00Z", open: 2285, high: 2305, low: 2278, close: 2298, volume: 14600 },
          { index: 4, time: "2024-01-15T10:00:00Z", open: 2298, high: 2315, low: 2290, close: 2310, volume: 18900 },
        ],
      },
      annotations: [
        {
          id: "resistance_15m",
          type: "horizontal_line",
          price: 2300,
          label: "Resistance",
          style: { stroke: "#FF3366", strokeWidth: 1, opacity: 0.7, dashed: true },
          // Starts after panel 1 candles reveal: 40 + 5*8 = frame 80
          animation: { startFrame: 82, duration: 30, easing: "linear" },
        },
      ],
    },

    // ── Panel 2: 5m entry view ───────────────────────────────
    // Very tight price range (2280–2315) — zoom into the breakout area
    // 5 candles → reveals over frames 80–120
    {
      panelId: "panel_5m",
      financialData: {
        asset: { ticker: "ETH/USD", exchange: "Crypto" },
        timeframe: "5m",
        series: [
          { index: 0, time: "2024-01-15T09:55:00Z", open: 2280, high: 2292, low: 2276, close: 2288, volume: 3200 },
          { index: 1, time: "2024-01-15T10:00:00Z", open: 2288, high: 2298, low: 2284, close: 2294, volume: 4100 },
          { index: 2, time: "2024-01-15T10:05:00Z", open: 2294, high: 2305, low: 2290, close: 2302, volume: 5600 },
          { index: 3, time: "2024-01-15T10:10:00Z", open: 2302, high: 2312, low: 2298, close: 2308, volume: 7200 },
          { index: 4, time: "2024-01-15T10:15:00Z", open: 2308, high: 2315, low: 2304, close: 2312, volume: 9100 },
        ],
      },
      annotations: [
        {
          id: "entry_callout_5m",
          type: "callout",
          targetIndex: 4,
          text: "Entry",
          style: { color: "#00FF7F", fontSize: 40 },
          // Starts after panel 2 candles reveal: 80 + 5*8 = frame 120
          animation: { startFrame: 122, duration: 25, easing: "spring" },
        },
      ],
    },
  ],
};
