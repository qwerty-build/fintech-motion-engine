// ============================================================
// RootRouter.tsx
// The single entry point for the Remotion composition.
// Reads payload.routing.templateId, looks it up in the
// registry, and renders the correct template.
//
// USAGE — in your Root.tsx / index.ts:
//   <Composition
//     id="FintechEducationalShort"
//     component={RootRouter}
//     defaultProps={{ payload: samplePayload }}
//     durationInFrames={1800}
//     fps={60}
//     width={1080}
//     height={1920}
//   />
// ============================================================

import React, { Suspense } from "react";
import { TemplateRegistry } from "./TemplateRegistry";
import type { VideoPayload } from "./types/schema";

// Remotion's <Composition component={...}> requires props to extend
// Record<string, unknown>. We satisfy that with an index signature
// while keeping payload strongly typed for everything downstream.
export interface RootRouterProps extends Record<string, unknown> {
  payload: VideoPayload;
}

export const RootRouter: React.FC<RootRouterProps> = ({ payload }) => {
  const { templateId } = payload.routing;

  // Validate the templateId exists before attempting to render.
  // A clear error here saves hours of debugging a blank frame.
  const TemplateComponent = TemplateRegistry[templateId];

  if (!TemplateComponent) {
    throw new Error(
      `[RootRouter] Template "${templateId}" is not registered in TemplateRegistry.\n` +
      `Registered templates: ${Object.keys(TemplateRegistry).join(", ")}`
    );
  }

  // The Suspense fallback is null because Remotion requires a
  // fully rendered frame on every tick — a loading spinner would
  // appear as literal frames in the output video.
  return (
    <Suspense fallback={null}>
      <TemplateComponent data={payload} />
    </Suspense>
  );
};