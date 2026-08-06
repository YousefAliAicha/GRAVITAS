// =============================================================================
// PROJECT DATA — single source of truth
// =============================================================================
// Every project lives in PROJECT_LIST below, exactly once. Everything else
// on the page (track views + Archive) is derived from this one list, so you
// never have to keep two copies of a project in sync.
//
// TO MOVE A PROJECT TO A DIFFERENT PATH:
//   Change its `track` field to one of: "systems", "creative", "startup"
//
// TO SHOW/HIDE A PROJECT ON ITS TRACK'S MAIN VIEW (max 3 shown per track):
//   Set `featured: true` / `featured: false`
//   It ALWAYS shows in Archive either way — nothing is ever fully hidden,
//   only pulled from the spotlight.
//
// TO UPDATE A PROJECT'S STATUS:
//   Change `status` to any short label. Common ones in use:
//     "BUILD_PHASE"   — actively being built
//     "READY"         — finished / shippable
//     "PLANNING"      — scoped but not started
//     "QUEUED"        — next up after current work
//   These are just display strings, not enforced — use whatever reads right.
// =============================================================================

const PROJECT_LIST = [
  {
    name: "AEGIS",
    desc: "ESP32-S3 networked rotating ultrasonic radar",
    status: "BUILD_PHASE",
    track: "systems",
    featured: true,
    tools: ["ESP32-S3", "C++", "PlatformIO", "FreeRTOS"],
    details:
      "Rotating ultrasonic radar built on an ESP32-S3, streaming live telemetry over WebSocket to a mission-control dashboard served straight from the board's own flash — no external server. Runs on a custom KiCad PCB. Full documentation, wiring diagrams, and build photos live in the repo.",
    demo: null,
  },
  {
    name: "SENTINEL",
    desc: "ATmega328P adaptive traffic-light FSM",
    status: "BUILD_PHASE",
    track: "systems",
    featured: true,
    tools: ["ATmega328P", "C", "AVR-GCC"],
    details:
      "Adaptive traffic-light finite state machine on bare-metal ATmega328P. Pedestrian preemption, LDR-gated night mode, HC-SR04 vehicle detection, and a multiplexed 7-segment countdown display, all running on a custom KiCad PCB. Timing and state transitions are hand-tuned against real traffic-load patterns, not just a fixed cycle.",
    demo: null,
  },
  {
    name: "BALLISTA",
    desc: "Monte Carlo ballistic simulator, C++",
    status: "QUEUED",
    track: "systems",
    featured: true,
    tools: ["C++", "Monte Carlo methods"],
    details:
      "Monte Carlo ballistic simulator in C++. Models trajectory dispersion under variable atmospheric and launch conditions rather than solving a single deterministic path — the point is the spread, not the shot.",
    demo: null,
  },
  {
    name: "RAYBORN",
    desc: "JavaScript raycaster, ported from Python engine",
    status: "QUEUED",
    track: "creative",
    featured: true,
    tools: ["JavaScript", "Canvas API", "Python (original)"],
    details:
      "JavaScript raycaster ported from an earlier Python engine, rebuilt on the Canvas API. The port forced a rewrite of the core raycasting math for real-time performance rather than a line-by-line translation.",
    demo: null,
  },
  {
    name: "GENESIS",
    desc: "SDL2 engine",
    status: "QUEUED",
    track: "creative",
    featured: true,
    tools: ["C++", "SDL2"],
    details:
      "A small SDL2 engine built from the ground up in C++ — window/render loop, input handling, and the scaffolding underneath it, built to be understood end to end rather than dropped in as a black box.",
    demo: null,
  },
  {
    name: "SPLICE-ENGINE",
    desc: "Three-tier movie recommender, MovieLens",
    status: "BUILD_PHASE",
    track: "creative",
    featured: true,
    tools: ["Python", "MovieLens dataset", "Collaborative filtering"],
    details:
      "Three-tier movie recommender on MovieLens-100k/1M: genre-affinity scoring for cold-start users, item-KNN for sparse histories, and a stacked LightGBM ensemble as meta-learner once there's enough signal. SVD++ was tried and dropped after it underperformed the simpler tiers. Served through a Streamlit dashboard with TMDB poster lookup and FAISS-indexed content embeddings. Test RMSE: 0.9026 on 100k, 0.8480 on 1M.",
    demo: null,
  },
  {
    name: "NOORMAP",
    desc: "Real-time Syria disaster/weather map, gov handoff",
    status: "BUILD_PHASE",
    track: "startup",
    featured: true,
    tools: ["React", "Node.js", "Mapping API", "Real-time data feeds"],
    details:
      "Real-time disaster and weather map for Syria, built on Python and Leaflet.js, pulling live feeds from NASA EONET and FIRMS. Built with an eventual handoff to government use in mind — the pipeline has to stay legible to whoever inherits it, not just work on my machine.",
    demo: null,
  },
  {
    name: "PRINCIPIA",
    desc: "Classical mechanics sandbox for IE physics dept.",
    status: "QUEUED",
    track: "startup",
    featured: true,
    tools: ["JavaScript", "Physics simulation"],
    details:
      "Classical mechanics sandbox built for IE's physics department — an interactive JavaScript simulation meant to make forces, motion, and energy visible and adjustable in real time instead of static diagrams in a slide deck.",
    demo: null,
  },
  {
    name: "NULLSHELL",
    desc: "C++ shell / REPL",
    status: "QUEUED",
    track: "startup",
    featured: true,
    tools: ["C++", "POSIX"],
    details:
      "A shell and REPL written in C++ against POSIX, built to understand exactly what a shell is doing between keystroke and syscall — process spawning, piping, and job control, with nothing abstracted away.",
    demo: null,
  },
];

// -----------------------------------------------------------------------
// TRACK METADATA — label/sub-heading shown per track. Doesn't need to
// change often; project assignment lives entirely in PROJECT_LIST above.
// -----------------------------------------------------------------------
const TRACK_META = {
  systems: { label: "SYSTEMS", sub: "Embedded · Simulation · C++" },
  creative: { label: "CREATIVE TECH", sub: "Graphics · Tooling · Games" },
  startup: { label: "STARTUP", sub: "Product · Full-Stack · Speed" },
  // Secret openings (Konami) — route to doc pages, not project tracks
  essays: {
    label: "PERSONAL ESSAYS",
    sub: "Notes · Reflections",
    secret: true,
  },
  favorites: {
    label: "FAVORITE THINGS",
    sub: "Taste · Texture · Time",
    secret: true,
  },
};


// -----------------------------------------------------------------------
// Derived data — do not hand-edit below this line. TRACKS and
// ARCHIVE_PROJECTS are both computed from PROJECT_LIST + TRACK_META above.
// -----------------------------------------------------------------------

const TRACKS = Object.keys(TRACK_META).reduce(function (acc, key) {
  var meta = TRACK_META[key];
  // Secret keys are doc pages, not project lists
  var projects = meta.secret
    ? []
    : PROJECT_LIST.filter(function (p) {
        return p.track === key && p.featured;
      });
  acc[key] = {
    label: meta.label,
    sub: meta.sub,
    secret: !!meta.secret,
    projects: projects,
  };
  return acc;
}, {});

// Every project, from every track, always — this is what ARCHIVE_ renders.
// Sorted by track order (systems, creative, startup) so related projects
// group together; within a track, kept in PROJECT_LIST order.
const ARCHIVE_PROJECTS = PROJECT_LIST.map(function (p) {
  return {
    name: p.name,
    desc: p.desc,
    status: p.status,
    featured: !!p.featured,
    track: p.track,
    trackLabel: TRACK_META[p.track] ? TRACK_META[p.track].label : p.track,
    tools: p.tools || [],
    details: p.details || "",
    demo: p.demo || null,
  };
});
