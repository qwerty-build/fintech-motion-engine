import React, { useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { line as d3Line } from "d3-shape";

import { DataProcessor } from "../chart/DataProcessor";
import { useChartScales } from "../chart/ChartProvider";
import { Candlestick } from "../chart/Candlestick";
import { VolumeBar } from "../chart/VolumeBar";
import { useAnimatedCandles } from "../animation/useAnimatedCandles";
import { AnnotationLayer } from "../annotations/AnnotationLayer";
import { FRAMES_PER_CANDLE } from "../config/timingConstants";

import type { TemplateProps } from "../TemplateRegistry";
import type { Padding } from "../chart/ChartProvider";
import type { OHLCVCandle, IndicatorType } from "../types/schema";

// ─────────────────────────────────────────────────────────────
// RSI computation (period = 14)
// Returns an array of number | null, same length as series.
// ─────────────────────────────────────────────────────────────
function computeRSI(series: OHLCVCandle[], period = 14): (number | null)[] {
  const result: (number | null)[] = new Array(series.length).fill(null);
  if (series.length <= period) return result;

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < series.length; i++) {
    const delta = series[i].close - series[i - 1].close;
    gains.push(delta > 0 ? delta : 0);
    losses.push(delta < 0 ? Math.abs(delta) : 0);
  }

  // First average: simple mean of first `period` deltas
  let avgGain = gains.slice(0, period).reduce((s, v) => s + v, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((s, v) => s + v, 0) / period;

  const rsiAt = (ag: number, al: number) =>
    al === 0 ? 100 : 100 - 100 / (1 + ag / al);

  result[period] = rsiAt(avgGain, avgLoss);

  for (let i = period + 1; i < series.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i - 1]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i - 1]) / period;
    result[i] = rsiAt(avgGain, avgLoss);
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// EMA helper
// ─────────────────────────────────────────────────────────────
function computeEMA(values: number[], period: number): (number | null)[] {
  const result: (number | null)[] = new Array(values.length).fill(null);
  if (values.length < period) return result;

  const k = 2 / (period + 1);
  let ema = values.slice(0, period).reduce((s, v) => s + v, 0) / period;
  result[period - 1] = ema;

  for (let i = period; i < values.length; i++) {
    ema = values[i] * k + ema * (1 - k);
    result[i] = ema;
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// MACD computation (fast=12, slow=26, signal=9)
// ─────────────────────────────────────────────────────────────
interface MACDResult {
  macdLine: (number | null)[];
  signalLine: (number | null)[];
  histogram: (number | null)[];
}

function computeMACD(
  series: OHLCVCandle[],
  fast = 12,
  slow = 26,
  signal = 9
): MACDResult {
  const closes = series.map((c) => c.close);
  const ema12 = computeEMA(closes, fast);
  const ema26 = computeEMA(closes, slow);

  const macdLine: (number | null)[] = series.map((_, i) => {
    const a = ema12[i];
    const b = ema26[i];
    return a !== null && b !== null ? a - b : null;
  });

  // Signal = EMA-9 of macdLine (only over valid entries)
  const macdValues = macdLine.map((v) => (v !== null ? v : NaN));
  const signalLine: (number | null)[] = new Array(series.length).fill(null);

  // Find first valid MACD index
  const firstValid = macdLine.findIndex((v) => v !== null);
  if (firstValid === -1) return { macdLine, signalLine, histogram: signalLine };

  const validMacd = macdValues.slice(firstValid);
  const signalEMA = computeEMA(validMacd, signal);

  signalEMA.forEach((v, i) => {
    signalLine[firstValid + i] = v;
  });

  const histogram: (number | null)[] = series.map((_, i) => {
    const m = macdLine[i];
    const s = signalLine[i];
    return m !== null && s !== null ? m - s : null;
  });

  return { macdLine, signalLine, histogram };
}

// ─────────────────────────────────────────────────────────────
// Utility: min/max over nullable array
// ─────────────────────────────────────────────────────────────
function safeExtent(values: (number | null)[]): [number, number] {
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length === 0) return [0, 1];
  return [Math.min(...valid), Math.max(...valid)];
}

// ─────────────────────────────────────────────────────────────
// RSI Panel
// ─────────────────────────────────────────────────────────────
interface RSIPanelProps {
  series: OHLCVCandle[];
  rsiValues: (number | null)[];
  width: number;
  height: number;
  padding: Padding;
  opacity: number;
  theme: { background: string; neutralColor: string; fontFamily: string };
}

function RSIPanel({
  series,
  rsiValues,
  width,
  height,
  padding,
  opacity,
  theme,
}: RSIPanelProps) {
  const { xScale } = useChartScales();

  const yScale = useMemo(() => {
    // RSI is always 0–100; show a little padding
    const domainMin = 0;
    const domainMax = 100;
    const rangeTop = padding.top;
    const rangeBottom = height - padding.bottom;
    return (value: number) =>
      rangeBottom -
      ((value - domainMin) / (domainMax - domainMin)) *
        (rangeBottom - rangeTop);
  }, [height, padding]);

  const pathData = useMemo(() => {
    const lineGen = d3Line<{ index: number; value: number | null }>()
      .defined((d) => d.value !== null)
      .x((d) => xScale(d.index))
      .y((d) => yScale(d.value as number));

    return lineGen(series.map((c, i) => ({ index: c.index, value: rsiValues[i] })));
  }, [series, rsiValues, xScale, yScale]);

  const yOverbought = yScale(70);
  const yOversold = yScale(30);
  const yMid = yScale(50);
  const labelX = width - padding.right + 6;

  return (
    <g opacity={opacity}>
      {/* Y-axis labels */}
      {[
        { label: "100", y: yScale(100) },
        { label: "50", y: yMid },
        { label: "0", y: yScale(0) },
      ].map(({ label, y }) => (
        <g key={label}>
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={y}
            y2={y}
            stroke={theme.neutralColor}
            strokeWidth={0.5}
            strokeDasharray="4 4"
            opacity={0.3}
          />
          <text
            x={padding.left - 6}
            y={y + 4}
            textAnchor="end"
            fontSize={10}
            fill={theme.neutralColor}
            fontFamily={theme.fontFamily}
          >
            {label}
          </text>
        </g>
      ))}

      {/* Overbought line at 70 */}
      <line
        x1={padding.left}
        x2={width - padding.right}
        y1={yOverbought}
        y2={yOverbought}
        stroke="#FF3366"
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.7}
      />
      <text
        x={labelX}
        y={yOverbought + 4}
        fontSize={10}
        fill="#FF3366"
        fontFamily={theme.fontFamily}
      >
        70
      </text>

      {/* Oversold line at 30 */}
      <line
        x1={padding.left}
        x2={width - padding.right}
        y1={yOversold}
        y2={yOversold}
        stroke="#00FF7F"
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.7}
      />
      <text
        x={labelX}
        y={yOversold + 4}
        fontSize={10}
        fill="#00FF7F"
        fontFamily={theme.fontFamily}
      >
        30
      </text>

      {/* RSI line */}
      {pathData && (
        <path
          d={pathData}
          fill="none"
          stroke="#00BFFF"
          strokeWidth={1.5}
        />
      )}

      {/* Panel label */}
      <text
        x={padding.left}
        y={padding.top - 6}
        fontSize={11}
        fill={theme.neutralColor}
        fontFamily={theme.fontFamily}
      >
        RSI (14)
      </text>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// MACD Panel
// ─────────────────────────────────────────────────────────────
interface MACDPanelProps {
  series: OHLCVCandle[];
  macd: MACDResult;
  width: number;
  height: number;
  padding: Padding;
  opacity: number;
  theme: {
    background: string;
    neutralColor: string;
    fontFamily: string;
    bullishColor: string;
    bearishColor: string;
  };
}

function MACDPanel({
  series,
  macd,
  width,
  height,
  padding,
  opacity,
  theme,
}: MACDPanelProps) {
  const { xScale } = useChartScales();

  const { yScale, yMin, yMax } = useMemo(() => {
    const allValues = [
      ...macd.macdLine,
      ...macd.signalLine,
      ...macd.histogram,
    ];
    const [domainMin, domainMax] = safeExtent(allValues);
    const pad = (domainMax - domainMin) * 0.1 || 0.1;
    const dMin = domainMin - pad;
    const dMax = domainMax + pad;
    const rangeTop = padding.top;
    const rangeBottom = height - padding.bottom;
    const scale = (value: number) =>
      rangeBottom -
      ((value - dMin) / (dMax - dMin)) * (rangeBottom - rangeTop);
    return { yScale: scale, yMin: dMin, yMax: dMax };
  }, [macd, height, padding]);

  const zeroY = yScale(0);

  const macdPathData = useMemo(() => {
    const lineGen = d3Line<{ index: number; value: number | null }>()
      .defined((d) => d.value !== null)
      .x((d) => xScale(d.index))
      .y((d) => yScale(d.value as number));
    return lineGen(series.map((c, i) => ({ index: c.index, value: macd.macdLine[i] })));
  }, [series, macd.macdLine, xScale, yScale]);

  const signalPathData = useMemo(() => {
    const lineGen = d3Line<{ index: number; value: number | null }>()
      .defined((d) => d.value !== null)
      .x((d) => xScale(d.index))
      .y((d) => yScale(d.value as number));
    return lineGen(series.map((c, i) => ({ index: c.index, value: macd.signalLine[i] })));
  }, [series, macd.signalLine, xScale, yScale]);

  // Bar width: gap between two adjacent x positions, capped
  const barWidth = useMemo(() => {
    if (series.length < 2) return 4;
    return Math.max(1, (xScale(1) - xScale(0)) * 0.6);
  }, [series, xScale]);

  const yMid = yScale((yMin + yMax) / 2);
  const yTop = yScale(yMax);
  const yBottom = yScale(yMin);

  return (
    <g opacity={opacity}>
      {/* Y-axis labels */}
      {[
        { label: yMax.toFixed(4), y: yTop },
        { label: ((yMin + yMax) / 2).toFixed(4), y: yMid },
        { label: yMin.toFixed(4), y: yBottom },
      ].map(({ label, y }) => (
        <g key={label}>
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={y}
            y2={y}
            stroke={theme.neutralColor}
            strokeWidth={0.5}
            strokeDasharray="4 4"
            opacity={0.3}
          />
          <text
            x={padding.left - 6}
            y={y + 4}
            textAnchor="end"
            fontSize={10}
            fill={theme.neutralColor}
            fontFamily={theme.fontFamily}
          >
            {label}
          </text>
        </g>
      ))}

      {/* Zero line */}
      <line
        x1={padding.left}
        x2={width - padding.right}
        y1={zeroY}
        y2={zeroY}
        stroke={theme.neutralColor}
        strokeWidth={0.5}
        opacity={0.5}
      />

      {/* Histogram bars */}
      {series.map((candle, i) => {
        const h = macd.histogram[i];
        if (h === null) return null;
        const x = xScale(candle.index);
        const barTop = h >= 0 ? yScale(h) : zeroY;
        const barHeight = Math.abs(yScale(h) - zeroY);
        return (
          <rect
            key={candle.index}
            x={x - barWidth / 2}
            y={barTop}
            width={barWidth}
            height={Math.max(barHeight, 1)}
            fill={h >= 0 ? theme.bullishColor : theme.bearishColor}
            opacity={0.6}
          />
        );
      })}

      {/* MACD line */}
      {macdPathData && (
        <path d={macdPathData} fill="none" stroke="#00BFFF" strokeWidth={1.5} />
      )}

      {/* Signal line */}
      {signalPathData && (
        <path d={signalPathData} fill="none" stroke="#FF9900" strokeWidth={1.5} />
      )}

      {/* Panel label */}
      <text
        x={padding.left}
        y={padding.top - 6}
        fontSize={11}
        fill={theme.neutralColor}
        fontFamily={theme.fontFamily}
      >
        MACD (12, 26, 9)
      </text>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// Price Panel inner — consumes ChartProvider context
// ─────────────────────────────────────────────────────────────
interface PricePanelInnerProps {
  series: OHLCVCandle[];
  annotations: import("../types/schema").Annotation[];
  width: number;
  height: number;
  padding: Padding;
  theme: {
    background: string;
    bullishColor: string;
    bearishColor: string;
    neutralColor: string;
    fontFamily: string;
  };
  ticker: string;
  timeframe: string;
}

function PricePanelInner({
  series,
  annotations,
  width,
  height,
  padding,
  theme,
  ticker,
  timeframe,
}: PricePanelInnerProps) {
  const { xScale, yScale } = useChartScales();
  const { visibleCandles, getOpacity } = useAnimatedCandles(series);

  // Y-axis: derive min/max from domain via sample points
  const yAxisLabels = useMemo(() => {
    const prices = series.map((c) => c.close);
    const minP = Math.min(...prices.map((_, i) => series[i].low));
    const maxP = Math.max(...prices.map((_, i) => series[i].high));
    const mid = (minP + maxP) / 2;
    return [
      { price: maxP, y: yScale(maxP) },
      { price: mid, y: yScale(mid) },
      { price: minP, y: yScale(minP) },
    ];
  }, [series, yScale]);

  return (
    <>
      {/* Gridlines + Y-axis labels */}
      {yAxisLabels.map(({ price, y }) => (
        <g key={price}>
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={y}
            y2={y}
            stroke={theme.neutralColor}
            strokeWidth={0.5}
            strokeDasharray="4 4"
            opacity={0.3}
          />
          <text
            x={padding.left - 6}
            y={y + 4}
            textAnchor="end"
            fontSize={11}
            fill={theme.neutralColor}
            fontFamily={theme.fontFamily}
          >
            {price.toFixed(2)}
          </text>
        </g>
      ))}

      {/* Volume bars */}
      {visibleCandles.map((candle) => (
        <VolumeBar
          key={`vol-${candle.index}`}
          dataPoint={candle}
          bullishColor={theme.bullishColor}
          bearishColor={theme.bearishColor}
          opacity={getOpacity(candle.index) * 0.4}
        />
      ))}

      {/* Candlesticks */}
      {visibleCandles.map((candle) => (
        <Candlestick
          key={`candle-${candle.index}`}
          dataPoint={candle}
          bullishColor={theme.bullishColor}
          bearishColor={theme.bearishColor}
          opacity={getOpacity(candle.index)}
        />
      ))}

      {/* Annotations */}
      <AnnotationLayer
        annotations={annotations}
        series={series}
        chartWidth={width}
        chartPaddingLeft={padding.left}
        fontFamily={theme.fontFamily}
      />

      {/* Ticker + timeframe label */}
      <text
        x={padding.left}
        y={padding.top - 8}
        fontSize={14}
        fontWeight="bold"
        fill="#FFFFFF"
        fontFamily={theme.fontFamily}
      >
        {ticker} · {timeframe}
      </text>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Root component
// ─────────────────────────────────────────────────────────────
const IndicatorDivergence = ({ data: payload }: TemplateProps) => {
  const frame = useCurrentFrame();
  const { width, height } = payload.config.dimensions;
  const theme = payload.config.theme;
  const series = payload.financialData.series;
  const indicators: IndicatorType[] = payload.routing.indicators ?? [];

  const PRICE_PADDING: Padding = { top: 60, right: 30, bottom: 60, left: 70 };
  const IND_PADDING: Padding = { top: 20, right: 30, bottom: 30, left: 70 };
  const GAP = 4;

  // Layout
  const hasIndicators = indicators.length > 0;
  const priceHeight = hasIndicators ? Math.floor(height * 0.55) : height;
  const remainingHeight = height - priceHeight - GAP * (indicators.length > 0 ? indicators.length : 0);
  const indPanelHeight = hasIndicators
    ? Math.floor(remainingHeight / indicators.length)
    : 0;

  // Pre-compute indicator values (memoized, never per-frame)
  const rsiValues = useMemo(
    () => (indicators.includes("rsi") ? computeRSI(series) : []),
    [series, indicators]
  );

  const macdResult = useMemo(
    () =>
      indicators.includes("macd")
        ? computeMACD(series)
        : { macdLine: [], signalLine: [], histogram: [] },
    [series, indicators]
  );

  // Indicator fade-in opacity (after all candles revealed)
  const allCandlesDoneFrame = series.length * FRAMES_PER_CANDLE;
  const indicatorOpacity = interpolate(
    frame,
    [allCandlesDoneFrame, allCandlesDoneFrame + 30],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: theme.background,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Price panel ── */}
      <svg
        width={width}
        height={priceHeight}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <DataProcessor series={series} width={width} height={priceHeight} padding={PRICE_PADDING}>
          <PricePanelInner
            series={series}
            annotations={payload.annotations}
            width={width}
            height={priceHeight}
            padding={PRICE_PADDING}
            theme={theme}
            ticker={payload.financialData.asset.ticker}
            timeframe={payload.financialData.timeframe}
          />
        </DataProcessor>
      </svg>

      {/* ── Indicator panels ── */}
      {hasIndicators &&
        indicators.map((indicator, idx) => {
          const topOffset = priceHeight + (indPanelHeight + GAP) * idx + GAP;

          return (
            <svg
              key={indicator}
              width={width}
              height={indPanelHeight}
              style={{ position: "absolute", top: topOffset, left: 0 }}
            >
              {/* Separator line */}
              <line
                x1={0}
                x2={width}
                y1={0}
                y2={0}
                stroke={theme.neutralColor}
                strokeWidth={0.5}
                opacity={0.4}
              />

              {/* Background */}
              <rect width={width} height={indPanelHeight} fill={theme.background} />

              {/*
                Indicator panels share the same x-domain as the price chart.
                We wrap in DataProcessor so xScale is consistent.
              */}
              <DataProcessor
                series={series}
                width={width}
                height={indPanelHeight}
                padding={IND_PADDING}
              >
                {indicator === "rsi" && (
                  <RSIPanel
                    series={series}
                    rsiValues={rsiValues}
                    width={width}
                    height={indPanelHeight}
                    padding={IND_PADDING}
                    opacity={indicatorOpacity}
                    theme={theme}
                  />
                )}

                {indicator === "macd" && (
                  <MACDPanel
                    series={series}
                    macd={macdResult}
                    width={width}
                    height={indPanelHeight}
                    padding={IND_PADDING}
                    opacity={indicatorOpacity}
                    theme={theme}
                  />
                )}
              </DataProcessor>
            </svg>
          );
        })}
    </div>
  );
};

export default IndicatorDivergence;