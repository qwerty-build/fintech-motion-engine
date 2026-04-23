// ============================================================
// schema.ts
// Universal JSON contract for the Remotion fintech video pipeline.
//
// Spec changelog:
//   1.0.0 – Initial release: single-panel templates
//   1.1.0 – Added PanelData + optional VideoPayload.panels
//   1.2.0 – Added IndicatorType + Routing.indicators
// ============================================================

// ------------------------------------------------------------
// 1. CONFIG NODE
// ------------------------------------------------------------

export interface Theme {
  background: string;       // e.g. "#0B0E14"
  bullishColor: string;     // e.g. "#00FF7F"
  bearishColor: string;     // e.g. "#FF3366"
  neutralColor: string;     // e.g. "#888888"
  fontFamily: string;       // e.g. "Inter, sans-serif"
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Config {
  compositionId: string;
  durationInFrames: number;
  fps: number;
  dimensions: Dimensions;
  theme: Theme;
}

// ------------------------------------------------------------
// 2. ROUTING NODE
// ------------------------------------------------------------

export type TemplateId =
  | "chart_pattern_breakdown"
  | "multi_timeframe_analysis"
  | "indicator_divergence"
  | "viral_trade_breakdown";

export interface ChapterMarker {
  frame: number;
  label: string;
}

export interface ChapterConfig {
  id: string;
  label: string;
  startFrame: number;
  endFrame: number;
}

export interface TradeResult {
  entryPrice: number;
  exitPrice: number;
  pnlPercent: number;
  riskReward: string;
}

export type IndicatorType = "rsi" | "macd";

export interface Routing {
  templateId: TemplateId;
  chapterMarkers: ChapterMarker[];
  /**
   * Which technical indicators to render in indicator_divergence
   * template. Omit or leave empty for non-indicator templates.
   * Order determines panel stacking: first entry = top panel.
   */
  indicators?: IndicatorType[];
  /**
   * Used by viral_trade_breakdown to define chapter timing.
   */
  chapters?: ChapterConfig[];
  /**
   * Used by viral_trade_breakdown to display P/L and risk/reward.
   */
  tradeResult?: TradeResult;
}

// ------------------------------------------------------------
// 3. FINANCIAL DATA NODE
// ------------------------------------------------------------

export interface AssetMeta {
  ticker: string;
  exchange: string;
}

// Keep as a union — string would lose compile-time validation
export type Timeframe =
  | "1m" | "5m" | "15m" | "30m"
  | "1h" | "4h"
  | "1D" | "1W";

export interface OHLCVCandle {
  index: number;            // Required — used by xScale for equidistant spacing
  time: string;             // ISO 8601
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FinancialData {
  asset: AssetMeta;
  timeframe: Timeframe;
  series: OHLCVCandle[];
}

// ------------------------------------------------------------
// 4. ANNOTATIONS NODE
// ------------------------------------------------------------

export type EasingFunction =
  | "linear"
  | "easeIn"
  | "easeOut"
  | "easeInOut"
  | "spring";

export interface AnimationConfig {
  startFrame: number;
  duration: number;
  easing: EasingFunction;
}

export interface BaseAnnotation {
  id: string;
  animation: AnimationConfig;
}

export interface TrendlineAnnotation extends BaseAnnotation {
  type: "trendline";
  startIndex: number;
  endIndex: number;
  style: {
    stroke: string;
    strokeWidth: number;
    opacity: number;
    dashed?: boolean;
  };
}

export interface ZoneAnnotation extends BaseAnnotation {
  type: "zone";
  startIndex: number;
  endIndex: number;
  priceLow: number;
  priceHigh: number;
  style: {
    fill: string;
    opacity: number;
  };
}

export interface CalloutAnnotation extends BaseAnnotation {
  type: "callout";
  targetIndex: number;
  text: string;
  style: {
    color: string;
    fontSize: number;
  };
}

export interface HorizontalLineAnnotation extends BaseAnnotation {
  type: "horizontal_line";
  price: number;
  label?: string;           // Restored — HorizontalLineAnnotation.tsx reads this
  style: {
    stroke: string;
    strokeWidth: number;
    opacity: number;        // Restored — used in the component
    dashed?: boolean;
  };
}

export type Annotation =
  | TrendlineAnnotation
  | ZoneAnnotation
  | CalloutAnnotation
  | HorizontalLineAnnotation;

// ------------------------------------------------------------
// 5. MULTI-PANEL SUPPORT (spec 1.1.0)
// ------------------------------------------------------------

/**
 * A self-contained data + annotation bundle for one chart panel
 * inside a multi-panel template (e.g. multi_timeframe_analysis).
 *
 * Each panel has its own FinancialData series and the annotations
 * scoped to that panel's coordinate space.
 */
export interface PanelData {
  /**
   * Unique identifier for this panel.
   * Convention: "panel_<timeframe>", e.g. "panel_1h", "panel_15m"
   */
  panelId: string;
  financialData: FinancialData;
  annotations: Annotation[];
}

// ------------------------------------------------------------
// 6. ROOT PAYLOAD
// ------------------------------------------------------------

export interface VideoPayload {
  specVersion: string;      // "1.0.0" for single-panel, "1.1.0" for multi-panel

  config: Config;
  routing: Routing;

  /**
   * Primary financial data for single-panel templates.
   * Multi-panel templates (indicator_divergence, etc.) also use this
   * as the base series. multi_timeframe_analysis reads from `panels`.
   */
  financialData: FinancialData;

  /**
   * Top-level annotations for single-panel templates.
   * Multi-panel templates may use this for global overlays.
   */
  annotations: Annotation[];

  /**
   * Present only in multi-panel templates (e.g. multi_timeframe_analysis).
   * Single-panel templates ignore this field entirely.
   *
   * When provided, each entry is one chart panel with its own independent
   * series, D3 scale domain, and annotation set.
   */
  panels?: PanelData[];
}