// ============================================================
// TemplateRegistry.ts
// Maps templateId strings → lazy-loaded React components.
// Add a new entry here whenever you create a new template.
//
// WHY LAZY? Each template may import heavy libs (D3, specific
// fonts). Lazy + Suspense means Webpack only bundles a template
// when it's actually requested by the JSON payload — critical
// for keeping Lambda memory usage low in Phase 4.
// ============================================================

import { lazy } from "react";
import type { VideoPayload } from "./types/schema";
import type { ComponentType } from "react";

// All template components must accept this exact prop shape.
export interface TemplateProps {
  data: VideoPayload;
}

export const TemplateRegistry: Record<
  string,
  ReturnType<typeof lazy<ComponentType<TemplateProps>>>
> = {
  chart_pattern_breakdown: lazy(
    () => import("./templates/ChartPatternBreakdown")
  ),
  multi_timeframe_analysis: lazy(
    () => import("./templates/MultiTimeframeAnalysis")
  ),
  indicator_divergence: lazy(
    () => import("./templates/IndicatorDivergence")
  ),
  viral_trade_breakdown: lazy(
    () => import("./templates/ViralTradeBreakdown")
  ),
};
