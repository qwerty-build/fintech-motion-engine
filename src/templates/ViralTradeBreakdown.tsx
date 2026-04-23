import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { DataProcessor } from "../chart/DataProcessor";
import { useChartScales, type Padding } from "../chart/ChartProvider";
import { Candlestick } from "../chart/Candlestick";
import { VolumeBar } from "../chart/VolumeBar";
import { AnnotationLayer } from "../annotations/AnnotationLayer";
import type { TemplateProps } from "../TemplateRegistry";
import type { ChapterConfig, OHLCVCandle } from "../types/schema";

// ------------------------------------------------------------
// Animation Utils
// ------------------------------------------------------------
function useChapterTiming(chapterId: string, chapters?: ChapterConfig[]) {
  const chapter = chapters?.find((c) => c.id === chapterId);
  if (!chapter) return { isActive: false, progress: 0, frameInChapter: 0, localFrame: -1 };

  const frame = useCurrentFrame();
  const isActive = frame >= chapter.startFrame && frame <= chapter.endFrame;
  const duration = chapter.endFrame - chapter.startFrame;
  const frameInChapter = Math.max(0, frame - chapter.startFrame);
  const progress = Math.min(1, Math.max(0, frameInChapter / duration));

  // localFrame continues to grow even after chapter ends, useful for lingering effects
  const localFrame = frame - chapter.startFrame;

  return { isActive, progress, frameInChapter, duration, localFrame };
}

// ------------------------------------------------------------
// Visual Components
// ------------------------------------------------------------

function HookChapter({
  theme,
  tradeResult,
  chapters,
}: {
  theme: any;
  tradeResult: any;
  chapters?: ChapterConfig[];
}) {
  const { isActive, localFrame } = useChapterTiming("hook", chapters);
  const { fps } = useVideoConfig();

  // Opacity fade out when chapter ends
  const chapter = chapters?.find((c) => c.id === "hook");
  const fadeOut = interpolate(localFrame, [chapter ? chapter.endFrame - chapter.startFrame - 15 : 0, chapter ? chapter.endFrame - chapter.startFrame : 0], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const pnlSpring = spring({ frame: localFrame, fps, config: { damping: 12, stiffness: 150 } });
  const pnlScale = interpolate(pnlSpring, [0, 1], [0.8, 1]);
  const pnlOpacity = interpolate(pnlSpring, [0, 1], [0, 1]);

  if (localFrame < 0) return null;

  const isPositive = tradeResult?.pnlPercent >= 0;
  const color = isPositive ? theme.bullishColor : theme.bearishColor;
  const sign = isPositive ? "+" : "";

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: fadeOut, zIndex: 10 }}>
      {/* Background sweep */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `radial-gradient(circle at 50% 40%, ${color}22 0%, transparent 60%)`,
        }}
      />

      <div
        style={{
          transform: `scale(${pnlScale})`,
          opacity: pnlOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 32,
            color: "white",
            fontWeight: "bold",
            marginBottom: 20,
            letterSpacing: 2,
            textTransform: "uppercase",
            opacity: 0.8,
            fontFamily: theme.fontFamily,
          }}
        >
          {isPositive ? "Winning Trade" : "Losing Trade"}
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: color,
            textShadow: `0 0 40px ${color}88`,
            padding: "20px 40px",
            background: `${color}11`,
            borderRadius: 20,
            border: `2px solid ${color}44`,
            fontFamily: theme.fontFamily,
          }}
        >
          {sign}{tradeResult?.pnlPercent}%
        </div>
      </div>
    </AbsoluteFill>
  );
}

function ProgressAndOverlay({ chapters, width, height }: { chapters?: ChapterConfig[]; width: number; height: number }) {
  const frame = useCurrentFrame();
  const maxEndFrame = chapters && chapters.length > 0 ? chapters[chapters.length - 1].endFrame : 600;
  const progressWidth = interpolate(frame, [0, maxEndFrame], [0, width], { extrapolateRight: "clamp" });

  return (
    <>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 8,
          width: progressWidth,
          background: `linear-gradient(90deg, #00E5FF, #7C3AED)`,
          zIndex: 50,
        }}
      />
    </>
  );
}

function ChartVisuals({
  series,
  width,
  height,
  padding,
  theme,
  chapters,
  annotations,
}: {
  series: OHLCVCandle[];
  width: number;
  height: number;
  padding: Padding;
  theme: any;
  chapters?: ChapterConfig[];
  annotations: any[];
}) {
  const { xScale, yScale } = useChartScales();
  const { fps } = useVideoConfig();

  // Setup chapter candle reveal logic (e.g. up to index 21)
  const setupChapter = chapters?.find((c) => c.id === "setup");
  const climaxChapter = chapters?.find((c) => c.id === "climax");
  const payoffChapter = chapters?.find((c) => c.id === "payoff");
  
  const setupLocalFrame = useChapterTiming("setup", chapters).localFrame;
  const climaxLocalFrame = useChapterTiming("climax", chapters).localFrame;
  
  // Decide how many candles to show
  // Hook: 0 candles
  // Setup: Reveal slowly up to index 21
  // Climax: Reveal remainder quickly
  // Payoff: All candles
  
  let visibleCount = 0;
  if (setupLocalFrame >= 0 && setupChapter) {
    const setupDuration = setupChapter.endFrame - setupChapter.startFrame;
    const climaxCandleIndex = 22; // Hardcoded for this specific payload structure as the breakout
    visibleCount = Math.floor(interpolate(setupLocalFrame, [0, setupDuration], [0, climaxCandleIndex], { extrapolateRight: "clamp" }));
  }
  if (climaxLocalFrame >= 0 && climaxChapter) {
    const climaxDuration = climaxChapter.endFrame - climaxChapter.startFrame;
    const remainingCandles = series.length - 22;
    visibleCount = 22 + Math.floor(interpolate(climaxLocalFrame, [0, climaxDuration], [0, remainingCandles], { extrapolateRight: "clamp" }));
  }

  const visibleCandles = series.slice(0, visibleCount);

  // Climax Breakout Flash
  const flashOpacity = interpolate(climaxLocalFrame, [0, 4, 15], [0, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Screen Flash on climax */}
      {flashOpacity > 0 && <rect width={width} height={height} fill="#FFFFFF" opacity={flashOpacity} />}

      {/* Volume separator */}
      <line
        x1={padding.left}
        y1={height - padding.bottom}
        x2={width - padding.right}
        y2={height - padding.bottom}
        stroke="#FFFFFF"
        strokeWidth={0.5}
        strokeOpacity={0.12}
      />

      {/* Volume bars */}
      {visibleCandles.map((candle) => (
        <VolumeBar
          key={`vol-${candle.index}`}
          dataPoint={candle}
          bullishColor={theme.bullishColor}
          bearishColor={theme.bearishColor}
          opacity={0.4} // Simplified opacity logic for the viral template
        />
      ))}

      {/* Price candles */}
      {visibleCandles.map((candle) => {
        // Climax glow on the big breakout candle (index 22)
        const isClimaxCandle = candle.index === 22 && climaxLocalFrame >= 0 && climaxLocalFrame < 30;
        return (
          <g key={`candle-${candle.index}`} filter={isClimaxCandle ? "url(#glow)" : undefined}>
            <Candlestick
              dataPoint={candle}
              bullishColor={theme.bullishColor}
              bearishColor={theme.bearishColor}
              opacity={1}
            />
          </g>
        );
      })}

      {/* Setup Annotations show starting in setup chapter */}
      {setupLocalFrame >= 0 && (
        <AnnotationLayer
          annotations={annotations}
          series={series}
          chartWidth={width}
          chartPaddingLeft={padding.left}
          fontFamily={theme.fontFamily}
        />
      )}
    </svg>
  );
}

function PayoffChapter({
  tradeResult,
  theme,
  width,
  height,
  chapters,
  series,
}: {
  tradeResult: any;
  theme: any;
  width: number;
  height: number;
  chapters?: ChapterConfig[];
  series: OHLCVCandle[];
}) {
  const { localFrame } = useChapterTiming("payoff", chapters);
  const { fps } = useVideoConfig();
  const { yScale } = useChartScales();

  if (localFrame < 0 || !tradeResult) return null;

  const entryY = yScale(tradeResult.entryPrice);
  const targetY = yScale(tradeResult.exitPrice);
  
  // Hardcode a stop line 3% below entry for visuals
  const stopY = yScale(tradeResult.entryPrice * 0.97);

  const lineProgress = spring({ frame: localFrame, fps, config: { damping: 15, stiffness: 100 } });
  const lineWidth = interpolate(lineProgress, [0, 1], [0, width]);

  return (
    <svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0, zIndex: 20 }}>
      {/* Entry Line */}
      <line x1={0} y1={entryY} x2={lineWidth} y2={entryY} stroke="#FFFFFF" strokeWidth={2} strokeDasharray="4 4" opacity={0.8} />
      <text x={lineWidth - 100} y={entryY - 10} fill="#FFFFFF" fontSize={24} fontFamily={theme.fontFamily} fontWeight="bold" opacity={lineProgress}>
        ENTRY
      </text>

      {/* Target Line */}
      <line x1={0} y1={targetY} x2={lineWidth} y2={targetY} stroke={theme.bullishColor} strokeWidth={3} />
      <text x={lineWidth - 100} y={targetY - 10} fill={theme.bullishColor} fontSize={24} fontFamily={theme.fontFamily} fontWeight="bold" opacity={lineProgress}>
        TARGET
      </text>

      {/* Stop Loss Line */}
      <line x1={0} y1={stopY} x2={lineWidth} y2={stopY} stroke={theme.bearishColor} strokeWidth={2} strokeDasharray="6 6" />
      <text x={lineWidth - 100} y={stopY + 25} fill={theme.bearishColor} fontSize={24} fontFamily={theme.fontFamily} fontWeight="bold" opacity={lineProgress}>
        STOP LOSS
      </text>
    </svg>
  );
}

function LoopOutroChapter({ theme, chapters }: { theme: any; chapters?: ChapterConfig[] }) {
  const { localFrame, duration } = useChapterTiming("loop", chapters);
  const { fps } = useVideoConfig();

  if (localFrame < 0) return null;

  const popAnim = spring({ frame: localFrame, fps, config: { damping: 10, stiffness: 120 } });
  const textScale = interpolate(popAnim, [0, 1], [0.5, 1]);
  const textOpacity = interpolate(popAnim, [0, 1], [0, 1]);

  // Fade everything to black at the end of the loop
  const toBlackFade = interpolate(localFrame, [duration - 15, duration], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ zIndex: 100 }}>
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          transform: `scale(${textScale})`,
          opacity: textOpacity,
        }}
      >
        <span
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: "white",
            background: "rgba(0,0,0,0.8)",
            padding: "20px 40px",
            borderRadius: 20,
            fontFamily: theme.fontFamily,
          }}
        >
          WOULD YOU TAKE THIS TRADE?
        </span>
      </div>
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "black", opacity: toBlackFade }} />
    </AbsoluteFill>
  );
}

// ------------------------------------------------------------
// ViralTradeBreakdown Template
// ------------------------------------------------------------
export const ViralTradeBreakdown: React.FC<TemplateProps> = ({ data }) => {
  const { width, height } = data.config.dimensions;
  const theme = data.config.theme;
  const padding: Padding = useMemo(() => ({ top: 200, right: 30, bottom: 200, left: 30 }), []);
  const chapters = data.routing.chapters;

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: theme.background,
        position: "relative",
        overflow: "hidden",
        fontFamily: theme.fontFamily,
      }}
    >
      {/* Background radial gradient to look premium */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 60%)`,
        }}
      />

      <HookChapter theme={theme} tradeResult={data.routing.tradeResult} chapters={chapters} />

      <DataProcessor series={data.financialData.series} width={width} height={height} padding={padding}>
        <ChartVisuals
          series={data.financialData.series}
          width={width}
          height={height}
          padding={padding}
          theme={theme}
          chapters={chapters}
          annotations={data.annotations}
        />
        <PayoffChapter
          tradeResult={data.routing.tradeResult}
          theme={theme}
          width={width}
          height={height}
          chapters={chapters}
          series={data.financialData.series}
        />
      </DataProcessor>

      {/* Asset info top left */}
      <div style={{ position: "absolute", top: 80, left: 50, zIndex: 10 }}>
        <div style={{ color: "white", fontSize: 40, fontWeight: "bold" }}>{data.financialData.asset.ticker}</div>
        <div style={{ color: theme.neutralColor, fontSize: 28 }}>{data.financialData.timeframe}</div>
      </div>

      <ProgressAndOverlay chapters={chapters} width={width} height={height} />
      <LoopOutroChapter theme={theme} chapters={chapters} />
    </div>
  );
};

export default ViralTradeBreakdown;
