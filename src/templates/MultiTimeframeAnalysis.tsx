// ============================================================
// templates/MultiTimeframeAnalysis.tsx
// Renders 2-3 stacked chart panels, each showing the same asset
// at a different timeframe. Each panel has its own independent
// D3 scales, candle reveal animation, and annotation set.
//
// DATA SOURCE: payload.panels (not payload.financialData)
// Each PanelData has: panelId, financialData, annotations
//
// CANDLE REVEAL: staggered — panel N starts after panel N-1
// finishes. adjustedFrame = Math.max(frame - offset, 0)
// ============================================================

import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { DataProcessor } from "../chart/DataProcessor";
import { useChartScales } from "../chart/ChartProvider";
import { Candlestick } from "../chart/Candlestick";
import { VolumeBar } from "../chart/VolumeBar";
import { AnnotationLayer } from "../annotations/AnnotationLayer";
import { FRAMES_PER_CANDLE } from "../config/timingConstants";
import type { TemplateProps } from "../TemplateRegistry";
import type { Padding } from "../chart/ChartProvider";
import type { PanelData, OHLCVCandle } from "../types/schema";

// ------------------------------------------------------------
// Layout constants
// ------------------------------------------------------------

const PANEL_GAP = 4;

const PANEL_PADDING: Padding = {
  top: 60,
  right: 30,
  bottom: 80,
  left: 70,
};

const PRICE_LABEL_COUNT = 5;
const PANEL_OVERLAY_OPACITY = [0, 0.03];

// ------------------------------------------------------------
// ChartInner
// Renders one panel's contents — consumes ChartProvider context.
// Must be rendered inside DataProcessor to access scales.
// ------------------------------------------------------------

interface ChartInnerProps {
  panelData: PanelData;
  panelWidth: number;
  panelHeight: number;
  adjustedFrame: number;
  panelIndex: number;
  isFirstPanel: boolean;
  theme: {
    bullishColor: string;
    bearishColor: string;
    fontFamily: string;
  };
}

const ChartInner: React.FC<ChartInnerProps> = ({
  panelData,
  panelWidth,
  panelHeight,
  adjustedFrame,
  panelIndex,
  isFirstPanel,
  theme,
}) => {
  const { yScale } = useChartScales();
  const { series, asset, timeframe } = panelData.financialData;

  // Price labels — derived from series data, NOT from yScale.range()
  // yScale is typed as (price: number) => number — not a full D3 scale
  // object, so .range() and .invert() are not available on the context type.
  const priceLabels = useMemo(() => {
    const prices = series.flatMap((d) => [d.high, d.low]);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const step = (maxP - minP) / (PRICE_LABEL_COUNT - 1);
    return Array.from({ length: PRICE_LABEL_COUNT }, (_, i) =>
      parseFloat((minP + step * i).toFixed(2))
    );
  }, [series]);

  // Visible candles — replicate useAnimatedCandles reveal logic
  // with the pre-offset adjustedFrame so we don't modify the hook.
  const visibleCount = Math.min(
    series.length,
    Math.floor(adjustedFrame / FRAMES_PER_CANDLE) + 1
  );
  const visibleSeries: OHLCVCandle[] = series.slice(0, visibleCount);

  // Per-candle opacity for the currently-revealing candle
  const getOpacity = (index: number): number => {
    const framesSinceReveal = adjustedFrame - index * FRAMES_PER_CANDLE;
    if (framesSinceReveal <= 0) return 0;
    if (framesSinceReveal >= 6) return 1;
    return framesSinceReveal / 6;
  };

  const overlayOpacity = PANEL_OVERLAY_OPACITY[panelIndex % PANEL_OVERLAY_OPACITY.length];

  // Gridline x extents
  const gridX1 = PANEL_PADDING.left;
  const gridX2 = panelWidth - PANEL_PADDING.right;

  return (
    <>
      {/* Alternating panel tint */}
      {overlayOpacity > 0 && (
        <rect
          x={0} y={0}
          width={panelWidth}
          height={panelHeight}
          fill="#FFFFFF"
          opacity={overlayOpacity}
        />
      )}

      {/* Y-axis gridlines + price labels */}
      {priceLabels.map((price) => (
        <g key={`label-${price}`}>
          <line
            x1={gridX1} y1={yScale(price)}
            x2={gridX2} y2={yScale(price)}
            stroke="#FFFFFF"
            strokeWidth={0.5}
            strokeOpacity={0.08}
            strokeDasharray="4 6"
          />
          <text
            x={PANEL_PADDING.left - 8}
            y={yScale(price)}
            textAnchor="end"
            fontSize={11}
            fontFamily={theme.fontFamily}
            fill="rgba(255,255,255,0.55)"
            dominantBaseline="middle"
          >
            {price.toLocaleString()}
          </text>
        </g>
      ))}

      {/* Volume bars */}
      {visibleSeries.map((candle) => (
        <VolumeBar
          key={`vol-${candle.index}`}
          dataPoint={candle}
          bullishColor={theme.bullishColor}
          bearishColor={theme.bearishColor}
          opacity={getOpacity(candle.index) * 0.4}
        />
      ))}

      {/* Candlesticks */}
      {visibleSeries.map((candle) => (
        <Candlestick
          key={`candle-${candle.index}`}
          dataPoint={candle}
          bullishColor={theme.bullishColor}
          bearishColor={theme.bearishColor}
          opacity={getOpacity(candle.index)}
        />
      ))}

      {/* Annotations — all required props passed */}
      <AnnotationLayer
        annotations={panelData.annotations}
        series={series}
        chartWidth={panelWidth}
        chartPaddingLeft={PANEL_PADDING.left}
        fontFamily={theme.fontFamily}
      />

      {/* Timeframe label — top-left of every panel */}
      <text
        x={PANEL_PADDING.left + 8}
        y={PANEL_PADDING.top - 8}
        fontSize={13}
        fontWeight="700"
        fontFamily={theme.fontFamily}
        fill="rgba(255,255,255,0.75)"
        textAnchor="start"
      >
        {timeframe.toUpperCase()}
      </text>

      {/* Ticker — first panel only */}
      {isFirstPanel && (
        <text
          x={PANEL_PADDING.left + 8}
          y={PANEL_PADDING.top - 28}
          fontSize={16}
          fontWeight="800"
          fontFamily={theme.fontFamily}
          fill="rgba(255,255,255,0.92)"
          textAnchor="start"
        >
          {asset.ticker}
        </text>
      )}
    </>
  );
};

// ------------------------------------------------------------
// PanelSVG
// Positions one panel's <svg> and wraps it with DataProcessor
// ------------------------------------------------------------

interface PanelSVGProps {
  panelData: PanelData;
  panelIndex: number;
  canvasWidth: number;
  panelHeight: number;
  yOffset: number;
  adjustedFrame: number;
  isFirstPanel: boolean;
  theme: {
    bullishColor: string;
    bearishColor: string;
    fontFamily: string;
  };
}

const PanelSVG: React.FC<PanelSVGProps> = ({
  panelData,
  panelIndex,
  canvasWidth,
  panelHeight,
  yOffset,
  adjustedFrame,
  isFirstPanel,
  theme,
}) => {
  // Memoize padding — same values every render, prevents useMemo busting
  // in ChartProvider (which depends on padding primitives)
  const padding = useMemo<Padding>(() => PANEL_PADDING, []);

  return (
    <svg
      style={{ position: "absolute", top: yOffset, left: 0 }}
      width={canvasWidth}
      height={panelHeight}
    >
      {/* DataProcessor accepts series (not payload) */}
      <DataProcessor
        series={panelData.financialData.series}
        width={canvasWidth}
        height={panelHeight}
        padding={padding}
      >
        <ChartInner
          panelData={panelData}
          panelWidth={canvasWidth}
          panelHeight={panelHeight}
          adjustedFrame={adjustedFrame}
          panelIndex={panelIndex}
          isFirstPanel={isFirstPanel}
          theme={theme}
        />
      </DataProcessor>
    </svg>
  );
};

// ------------------------------------------------------------
// MultiTimeframeAnalysis — default export
// ------------------------------------------------------------

const MultiTimeframeAnalysis: React.FC<TemplateProps> = ({ data }) => {
  const frame = useCurrentFrame();
  const { width, height } = data.config.dimensions;
  const { theme } = data.config;
  const panels: PanelData[] | undefined = data.panels;

  // Guard: no panels provided
  if (!panels || panels.length === 0) {
    return (
      <div
        style={{
          width,
          height,
          backgroundColor: theme.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: theme.fontFamily,
          color: "rgba(255,255,255,0.6)",
          fontSize: 20,
        }}
      >
        No panels provided to MultiTimeframeAnalysis
      </div>
    );
  }

  const panelCount = panels.length;
  const totalGap = PANEL_GAP * (panelCount - 1);
  const panelHeight = Math.floor((height - totalGap) / panelCount);

  // Staggered frame offsets — panel N starts after panel N-1 finishes
  const frameOffsets = useMemo<number[]>(() => {
    const offsets: number[] = [0];
    for (let i = 1; i < panelCount; i++) {
      const prev = offsets[i - 1];
      const prevLen = panels[i - 1].financialData.series.length;
      offsets.push(prev + prevLen * FRAMES_PER_CANDLE);
    }
    return offsets;
  }, [panelCount, panels]);

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
      {panels.map((panelData, i) => {
        const yOffset = i * (panelHeight + PANEL_GAP);
        const adjustedFrame = Math.max(frame - frameOffsets[i], 0);

        return (
          <PanelSVG
            key={panelData.panelId}
            panelData={panelData}
            panelIndex={i}
            canvasWidth={width}
            panelHeight={panelHeight}
            yOffset={yOffset}
            adjustedFrame={adjustedFrame}
            isFirstPanel={i === 0}
            theme={{
              bullishColor: theme.bullishColor,
              bearishColor: theme.bearishColor,
              fontFamily: theme.fontFamily,
            }}
          />
        );
      })}
    </div>
  );
};

export default MultiTimeframeAnalysis;