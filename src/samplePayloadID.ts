// ============================================================
// samplePayloadID.ts
// Test payload for IndicatorDivergence template.
//
// HOW TO USE IN Root.tsx:
//
//   import { samplePayloadID } from "./samplePayloadID";
//
//   <Composition
//     id="FintechEducationalShort"
//     component={RootRouter}
//     calculateMetadata={calculateMetadata as CalculateMetadataFunction<RootRouterProps>}
//     defaultProps={{ payload: samplePayloadID }}
//     durationInFrames={800}
//     fps={60}
//     width={1080}
//     height={1920}
//   />
//
// WHAT TO VERIFY IN REMOTION STUDIO:
//   Frame 0:        First candle appears in price panel
//   Frame 0–320:    40 candles reveal (40 * FRAMES_PER_CANDLE=8)
//   Frame 320–350:  RSI and MACD panels fade in (30-frame fade)
//   Frame 350+:     Both indicator panels fully visible
//
//   RSI panel:
//     - Line visible from candle 14 onward (warmup period)
//     - Red dashed line at 70 (overbought)
//     - Green dashed line at 30 (oversold)
//     - Series is designed to push RSI above 70 near the end
//       (strong uptrend in candles 28–40)
//
//   MACD panel:
//     - MACD line (blue) and signal line (orange) visible from ~candle 34
//     - Histogram bars visible — green above zero, red below
//     - Zero line visible as a neutral reference
//
// NOTE ON SERIES LENGTH:
//   RSI needs 15+ candles for any values (period=14).
//   MACD needs 34+ candles for any histogram values (slow=26 + signal=9 - 1).
//   This payload uses 40 candles — the minimum for a useful test of both.
//   In production, use 50–100 candles for meaningful patterns.
// ============================================================

import type { VideoPayload } from "./types/schema";

// ── Helper: generate a realistic price series ───────────────
// Starts at basePrice, applies small random-ish deltas each step.
// Hardcoded rather than Math.random() to keep rendering deterministic.
// Pattern: slow consolidation (0-19), strong uptrend (20-33),
// slight pullback (34-39) — this creates RSI overbought + MACD cross.

const BASE = 2200;
const series = [
  // Consolidation phase (candles 0–19)
  { index: 0,  open: 2200, high: 2218, low: 2192, close: 2208, volume: 8200  },
  { index: 1,  open: 2208, high: 2222, low: 2200, close: 2214, volume: 7800  },
  { index: 2,  open: 2214, high: 2220, low: 2205, close: 2210, volume: 6900  },
  { index: 3,  open: 2210, high: 2225, low: 2202, close: 2218, volume: 7200  },
  { index: 4,  open: 2218, high: 2230, low: 2208, close: 2212, volume: 8100  },
  { index: 5,  open: 2212, high: 2228, low: 2205, close: 2222, volume: 7600  },
  { index: 6,  open: 2222, high: 2235, low: 2215, close: 2228, volume: 8400  },
  { index: 7,  open: 2228, high: 2238, low: 2218, close: 2224, volume: 7100  },
  { index: 8,  open: 2224, high: 2240, low: 2216, close: 2232, volume: 8800  },
  { index: 9,  open: 2232, high: 2245, low: 2224, close: 2238, volume: 9200  },
  { index: 10, open: 2238, high: 2250, low: 2228, close: 2242, volume: 8600  },
  { index: 11, open: 2242, high: 2255, low: 2234, close: 2248, volume: 9400  },
  { index: 12, open: 2248, high: 2260, low: 2238, close: 2244, volume: 8200  },
  { index: 13, open: 2244, high: 2258, low: 2236, close: 2252, volume: 9800  },
  { index: 14, open: 2252, high: 2265, low: 2244, close: 2258, volume: 10200 },
  { index: 15, open: 2258, high: 2272, low: 2250, close: 2265, volume: 10800 },
  { index: 16, open: 2265, high: 2278, low: 2256, close: 2260, volume: 9600  },
  { index: 17, open: 2260, high: 2275, low: 2252, close: 2268, volume: 10400 },
  { index: 18, open: 2268, high: 2282, low: 2260, close: 2275, volume: 11200 },
  { index: 19, open: 2275, high: 2288, low: 2266, close: 2280, volume: 11800 },
  // Strong uptrend (candles 20–33) — pushes RSI above 70
  { index: 20, open: 2280, high: 2300, low: 2275, close: 2295, volume: 15200 },
  { index: 21, open: 2295, high: 2318, low: 2290, close: 2312, volume: 17400 },
  { index: 22, open: 2312, high: 2335, low: 2308, close: 2330, volume: 19800 },
  { index: 23, open: 2330, high: 2352, low: 2325, close: 2346, volume: 21200 },
  { index: 24, open: 2346, high: 2368, low: 2340, close: 2362, volume: 22600 },
  { index: 25, open: 2362, high: 2385, low: 2356, close: 2378, volume: 24100 },
  { index: 26, open: 2378, high: 2402, low: 2372, close: 2396, volume: 25800 },
  { index: 27, open: 2396, high: 2418, low: 2388, close: 2410, volume: 26400 },
  { index: 28, open: 2410, high: 2435, low: 2404, close: 2428, volume: 28200 },
  { index: 29, open: 2428, high: 2450, low: 2420, close: 2444, volume: 29600 },
  { index: 30, open: 2444, high: 2468, low: 2436, close: 2460, volume: 31000 },
  { index: 31, open: 2460, high: 2485, low: 2452, close: 2478, volume: 32400 },
  { index: 32, open: 2478, high: 2502, low: 2470, close: 2495, volume: 33800 },
  { index: 33, open: 2495, high: 2518, low: 2488, close: 2510, volume: 35200 },
  // Pullback (candles 34–39) — RSI starts declining from overbought
  { index: 34, open: 2510, high: 2520, low: 2488, close: 2492, volume: 28600 },
  { index: 35, open: 2492, high: 2505, low: 2475, close: 2480, volume: 24200 },
  { index: 36, open: 2480, high: 2492, low: 2462, close: 2468, volume: 21800 },
  { index: 37, open: 2468, high: 2480, low: 2450, close: 2458, volume: 19400 },
  { index: 38, open: 2458, high: 2470, low: 2440, close: 2448, volume: 17200 },
  { index: 39, open: 2448, high: 2462, low: 2432, close: 2440, volume: 15800 },
].map((c) => ({ ...c, time: `2024-01-15T${String(Math.floor(c.index / 4) + 9).padStart(2, "0")}:${String((c.index % 4) * 15).padStart(2, "0")}:00Z` }));

export const samplePayloadID: VideoPayload = {
  specVersion: "1.2.0",
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
    templateId: "indicator_divergence",
    chapterMarkers: [
      { frame: 0,   label: "Price Action" },
      { frame: 320, label: "Indicator Reveal" },
    ],
    // Test both indicators. Change to ["rsi"] or ["macd"] to test individually.
    // Remove the field entirely to test price-only fallback mode.
    indicators: ["rsi", "macd"],
  },
  financialData: {
    asset: { ticker: "ETH/USD", exchange: "Crypto" },
    timeframe: "15m",
    series,
  },
  annotations: [
    {
      id: "overbought_callout",
      type: "callout",
      targetIndex: 33,
      text: "Overbought",
      style: { color: "#FF3366", fontSize: 40 },
      // Appears just as candles finish: 40 * 8 = 320
      animation: { startFrame: 322, duration: 25, easing: "spring" },
    },
    {
      id: "pullback_zone",
      type: "zone",
      startIndex: 33,
      endIndex: 39,
      priceLow: 2430,
      priceHigh: 2520,
      style: { fill: "#FF3366", opacity: 0.08 },
      animation: { startFrame: 320, duration: 30, easing: "easeOut" },
    },
  ],
};
