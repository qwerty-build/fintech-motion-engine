// ============================================================
// DataProcessor.tsx
// Sits between the raw payload and ChartProvider.
// Responsibilities:
//   1. Sort the series by index (defensive — upstream may not)
//   2. Memoize the sorted result so it's stable across frames
//   3. Pass clean data down to ChartProvider
//
// This keeps ChartProvider pure: it only does math, never data
// transformation. Easier to test and reason about separately.
// ============================================================

import React, { useMemo, type ReactNode } from "react";
import { ChartProvider, type Padding } from "./ChartProvider";
import type { OHLCVCandle } from "../types/schema";

interface DataProcessorProps {
  series: OHLCVCandle[];
  width: number;
  height: number;
  padding: Padding;
  children: ReactNode;
}

export const DataProcessor: React.FC<DataProcessorProps> = ({
  series,
  width,
  height,
  padding,
  children,
}) => {
  // Sort by index — guards against out-of-order payloads from
  // upstream APIs. useMemo means this only runs once at mount,
  // not on every Remotion frame render cycle.
  const sortedSeries = useMemo(
    () => [...series].sort((a, b) => a.index - b.index),
    [series]
  );

  return (
    <ChartProvider
      series={sortedSeries}
      width={width}
      height={height}
      padding={padding}
    >
      {children}
    </ChartProvider>
  );
};
