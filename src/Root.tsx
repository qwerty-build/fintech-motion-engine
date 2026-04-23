import { Composition, type CalculateMetadataFunction } from "remotion";
import { RootRouter } from "./RootRouter";
import { calculateMetadata } from "./calculateMetadata";
import { VideoPayload } from "./types/schema";
import { samplePayloadMTF } from "./samplePayloadMTF";
import { samplePayloadID } from "./samplePayloadID";
import { samplePayloadVTB } from "./samplePayloadVTB";
import { payloadBullFlagProduction } from "./payloadBullFlag";

interface RootRouterProps extends Record<string, unknown> {
  payload: VideoPayload;
}

export const RemotionRoot = () => (
  <>
    {/* IndicatorDivergence */}
    <Composition
      id="IndicatorDivergence"
      component={RootRouter}
      calculateMetadata={calculateMetadata as unknown as CalculateMetadataFunction<RootRouterProps>}
      defaultProps={{ payload: samplePayloadID }}
      durationInFrames={800} fps={60} width={1080} height={1920}
    />

    {/* ViralTradeBreakdown */}
    <Composition
      id="ViralTradeBreakdown"
      component={RootRouter}
      calculateMetadata={calculateMetadata as unknown as CalculateMetadataFunction<RootRouterProps>}
      defaultProps={{ payload: samplePayloadVTB }}
      durationInFrames={800} fps={60} width={1080} height={1920}
    />

    {/* Production Bull Flag */}
    <Composition
      id="BullFlagProduction"
      component={RootRouter}
      calculateMetadata={calculateMetadata as unknown as CalculateMetadataFunction<RootRouterProps>}
      defaultProps={{ payload: payloadBullFlagProduction }}
      durationInFrames={800} fps={60} width={1080} height={1920}
    />

    {/* MultiTimeframeAnalysis */}
    <Composition
      id="MultiTimeframeAnalysis"
      component={RootRouter}
      calculateMetadata={calculateMetadata as unknown as CalculateMetadataFunction<RootRouterProps>}
      defaultProps={{ payload: samplePayloadMTF }}
      durationInFrames={800} fps={60} width={1080} height={1920}
    />

  </>
);