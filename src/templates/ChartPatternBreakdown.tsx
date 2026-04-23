// ============================================================
// templates/ChartPatternBreakdown.tsx
// PHASE 2 — Full chart rendering with D3 scales.
// Renders all OHLCV candles + volume bars using the
// ChartProvider context. Annotations wired in Phase 3.
//
// Polish applied per TEMPLATES.md §1 visual polish:
//   ✓ Consistent price label formatter (no locale variance)
//   ✓ Dynamic ticker font size based on ticker string length
//   ✓ Volume panel separator line
//   ✓ Current price indicator (right-side last-close label)
// ============================================================

import React, { useMemo } from "react";
import { DataProcessor } from "../chart/DataProcessor";
import { useChartScales } from "../chart/ChartProvider";
import { Candlestick } from "../chart/Candlestick";
import { VolumeBar } from "../chart/VolumeBar";
import { useAnimatedCandles } from "../animation/useAnimatedCandles";
import { AnnotationLayer } from "../annotations/AnnotationLayer";
import type { TemplateProps } from "../TemplateRegistry";
import type { Padding } from "../chart/ChartProvider";

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

/**
 * Consistent price formatter — avoids locale-dependent output from
 * toLocaleString(). Adds commas for values ≥ 1000, always shows
 * exactly 2 decimal places.
 */
const formatPrice = (price: number): string => {
  const fixed = price.toFixed(2);
  const [intPart, decPart] = fixed.split(".");
  // Add commas only for the integer portion above 1000
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${withCommas}.${decPart}`;
};

/**
 * Compute ticker font size dynamically based on string length.
 * Short tickers (≤ 4 chars, e.g. "AAPL") get the full 36px,
 * longer tickers (e.g. "BTC/USDT") scale down proportionally
 * with a floor of 22px so they stay legible.
 */
const getTickerFontSize = (ticker: string): number => {
  if (ticker.length <= 4) return 36;
  if (ticker.length <= 6) return 30;
  if (ticker.length <= 8) return 26;
  return 22;
};

// ------------------------------------------------------------
// Inner chart — consumes context, must be inside DataProcessor
// ------------------------------------------------------------

const ChartInner: React.FC<TemplateProps & { padding: Padding }> = ({ data, padding }) => {
  const { width, height } = data.config.dimensions;
  const { theme } = data.config;
  const { series } = data.financialData;
  const { xScale, yScale } = useChartScales();

  // Gridline x boundaries derived from scale range endpoints
  const gridX1 = xScale(0) - 10;
  const gridX2 = xScale(series.length - 1) + 10;

  // Axis labels: ~5 evenly spaced price levels on Y axis
  const priceLabels = useMemo(() => {
    const prices = series.flatMap((d) => [d.high, d.low]);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const step = (maxP - minP) / 4;
    return Array.from({ length: 5 }, (_, i) =>
      parseFloat((minP + step * i).toFixed(2))
    );
  }, [series]);

  // Phase 3a: animated candle reveal
  // visibleCandles grows frame-by-frame; getOpacity handles fade-in
  const { visibleCandles, getOpacity } = useAnimatedCandles(series);

  // Last close price for the current-price indicator
  const lastClose = series.length > 0 ? series[series.length - 1].close : null;

  // Dynamic ticker font size
  const tickerFontSize = getTickerFontSize(data.financialData.asset.ticker);

  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      {/* Volume–price separator line */}
      <line
        x1={gridX1}
        y1={height - padding.bottom}
        x2={gridX2}
        y2={height - padding.bottom}
        stroke="#FFFFFF"
        strokeWidth={0.5}
        strokeOpacity={0.12}
      />

      {/* Volume bars — same subset as visible candles */}
      {visibleCandles.map((candle) => (
        <VolumeBar
          key={`vol-${candle.index}`}
          dataPoint={candle}
          bullishColor={theme.bullishColor}
          bearishColor={theme.bearishColor}
          opacity={getOpacity(candle.index) * 0.4}
        />
      ))}

      {/* Price candles — opacity driven by animation hook */}
      {visibleCandles.map((candle) => (
        <Candlestick
          key={`candle-${candle.index}`}
          dataPoint={candle}
          bullishColor={theme.bullishColor}
          bearishColor={theme.bearishColor}
          opacity={getOpacity(candle.index)}
        />
      ))}

      {/* Annotation layer — zones, h-lines, trendlines, callouts */}
      <AnnotationLayer
        annotations={data.annotations}
        series={series}
        chartWidth={width}
        chartPaddingLeft={padding.left}
        fontFamily={theme.fontFamily}
      />

      {/* Y-axis price labels + dashed gridlines */}
      {priceLabels.map((price) => (
        <g key={`label-${price}`}>
          <line
            x1={gridX1}
            y1={yScale(price)}
            x2={gridX2}
            y2={yScale(price)}
            stroke="#FFFFFF"
            strokeWidth={0.5}
            strokeOpacity={0.08}
            strokeDasharray="4 6"
          />
          <text
            x={52}
            y={yScale(price)}
            fill="#666"
            fontSize={22}
            textAnchor="end"
            dominantBaseline="middle"
            fontFamily={theme.fontFamily}
          >
            {formatPrice(price)}
          </text>
        </g>
      ))}

      {/* Current price indicator — right-side last-close label */}
      {lastClose !== null && (
        <g>
          {/* Small background pill behind the price text */}
          <rect
            x={width - padding.right + 4}
            y={yScale(lastClose) - 14}
            width={70}
            height={28}
            rx={4}
            fill={
              series[series.length - 1].close >= series[series.length - 1].open
                ? theme.bullishColor
                : theme.bearishColor
            }
            opacity={0.85}
          />
          <text
            x={width - padding.right + 8}
            y={yScale(lastClose)}
            fill="#FFFFFF"
            fontSize={16}
            fontWeight="600"
            textAnchor="start"
            dominantBaseline="middle"
            fontFamily={theme.fontFamily}
          >
            {formatPrice(lastClose)}
          </text>
          {/* Dashed line connecting last candle to the price label */}
          <line
            x1={xScale(series.length - 1) + 10}
            y1={yScale(lastClose)}
            x2={width - padding.right + 4}
            y2={yScale(lastClose)}
            stroke={
              series[series.length - 1].close >= series[series.length - 1].open
                ? theme.bullishColor
                : theme.bearishColor
            }
            strokeWidth={0.8}
            strokeOpacity={0.5}
            strokeDasharray="3 4"
          />
        </g>
      )}

      {/* Asset label — top left (dynamic font size) */}
      <text
        x={70}
        y={60}
        fill="#FFFFFF"
        fontSize={tickerFontSize}
        fontWeight="600"
        fontFamily={theme.fontFamily}
        opacity={0.9}
      >
        {data.financialData.asset.ticker}
      </text>
      <text
        x={70}
        y={100}
        fill="#666"
        fontSize={26}
        fontFamily={theme.fontFamily}
      >
        {data.financialData.timeframe} · {data.financialData.asset.exchange}
      </text>
    </svg>
  );
};

// ------------------------------------------------------------
// Template root — sets up layout and DataProcessor wrapper
// ------------------------------------------------------------

const ChartPatternBreakdown: React.FC<TemplateProps> = ({ data }) => {
  const { theme } = data.config;
  const { width, height } = data.config.dimensions;

  const padding: Padding = useMemo(
    () => ({ top: 140, right: 30, bottom: 180, left: 70 }),
    []
  );

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: theme.background,
        position: "relative",
        overflow: "hidden",
        fontFamily: theme.fontFamily,
      }}
    >
      <DataProcessor
        series={data.financialData.series}
        width={width}
        height={height}
        padding={padding}
      >
        <ChartInner data={data} padding={padding} />
      </DataProcessor>
    </div>
  );
};

export default ChartPatternBreakdown;
