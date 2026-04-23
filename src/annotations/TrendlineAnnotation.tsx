// ============================================================
// TrendlineAnnotation.tsx
// Draws a line from (startIndex, price_at_start) to
// (endIndex, price_at_end) using the chart's xScale/yScale.
//
// ANIMATION: strokeDashoffset draw-on effect.
// The line's total pixel length is computed via Pythagoras,
// set as strokeDasharray, then strokeDashoffset animates from
// full-length → 0 so the line appears to "draw itself".
//
// NOTE: For a trendline we connect the CLOSE prices at each
// index end-point. The JSON could alternatively store explicit
// prices — if you need that, add priceStart/priceEnd fields to
// TrendlineAnnotation in schema.ts and read them here instead.
// ============================================================

import React from "react";
import { useChartScales } from "../chart/ChartProvider";
import { useAnnotationProgress } from "../animation/useAnnotationProgress";
import type { TrendlineAnnotation as TrendlineAnnotationType } from "../types/schema";
import type { OHLCVCandle } from "../types/schema";

interface TrendlineAnnotationProps {
  annotation: TrendlineAnnotationType;
  series: OHLCVCandle[];
}

export const TrendlineAnnotation: React.FC<TrendlineAnnotationProps> = ({
  annotation,
  series,
}) => {
  const { xScale, yScale } = useChartScales();
  const progress = useAnnotationProgress(annotation.animation);

  if (progress <= 0) return null;

  const startCandle = series[annotation.startIndex];
  const endCandle   = series[annotation.endIndex];

  // Guard: if indices are out of bounds in a short series, skip
  if (!startCandle || !endCandle) return null;

  const x1 = xScale(annotation.startIndex);
  const y1 = yScale(startCandle.close);
  const x2 = xScale(annotation.endIndex);
  const y2 = yScale(endCandle.close);

  // Total pixel length via Pythagoras — required for dashoffset trick
  const lineLength = Math.sqrt(
    Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
  );

  // progress 0→1 maps dashoffset lineLength→0
  // At progress=0: dashoffset=lineLength → line invisible (offset hides it)
  // At progress=1: dashoffset=0 → line fully drawn
  const dashOffset = lineLength * (1 - progress);

  const { style } = annotation;
  const strokeDasharray = style.dashed
    ? `${lineLength} ${lineLength}`  // Solid draw-on over dashes handled separately
    : `${lineLength} ${lineLength}`; // Same — dashed appearance applied via a second line below

  return (
    <g opacity={style.opacity}>
      {/* Draw-on line — always solid for the animation itself */}
      <line
        x1={x1} y1={y1}
        x2={x2} y2={y2}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        strokeLinecap="round"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={dashOffset}
      />
      {/* If dashed, overlay a dashed pattern on top after draw-on completes */}
      {style.dashed && progress >= 1 && (
        <line
          x1={x1} y1={y1}
          x2={x2} y2={y2}
          stroke={style.stroke}
          strokeWidth={style.strokeWidth}
          strokeLinecap="round"
          strokeDasharray="12 8"
        />
      )}
    </g>
  );
};
