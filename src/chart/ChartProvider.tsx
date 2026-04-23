// ============================================================
// ChartProvider.tsx
// The mathematical heart of the rendering engine.
// Computes xScale, yScale, and volumeScale from the OHLCV
// series once, memoizes them, and exposes via React Context.
//
// WHY CONTEXT? Avoids prop-drilling scales through:
//   ChartPatternBreakdown → CandlestickSeries → Candlestick
//                         → AnnotationLayer → TrendlineAnnotation
// Every child calls useChartScales() and gets the exact same
// scale functions — guaranteed coordinate alignment.
// ============================================================

import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { scaleLinear } from "d3-scale";
import { min, max } from "d3-array";
import type { OHLCVCandle } from "../types/schema";

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartScales {
  // Maps candle.index → pixel X coordinate (equidistant spacing)
  xScale: (index: number) => number;
  // Maps price value → pixel Y coordinate (inverted — SVG 0 is top)
  yScale: (price: number) => number;
  // Maps volume value → pixel Y coordinate (bottom 20% of chart)
  volumeScale: (volume: number) => number;
  // Width of one candle slot in pixels — used to size candle bodies
  candleWidth: number;
}

// ------------------------------------------------------------
// Context
// ------------------------------------------------------------

const ChartContext = createContext<ChartScales | null>(null);

// ------------------------------------------------------------
// Provider
// ------------------------------------------------------------

interface ChartProviderProps {
  series: OHLCVCandle[];
  width: number;
  height: number;
  padding: Padding;
  children: ReactNode;
}

export const ChartProvider: React.FC<ChartProviderProps> = ({
  series,
  width,
  height,
  padding,
  children,
}) => {
  const scales = useMemo<ChartScales>(() => {
    // -- X axis --
    // Use array index for equidistant candle spacing regardless
    // of gaps in the time series (weekends, halted trading etc.)
    const xScale = scaleLinear()
      .domain([0, series.length - 1])
      .range([padding.left, width - padding.right]);

    // Slot width: total drawable width divided by candle count.
    // Body will be rendered at 60% of this, leaving 40% as gap.
    const candleWidth =
      (width - padding.left - padding.right) / series.length;

    // -- Y axis --
    // Domain must span the absolute high/low of the ENTIRE series,
    // not just open/close — otherwise wicks get clipped.
    const yMin = min(series, (d) => d.low) ?? 0;
    const yMax = max(series, (d) => d.high) ?? 1;
    const yPadding = (yMax - yMin) * 0.1; // 10% breathing room

    // Range is INVERTED: high prices → small Y (top of screen),
    // low prices → large Y (bottom of screen). This is required
    // because SVG coordinate origin (0,0) is the top-left corner.
    const yScale = scaleLinear()
      .domain([yMin - yPadding, yMax + yPadding])
      .range([height - padding.bottom, padding.top]);

    // -- Volume axis --
    // Occupies the bottom 20% of the total chart height, sitting
    // just above the bottom padding. Rendered behind price candles.
    const maxVolume = max(series, (d) => d.volume) ?? 1;
    const volumeAreaHeight = height * 0.2;

    const volumeScale = scaleLinear()
      .domain([0, maxVolume])
      .range([
        height - padding.bottom,
        height - padding.bottom - volumeAreaHeight,
      ]);

    return { xScale, yScale, volumeScale, candleWidth };
  // Destructure padding so we depend on primitive values, not the
  // object reference. An inline object like { top:140, ... } is a
  // new reference every render even when values are identical,
  // which would bust the memo on every Remotion frame tick.
  }, [series, width, height,
      padding.top, padding.right, padding.bottom, padding.left]);
  // Dependency array: scales only recalculate when dimensions or
  // data change — NOT on every Remotion frame tick.

  return (
    <ChartContext.Provider value={scales}>
      {children}
    </ChartContext.Provider>
  );
};

// ------------------------------------------------------------
// Consumer hook — use this in every child component
// ------------------------------------------------------------

export const useChartScales = (): ChartScales => {
  const ctx = useContext(ChartContext);
  if (!ctx) {
    throw new Error(
      "[useChartScales] Must be used inside a <ChartProvider>."
    );
  }
  return ctx;
};
