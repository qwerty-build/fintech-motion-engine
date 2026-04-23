// ============================================================
// CalloutAnnotation.tsx
// Renders a text callout pinned above a specific candle.
// Appears with a spring scale-up effect (grows from a point).
//
// ANIMATION: SVG transform scale on the <g> wrapper.
// The group's transform-origin is set to the anchor point
// (centre-top of the candle's high wick) so it "pops out"
// from the chart rather than scaling from the SVG origin.
//
// POSITIONING: The label sits above the candle's high price
// with a fixed pixel gap so it never overlaps the wick.
// ============================================================

import React from "react";
import { useChartScales } from "../chart/ChartProvider";
import { useAnnotationProgress } from "../animation/useAnnotationProgress";
import type { CalloutAnnotation as CalloutAnnotationType } from "../types/schema";
import type { OHLCVCandle } from "../types/schema";

// Vertical gap in pixels between wick tip and callout baseline
const CALLOUT_GAP = 20;

interface CalloutAnnotationProps {
  annotation: CalloutAnnotationType;
  series: OHLCVCandle[];
  fontFamily: string;
}

export const CalloutAnnotation: React.FC<CalloutAnnotationProps> = ({
  annotation,
  series,
  fontFamily,
}) => {
  const { xScale, yScale } = useChartScales();
  const progress = useAnnotationProgress(annotation.animation);

  if (progress <= 0) return null;

  const candle = series[annotation.targetIndex];
  if (!candle) return null;

  const cx = xScale(annotation.targetIndex);
  // Anchor Y: above the candle's high wick tip
  const anchorY = yScale(candle.high) - CALLOUT_GAP;

  const { style } = annotation;

  // Scale: spring easing drives progress to ~1 with natural overshoot.
  // We clamp to max 1.05 so any overshoot is subtle, not jarring.
  const scale = Math.min(progress * 1.05, 1.05);

  return (
    // SVG transforms don't support transform-origin directly.
    // Workaround: translate to anchor, scale, translate back.
    <g transform={`translate(${cx}, ${anchorY}) scale(${scale}) translate(${-cx}, ${-anchorY})`}>
      <text
        x={cx}
        y={anchorY}
        fill={style.color}
        fontSize={style.fontSize}
        fontFamily={fontFamily}
        fontWeight="600"
        textAnchor="middle"
        dominantBaseline="auto"
      >
        {annotation.text}
      </text>
    </g>
  );
};
