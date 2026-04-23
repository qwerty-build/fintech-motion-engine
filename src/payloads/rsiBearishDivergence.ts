import { VideoPayload } from "../types/schema";

export const rsiBearishDivergence: VideoPayload = {
  specVersion: "1.2.0",
  config: {
    compositionId: "IndicatorDivergence",
    durationInFrames: 0,
    fps: 60,
    dimensions: { width: 1080, height: 1920 },
    theme: {
      background: "#0B0E14",
      bullishColor: "#00FF7F",
      bearishColor: "#FF3366",
      neutralColor: "#8D99AE",
      fontFamily: "Inter, sans-serif",
    },
  },
  routing: {
    templateId: "indicator_divergence",
    indicators: ["rsi"],
    chapterMarkers: [
      { frame: 0, label: "Higher Highs, Lower RSI Highs" },
      { frame: 200, label: "Bearish Divergence Signal" },
      { frame: 400, label: "Entry & Risk Management" },
    ],
  },
  financialData: {
    asset: { ticker: "BTC/USD", exchange: "Crypto" },
    timeframe: "4h",
    series: [
    {
        "index": 0,
        "time": "2026-05-15T00:00:00.000Z",
        "open": 40000,
        "high": 40028.02,
        "low": 39959.26,
        "close": 39984.96,
        "volume": 7461
    },
    {
        "index": 1,
        "time": "2026-05-15T04:00:00.000Z",
        "open": 39984.96,
        "high": 40027.61,
        "low": 39897.3,
        "close": 39939.63,
        "volume": 10306
    },
    {
        "index": 2,
        "time": "2026-05-15T08:00:00.000Z",
        "open": 39939.63,
        "high": 39990.13,
        "low": 39908.24,
        "close": 39963.86,
        "volume": 12031
    },
    {
        "index": 3,
        "time": "2026-05-15T12:00:00.000Z",
        "open": 39963.86,
        "high": 39986.31,
        "low": 39876.68,
        "close": 39926.03,
        "volume": 10526
    },
    {
        "index": 4,
        "time": "2026-05-15T16:00:00.000Z",
        "open": 39926.03,
        "high": 40005.1,
        "low": 39890.96,
        "close": 39969.65,
        "volume": 13991
    },
    {
        "index": 5,
        "time": "2026-05-15T20:00:00.000Z",
        "open": 39969.65,
        "high": 40049.66,
        "low": 39957.26,
        "close": 39996.76,
        "volume": 14711
    },
    {
        "index": 6,
        "time": "2026-05-16T00:00:00.000Z",
        "open": 39996.76,
        "high": 40031.25,
        "low": 39933.06,
        "close": 39949.9,
        "volume": 11348
    },
    {
        "index": 7,
        "time": "2026-05-16T04:00:00.000Z",
        "open": 39949.9,
        "high": 39972.52,
        "low": 39898.54,
        "close": 39952.74,
        "volume": 7627
    },
    {
        "index": 8,
        "time": "2026-05-16T08:00:00.000Z",
        "open": 39952.74,
        "high": 40025.99,
        "low": 39930.41,
        "close": 39978.62,
        "volume": 13219
    },
    {
        "index": 9,
        "time": "2026-05-16T12:00:00.000Z",
        "open": 39978.62,
        "high": 40003.54,
        "low": 39951.15,
        "close": 39965.41,
        "volume": 5301
    },
    {
        "index": 10,
        "time": "2026-05-16T16:00:00.000Z",
        "open": 39965.41,
        "high": 40045.42,
        "low": 39931.71,
        "close": 39996.16,
        "volume": 7647
    },
    {
        "index": 11,
        "time": "2026-05-16T20:00:00.000Z",
        "open": 39996.16,
        "high": 40608.98,
        "low": 39960.28,
        "close": 40558.27,
        "volume": 8150
    },
    {
        "index": 12,
        "time": "2026-05-17T00:00:00.000Z",
        "open": 40558.27,
        "high": 41172.6,
        "low": 40510.96,
        "close": 41131.22,
        "volume": 6865
    },
    {
        "index": 13,
        "time": "2026-05-17T04:00:00.000Z",
        "open": 41131.22,
        "high": 41684.22,
        "low": 41078.32,
        "close": 41636.94,
        "volume": 9173
    },
    {
        "index": 14,
        "time": "2026-05-17T08:00:00.000Z",
        "open": 41636.94,
        "high": 42253.81,
        "low": 41606.03,
        "close": 42201.3,
        "volume": 10785
    },
    {
        "index": 15,
        "time": "2026-05-17T12:00:00.000Z",
        "open": 42201.3,
        "high": 42725.28,
        "low": 42156.66,
        "close": 42699.63,
        "volume": 6291
    },
    {
        "index": 16,
        "time": "2026-05-17T16:00:00.000Z",
        "open": 42699.63,
        "high": 43257.17,
        "low": 42640.62,
        "close": 43213.2,
        "volume": 8896
    },
    {
        "index": 17,
        "time": "2026-05-17T20:00:00.000Z",
        "open": 43213.2,
        "high": 43789.47,
        "low": 43195.11,
        "close": 43773.2,
        "volume": 12611
    },
    {
        "index": 18,
        "time": "2026-05-18T00:00:00.000Z",
        "open": 43773.2,
        "high": 44370.67,
        "low": 43753.11,
        "close": 44312.07,
        "volume": 6007
    },
    {
        "index": 19,
        "time": "2026-05-18T04:00:00.000Z",
        "open": 44312.07,
        "high": 44327.44,
        "low": 43999.09,
        "close": 44044.17,
        "volume": 7159
    },
    {
        "index": 20,
        "time": "2026-05-18T08:00:00.000Z",
        "open": 44044.17,
        "high": 44070.21,
        "low": 43731.62,
        "close": 43763.53,
        "volume": 14216
    },
    {
        "index": 21,
        "time": "2026-05-18T12:00:00.000Z",
        "open": 43763.53,
        "high": 43821.34,
        "low": 43412.79,
        "close": 43464.99,
        "volume": 5176
    },
    {
        "index": 22,
        "time": "2026-05-18T16:00:00.000Z",
        "open": 43464.99,
        "high": 43480.05,
        "low": 43196.85,
        "close": 43213.94,
        "volume": 13638
    },
    {
        "index": 23,
        "time": "2026-05-18T20:00:00.000Z",
        "open": 43213.94,
        "high": 43246.41,
        "low": 42926.18,
        "close": 42962.36,
        "volume": 10721
    },
    {
        "index": 24,
        "time": "2026-05-19T00:00:00.000Z",
        "open": 42962.36,
        "high": 42990.85,
        "low": 42659.31,
        "close": 42697.34,
        "volume": 6335
    },
    {
        "index": 25,
        "time": "2026-05-19T04:00:00.000Z",
        "open": 42697.34,
        "high": 42709.25,
        "low": 42425.53,
        "close": 42437.57,
        "volume": 13356
    },
    {
        "index": 26,
        "time": "2026-05-19T08:00:00.000Z",
        "open": 42437.57,
        "high": 42719.56,
        "low": 42422.59,
        "close": 42672.19,
        "volume": 5426
    },
    {
        "index": 27,
        "time": "2026-05-19T12:00:00.000Z",
        "open": 42672.19,
        "high": 42927.77,
        "low": 42637.74,
        "close": 42908.36,
        "volume": 9128
    },
    {
        "index": 28,
        "time": "2026-05-19T16:00:00.000Z",
        "open": 42908.36,
        "high": 43172.95,
        "low": 42885.66,
        "close": 43135.71,
        "volume": 12489
    },
    {
        "index": 29,
        "time": "2026-05-19T20:00:00.000Z",
        "open": 43135.71,
        "high": 43406.1,
        "low": 43120,
        "close": 43372.91,
        "volume": 8608
    },
    {
        "index": 30,
        "time": "2026-05-20T00:00:00.000Z",
        "open": 43372.91,
        "high": 43652.25,
        "low": 43344.62,
        "close": 43598.29,
        "volume": 6576
    },
    {
        "index": 31,
        "time": "2026-05-20T04:00:00.000Z",
        "open": 43598.29,
        "high": 43891.06,
        "low": 43582.95,
        "close": 43831.97,
        "volume": 9652
    },
    {
        "index": 32,
        "time": "2026-05-20T08:00:00.000Z",
        "open": 43831.97,
        "high": 44085.1,
        "low": 43800.16,
        "close": 44055.75,
        "volume": 9553
    },
    {
        "index": 33,
        "time": "2026-05-20T12:00:00.000Z",
        "open": 44055.75,
        "high": 44312.64,
        "low": 44004.05,
        "close": 44287.25,
        "volume": 6184
    },
    {
        "index": 34,
        "time": "2026-05-20T16:00:00.000Z",
        "open": 44287.25,
        "high": 44556.65,
        "low": 44269.41,
        "close": 44509.55,
        "volume": 9141
    },
    {
        "index": 35,
        "time": "2026-05-20T20:00:00.000Z",
        "open": 44509.55,
        "high": 44762.98,
        "low": 44477.73,
        "close": 44740.99,
        "volume": 6663
    },
    {
        "index": 36,
        "time": "2026-05-21T00:00:00.000Z",
        "open": 44740.99,
        "high": 44800.49,
        "low": 44393.69,
        "close": 44440.99,
        "volume": 11750
    },
    {
        "index": 37,
        "time": "2026-05-21T04:00:00.000Z",
        "open": 44440.99,
        "high": 44476.37,
        "low": 44107.72,
        "close": 44140.99,
        "volume": 5389
    },
    {
        "index": 38,
        "time": "2026-05-21T08:00:00.000Z",
        "open": 44140.99,
        "high": 44160.79,
        "low": 43807.86,
        "close": 43840.99,
        "volume": 9122
    },
    {
        "index": 39,
        "time": "2026-05-21T12:00:00.000Z",
        "open": 43840.99,
        "high": 43872.32,
        "low": 43484.65,
        "close": 43540.99,
        "volume": 11050
    }
]
  },
  annotations: [
    {
      id: "hh1",
      type: "horizontal_line",
      price: 43800,
      style: { stroke: "#FFFFFF", opacity: 0.3, strokeWidth: 2 },
      animation: { startFrame: 80, duration: 20, easing: "linear" },
    },
    {
      id: "hh2",
      type: "horizontal_line",
      price: 44200,
      style: { stroke: "#FFFFFF", opacity: 0.3, strokeWidth: 2 },
      animation: { startFrame: 200, duration: 20, easing: "linear" },
    },
    {
      id: "diverg_label",
      type: "callout",
      targetIndex: 35,
      text: "Bearish Divergence",
      style: { color: "#FF3366", fontSize: 48 },
      animation: { startFrame: 280, duration: 30, easing: "spring" },
    },
  ],
};
