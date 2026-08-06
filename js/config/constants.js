// =============================================================================
// SHARED NUMERIC TUNABLES — camera, fog, animation, pager, doc, app knobs.
// Values must stay identical to the literals they replaced; rename only.
// =============================================================================

window.Gravitas = window.Gravitas || {};

window.Gravitas.Constants = {
  mobile: {
    maxWidthPx: 768,
    // Narrow alone is not enough — desktop split-screen is often <768px but
    // still has hover:hover + pointer:fine. Mobile experience requires no hover.
    query: "(max-width: 768px) and (hover: none)",
  },

  render: {
    pixelRatioCap: { mobile: 1.0, desktop: 1.25 },
  },

  // Look-preserving performance knobs (shadow quality, light caps, texture SS).
  perf: {
    shadowMapSize: 512,
    shadowFrustum: 12,
    shadowFar: 45,
    caveFillLights: 2,
    scanBayMaxFillLights: 4,
    emblemSupersample: 2,
    signSupersample: 2,
    textureAnisotropy: 4,
    waterfallHeightSegs: 6,
    poolGridSegs: 4,
  },

  hero: {
    clearColor: 0x0a0806,
    fog: {
      color: 0x0e0a07,
      density: 0.014,
    },
    camera: {
      near: 0.1,
      far: 120,
      defaultTransitionMs: 1600,
      wide: {
        pos: { x: 0, y: 2.6, z: 11.5 },
        look: { x: 0, y: 1.6, z: -4 },
        fov: 42,
      },
      gates: {
        pos: { x: 0, y: 3.1, z: 12.25 },
        look: { x: 0, y: -0.6, z: 2.0 },
        fov: 40,
        minHfovDeg: 62,
        maxFov: 78,
      },
      flyIn: {
        eyeYOffset: 1.35,
        approach: {
          posXScale: 0.35,
          posYOffset: 0.35,
          posZOffset: 5.2,
          lookZOffset: -1.5,
          fov: 48,
          durationMs: 900,
        },
        plunge: {
          posZOffset: 1.1,
          lookZOffset: -6,
          fov: 68,
          durationMs: 850,
          delayMs: 650,
        },
        doneDelayMs: 1650,
      },
      flyOut: {
        durationMs: 1400,
        doneDelayMs: 1500,
      },
    },
    motes: {
      count: { mobile: 30, desktop: 80 },
      size: 0.09,
      opacity: 0.5,
      color: 0xffdca8,
    },
    parallax: {
      maxX: 0.18,
      maxY: 0.12,
      damping: 0.05,
    },
    hoverNudge: {
      damping: 0.08,
      xScale: 0.15,
      zOffset: -0.45,
      lookXFactor: 1.2,
      parallaxLookFactor: 0.5,
    },
    breathe: {
      speed: 0.00035,
      amount: 0.05,
    },
  },

  scanBay: {
    clearColor: 0x0a0908,
    clearAlpha: 0.0,
    fog: {
      color: 0xd8a86a,
      density: 0.0055,
    },
    camera: {
      near: 0.1,
      far: 100,
      home: {
        pos: {
          mobile: { x: 0, y: 0.82, z: 2.55 },
          desktop: { x: 0, y: 1.05, z: 4.2 },
        },
        look: {
          mobile: { x: 0, y: 0.48, z: 0 },
          desktop: { x: 0, y: 0.6, z: 0 },
        },
        fov: { mobile: 50, desktop: 42 },
      },
      focus: {
        pos: { x: 0, y: 0.15, z: 2.0 },
        lookY: 0.05,
        minSize: 0.25,
        depthFactor: 0.6,
        distancePad: 1.7,
      },
    },
    motes: {
      count: { mobile: 20, desktop: 50 },
      size: 0.045,
      opacity: 0.7,
      color: 0xffdca8,
    },
    modelMaxDim: { mobile: 1.85, desktop: 1.45 },
    spinRate: 0.012,
    maxCachedHoverModels: 4,
  },

  pager: {
    zoomCooldownMs: 1450,
    portalClearMs: 520,
    portalReverseClearMs: 520,
    wheelDeltaThreshold: 12,
    touchSwipePx: 40,
  },

  doc: {
    typeDurationMs: 5000,
  },

  app: {
    stageTopThreshold: 4,
    settleMs: 120,
    docPlayDelayMs: 420,
    stageRelockDelayMs: 650,
    intersectionThreshold: 0.2,
    sidebar: {
      expandedW: 290,
      collapsedW: 76,
      fadeOutDuration: 0.35,
      fadeStagger: 0.008,
      widthDuration: 1.3,
      toggleAt: 0.4,
      fadeInDuration: 0.5,
      fadeInAt: 0.75,
    },
  },
};
