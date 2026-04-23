// ============================================================
// HorizontalLineAnnotation.tsx
// Draws a horizontal line across the chart at a fixed price.
// Used for support/resistance levels, entry/SL/TP markers.
//
// ANIMATION: same strokeDashoffset draw-on as TrendlineAnnotation.
// Line draws left-to-right. Optional label fades in at the
// right edge once progress > 0.5 (halfway through the draw).
//
// LABEL PLACEMENT: right-aligned at the end of the line so it
// appears as the line "arrives" at that edge — matches the
// visual language of professional charting platforms.
// ============================================================

import React from "react";
import { useChartScales } from "../chart/ChartProvider";
import { useAnnotationProgress } from "../animation/useAnnotationProgress";
import type { HorizontalLineAnnotation as HorizontalLineAnnotationType } from "../types/schema";

// How many pixels the line extends beyond the last candle on each side
const LINE_OVERHANG = 20;
// Pixel gap between line end and label text
const LABEL_GAP = 10;

interface HorizontalLineAnnotationProps {
  annotation: HorizontalLineAnnotationType;
  chartWidth: number;
  chartPaddingLeft: number;
  fontFamily: string;
}

export const HorizontalLineAnnotation: React.FC<HorizontalLineAnnotationProps> = ({
  annotation,
  chartWidth,
  chartPaddingLeft,
  fontFamily,
}) => {
  const { yScale } = useChartScales();
  const progress = useAnnotationProgress(annotation.animation);

  if (progress <= 0) return null;

  const { price, label, style } = annotation;
  const y = yScale(price);

  // X extents: from left padding to full chart width
  const x1 = chartPaddingLeft - LINE_OVERHANG;
  const x2 = chartWidth - LINE_OVERHANG;
  const lineLength = x2 - x1;

  // Draw-on from left to right
  const dashOffset = lineLength * (1 - progress);

  // Label opacity: starts fading in when line is 50% drawn
  const labelOpacity = progress < 0.5
    ? 0
    : (progress - 0.5) * 2; // 0→1 over the second half of animation

  return (
    <g>
      {/* Main line with draw-on animation */}
      <line
        x1={x1} y1={y}
        x2={x2} y2={y}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        strokeOpacity={style.opacity}
        strokeLinecap="round"
        strokeDasharray={`${lineLength} ${lineLength}`}
        strokeDashoffset={dashOffset}
      />

      {/* Dashed overlay — only visible when animation is complete */}
      {style.dashed && progress >= 1 && (
        <line
          x1={x1} y1={y}
          x2={x2} y2={y}
          stroke={style.stroke}
          strokeWidth={style.strokeWidth}
          strokeOpacity={style.opacity}
          strokeLinecap="round"
          strokeDasharray="12 8"
        />
      )}

      {/* Optional label — fades in at the right edge */}
      {label && (
        <text
          x={x2 + LABEL_GAP}
          y={y}
          fill={style.stroke}
          fontSize={24}
          fontFamily={fontFamily}
          fontWeight="500"
          dominantBaseline="middle"
          opacity={labelOpacity}
        >
          {label}
        </text>
      )}
    </g>
  );
};