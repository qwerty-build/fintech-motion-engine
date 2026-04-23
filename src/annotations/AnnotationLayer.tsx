// ============================================================
// AnnotationLayer.tsx
// Receives the full annotations[] array from the JSON payload
// and renders each one via its matching component.
//
// This is the only file that knows about annotation types.
// Adding a new annotation type = add one case here + one file
// in this folder. Nothing else in the codebase changes.
//
// RENDER ORDER (bottom to top):
//   1. Zones       (background rectangles, behind everything)
//   2. H-Lines     (price levels, behind trendlines)
//   3. Trendlines  (diagonal lines on top of zones)
//   4. Callouts    (text labels, always on top)
// ============================================================

import React from "react";
import { TrendlineAnnotation } from "./TrendlineAnnotation";
import { ZoneAnnotation } from "./ZoneAnnotation";
import { CalloutAnnotation } from "./CalloutAnnotation";
import { HorizontalLineAnnotation } from "./HorizontalLineAnnotation";
import type {
  Annotation,
  TrendlineAnnotation as TrendlineType,
  ZoneAnnotation as ZoneType,
  CalloutAnnotation as CalloutType,
  HorizontalLineAnnotation as HorizontalLineType,
} from "../types/schema";
import type { OHLCVCandle } from "../types/schema";

interface AnnotationLayerProps {
  annotations: Annotation[];
  series: OHLCVCandle[];
  chartWidth: number;
  chartPaddingLeft: number;
  fontFamily: string;
}

export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  annotations,
  series,
  chartWidth,
  chartPaddingLeft,
  fontFamily,
}) => {
  // Split annotations by type to enforce render order
  const zones      = annotations.filter((a): a is ZoneType         => a.type === "zone");
  const hLines     = annotations.filter((a): a is HorizontalLineType => a.type === "horizontal_line");
  const trendlines = annotations.filter((a): a is TrendlineType    => a.type === "trendline");
  const callouts   = annotations.filter((a): a is CalloutType      => a.type === "callout");

  return (
    <g>
      {/* Layer 1: Zones — widest, most background */}
      {zones.map((a) => (
        <ZoneAnnotation key={a.id} annotation={a} />
      ))}

      {/* Layer 2: Horizontal price levels */}
      {hLines.map((a) => (
        <HorizontalLineAnnotation
          key={a.id}
          annotation={a}
          chartWidth={chartWidth}
          chartPaddingLeft={chartPaddingLeft}
          fontFamily={fontFamily}
        />
      ))}

      {/* Layer 3: Trendlines */}
      {trendlines.map((a) => (
        <TrendlineAnnotation key={a.id} annotation={a} series={series} />
      ))}

      {/* Layer 4: Callouts — always on top */}
      {callouts.map((a) => (
        <CalloutAnnotation
          key={a.id}
          annotation={a}
          series={series}
          fontFamily={fontFamily}
        />
      ))}
    </g>
  );
};
