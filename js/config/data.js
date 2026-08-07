// =============================================================================
// PROJECTS — single source of truth for the whole site
// =============================================================================
// File: js/config/data.js
//
// HOW TO ADD A PROJECT (usual case — text + links only)
//   1. Copy the TEMPLATE below.
//   2. Paste a new object into PROJECT_LIST (order = Archive order within a track).
//   3. Fill the fields. Omit anything you don't have yet (or set it to null).
//   4. Save and refresh. No other files needed.
//
// HOW TO ADD A VIDEO / DEMO LATER (e.g. SENTINEL)
//   Set `video: "https://youtu.be/…"` or `demo: "https://…"`.
//   The detail page grows a "Watch demo" / "Live demo" button automatically.
//
// HOW TO MAKE IT THE FLAGSHIP FOR A TRACK
//   Set `featured: true` on that project and `featured: false` on the previous
//   flagship for the same track (aim for one flagship per track).
//
// OPTIONAL LATER: custom 3D scan-bay model
//   Register a builder in js/utils/portalModels.js. Until then, unknown names
//   fall back to a generic flagship mesh — the dossier still works fine.
//
// URL SLUG
//   Derived from `name` (e.g. "SPLICE-ENGINE" → /startup/splice-engine/).
//
// ---------------------------------------------------------------------------
// TEMPLATE — copy from here ↓
// ---------------------------------------------------------------------------
//  {
//    name: "MY-PROJECT",              // required — title + URL slug
//    track: "systems",                // required — "systems" | "creative" | "startup"
//    featured: false,                 // true = flagship card on that track
//    status: "READY",                 // any label: READY | BUILD_PHASE | PLANNING | QUEUED …
//    desc: "Short card blurb for the list.",
//    details: "Longer engineering write-up shown on the detail page.",
//    tools: ["Skill A", "Skill B", "Stack item"],
//    repo: "https://github.com/you/repo",   // optional
//    demo: "https://you.github.io/demo/",   // optional — live site
//    video: "https://youtu.be/xxxxxxxxxxx", // optional — add anytime
//    related: [                            // optional — extra links
//      { label: "Write-up", url: "https://…" },
//    ],
//  },
// ---------------------------------------------------------------------------
// =============================================================================

function normalizeProject(p) {
  return {
    name: p.name,
    desc: p.desc || "",
    status: p.status || "QUEUED",
    track: p.track,
    featured: !!p.featured,
    tools: p.tools ? p.tools.slice() : [],
    details: p.details || "",
    demo: p.demo || null,
    repo: p.repo || null,
    video: p.video || null,
    related: p.related ? p.related.slice() : [],
  };
}

const PROJECT_LIST = [
  {
    name: "AEGIS",
    desc: "Networked rotating ultrasonic radar on ESP32-S3 — live WebSocket telemetry, onboard mission-control dashboard served from flash, custom KiCad PCB, and offline-capable firmware you can steer from any browser on the LAN.",
    status: "READY",
    track: "systems",
    featured: true,
    tools: [
      "ESP32-S3",
      "C / Arduino",
      "FreeRTOS timing",
      "WebSocket",
      "HTML/CSS/JS dashboard",
      "KiCad",
      "HC-SR04",
      "SG90 servo",
      "1602A LCD",
      "ArduinoJson",
    ],
    details:
      "AEGIS is a full stack embedded radar: Deneyap Kart 1A (ESP32-S3) drives a continuous 0–180° servo sweep with HC-SR04 ranging and a 1602A LCD for local status. The board hosts its own mission-control UI from flash — no external server — and streams frames over WebSocket with auto-reconnect. Operators get a phosphor-style scope, manual steer, threat-perimeter polygons, waterfall history, distance-scaled sonar audio, and runtime knobs for sweep bounds, step size, and detection threshold without reflashing. If Wi-Fi association fails, firmware falls back to offline radar mode so the hardware loop never dies. Schematics, PCB, wiring maps, and build photos live in the public repo so the system is rebuildable, not just demoable.",
    repo: "https://github.com/YousefAliAicha/aegis-embedded-system",
    demo: null,
    video: "https://youtu.be/lgbAfCLylXU",
  },
  {
    name: "SENTINEL",
    desc: "Bare-metal adaptive traffic-light FSM on ATmega328P — pedestrian preemption, LDR night mode, ultrasonic vehicle detect, and a multiplexed 7-segment countdown with zero blocking delays.",
    status: "READY",
    track: "systems",
    featured: false,
    tools: [
      "ATmega328P",
      "C++",
      "Arduino UNO R3",
      "Finite state machine",
      "HC-SR04",
      "LDR",
      "7-segment display",
      "Non-blocking timers",
      "ISR-friendly I/O",
    ],
    details:
      "SENTINEL treats the intersection as a real control problem, not a delay()-loop toy. Pedestrian buttons preempt the cycle, an LDR gates night mode, HC-SR04 senses approaching vehicles, and a multiplexed 7-segment display runs a live countdown — all on a fully non-blocking tick. State transitions are tuned against traffic-load patterns instead of a fixed period, so the machine adapts instead of blindly repeating. Firmware and docs are public for inspection and reuse.",
    repo: "https://github.com/YousefAliAicha/sentinel-arduino-firmware",
    demo: null,
    // When the demo video is ready, set e.g. video: "https://youtu.be/…"
    video: null,
  },
  {
    name: "BALLISTA",
    desc: "C++17 Monte Carlo ballistic simulator with RK4 integration, Mach-dependent drag, altitude density, coupled wind, closed-form validation, and CEP dispersion across 100 seeds.",
    status: "READY",
    track: "systems",
    featured: false,
    tools: [
      "C++17",
      "CMake",
      "RK4 integrator",
      "Monte Carlo",
      "Mach drag model",
      "CEP analysis",
      "Python",
      "Matplotlib",
      "Numerical validation",
    ],
    details:
      "Most student ballistic sims stop at a parabola. BALLISTA models the things that actually move impact points: Mach-dependent drag (not a flat Cd), altitude-dependent air density, and wind that couples into the drag calculation. Trajectories are integrated with RK4, validated against closed-form solutions, then stressed with Monte Carlo seeds to expose CEP dispersion — the spread is the product, not a single deterministic shot. Python/Matplotlib helpers visualize ensembles; the core builds cleanly with CMake.",
    repo: "https://github.com/YousefAliAicha/ballista",
    demo: null,
    video: null,
  },
  {
    name: "RAYBORN",
    desc: "Zero-dependency 2.5D DDA raycaster in pure JavaScript & Canvas — software rasterizer, distance fog, sliding doors, sprites, procedural assets, hit-scan combat, Web Audio, and mobile touch — rewritten from a Python engine for real-time web play.",
    status: "READY",
    track: "creative",
    featured: true,
    tools: [
      "JavaScript ES6",
      "HTML5 Canvas",
      "DDA raycasting",
      "Software rasterizer",
      "Web Audio API",
      "Procedural textures",
      "Z-buffer sprites",
      "AABB collision",
      "Touch + keyboard input",
      "GitHub Pages",
    ],
    details:
      "RAYBORN is a high-performance 2.5D DDA raycasting engine written in pure JavaScript and HTML5 Canvas with zero dependencies. It renders into a 320×200 software ImageData buffer and upscales with nearest-neighbor pixelation for crisp retro fidelity. Perpendicular wall distance removes fish-eye distortion; exponential distance fog and lighting decay sell depth; animated vertical sliding doors and depth-sorted sprite billboards (barrels, persons, keys, exit flag) share a column Z-buffer. Every brick, door, sprite, and weapon hand is generated procedurally at boot — no image network requests. Gameplay includes axis-separated sliding collision, key/vault progression, hit-scan weapons with recoil and muzzle flash, and Web Audio synthesized SFX, with WASD/mouse plus an adaptive on-screen D-pad for phones. It is a deliberate rewrite of the earlier Python/NumPy raycaster for real-time browser performance — not a line-by-line port — and ships as a live GitHub Pages demo.",
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
    desc: "Ground-up C++ / SDL2 engine scaffold — windowing, render loop, input, and the plumbing you usually inherit as a black box, built to be read and owned end to end.",
    status: "QUEUED",
    track: "creative",
    featured: false,
    tools: [
      "C++",
      "SDL2",
      "Render loop",
      "Input handling",
      "Window management",
      "Game architecture",
    ],
    details:
      "GENESIS is a small SDL2 engine written from scratch in C++: window creation, the render loop, input handling, and the scaffolding underneath a playable frame. The point is ownership — every subsystem is there to be understood, profiled, and extended, not dropped in as an opaque framework. Queued for deeper scene, asset, and gameplay layers once the core loop is locked.",
    repo: null,
    demo: null,
    video: null,
  },
  {
    name: "SPLICE-ENGINE",
    desc: "Adaptive three-tier MovieLens recommender — cold-start routing, item-KNN, LightGBM stacking, FAISS content embeddings, TMDB posters, and a Streamlit dashboard that logs feedback and audits its own predictions (RMSE 0.90 / 0.85).",
    status: "READY",
    track: "startup",
    featured: true,
    tools: [
      "Python",
      "MovieLens 100k/1M",
      "Collaborative filtering",
      "Item-KNN",
      "LightGBM",
      "FAISS",
      "TMDB API",
      "Streamlit",
      "Pandas / NumPy",
      "Model evaluation",
    ],
    details:
      "SPLICE-ENGINE is an adaptive movie recommender built on MovieLens-100k and 1M. Cold-start users get genre-affinity scoring; sparse histories route through item-KNN; once signal accumulates, a stacked LightGBM ensemble acts as meta-learner. Content embeddings are FAISS-indexed and hybridized with collaborative scores, with TMDB poster lookup for a usable UI. SVD++ was implemented, measured, and dropped after it underperformed the simpler tiers — the stack reflects evidence, not fashion. A Streamlit dashboard logs feedback and checks its own predictions. Test RMSE: 0.9026 on 100k, 0.8480 on 1M.",
    repo: "https://github.com/YousefAliAicha/splice-engine",
    demo: null,
    video: null,
  },
  {
    name: "NOORMAP",
    desc: "Real-time Syria disaster and weather map — NASA EONET/FIRMS feeds, Leaflet visualization, and a pipeline designed for government handoff, not a laptop-only demo.",
    status: "BUILD_PHASE",
    track: "startup",
    featured: false,
    tools: [
      "Python",
      "Leaflet.js",
      "NASA EONET",
      "NASA FIRMS",
      "GeoJSON",
      "Real-time feeds",
      "Mapping UX",
      "Handoff docs",
    ],
    details:
      "NOORMAP aggregates live disaster and weather signals for Syria — NASA EONET events and FIRMS fire detections — onto a Leaflet map meant for operational reading, not just a portfolio screenshot. Architecture choices favor a clean handoff: feeds, transforms, and map layers stay documented so another team (including government stakeholders) can inherit the pipeline without reverse-engineering a private notebook.",
    repo: null,
    demo: null,
    video: null,
  },
  {
    name: "PRINCIPIA",
    desc: "Interactive classical mechanics sandbox for IE University’s physics department — forces, motion, and energy as live, adjustable simulation instead of static lecture slides.",
    status: "QUEUED",
    track: "startup",
    featured: false,
    tools: [
      "JavaScript",
      "Physics simulation",
      "Canvas / DOM UI",
      "Pedagogy UX",
      "Real-time parameters",
      "IE University",
    ],
    details:
      "PRINCIPIA is a classical mechanics sandbox scoped for IE’s physics department: learners push on forces, motion, and energy in real time instead of watching fixed diagrams. The product goal is clarity under interaction — parameters you can twist, outcomes you can see — so the math becomes tangible in a lecture or lab setting. Queued pending deeper scenario packs and classroom packaging.",
    repo: null,
    demo: null,
    video: null,
  },
  {
    name: "NULLSHELL",
    desc: "POSIX C++ shell and REPL built to expose process spawn, pipes, and job control — the path from keystroke to syscall with nothing abstracted away.",
    status: "QUEUED",
    track: "startup",
    featured: false,
    tools: [
      "C++",
      "POSIX",
      "fork / exec",
      "Pipes",
      "Job control",
      "REPL design",
      "Systems programming",
    ],
    details:
      "NULLSHELL is a shell and REPL written in C++ against POSIX APIs. The brief is pedagogical brutality: process spawning, piping, and job control implemented so you can see exactly what happens between a keystroke and a syscall. Nothing is hidden behind a high-level framework — the point is to understand the machine, then grow features on top of that honesty.",
    repo: null,
    demo: null,
    video: null,
  },
];

// Normalize once so omitted optional fields never break the UI.
for (var _pi = 0; _pi < PROJECT_LIST.length; _pi++) {
  PROJECT_LIST[_pi] = normalizeProject(PROJECT_LIST[_pi]);
}

// -----------------------------------------------------------------------
// TRACK METADATA — label/sub-heading shown per track. Doesn't need to
// change often; project assignment lives entirely in PROJECT_LIST above.
// -----------------------------------------------------------------------
const TRACK_META = {
  systems: { label: "SYSTEMS", sub: "Embedded · Simulation · C++" },
  creative: { label: "CREATIVE TECH", sub: "Graphics · Tooling · Games" },
  startup: { label: "STARTUP", sub: "Product · Recommenders · Speed" },
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

// Every project, from every track, always — this is what ARCHIVE renders.
// Sorted by track order (systems, creative, startup); within a track,
// kept in PROJECT_LIST order.
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
