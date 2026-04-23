// ============================================================
// Candlestick.tsx
// Renders a single OHLCV candle as two SVG primitives:
//   1. A <line> for the wick  (high → low)
//   2. A <rect> for the body  (open → close)
//
// This component has ZERO awareness of scales or dimensions.
// It queries ChartProvider via useChartScales() and lets the
// context handle all coordinate math.
// ============================================================

import React from "react";
import { useChartScales } from "./ChartProvider";
import type { OHLCVCandle } from "../types/schema";

interface CandlestickProps {
  dataPoint: OHLCVCandle;
  bullishColor: string;
  bearishColor: string;
  // opacity is driven by Phase 3 animation — defaults to 1 here
  opacity?: number;
}

export const Candlestick: React.FC<CandlestickProps> = ({
  dataPoint,
  bullishColor,
  bearishColor,
  opacity = 1,
}) => {
  const { xScale, yScale, candleWidth } = useChartScales();

  // Pixel coordinates for this candle
  const x      = xScale(dataPoint.index);
  const highY  = yScale(dataPoint.high);
  const lowY   = yScale(dataPoint.low);
  const openY  = yScale(dataPoint.open);
  const closeY = yScale(dataPoint.close);

  // Directionality determines color
  const isBullish = dataPoint.close >= dataPoint.open;
  const color = isBullish ? bullishColor : bearishColor;

  // Body dimensions
  // Math.abs handles bullish (close > open) and bearish (open > close).
  // Math.max(..., 1) ensures Doji candles (open === close) still render
  // as a 1px horizontal line rather than disappearing entirely.
  const bodyHeight = Math.max(Math.abs(closeY - openY), 1);
  const bodyY      = isBullish ? closeY : openY;

  // Body width: 60% of the slot width, centered on x.
  const bodyWidth     = candleWidth * 0.6;
  const wickStroke    = candleWidth * 0.15; // Thin relative to body

  return (
    <g opacity={opacity}>
      {/* Wick: full high-to-low range */}
      <line
        x1={x}
        y1={highY}
        x2={x}
        y2={lowY}
        stroke={color}
        strokeWidth={Math.max(wickStroke, 1)}
        strokeLinecap="round"
      />

      {/* Body: open-to-close range */}
      <rect
        x={x - bodyWidth / 2}
        y={bodyY}
        width={bodyWidth}
        height={bodyHeight}
        fill={color}
        rx={1}
      />
    </g>
  );
};
