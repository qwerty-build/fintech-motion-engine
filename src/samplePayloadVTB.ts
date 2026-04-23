import type { VideoPayload } from "./types/schema";

const BASE = 2200;

// Shorter 30-candle series to keep the video fast-paced
// Consolidation + breakout structure
const series = [
  { index: 0, open: 2200, high: 2218, low: 2192, close: 2208, volume: 8200 },
  { index: 1, open: 2208, high: 2222, low: 2200, close: 2214, volume: 7800 },
  { index: 2, open: 2214, high: 2220, low: 2205, close: 2210, volume: 6900 },
  { index: 3, open: 2210, high: 2225, low: 2202, close: 2218, volume: 7200 },
  { index: 4, open: 2218, high: 2230, low: 2208, close: 2212, volume: 8100 },
  { index: 5, open: 2212, high: 2228, low: 2205, close: 2222, volume: 7600 },
  { index: 6, open: 2222, high: 2235, low: 2215, close: 2228, volume: 8400 },
  { index: 7, open: 2228, high: 2238, low: 2218, close: 2224, volume: 7100 },
  { index: 8, open: 2224, high: 2240, low: 2216, close: 2232, volume: 8800 },
  { index: 9, open: 2232, high: 2245, low: 2224, close: 2238, volume: 9200 },
  { index: 10, open: 2238, high: 2250, low: 2228, close: 2242, volume: 8600 },
  { index: 11, open: 2242, high: 2255, low: 2234, close: 2248, volume: 9400 },
  { index: 12, open: 2248, high: 2260, low: 2238, close: 2244, volume: 8200 },
  { index: 13, open: 2244, high: 2258, low: 2236, close: 2252, volume: 9800 },
  { index: 14, open: 2252, high: 2265, low: 2244, close: 2258, volume: 10200 },
  { index: 15, open: 2258, high: 2272, low: 2250, close: 2265, volume: 10800 },
  { index: 16, open: 2265, high: 2278, low: 2256, close: 2260, volume: 9600 },
  { index: 17, open: 2260, high: 2275, low: 2252, close: 2268, volume: 10400 },
  { index: 18, open: 2268, high: 2282, low: 2260, close: 2275, volume: 11200 },
  { index: 19, open: 2275, high: 2288, low: 2266, close: 2280, volume: 11800 },
  // Acceleration toward breakout
  { index: 20, open: 2280, high: 2300, low: 2275, close: 2295, volume: 15200 },
  { index: 21, open: 2295, high: 2318, low: 2290, close: 2312, volume: 17400 },
  // CLIMAX FRAME: Breakout candle with huge volume
  { index: 22, open: 2312, high: 2385, low: 2308, close: 2380, volume: 45000 },
  // Continuation
  { index: 23, open: 2380, high: 2415, low: 2365, close: 2405, volume: 21200 },
  { index: 24, open: 2405, high: 2420, low: 2390, close: 2415, volume: 18600 },
  { index: 25, open: 2415, high: 2435, low: 2408, close: 2428, volume: 16100 },
  { index: 26, open: 2428, high: 2450, low: 2422, close: 2445, volume: 14800 },
  { index: 27, open: 2445, high: 2460, low: 2435, close: 2452, volume: 13400 },
  { index: 28, open: 2452, high: 2465, low: 2448, close: 2460, volume: 12200 },
  { index: 29, open: 2460, high: 2480, low: 2455, close: 2475, volume: 11600 },
].map((c) => ({
  ...c,
  time: `2024-01-15T${String(Math.floor(c.index / 4) + 9).padStart(2, "0")}:${String((c.index % 4) * 15).padStart(2, "0")}:00Z`,
}));

export const samplePayloadVTB: VideoPayload = {
  specVersion: "1.3.0",
  config: {
    compositionId: "ViralTradeBreakdown",
    durationInFrames: 600,
    fps: 60,
    dimensions: { width: 1080, height: 1920 },
    theme: {
      background: "#0A0D12",
      bullishColor: "#00FF7F",
      bearishColor: "#FF3366",
      neutralColor: "#888888",
      fontFamily: "Inter, sans-serif",
    },
  },
  routing: {
    templateId: "viral_trade_breakdown",
    chapterMarkers: [],
    chapters: [
      { id: "hook", label: "Result", startFrame: 0, endFrame: 90 },
      { id: "setup", label: "Setup", startFrame: 91, endFrame: 230 },
      { id: "climax", label: "Breakout", startFrame: 231, endFrame: 390 },
      { id: "payoff", label: "The Play", startFrame: 391, endFrame: 510 },
      { id: "loop", label: "Loop", startFrame: 511, endFrame: 600 },
    ],
    tradeResult: {
      entryPrice: 2320,
      exitPrice: 2475,
      pnlPercent: 6.68,
      riskReward: "1:3.2",
    },
  },
  financialData: {
    asset: { ticker: "ETH/USD", exchange: "Crypto" },
    timeframe: "15m",
    series,
  },
  annotations: [
    {
      id: "resistance",
      type: "horizontal_line",
      price: 2318,
      label: "Key Resistance",
      style: {
        stroke: "#FF3366",
        strokeWidth: 2,
        opacity: 0.8,
        dashed: true,
      },
      animation: { startFrame: 120, duration: 40, easing: "spring" },
    },
    {
      id: "consolidation_zone",
      type: "zone",
      startIndex: 10,
      endIndex: 21,
      priceLow: 2240,
      priceHigh: 2318,
      style: { fill: "#FFFFFF", opacity: 0.05 },
      animation: { startFrame: 150, duration: 40, easing: "easeOut" },
    },
  ],
};
