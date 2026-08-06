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
//
// OPTIONAL PROOF LINKS (shown in project detail):
//   repo    — GitHub repository URL
//   demo    — live demo URL (web app / Pages)
//   video   — demo video URL (YouTube, etc.)
//   related — [{ label, url }] for sibling repos / writeups
// =============================================================================

const PROJECT_LIST = [
  {
    name: "AEGIS",
    desc: "ESP32-S3 networked rotating ultrasonic radar with onboard mission-control dashboard",
    status: "READY",
    track: "systems",
    featured: true,
    tools: ["ESP32-S3", "C", "WebSocket", "KiCad", "HC-SR04"],
    details:
      "Rotating ultrasonic radar on a Deneyap Kart 1A (ESP32-S3): continuous 0–180° servo sweep, HC-SR04 ranging, 1602A LCD, and a full mission-control dashboard served from the board's own flash — no external server. Live telemetry over WebSocket (auto-reconnect), manual steer mode, threat-perimeter polygons, waterfall history, and sonar audio scaled by distance. Firmware knobs (sweep bounds, step, threshold) adjust at runtime from the browser. Offline fallback keeps the radar loop alive if Wi-Fi fails. Custom KiCad schematic/PCB plus full wiring docs in the repo.",
    repo: "https://github.com/YousefAliAicha/aegis-embedded-system",
    demo: null,
    video: "https://youtu.be/lgbAfCLylXU",
  },
  {
    name: "SENTINEL",
    desc: "ATmega328P adaptive traffic-light FSM — pedestrian, night mode, vehicle detect",
    status: "READY",
    track: "systems",
    featured: true,
    tools: ["ATmega328P", "C++", "Arduino UNO", "HC-SR04", "LDR"],
    details:
      "Adaptive traffic-light finite state machine on Arduino UNO R3 / ATmega328P. Pedestrian preemption, LDR-gated night mode, HC-SR04 vehicle detection, and a multiplexed 7-segment countdown — fully non-blocking, no delay()-stuck loops. Timing and transitions are tuned against real traffic-load patterns rather than a fixed cycle. Firmware and docs live in the public repo.",
    repo: "https://github.com/YousefAliAicha/sentinel-arduino-firmware",
    demo: null,
    video: null,
  },
  {
    name: "BALLISTA",
    desc: "C++ Monte Carlo ballistic simulator — RK4, Mach drag, CEP dispersion",
    status: "READY",
    track: "systems",
    featured: true,
    tools: ["C++17", "CMake", "Monte Carlo", "RK4", "Python viz"],
    details:
      "Monte Carlo ballistic trajectory simulator in C++17. RK4 integration with Mach-dependent drag, altitude-dependent air density, and wind that couples into the drag model — not a single flat Cd parabola. Validates the integrator against closed-form solutions and checks Monte Carlo stability across 100 independent seeds; CEP dispersion is the point, not one deterministic shot. Visualization helpers in Python/Matplotlib. Build with CMake.",
    repo: "https://github.com/YousefAliAicha/ballista",
    demo: null,
    video: null,
  },
  {
    name: "RAYBORN",
    desc: "Zero-dependency 2.5D DDA raycaster — JS Canvas, fog, doors, Web Audio",
    status: "READY",
    track: "creative",
    featured: true,
    tools: ["JavaScript", "Canvas API", "Web Audio", "DDA"],
    details:
      "High-performance 2.5D DDA raycasting engine in pure JavaScript & HTML5 Canvas — zero dependencies. 320×200 software rasterizer with nearest-neighbor upscale, perpendicular wall distance (no fish-eye), exponential distance fog, animated sliding doors, depth-sorted sprite billboards, procedural textures/sprites (no image assets over the network), axis-separated collision, key/vault progression, hit-scan weapon with Web Audio SFX, plus mouse/keyboard and mobile touch controls. Ported and rewritten from the Python/NumPy original for real-time web performance — not a line-by-line translation.",
    repo: "https://github.com/YousefAliAicha/Rayborn",
    demo: "https://yousefaliaicha.github.io/Rayborn/",
    video: null,
    related: [
      {
        label: "Python original · Raycaster-Engine",
        url: "https://github.com/YousefAliAicha/Raycaster-Engine",
      },
    ],
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
    repo: null,
    demo: null,
    video: null,
  },
  {
    name: "SPLICE-ENGINE",
    desc: "Three-tier MovieLens recommender with Streamlit dashboard",
    status: "READY",
    track: "creative",
    featured: true,
    tools: ["Python", "LightGBM", "FAISS", "Streamlit", "MovieLens"],
    details:
      "Adaptive movie recommender on MovieLens-100k/1M: genre-affinity scoring for cold-start, item-KNN for sparse histories, and a stacked LightGBM ensemble as meta-learner once there's enough signal. Content-embedding hybridization with FAISS-indexed lookup and TMDB poster fetch. SVD++ was tried and dropped after it underperformed the simpler tiers. Streamlit dashboard logs feedback and checks its own predictions. Test RMSE: 0.9026 on 100k, 0.8480 on 1M.",
    repo: "https://github.com/YousefAliAicha/splice-engine",
    demo: null,
    video: null,
  },
  {
    name: "NOORMAP",
    desc: "Real-time Syria disaster/weather map, gov handoff",
    status: "BUILD_PHASE",
    track: "startup",
    featured: true,
    tools: ["Python", "Leaflet.js", "NASA EONET", "FIRMS"],
    details:
      "Real-time disaster and weather map for Syria, built on Python and Leaflet.js, pulling live feeds from NASA EONET and FIRMS. Built with an eventual handoff to government use in mind — the pipeline has to stay legible to whoever inherits it, not just work on my machine.",
    repo: null,
    demo: null,
    video: null,
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
    repo: null,
    demo: null,
    video: null,
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
    repo: null,
    demo: null,
    video: null,
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
    repo: p.repo || null,
    video: p.video || null,
    related: p.related || [],
  };
});
