import type { VideoPayload } from "./types/schema";

// ─────────────────────────────────────────────────────────────
// DATA CRAFTING: THE BULL FLAG
// ─────────────────────────────────────────────────────────────
// 1. Base (Indices 0-8): Consolidation before the move.
// 2. The Pole (Indices 9-13): Aggressive buying, massive volume spikes.
// 3. The Flag (Indices 14-27): Orderly downward drift, volume dries up completely.
// 4. The Breakout (Index 28): The trigger. Volume explodes, price pushes through resistance.
// 5. Continuation (Indices 29-34): Follow-through to the profit target.

const series = [
  // Base Building (0-8)
  { index: 0, open: 850.0, high: 852.5, low: 848.0, close: 851.0, volume: 12000 },
  { index: 1, open: 851.0, high: 853.0, low: 849.5, close: 850.5, volume: 11500 },
  { index: 2, open: 850.5, high: 851.5, low: 847.0, close: 848.5, volume: 13000 },
  { index: 3, open: 848.5, high: 852.0, low: 848.0, close: 851.5, volume: 10500 },
  { index: 4, open: 851.5, high: 854.0, low: 850.5, close: 852.0, volume: 14000 },
  { index: 5, open: 852.0, high: 853.5, low: 849.5, close: 850.0, volume: 9000 },
  { index: 6, open: 850.0, high: 851.0, low: 847.5, close: 849.0, volume: 9500 },
  { index: 7, open: 849.0, high: 854.5, low: 848.5, close: 853.5, volume: 16000 },
  { index: 8, open: 853.5, high: 856.0, low: 852.0, close: 855.0, volume: 18500 },

  // The Pole (9-13) - Explosive move, volume ramping up
  { index: 9, open: 855.0, high: 862.0, low: 854.5, close: 861.5, volume: 35000 },
  { index: 10, open: 861.5, high: 870.5, low: 860.0, close: 869.0, volume: 48000 },
  { index: 11, open: 869.0, high: 882.0, low: 868.5, close: 880.5, volume: 65000 },
  { index: 12, open: 880.5, high: 890.0, low: 878.0, close: 888.0, volume: 72000 },
  { index: 13, open: 888.0, high: 895.0, low: 885.5, close: 892.0, volume: 55000 },

  // The Flag (14-26) - Orderly pullback, descending channel, volume dying
  { index: 14, open: 892.0, high: 896.0, low: 887.0, close: 888.5, volume: 32000 },
  { index: 15, open: 888.5, high: 890.5, low: 884.0, close: 885.5, volume: 28000 },
  { index: 16, open: 885.5, high: 892.0, low: 882.5, close: 883.0, volume: 25000 }, // Long upper wick (bulls rejected)
  { index: 17, open: 883.0, high: 886.5, low: 880.0, close: 885.0, volume: 22000 },
  { index: 18, open: 885.0, high: 886.0, low: 878.5, close: 880.5, volume: 19000 },
  { index: 19, open: 880.5, high: 882.5, low: 876.0, close: 877.5, volume: 17000 },
  { index: 20, open: 877.5, high: 880.0, low: 875.0, close: 879.0, volume: 15000 },
  { index: 21, open: 879.0, high: 884.0, low: 872.5, close: 874.0, volume: 14000 }, // Bull trap (wick up, close low)
  { index: 22, open: 874.0, high: 877.0, low: 873.0, close: 876.5, volume: 12500 },
  { index: 23, open: 876.5, high: 878.5, low: 874.0, close: 875.0, volume: 11000 },
  { index: 24, open: 875.0, high: 876.0, low: 870.5, close: 871.5, volume: 10000 },
  { index: 25, open: 871.5, high: 874.5, low: 869.0, close: 873.0, volume: 9500 },
  { index: 26, open: 873.0, high: 873.5, low: 868.5, close: 869.5, volume: 8000 },

  // The "Shakeout" (27) - Drops BELOW the flag support to hunt stop losses, then rips wildly back up
  // This is the "Spring" in Wyckoff theory. It traps late bears and fuels the breakout.
  { index: 27, open: 869.5, high: 872.0, low: 858.0, close: 871.0, volume: 24000 }, 

  // The Breakout (28) - The trigger. Volume explodes. Bears who shorted the shakeout are squeezed.
  { index: 28, open: 871.0, high: 888.0, low: 870.0, close: 886.5, volume: 95000 },

  // Continuation (29-32) - Hitting targets rapidly due to short squeeze
  { index: 29, open: 886.5, high: 898.0, low: 884.0, close: 896.0, volume: 72000 },
  { index: 30, open: 896.0, high: 906.5, low: 892.5, close: 904.0, volume: 65000 },
  { index: 31, open: 904.0, high: 912.0, low: 900.0, close: 908.5, volume: 59000 },
  { index: 32, open: 908.5, high: 918.0, low: 905.0, close: 915.0, volume: 78000 }, // Target hit perfectly
].map((c) => ({
  ...c,
  // Assign fake time data (5m intervals starting at 09:30 AM)
  time: `2024-05-15T${String(Math.floor(c.index * 5 / 60) + 9).padStart(2, "0")}:${String((c.index * 5 % 60) + 30 > 59 ? (c.index * 5 % 60) + 30 - 60 : (c.index * 5 % 60) + 30).padStart(2, "0")}:00Z`,
}));

export const payloadBullFlagProduction: VideoPayload = {
  specVersion: "1.3.0",
  config: {
    compositionId: "ViralTradeBreakdown",
    durationInFrames: 600, // Driven dynamically by calculateMetadata
    fps: 60,
    dimensions: { width: 1080, height: 1920 },
    theme: {
      background: "#080B10", // Deep sophisticated dark mode
      bullishColor: "#00FF88", // Vibrant neon green
      bearishColor: "#FF2A5F", // Punchy neon red/pink
      neutralColor: "#8D99AE", // Clean steel blue/grey for text and lines
      fontFamily: "Inter, sans-serif",
    },
  },
  routing: {
    templateId: "viral_trade_breakdown",
    chapterMarkers: [],
    // Custom timing to perfectly align with the dramatic 5-chapter template
    chapters: [
      { id: "hook", label: "Result First", startFrame: 0, endFrame: 80 }, // Show P/L
      { id: "setup", label: "Identify Trend", startFrame: 81, endFrame: 220 }, // Reveal Pole + Flag slowly
      { id: "climax", label: "The Breakout", startFrame: 221, endFrame: 360 }, // Flash + fast reveal of breakout
      { id: "payoff", label: "Trade Execution", startFrame: 361, endFrame: 500 }, // Drop Entry/Target lines
      { id: "loop", label: "Loop CTA", startFrame: 501, endFrame: 600 }, // "Would you take this?"
    ],
    tradeResult: {
      entryPrice: 878.0, // Buying the breakout of the upper trendline
      exitPrice: 912.0,  // Target achieved based on pole height
      pnlPercent: 3.87,  // 3.87% on underlying (translates to huge options gains)
      riskReward: "1:3.4",
    },
  },
  financialData: {
    asset: { ticker: "NVDA", exchange: "NASDAQ" },
    timeframe: "5m",
    series,
  },
  annotations: [
    // 1. Pole Callout (Just to emphasize momentum)
    {
      id: "pole_callout",
      type: "callout",
      targetIndex: 11,
      text: "Massive Volume Surge",
      style: { color: "#00FF88", fontSize: 32 },
      animation: { startFrame: 140, duration: 40, easing: "spring" },
    },
    // 2. Upper Flag Resistance Trendline
    {
      id: "flag_upper",
      type: "trendline",
      startIndex: 13, // High: 895
      endIndex: 26,   // High: 873.5
      style: { stroke: "#FF2A5F", strokeWidth: 4, opacity: 0.9, dashed: false },
      animation: { startFrame: 180, duration: 45, easing: "easeOut" },
    },
    // 3. Lower Flag Support Trendline
    {
      id: "flag_lower",
      type: "trendline",
      startIndex: 14, // Low: 887
      endIndex: 26,   // Low: 868.5
      style: { stroke: "#8D99AE", strokeWidth: 3, opacity: 0.6, dashed: true },
      animation: { startFrame: 190, duration: 45, easing: "easeOut" },
    },
    // 4. The "Shakeout" Liquidity Grab Callout
    {
      id: "liquidity_grab",
      type: "callout",
      targetIndex: 27,
      text: "Stop Loss Hunt / Shakeout",
      style: { color: "#FF2A5F", fontSize: 26 },
      animation: { startFrame: 220, duration: 20, easing: "spring" }, // Right before climax
    },
    // 5. Breakout Callout
    {
      id: "breakout_callout",
      type: "callout",
      targetIndex: 28,
      text: "FLAG BREAKOUT!",
      style: { color: "#00FF88", fontSize: 44 },
      animation: { startFrame: 235, duration: 30, easing: "spring" }, // Synced with climax chapter frame start
    },
    // 6. Volume Climax Zone annotation
    {
      id: "breakout_zone",
      type: "zone",
      startIndex: 27,
      endIndex: 29,
      priceLow: 870,
      priceHigh: 888,
      style: { fill: "#FFFFFF", opacity: 0.1 },
      animation: { startFrame: 232, duration: 60, easing: "linear" },
    }
  ],
};
