// ============================================================
// ZoneAnnotation.tsx
// Renders a semi-transparent rectangle spanning a price range
// across a range of candle indices. Used for supply/demand
// zones, order blocks, and consolidation areas.
//
// ANIMATION: simple opacity fade-in driven by progress.
// The rect is fully sized from frame 0 of its animation —
// it fades in rather than "growing", which feels more natural
// for zone overlays (they represent areas, not drawn lines).
// ============================================================

import React from "react";
import { useChartScales } from "../chart/ChartProvider";
import { useAnnotationProgress } from "../animation/useAnnotationProgress";
import type { ZoneAnnotation as ZoneAnnotationType } from "../types/schema";

interface ZoneAnnotationProps {
  annotation: ZoneAnnotationType;
}

export const ZoneAnnotation: React.FC<ZoneAnnotationProps> = ({
  annotation,
}) => {
  const { xScale, yScale } = useChartScales();
  const progress = useAnnotationProgress(annotation.animation);

  if (progress <= 0) return null;

  const { startIndex, endIndex, priceLow, priceHigh, style } = annotation;

  // X: from the left edge of startIndex candle to right edge of endIndex
  // We add/subtract half a candleWidth slot so the zone hugs the candles,
  // not just the centre points.
  const x1 = xScale(startIndex);
  const x2 = xScale(endIndex);

  // Y: yScale is inverted — higher price = smaller Y value
  const yTop    = yScale(priceHigh);
  const yBottom = yScale(priceLow);

  const rectX      = x1;
  const rectY      = yTop;
  const rectWidth  = x2 - x1;
  const rectHeight = yBottom - yTop;

  // Guard against degenerate rects (zero or negative size)
  if (rectWidth <= 0 || rectHeight <= 0) return null;

  return (
    <rect
      x={rectX}
      y={rectY}
      width={rectWidth}
      height={rectHeight}
      fill={style.fill}
      // Multiply schema opacity by animation progress for fade-in
      opacity={style.opacity * progress}
      rx={2}
    />
  );
};
