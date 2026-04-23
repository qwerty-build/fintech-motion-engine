// ============================================================
// VolumeBar.tsx
// Renders a single volume bar in the bottom 20% of the chart.
// Uses volumeScale from ChartProvider context.
// Semi-transparent so price candles show through when the
// chart layout overlaps the volume area.
// ============================================================

import React from "react";
import { useChartScales } from "./ChartProvider";
import type { OHLCVCandle } from "../types/schema";

interface VolumeBarProps {
  dataPoint: OHLCVCandle;
  bullishColor: string;
  bearishColor: string;
  opacity?: number;
}

export const VolumeBar: React.FC<VolumeBarProps> = ({
  dataPoint,
  bullishColor,
  bearishColor,
  opacity = 0.4, // Semi-transparent by default
}) => {
  const { xScale, volumeScale, candleWidth } = useChartScales();

  const x       = xScale(dataPoint.index);
  const barTopY = volumeScale(dataPoint.volume);
  // volumeScale(0) returns the bottom of the volume area (= height - padding.bottom).
  // We read it from the scale itself so VolumeBar stays padding-agnostic.
  const baseY   = volumeScale(0);
  const barHeight = baseY - barTopY;

  const isBullish = dataPoint.close >= dataPoint.open;
  const color = isBullish ? bullishColor : bearishColor;
  const barWidth = candleWidth * 0.6;

  return (
    <rect
      x={x - barWidth / 2}
      y={barTopY}
      width={barWidth}
      height={Math.max(barHeight, 1)}
      fill={color}
      opacity={opacity}
      rx={1}
    />
  );
};
