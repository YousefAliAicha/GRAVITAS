// =========================================================================
// AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY
// Source of truth is js/scenes/hero/*.js — edit those, then run:
//   node js/scenes/build-hero.js
// =========================================================================

// ---- 01.textures.js ----
(function () {
  // ---- Dependency guard ----
  // If the Three.js CDN failed to load, every THREE.* call in this file
  // (several run immediately at the top level, not just inside deferred
  // functions) would throw "THREE is not defined" right away, leaving
  // #hero-bay blank with no explanation and window.Gravitas.Hero
  // undefined — so any other code calling its methods later would throw
  // a second, unrelated-looking error too. Caught here at the source.
  if (typeof THREE === "undefined") {
    console.error(
      "GravitasHero: THREE.js failed to load — hero scene cannot initialize.",
    );
    var heroFallbackEl = document.getElementById("hero-bay");
    if (heroFallbackEl) {
      heroFallbackEl.innerHTML =
        '<div class="scene-load-error">3D scene unavailable — check your connection and refresh.</div>';
    }
    window.Gravitas = window.Gravitas || {};
    window.Gravitas.Hero = {
      toGates: function () {},
      toWide: function () {},
      // Call done so pager enter/leave cannot stick busy forever
      flyIntoGate: function (_track, done) {
        if (typeof done === "function") done();
      },
      flyOutOfGate: function (done) {
        if (typeof done === "function") done();
      },
      setHover: function () {},
      setInteractive: function () {},
      onGateClick: null,
      pause: function () {},
      resume: function () {},
      destroyBootLogo: function () {},
    };
    return;
  }

  // =========================================================================
  // PROCEDURAL BRICK & MOSAIC CANVAS TEXTURE GENERATORS
  // =========================================================================

  function createBrickTexture(size) {
    size = size || 256;
    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "#18130e";
    ctx.fillRect(0, 0, size, size);

    var rows = 12;
    var cols = 6;
    var rowHeight = size / rows;
    var colWidth = size / cols;
    var mortar = 2;

    for (var r = 0; r < rows; r++) {
      var y = r * rowHeight;
      var xOffset = r % 2 === 0 ? 0 : -colWidth / 2;

      for (var c = -1; c <= cols + 1; c++) {
        var x = c * colWidth + xOffset;

        var baseR = Math.floor(180 + Math.random() * 35);
        var baseG = Math.floor(baseR * (0.72 + Math.random() * 0.08));
        var baseB = Math.floor(baseR * (0.42 + Math.random() * 0.08));

        ctx.fillStyle = "rgb(" + baseR + "," + baseG + "," + baseB + ")";
        ctx.fillRect(
          x + mortar,
          y + mortar,
          colWidth - mortar * 2,
          rowHeight - mortar * 2,
        );

        for (var n = 0; n < 15; n++) {
          var nx = x + mortar + Math.random() * (colWidth - mortar * 2);
          var ny = y + mortar + Math.random() * (rowHeight - mortar * 2);
          var noiseVal = Math.floor(baseR + (Math.random() - 0.5) * 45);
          ctx.fillStyle =
            "rgba(" +
            noiseVal +
            "," +
            Math.floor(noiseVal * 0.7) +
            "," +
            Math.floor(noiseVal * 0.4) +
            ", 0.22)";
          ctx.fillRect(nx, ny, 2, 2);
        }
      }
    }

    var texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  function createMosaicTexture(size) {
    size = size || 256;
    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "#0d0a07";
    ctx.fillRect(0, 0, size, size);

    var tiles = 16;
    var tileSize = size / tiles;
    var gap = 1.2;

    var colors = ["#d1a14c", "#105ba3", "#8a2e1f", "#e8ddc7", "#2bb8b0"];

    for (var r = 0; r < tiles; r++) {
      for (var c = 0; c < tiles; c++) {
        var x = c * tileSize;
        var y = r * tileSize;

        var colorIdx = (r + c) % colors.length;
        if ((r % 4 === 0 || c % 4 === 0) && (r + c) % 2 === 0) {
          colorIdx = 0;
        }

        ctx.fillStyle = colors[colorIdx];
        ctx.fillRect(x + gap, y + gap, tileSize - gap * 2, tileSize - gap * 2);

        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(x + gap, y + gap, tileSize - gap * 2, 1.5);
      }
    }

    var texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  function createGunmetalTexture(size) {
    size = size || 256;
    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");

    var grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, "#565d66");
    grad.addColorStop(0.42, "#33383f");
    grad.addColorStop(0.58, "#23272d");
    grad.addColorStop(1, "#15171b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    for (var i = 0; i < size * 0.6; i++) {
      var y = Math.random() * size;
      ctx.strokeStyle =
        Math.random() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y + (Math.random() * 3 - 1.5));
      ctx.stroke();
    }

    var vig = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.15,
      size / 2,
      size / 2,
      size * 0.72,
    );
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, size, size);

    var texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  var brickTex = createBrickTexture(256);
  var mosaicTex = createMosaicTexture(256);
  var gunmetalTex = createGunmetalTexture(256);

  // MATERIAL SYSTEM — exaggerate family differences:
  // stone/brick chalky, metals mirror-like, foliage muted for hierarchy.
  var basaltMat = new THREE.MeshStandardMaterial({
    color: 0xb88b4a,
    roughness: 0.92,
    metalness: 0.02,
    map: brickTex,
    bumpMap: brickTex,
    bumpScale: 0.028,
  });

  var goldMat = new THREE.MeshStandardMaterial({
    color: 0xd1a14c,
    roughness: 0.18,
    metalness: 0.95,
  });

  var lapisMat = new THREE.MeshStandardMaterial({
    color: 0x105ba3,
    roughness: 0.22,
    metalness: 0.55,
  });

  var mosaicTileMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.55,
    metalness: 0.12,
    map: mosaicTex,
    bumpMap: mosaicTex,
    bumpScale: 0.018,
  });

  var lapisAccentMat = new THREE.MeshStandardMaterial({
    color: 0x105ba3,
    roughness: 0.24,
    metalness: 0.5,
    emissive: 0x082e5e,
    emissiveIntensity: 0.3,
  });

  var darkIronMat = new THREE.MeshStandardMaterial({
    color: 0x1a1614,
    roughness: 0.38,
    metalness: 0.92,
  });

  var blackGlassMaterial = new THREE.MeshStandardMaterial({
    color: 0x060709,
    roughness: 0.1,
    metalness: 0.3,
  });

  var gateGlassMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0d10,
    roughness: 0.06,
    metalness: 0.2,
    transparent: true,
    opacity: 0.58,
  });

  var waterlineMat = new THREE.MeshStandardMaterial({
    color: 0x3df0e6,
    roughness: 0.15,
    metalness: 0.7,
    emissive: 0x1a8c87,
    emissiveIntensity: 0.65,
    transparent: true,
    opacity: 0.75,
  });

  var foliageMatA = new THREE.MeshStandardMaterial({
    color: 0x2a3a28,
    roughness: 0.95,
    metalness: 0.0,
    flatShading: true,
  });

  var foliageMatB = new THREE.MeshStandardMaterial({
    color: 0x354830,
    roughness: 0.92,
    metalness: 0.0,
    flatShading: true,
  });

  var foliageMatGold = new THREE.MeshStandardMaterial({
    color: 0x5a4a28,
    roughness: 0.88,
    metalness: 0.08,
    flatShading: true,
  });

  function createSandNoiseTexture(size) {
    size = size || 128;
    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");

    var imgData = ctx.createImageData(size, size);
    var data = imgData.data;
    for (var i = 0; i < data.length; i += 4) {
      var val = Math.floor(205 + Math.random() * 40);
      data[i] = val;
      data[i + 1] = Math.floor(val * 0.88);
      data[i + 2] = Math.floor(val * 0.7);
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    var texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    return texture;
  }

  var sandGrainTex = createSandNoiseTexture(128);

  var sandyFloorMat = new THREE.MeshStandardMaterial({
    color: 0xc8b288,
    roughness: 0.94,
    metalness: 0.02,
    map: sandGrainTex,
    bumpMap: sandGrainTex,
    bumpScale: 0.022,
  });
  

// ---- 02.environment.js ----
var bootLogo = mountStarLogo(document.getElementById("boot-logo"));

var C = window.Gravitas.Constants;

// MOBILE — skip the full hero WebGL scene. #mobile-landing replaces the
// gate experience; pager.js takes its instant goToApp/goToLanding path
// because flyIntoGate / flyOutOfGate are deliberately absent here.
var IS_MOBILE =
  typeof window.Gravitas.isMobileExperience === "function"
    ? window.Gravitas.isMobileExperience()
    : typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: " + C.mobile.maxWidthPx + "px) and (hover: none)").matches;

if (IS_MOBILE) {
  window.Gravitas = window.Gravitas || {};
  window.Gravitas.Hero = {
    toGates: function () {},
    toWide: function () {},
    setHover: function () {},
    setInteractive: function () {},
    onGateClick: null,
    pause: function () {},
    resume: function () {},
    destroyBootLogo: function () {
      if (bootLogo) {
        bootLogo.destroy();
        bootLogo = null;
      }
    },
  };
  return;
}

var heroLogo = mountStarLogo(document.getElementById("hero-topbar-logo"));

var bayEl = document.getElementById("hero-bay");

// Desktop path only — mobile early-returns above. Keep the flag so later
// hero/*.js quality branches stay valid (always false here).
var IS_MOBILE = false;
var scene = new THREE.Scene();
var camWideCfg = C.hero.camera.wide;
var camera = new THREE.PerspectiveCamera(
  camWideCfg.fov,
  bayEl.clientWidth / (bayEl.clientHeight || 1),
  C.hero.camera.near,
  C.hero.camera.far,
);
camera.position.set(camWideCfg.pos.x, camWideCfg.pos.y, camWideCfg.pos.z);
camera.lookAt(camWideCfg.look.x, camWideCfg.look.y, camWideCfg.look.z);

var renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,
    IS_MOBILE ? C.render.pixelRatioCap.mobile : C.render.pixelRatioCap.desktop,
  ),
);
renderer.setSize(bayEl.clientWidth, bayEl.clientHeight);
renderer.setClearColor(C.hero.clearColor);
renderer.shadowMap.enabled = !IS_MOBILE;
renderer.shadowMap.type = THREE.PCFShadowMap;
bayEl.appendChild(renderer.domElement);

// Freeze shadow maps after first bake; re-enable briefly around camera moves.
var shadowBakePending = true;
function requestShadowBake() {
  if (!renderer.shadowMap.enabled) return;
  shadowBakePending = true;
  renderer.shadowMap.autoUpdate = true;
}
function settleShadowMap() {
  if (!renderer.shadowMap.enabled || !shadowBakePending) return;
  renderer.shadowMap.needsUpdate = true;
  renderer.shadowMap.autoUpdate = false;
  shadowBakePending = false;
}

scene.fog = new THREE.FogExp2(C.hero.fog.color, C.hero.fog.density);

function jaggedRockGeometry(baseGeo, roughness, seed) {
  var pos = baseGeo.attributes.position;
  var v = new THREE.Vector3();
  for (var i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    var n = v.clone().normalize();
    var noise =
      Math.sin(n.x * 3.1 + seed) * Math.cos(n.y * 2.7 + seed * 1.3) +
      Math.sin(n.z * 4.4 - seed * 0.7) * 0.6 +
      Math.sin((n.x + n.z) * 7.3 + seed * 2.1) * 0.35 +
      Math.sin((n.y - n.x) * 9.6 + seed * 3.3) * 0.2;
    var disp = 1 + noise * roughness;
    v.multiplyScalar(disp);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  baseGeo.computeVertexNormals();
  return baseGeo;
}

// Bakes each entry's geometry into world-space (position/rotation/scale)
// and concatenates them into a single BufferGeometry. Used only for static,
// never-moving decorative rock clusters that share one material, so this
// collapses many draw calls into one with zero visual difference.
function mergeStaticGeometries(entries) {
  var mat4 = new THREE.Matrix4();
  var totalVerts = 0;
  for (var i = 0; i < entries.length; i++) {
    totalVerts += entries[i].geometry.attributes.position.count;
  }
  var mergedPositions = new Float32Array(totalVerts * 3);
  var indices = [];
  var vertOffset = 0;
  var v = new THREE.Vector3();

  for (i = 0; i < entries.length; i++) {
    var e = entries[i];
    var geo = e.geometry;
    mat4.compose(
      e.position || new THREE.Vector3(),
      new THREE.Quaternion().setFromEuler(
        e.rotation || new THREE.Euler(0, 0, 0),
      ),
      e.scale || new THREE.Vector3(1, 1, 1),
    );

    var posAttr = geo.attributes.position;
    for (var p = 0; p < posAttr.count; p++) {
      v.fromBufferAttribute(posAttr, p);
      v.applyMatrix4(mat4);
      mergedPositions[(vertOffset + p) * 3] = v.x;
      mergedPositions[(vertOffset + p) * 3 + 1] = v.y;
      mergedPositions[(vertOffset + p) * 3 + 2] = v.z;
    }

    var geoIndex = geo.getIndex();
    if (geoIndex) {
      for (var k = 0; k < geoIndex.count; k++) {
        indices.push(geoIndex.getX(k) + vertOffset);
      }
    } else {
      for (var k2 = 0; k2 < posAttr.count; k2++) {
        indices.push(k2 + vertOffset);
      }
    }

    vertOffset += posAttr.count;
    geo.dispose();
  }

  var merged = new THREE.BufferGeometry();
  merged.setAttribute(
    "position",
    new THREE.BufferAttribute(mergedPositions, 3),
  );
  merged.setIndex(indices);
  merged.computeVertexNormals();
  return merged;
}

function buildCaveEnvironment(structureBoundingRadius, parentScene) {
  var caveGroup = new THREE.Group();
  var caveRadius = Math.max(58, structureBoundingRadius * 4.6);

  var cavernMat = new THREE.MeshStandardMaterial({
    color: 0x0c0908,
    roughness: 0.99,
    metalness: 0.0,
    flatShading: true,
    side: THREE.BackSide,
  });

  var cavernShadowMat = new THREE.MeshStandardMaterial({
    color: 0x0a0807,
    roughness: 1.0,
    metalness: 0.0,
    flatShading: true,
    side: THREE.BackSide,
  });

  var mountainRockMat = new THREE.MeshStandardMaterial({
    color: 0x15100d,
    roughness: 0.98,
    metalness: 0.0,
    flatShading: true,
  });

  var mountainRockMatFar = new THREE.MeshStandardMaterial({
    color: 0x0d0b0a,
    roughness: 1.0,
    metalness: 0.0,
    flatShading: true,
  });

  var stalactiteMat = new THREE.MeshStandardMaterial({
    color: 0x18120e,
    roughness: 0.96,
    metalness: 0.0,
    flatShading: true,
  });

  var shellGeo = jaggedRockGeometry(
    new THREE.SphereGeometry(
      caveRadius,
      IS_MOBILE ? 22 : 36,
      IS_MOBILE ? 12 : 20,
    ),
    0.16,
    3.7,
  );
  var shell = new THREE.Mesh(shellGeo, cavernMat);
  shell.position.set(0, 9.5, -9.0);
  shell.scale.set(1.08, 0.92, 1.12);
  shell.receiveShadow = false;
  caveGroup.add(shell);

  var innerShellGeo = jaggedRockGeometry(
    new THREE.SphereGeometry(
      caveRadius * 0.82,
      IS_MOBILE ? 18 : 28,
      IS_MOBILE ? 10 : 18,
    ),
    0.2,
    8.1,
  );
  var innerShell = new THREE.Mesh(innerShellGeo, cavernShadowMat);
  innerShell.position.set(0, 7.4, -11.0);
  innerShell.scale.set(1.02, 0.86, 1.06);
  innerShell.receiveShadow = false;
  caveGroup.add(innerShell);

  // Peaks, walls and stalactites are fully static (never animated), so
  // instead of one Mesh + one draw call each (33 total), their baked
  // world-space geometry is merged per material/shadow-group into just
  // four meshes. Same positions, rotations and visuals, far fewer draw calls.
  var peakCount = 12;
  var peakEntriesNear = [];
  var peakEntriesFar = [];
  for (var pI = 0; pI < peakCount; pI++) {
    var angle = -Math.PI * 0.72 + (pI / (peakCount - 1)) * Math.PI * 1.44;
    var ringRadius = 30 + Math.sin(pI * 1.7) * 6 + (pI % 3) * 2.5;
    var peakHeight = 20 + Math.sin(pI * 2.3) * 8 + Math.random() * 6;
    var peakBaseR = 5 + Math.random() * 3.5;

    var peakGeo = jaggedRockGeometry(
      new THREE.ConeGeometry(peakBaseR, peakHeight, 5, 2),
      0.28,
      pI * 1.37 + 1.1,
    );
    var isFar = ringRadius > 34;
    var entry = {
      geometry: peakGeo,
      position: new THREE.Vector3(
        Math.sin(angle) * ringRadius,
        peakHeight * 0.32 - 2.5,
        -Math.cos(angle) * ringRadius - 6,
      ),
      rotation: new THREE.Euler(
        0,
        angle + (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 0.08,
      ),
    };
    (isFar ? peakEntriesFar : peakEntriesNear).push(entry);
  }

  if (peakEntriesNear.length) {
    var peaksNearMesh = new THREE.Mesh(
      mergeStaticGeometries(peakEntriesNear),
      mountainRockMat,
    );
    peaksNearMesh.castShadow = true;
    peaksNearMesh.receiveShadow = true;
    caveGroup.add(peaksNearMesh);
  }
  if (peakEntriesFar.length) {
    var peaksFarMesh = new THREE.Mesh(
      mergeStaticGeometries(peakEntriesFar),
      mountainRockMatFar,
    );
    peaksFarMesh.castShadow = false;
    peaksFarMesh.receiveShadow = false;
    caveGroup.add(peaksFarMesh);
  }

  var wallSegments = [
    { x: -26, y: 6.0, z: -28, s: 8.5, ry: 0.18 },
    { x: 26, y: 5.7, z: -24, s: 8.0, ry: -0.16 },
    { x: -18, y: 3.2, z: 22, s: 7.0, ry: -0.22 },
    { x: 20, y: 3.6, z: 20, s: 7.4, ry: 0.2 },
    { x: 0, y: 9.0, z: -34, s: 11.0, ry: 0.0 },
  ];

  var wallEntries = wallSegments.map(function (seg, idx) {
    return {
      geometry: jaggedRockGeometry(
        new THREE.IcosahedronGeometry(seg.s, IS_MOBILE ? 0 : 1),
        0.35,
        idx * 4.4 + 2.3,
      ),
      position: new THREE.Vector3(seg.x, seg.y, seg.z),
      rotation: new THREE.Euler(0, seg.ry, 0),
      scale: new THREE.Vector3(1, 1.6, 0.9),
    };
  });
  var wallsMesh = new THREE.Mesh(
    mergeStaticGeometries(wallEntries),
    cavernShadowMat,
  );
  wallsMesh.castShadow = false;
  wallsMesh.receiveShadow = false;
  caveGroup.add(wallsMesh);

  var stalCount = 16;
  var stalEntries = [];
  for (var sI = 0; sI < stalCount; sI++) {
    var sx = (Math.random() - 0.5) * 52;
    var sz = -6 + (Math.random() - 0.5) * 44;
    var sLen = 2.2 + Math.random() * 5.5;
    var sR = 0.35 + Math.random() * 0.55;
    var stalGeo = jaggedRockGeometry(
      new THREE.ConeGeometry(sR, sLen, 4, 2),
      0.3,
      sI * 2.9 + 5.5,
    );
    stalEntries.push({
      geometry: stalGeo,
      position: new THREE.Vector3(sx, 20.5 + Math.random() * 3.5, sz),
      rotation: new THREE.Euler(Math.PI, Math.random() * Math.PI, 0),
    });
  }
  var stalMesh = new THREE.Mesh(
    mergeStaticGeometries(stalEntries),
    stalactiteMat,
  );
  stalMesh.castShadow = true;
  stalMesh.receiveShadow = false;
  caveGroup.add(stalMesh);

  var caveLightCoords = [
    { x: -22, y: 16, z: -18, color: 0xd18a42, int: 0.28 },
    { x: 24, y: 14, z: -15, color: 0x8f6530, int: 0.22 },
    { x: -18, y: 12, z: 12, color: 0xc47b35, int: 0.16 },
    { x: 20, y: 15, z: 10, color: 0xa86e38, int: 0.13 },
  ].slice(0, C.perf.caveFillLights);

  caveLightCoords.forEach(function (l) {
    var pLight = new THREE.PointLight(l.color, l.int, 38);
    pLight.position.set(l.x, l.y, l.z);
    caveGroup.add(pLight);
  });

  if (parentScene) {
    parentScene.add(caveGroup);
  } else {
    scene.add(caveGroup);
  }
  return caveGroup;
}

buildCaveEnvironment(14.0, scene);

// LIGHTING SETUP — stronger FG/MG/BG separation via cooler fill, teal rim,
// and a slightly hotter temple accent against lower ambient/key.
var ambientLight = new THREE.AmbientLight(0x1a1614, 0.16);
scene.add(ambientLight);

var keySunLight = new THREE.DirectionalLight(0xffd8a8, 2.35);
keySunLight.position.set(-22, 18, 16);
keySunLight.target.position.set(0, 0, -3.5);
keySunLight.castShadow = true;
keySunLight.shadow.mapSize.width = C.perf.shadowMapSize;
keySunLight.shadow.mapSize.height = C.perf.shadowMapSize;
keySunLight.shadow.camera.left = -C.perf.shadowFrustum;
keySunLight.shadow.camera.right = C.perf.shadowFrustum;
keySunLight.shadow.camera.top = C.perf.shadowFrustum;
keySunLight.shadow.camera.bottom = -C.perf.shadowFrustum;
keySunLight.shadow.camera.near = 1.0;
keySunLight.shadow.camera.far = C.perf.shadowFar;
keySunLight.shadow.bias = -0.0003;
keySunLight.shadow.normalBias = 0.04;
scene.add(keySunLight);
scene.add(keySunLight.target);

var tealRimLight = new THREE.PointLight(0x2bb8b0, 0.85, 32);
tealRimLight.position.set(-9, 7.5, -10);
scene.add(tealRimLight);

var duskFillLight = new THREE.DirectionalLight(0x3a6ea5, 0.55);
duskFillLight.position.set(14, -1, 10);
scene.add(duskFillLight);

var templeAccentLight = new THREE.PointLight(0xffa044, 1.55, 15);
templeAccentLight.position.set(0, 4.2, -6.2);
scene.add(templeAccentLight);

function wireMesh(geometry, color, opacity) {
  var edges = new THREE.EdgesGeometry(geometry);
  var mat = new THREE.LineBasicMaterial({
    color: color,
    transparent: true,
    opacity: opacity === undefined ? 0.92 : opacity,
  });
  return new THREE.LineSegments(edges, mat);
}

var GOLD = 0xd1a14c,
  CARNELIAN = 0x8a2e1f;

function flutedColumnGeometry(
  rBottom,
  rTop,
  height,
  heightSegs,
  radialSegs,
  fluteCount,
  fluteDepth,
) {
  var positions = [],
    uvs = [],
    indices = [];
  for (var hi = 0; hi <= heightSegs; hi++) {
    var v = hi / heightSegs;
    var y = -height / 2 + v * height;
    var r = rBottom + (rTop - rBottom) * v;
    for (var ri = 0; ri <= radialSegs; ri++) {
      var u = ri / radialSegs;
      var theta = u * Math.PI * 2;
      var rad =
        r - fluteDepth * 0.5 + Math.cos(theta * fluteCount) * fluteDepth * 0.5;
      positions.push(Math.cos(theta) * rad, y, Math.sin(theta) * rad);
      uvs.push(u * fluteCount * 0.5, v * 3);
    }
  }
  var rowLen = radialSegs + 1;
  for (hi = 0; hi < heightSegs; hi++) {
    for (ri = 0; ri < radialSegs; ri++) {
      var a = hi * rowLen + ri,
        b = a + rowLen,
        c = a + 1,
        d = b + 1;
      indices.push(a, b, c, c, b, d);
    }
  }
  var geo = new THREE.BufferGeometry();
  geo.setIndex(indices);
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

function addTierAccentLines(
  tierWidth,
  tierDepth,
  tierTopY,
  tierCenterZ,
  parentGroup,
) {
  var linesGroup = new THREE.Group();
  var stripH = 0.05;
  var stripThick = 0.04;

  var halfW = tierWidth / 2;
  var halfD = tierDepth / 2;

  var lineN = new THREE.Mesh(
    new THREE.BoxGeometry(tierWidth + stripThick * 2, stripH, stripThick),
    lapisAccentMat,
  );
  lineN.position.set(0, tierTopY, tierCenterZ - halfD);
  lineN.castShadow = false;
  linesGroup.add(lineN);

  var lineS = new THREE.Mesh(
    new THREE.BoxGeometry(tierWidth + stripThick * 2, stripH, stripThick),
    lapisAccentMat,
  );
  lineS.position.set(0, tierTopY, tierCenterZ + halfD);
  lineS.castShadow = false;
  linesGroup.add(lineS);

  var lineW = new THREE.Mesh(
    new THREE.BoxGeometry(stripThick, stripH, tierDepth),
    lapisAccentMat,
  );
  lineW.position.set(-halfW, tierTopY, tierCenterZ);
  lineW.castShadow = false;
  linesGroup.add(lineW);

  var lineE = new THREE.Mesh(
    new THREE.BoxGeometry(stripThick, stripH, tierDepth),
    lapisAccentMat,
  );
  lineE.position.set(halfW, tierTopY, tierCenterZ);
  lineE.castShadow = false;
  linesGroup.add(lineE);

  if (parentGroup) {
    parentGroup.add(linesGroup);
  } else {
    scene.add(linesGroup);
  }
  return linesGroup;
}

function buildSandyBasinFloor(width, depth, position, parentGroup) {
  var floorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.12, depth),
    sandyFloorMat,
  );
  floorMesh.position.copy(position);
  floorMesh.receiveShadow = true;

  if (parentGroup) {
    parentGroup.add(floorMesh);
  } else {
    scene.add(floorMesh);
  }
  return floorMesh;
}

function buildPortalGlass(
  archOpeningWidth,
  archOpeningHeight,
  position,
  parentGroup,
  material,
) {
  var glassMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(archOpeningWidth, archOpeningHeight),
    material || blackGlassMaterial,
  );
  glassMesh.position.copy(position);
  glassMesh.receiveShadow = true;

  if (parentGroup) {
    parentGroup.add(glassMesh);
  } else {
    scene.add(glassMesh);
  }
  return glassMesh;
}

var waterfallUniforms = {
  uTime: { value: 0.0 },
};

var waterfallMaterial = new THREE.ShaderMaterial({
  uniforms: waterfallUniforms,
  vertexShader: `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        vUv = uv;
        vec3 p = position;
        float ripple = sin(uv.y * 18.0 + uTime * 6.0 + uv.x * 8.0) * 0.035;
        p.x += ripple;
        p.z += sin(uv.y * 10.0 + uTime * 4.0) * 0.012;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
  fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        float flowA = fract(vUv.y * 9.0 - uTime * 1.9);
        float flowB = fract(vUv.y * 13.0 - uTime * 2.6 + vUv.x * 2.0);
        float streakA = smoothstep(0.15, 0.95, flowA);
        float streakB = smoothstep(0.25, 0.98, flowB);
        float streak = clamp(streakA * 0.7 + streakB * 0.45, 0.0, 1.0);

        float edge = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
        float topFade = smoothstep(0.0, 0.1, 1.0 - vUv.y);
        float foam = smoothstep(0.32, 0.0, vUv.y) * (0.55 + 0.45 * streakB);

        float alpha = (0.3 + 0.42 * streak + foam * 0.5) * edge * (1.0 - topFade * 0.5);
        vec3 base = vec3(0.32, 0.8, 0.9);
        vec3 hi = vec3(0.82, 0.98, 1.0);
        vec3 col = mix(base, hi, streak * 0.6);
        col = mix(col, vec3(0.92, 1.0, 1.0), foam);
        gl_FragColor = vec4(col, alpha);
      }
    `,
  transparent: true,
  depthWrite: false,
  depthTest: true,
  side: THREE.FrontSide,
});

function buildWaterfall(width, height, position, parentGroup) {
  var waterfall = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height, 1, C.perf.waterfallHeightSegs),
    waterfallMaterial,
  );
  waterfall.position.copy(position);
  waterfall.receiveShadow = false;
  if (parentGroup) {
    parentGroup.add(waterfall);
  } else {
    scene.add(waterfall);
  }

  return waterfall;
}

function attachChain(gateAnchorPosition, ringTopPosition, parentGroup) {
  var chainGroup = new THREE.Group();

  var start = gateAnchorPosition.clone();
  var end = ringTopPosition.clone();
  var vec = new THREE.Vector3().subVectors(end, start);
  var distance = vec.length();

  if (distance < 0.001) return chainGroup;

  var dir = vec.clone().normalize();
  var linkRadius = 0.055;
  var tubeRadius = 0.016;
  var linkStep = linkRadius * 1.45;

  var numLinks = Math.max(3, Math.ceil(distance / linkStep));
  var linkGeo = new THREE.TorusGeometry(linkRadius, tubeRadius, 6, 8);

  var bracket = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.08, 0.12),
    darkIronMat,
  );
  bracket.position.copy(start);
  bracket.castShadow = false;
  chainGroup.add(bracket);

  for (var i = 0; i < numLinks; i++) {
    var t = (i + 0.5) / numLinks;
    var linkPos = new THREE.Vector3().lerpVectors(start, end, t);

    var linkMesh = new THREE.Mesh(linkGeo, darkIronMat);
    linkMesh.scale.set(0.65, 1.25, 0.65);
    linkMesh.position.copy(linkPos);
    linkMesh.castShadow = false;

    var dummy = new THREE.Object3D();
    dummy.position.copy(linkPos);
    dummy.lookAt(linkPos.clone().add(dir));

    var altRot = (i % 2 === 0 ? 0 : Math.PI / 2) + (Math.random() - 0.5) * 0.16;
    dummy.rotateZ(altRot);
    dummy.rotateX((Math.random() - 0.5) * 0.1);

    linkMesh.rotation.copy(dummy.rotation);
    chainGroup.add(linkMesh);
  }

  if (parentGroup) {
    parentGroup.add(chainGroup);
  } else {
    scene.add(chainGroup);
  }
  return chainGroup;
}

function buildPoolEdge(centerPosition, width, depth, waterY, parentGroup) {
  var poolGroup = new THREE.Group();
  poolGroup.position.set(centerPosition.x, waterY, centerPosition.z);

  var wallThick = 0.18;
  var rimHeight = 0.16;
  var wallDrop = 0.32;

  var halfW = width / 2;
  var halfD = depth / 2;

  var rimN = new THREE.Mesh(
    new THREE.BoxGeometry(width + wallThick * 2, rimHeight, wallThick),
    basaltMat,
  );
  rimN.position.set(0, rimHeight / 2, -halfD - wallThick / 2);
  rimN.castShadow = true;
  rimN.receiveShadow = true;
  poolGroup.add(rimN);

  var rimS = new THREE.Mesh(
    new THREE.BoxGeometry(width + wallThick * 2, rimHeight, wallThick),
    basaltMat,
  );
  rimS.position.set(0, rimHeight / 2, halfD + wallThick / 2);
  rimS.castShadow = true;
  rimS.receiveShadow = true;
  poolGroup.add(rimS);

  var rimW = new THREE.Mesh(
    new THREE.BoxGeometry(wallThick, rimHeight, depth),
    basaltMat,
  );
  rimW.position.set(-halfW - wallThick / 2, rimHeight / 2, 0);
  rimW.castShadow = true;
  rimW.receiveShadow = true;
  poolGroup.add(rimW);

  var rimE = new THREE.Mesh(
    new THREE.BoxGeometry(wallThick, rimHeight, depth),
    basaltMat,
  );
  rimE.position.set(halfW + wallThick / 2, rimHeight / 2, 0);
  rimE.castShadow = true;
  rimE.receiveShadow = true;
  poolGroup.add(rimE);

  var rimTrimN = wireMesh(
    new THREE.BoxGeometry(width + wallThick * 2, rimHeight, wallThick),
    GOLD,
    0.35,
  );
  rimTrimN.position.copy(rimN.position);
  poolGroup.add(rimTrimN);

  var rimTrimS = wireMesh(
    new THREE.BoxGeometry(width + wallThick * 2, rimHeight, wallThick),
    GOLD,
    0.35,
  );
  rimTrimS.position.copy(rimS.position);
  poolGroup.add(rimTrimS);

  var totalWallH = rimHeight + wallDrop;
  var innerWallY = rimHeight / 2 - wallDrop / 2;

  var wallInnerN = new THREE.Mesh(
    new THREE.BoxGeometry(width, totalWallH, 0.08),
    basaltMat,
  );
  wallInnerN.position.set(0, innerWallY, -halfD);
  wallInnerN.receiveShadow = true;
  poolGroup.add(wallInnerN);

  var wallInnerS = new THREE.Mesh(
    new THREE.BoxGeometry(width, totalWallH, 0.08),
    basaltMat,
  );
  wallInnerS.position.set(0, innerWallY, halfD);
  wallInnerS.receiveShadow = true;
  poolGroup.add(wallInnerS);

  var wallInnerW = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, totalWallH, depth),
    basaltMat,
  );
  wallInnerW.position.set(-halfW, innerWallY, 0);
  wallInnerW.receiveShadow = true;
  poolGroup.add(wallInnerW);

  var wallInnerE = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, totalWallH, depth),
    basaltMat,
  );
  wallInnerE.position.set(halfW, innerWallY, 0);
  wallInnerE.receiveShadow = true;
  poolGroup.add(wallInnerE);

  buildSandyBasinFloor(
    width,
    depth,
    new THREE.Vector3(0, -wallDrop + 0.06, 0),
    poolGroup,
  );

  var wlHeight = 0.032;
  var wlY = 0.016;

  var wlN = new THREE.Mesh(
    new THREE.PlaneGeometry(width, wlHeight),
    waterlineMat,
  );
  wlN.position.set(0, wlY, -halfD + 0.041);
  poolGroup.add(wlN);

  var wlS = new THREE.Mesh(
    new THREE.PlaneGeometry(width, wlHeight),
    waterlineMat,
  );
  wlS.rotation.y = Math.PI;
  wlS.position.set(0, wlY, halfD - 0.041);
  poolGroup.add(wlS);

  var wlW = new THREE.Mesh(
    new THREE.PlaneGeometry(depth, wlHeight),
    waterlineMat,
  );
  wlW.rotation.y = Math.PI / 2;
  wlW.position.set(-halfW + 0.041, wlY, 0);
  poolGroup.add(wlW);

  var wlE = new THREE.Mesh(
    new THREE.PlaneGeometry(depth, wlHeight),
    waterlineMat,
  );
  wlE.rotation.y = -Math.PI / 2;
  wlE.position.set(halfW - 0.041, wlY, 0);
  poolGroup.add(wlE);

  if (parentGroup) {
    parentGroup.add(poolGroup);
  } else {
    scene.add(poolGroup);
  }
  return poolGroup;
}

// FOLIAGE SYSTEM

// ---- 03.foliage.js ----
var animatedFoliage = [];

function placeFoliageCluster(anchorPos, parentGroup) {
  var cluster = new THREE.Group();
  cluster.position.copy(anchorPos);

  var count = IS_MOBILE
    ? 1 + Math.floor(Math.random() * 2)
    : 3 + Math.floor(Math.random() * 3);

  for (var i = 0; i < count; i++) {
    var vineGroup = new THREE.Group();

    var vineLen = 0.3 + Math.random() * 0.45;
    var mat =
      Math.random() < 0.22
        ? foliageMatGold
        : Math.random() < 0.5
          ? foliageMatA
          : foliageMatB;

    var stemGeo = new THREE.CylinderGeometry(0.008, 0.03, vineLen, 3);
    stemGeo.translate(0, -vineLen / 2, 0);
    var stem = new THREE.Mesh(stemGeo, mat);
    stem.castShadow = false;
    vineGroup.add(stem);

    var leafCount = IS_MOBILE ? 1 : 2;
    for (var l = 0; l < leafCount; l++) {
      var leafY = -vineLen * (0.25 + (l / leafCount) * 0.68);
      var leafSize = 0.07 + Math.random() * 0.08;
      var leafGeo = new THREE.IcosahedronGeometry(leafSize, 0);
      var leaf = new THREE.Mesh(leafGeo, mat);
      leaf.scale.set(1.0, 1.7, 0.35);
      leaf.position.set(
        (Math.random() - 0.5) * 0.06,
        leafY,
        (Math.random() - 0.5) * 0.06,
      );
      leaf.rotation.set(
        Math.random() * 0.4,
        Math.random() * Math.PI * 2,
        Math.random() * 0.4,
      );
      leaf.castShadow = false;
      vineGroup.add(leaf);
    }

    vineGroup.position.set(
      (Math.random() - 0.5) * 0.22,
      -(Math.random() * 0.04),
      (Math.random() - 0.5) * 0.12,
    );

    var initRotX = 0.12 + Math.random() * 0.2;
    var initRotZ = (Math.random() - 0.5) * 0.25;
    vineGroup.rotation.set(initRotX, Math.random() * Math.PI, initRotZ);

    cluster.add(vineGroup);

    animatedFoliage.push({
      group: vineGroup,
      baseRotX: initRotX,
      baseRotZ: initRotZ,
      phase: Math.random() * Math.PI * 2,
      speed: 1.1 + Math.random() * 1.4,
      ampX: 0.035 + Math.random() * 0.045,
      ampZ: 0.025 + Math.random() * 0.035,
    });
  }

  if (parentGroup) {
    parentGroup.add(cluster);
  } else {
    scene.add(cluster);
  }
  return cluster;
}

function tickFoliage(timeSec) {
  for (var i = 0; i < animatedFoliage.length; i++) {
    var f = animatedFoliage[i];
    f.group.rotation.x =
      f.baseRotX + Math.sin(timeSec * f.speed + f.phase) * f.ampX;
    f.group.rotation.z =
      f.baseRotZ + Math.cos(timeSec * f.speed * 0.85 + f.phase) * f.ampZ;
  }
}

// ---- 04.pillars.js ----
  function buildPillar(radius, height) {
    var group = new THREE.Group();

    var base = new THREE.Mesh(
      new THREE.BoxGeometry(radius * 3.2, 0.4, radius * 3.2),
      basaltMat,
    );
    base.position.y = 0.2;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    var basePlinth = new THREE.Mesh(
      new THREE.BoxGeometry(radius * 2.6, 0.3, radius * 2.6),
      basaltMat,
    );
    basePlinth.position.y = 0.55;
    basePlinth.castShadow = true;
    basePlinth.receiveShadow = true;
    group.add(basePlinth);

    var neckLow = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.95, radius * 0.09, 5, 12),
      goldMat,
    );
    neckLow.rotation.x = Math.PI / 2;
    neckLow.position.y = 0.74;
    neckLow.castShadow = true;
    group.add(neckLow);

    var shaftGeo = flutedColumnGeometry(
      radius,
      radius * 0.82,
      height,
      8,
      12,
      8,
      radius * 0.16,
    );
    var shaft = new THREE.Mesh(shaftGeo, basaltMat);
    shaft.position.y = 0.9 + height / 2;
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    group.add(shaft);

    var neckHigh = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 0.82, radius * 0.09, 5, 12),
      goldMat,
    );
    neckHigh.rotation.x = Math.PI / 2;
    neckHigh.position.y = 0.9 + height + 0.05;
    neckHigh.castShadow = true;
    group.add(neckHigh);

    var capitalCore = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 1.4, radius * 0.82, 0.45, 10),
      goldMat,
    );
    capitalCore.position.y = 0.9 + height + 0.35;
    capitalCore.castShadow = true;
    capitalCore.receiveShadow = true;
    group.add(capitalCore);

    var abacus = new THREE.Mesh(
      new THREE.BoxGeometry(radius * 3.6, 0.34, radius * 3.6),
      basaltMat,
    );
    abacus.position.y = 0.9 + height + 0.75;
    abacus.castShadow = true;
    abacus.receiveShadow = true;
    group.add(abacus);

    var abacusTrim = wireMesh(
      new THREE.BoxGeometry(radius * 3.6, 0.34, radius * 3.6),
      GOLD,
      0.5,
    );
    abacusTrim.position.y = abacus.position.y;
    group.add(abacusTrim);

    var capRoof = new THREE.Mesh(
      new THREE.ConeGeometry(radius * 2.0, radius * 1.3, 4),
      goldMat,
    );
    capRoof.rotation.y = Math.PI / 4;
    capRoof.position.y = abacus.position.y + 0.17 + radius * 0.65;
    capRoof.castShadow = true;
    capRoof.receiveShadow = true;
    group.add(capRoof);

    var capRoofTrim = wireMesh(
      new THREE.ConeGeometry(radius * 2.0, radius * 1.3, 4),
      GOLD,
      0.55,
    );
    capRoofTrim.position.copy(capRoof.position);
    capRoofTrim.rotation.copy(capRoof.rotation);
    group.add(capRoofTrim);

    var capFinial = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.32, 6, 5),
      goldMat,
    );
    capFinial.position.y = capRoof.position.y + radius * 0.65 + radius * 0.28;
    capFinial.castShadow = true;
    group.add(capFinial);

    placeFoliageCluster(
      new THREE.Vector3(radius * 1.2, abacus.position.y - 0.1, radius * 1.2),
      group,
    );
    placeFoliageCluster(
      new THREE.Vector3(-radius * 1.2, abacus.position.y - 0.1, -radius * 1.2),
      group,
    );

    return group;
  }

  var forecourtY = -2.18;
  var forecourt = new THREE.Mesh(
    new THREE.BoxGeometry(13.6, 0.36, 5.2),
    basaltMat,
  );
  forecourt.position.set(0, forecourtY, 2.9);
  forecourt.castShadow = true;
  forecourt.receiveShadow = true;
  scene.add(forecourt);
  var forecourtTrim = wireMesh(
    new THREE.BoxGeometry(13.6, 0.36, 5.2),
    GOLD,
    0.3,
  );
  forecourtTrim.position.copy(forecourt.position);
  scene.add(forecourtTrim);

  var forecourtStandY = forecourtY + 0.18;
  var pillarGroundY = -5.0;
  var pillarHeight = 7.4;

  var pillarL = buildPillar(0.4, pillarHeight);
  pillarL.position.set(-5.6, pillarGroundY, 1.4);
  scene.add(pillarL);

  var pillarR = buildPillar(0.4, pillarHeight);
  pillarR.position.set(5.6, pillarGroundY, 1.4);
  scene.add(pillarR);

  function createPedestalAnchor(x, z) {
    var group = new THREE.Group();
    var baseTier = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.6, 2.4),
      basaltMat,
    );
    baseTier.position.set(0, 0.3, 0);
    baseTier.castShadow = true;
    baseTier.receiveShadow = true;
    group.add(baseTier);

    var midTier = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.5, 1.8),
      basaltMat,
    );
    midTier.position.set(0, 0.85, 0);
    midTier.castShadow = true;
    midTier.receiveShadow = true;
    group.add(midTier);

    var topCap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 1.4), goldMat);
    topCap.position.set(0, 1.2, 0);
    topCap.castShadow = true;
    group.add(topCap);

    group.position.set(x, pillarGroundY, z);
    return group;
  }

  scene.add(createPedestalAnchor(-5.6, 1.4));
  scene.add(createPedestalAnchor(5.6, 1.4));


// ---- 05.emblem.js ----
// EMBLEM MAP GENERATOR
function drawEmblemWing(ctx, originX, originY, dir, mode) {
  var featherCount = 13;
  var lowAngle = 8 * (Math.PI / 180);
  var highAngle = -40 * (Math.PI / 180);

  for (var i = 0; i < featherCount; i++) {
    var t = i / (featherCount - 1);
    var angleRight = lowAngle + (highAngle - lowAngle) * t;
    var ang = dir === 1 ? angleRight : Math.PI - angleRight;
    var len = 250 + Math.sin(t * Math.PI) * 270;
    var width = 33 - t * 15;

    var tipX = originX + Math.cos(ang) * len;
    var tipY = originY + Math.sin(ang) * len;
    var midX = originX + Math.cos(ang) * len * 0.55;
    var midY = originY + Math.sin(ang) * len * 0.55;
    var perpAng = ang + Math.PI / 2;
    var pX = Math.cos(perpAng) * width;
    var pY = Math.sin(perpAng) * width;

    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.quadraticCurveTo(midX + pX, midY + pY, tipX, tipY);
    ctx.quadraticCurveTo(midX - pX, midY - pY, originX, originY);
    ctx.closePath();

    if (mode === "height") {
      var hGrad = ctx.createLinearGradient(originX, originY, tipX, tipY);
      hGrad.addColorStop(0, "rgb(96,96,96)");
      hGrad.addColorStop(0.45, "rgb(176,176,176)");
      hGrad.addColorStop(0.8, "rgb(198,198,198)");
      hGrad.addColorStop(1, "rgb(150,150,150)");
      ctx.fillStyle = hGrad;
      ctx.fill();
    } else if (mode === "roughness") {
      var rGrad = ctx.createLinearGradient(originX, originY, tipX, tipY);
      rGrad.addColorStop(0, "rgb(150,150,150)");
      rGrad.addColorStop(0.5, "rgb(90,90,90)");
      rGrad.addColorStop(1, "rgb(70,70,70)");
      ctx.fillStyle = rGrad;
      ctx.fill();
    } else {
      var grad = ctx.createLinearGradient(originX, originY, tipX, tipY);
      grad.addColorStop(0, "rgba(58,72,54,0.92)");
      grad.addColorStop(0.35, "rgba(122,84,32,0.95)");
      grad.addColorStop(0.65, "rgba(214,164,78,0.97)");
      grad.addColorStop(1, "rgba(255,236,190,0.98)");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = "rgba(38,24,8,0.6)";
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    if (mode !== "roughness") {
      var barbCount = 2;
      for (var b = 1; b <= barbCount; b++) {
        var bt = b / (barbCount + 1);
        var offX = pX * (bt * 2 - 1) * 0.7;
        var offY = pY * (bt * 2 - 1) * 0.7;
        ctx.beginPath();
        ctx.moveTo(originX + offX * 0.3, originY + offY * 0.3);
        ctx.quadraticCurveTo(
          midX + offX,
          midY + offY,
          tipX + offX * 0.15,
          tipY + offY * 0.15,
        );
        ctx.strokeStyle =
          mode === "height" ? "rgba(90,90,90,0.5)" : "rgba(40,26,10,0.28)";
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
    }

    if (mode === "height") {
      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(tipX, tipY);
      ctx.strokeStyle = "rgba(214,214,214,0.9)";
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }
  }
}

function drawEmblemDisc(ctx, cx, cy, mode) {
  var discR = 104;
  if (mode === "height") {
    var hGrad = ctx.createRadialGradient(cx, cy - 14, 4, cx, cy, discR);
    hGrad.addColorStop(0, "rgb(232,232,232)");
    hGrad.addColorStop(0.7, "rgb(200,200,200)");
    hGrad.addColorStop(0.92, "rgb(160,160,160)");
    hGrad.addColorStop(1, "rgb(120,120,120)");
    ctx.beginPath();
    ctx.arc(cx, cy, discR, 0, Math.PI * 2);
    ctx.fillStyle = hGrad;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgb(235,235,235)";
    ctx.stroke();
  } else if (mode === "roughness") {
    var rGrad = ctx.createRadialGradient(cx, cy - 14, 4, cx, cy, discR);
    rGrad.addColorStop(0, "rgb(70,70,70)");
    rGrad.addColorStop(0.75, "rgb(95,95,95)");
    rGrad.addColorStop(1, "rgb(140,140,140)");
    ctx.beginPath();
    ctx.arc(cx, cy, discR, 0, Math.PI * 2);
    ctx.fillStyle = rGrad;
    ctx.fill();
  } else {
    var discGrad = ctx.createRadialGradient(cx, cy - 14, 8, cx, cy, discR);
    discGrad.addColorStop(0, "#fff4d6");
    discGrad.addColorStop(0.5, "#e8b957");
    discGrad.addColorStop(0.85, "#9c6e22");
    discGrad.addColorStop(1, "#5c3f12");
    ctx.beginPath();
    ctx.arc(cx, cy, discR, 0, Math.PI * 2);
    ctx.fillStyle = discGrad;
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#3a2408";
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,244,210,0.55)";
    ctx.beginPath();
    ctx.arc(cx, cy, discR - 9, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawEmblemVolutes(ctx, cx, cy, discR, mode) {
  [-1, 1].forEach(function (side) {
    ctx.save();
    ctx.translate(cx + side * 36, cy - discR - 4);
    ctx.scale(side, 1);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(26, -6, 30, -34, 6, -40);
    ctx.bezierCurveTo(-14, -44, -18, -22, 0, -18);
    if (mode === "height") {
      ctx.strokeStyle = "rgb(150,150,150)";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.strokeStyle = "rgb(210,210,210)";
      ctx.lineWidth = 4;
      ctx.stroke();
    } else if (mode === "roughness") {
      ctx.strokeStyle = "rgb(100,100,100)";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.strokeStyle = "rgb(75,75,75)";
      ctx.lineWidth = 4;
      ctx.stroke();
    } else {
      ctx.strokeStyle = "#33210a";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.strokeStyle = "#e8b957";
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    ctx.restore();
  });
}

function drawEmblemPlaque(ctx, cx, cy, mode) {
  var plaqueW = 500,
    plaqueH = 108,
    plaqueR = 16;

  function plaquePath() {
    ctx.beginPath();
    ctx.moveTo(cx - plaqueW / 2 + plaqueR, cy - plaqueH / 2);
    ctx.arcTo(
      cx + plaqueW / 2,
      cy - plaqueH / 2,
      cx + plaqueW / 2,
      cy + plaqueH / 2,
      plaqueR,
    );
    ctx.arcTo(
      cx + plaqueW / 2,
      cy + plaqueH / 2,
      cx - plaqueW / 2,
      cy + plaqueH / 2,
      plaqueR,
    );
    ctx.arcTo(
      cx - plaqueW / 2,
      cy + plaqueH / 2,
      cx - plaqueW / 2,
      cy - plaqueH / 2,
      plaqueR,
    );
    ctx.arcTo(
      cx - plaqueW / 2,
      cy - plaqueH / 2,
      cx + plaqueW / 2,
      cy - plaqueH / 2,
      plaqueR,
    );
    ctx.closePath();
  }

  plaquePath();
  if (mode === "height") {
    var hGrad = ctx.createLinearGradient(
      0,
      cy - plaqueH / 2,
      0,
      cy + plaqueH / 2,
    );
    hGrad.addColorStop(0, "rgb(215,215,215)");
    hGrad.addColorStop(0.5, "rgb(190,190,190)");
    hGrad.addColorStop(1, "rgb(170,170,170)");
    ctx.fillStyle = hGrad;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgb(225,225,225)";
    ctx.stroke();
  } else if (mode === "roughness") {
    ctx.fillStyle = "rgb(85,85,85)";
    ctx.fill();
  } else {
    var plaqueGrad = ctx.createLinearGradient(
      0,
      cy - plaqueH / 2,
      0,
      cy + plaqueH / 2,
    );
    plaqueGrad.addColorStop(0, "#d2a355");
    plaqueGrad.addColorStop(0.5, "#93702f");
    plaqueGrad.addColorStop(1, "#5c431a");
    ctx.fillStyle = plaqueGrad;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#33210a";
    ctx.stroke();
    var rivetXs = [
      cx - plaqueW / 2 + 20,
      cx + plaqueW / 2 - 20,
      cx - plaqueW / 2 + 20,
      cx + plaqueW / 2 - 20,
    ];
    var rivetYs = [
      cy - plaqueH / 2 + 16,
      cy - plaqueH / 2 + 16,
      cy + plaqueH / 2 - 16,
      cy + plaqueH / 2 - 16,
    ];
    for (var r = 0; r < rivetXs.length; r++) {
      var rg = ctx.createRadialGradient(
        rivetXs[r] - 1,
        rivetYs[r] - 1,
        0.5,
        rivetXs[r],
        rivetYs[r],
        4,
      );
      rg.addColorStop(0, "#fff0cc");
      rg.addColorStop(1, "#4a3010");
      ctx.beginPath();
      ctx.arc(rivetXs[r], rivetYs[r], 4, 0, Math.PI * 2);
      ctx.fillStyle = rg;
      ctx.fill();
    }
  }

  return { plaqueW: plaqueW, plaqueH: plaqueH };
}

function drawEmblemWordmark(ctx, cx, cy, mode, plaqueW) {
  var basePx = 104;
  var maxTextWidth = (plaqueW || 500) - 60;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = basePx + 'px "Aladin", "Cinzel", serif';
  var measured = ctx.measureText("GRAVITAS").width;
  var fitScale = measured > maxTextWidth ? maxTextWidth / measured : 1;
  var fontPx = Math.floor(basePx * fitScale);

  ctx.translate(cx, cy);
  ctx.font = fontPx + 'px "Aladin", "Cinzel", serif';

  var metrics = ctx.measureText("GRAVITAS");
  var ascent =
    metrics.actualBoundingBoxAscent !== undefined
      ? metrics.actualBoundingBoxAscent
      : fontPx * 0.72;
  var descent =
    metrics.actualBoundingBoxDescent !== undefined
      ? metrics.actualBoundingBoxDescent
      : 0;
  var baseY = (ascent - descent) / 2;

  if (mode === "height") {
    ctx.fillStyle = "rgb(86,86,86)";
    ctx.fillText("GRAVITAS", 0, baseY);
    ctx.fillStyle = "rgb(150,150,150)";
    ctx.fillText("GRAVITAS", 0, baseY + 2.2);
  } else if (mode === "roughness") {
    ctx.fillStyle = "rgb(150,150,150)";
    ctx.fillText("GRAVITAS", 0, baseY);
  } else {
    ctx.fillStyle = "rgba(26,16,4,0.88)";
    ctx.fillText("GRAVITAS", 0, baseY - 2.5);
    ctx.fillStyle = "rgba(255,244,210,0.5)";
    ctx.fillText("GRAVITAS", 0, baseY + 2);
    ctx.fillStyle = "#201304";
    ctx.fillText("GRAVITAS", 0, baseY);
  }
  ctx.restore();
}

function heightCanvasToNormalCanvas(heightCanvas, strength) {
  var w = heightCanvas.width,
    h = heightCanvas.height;
  var hctx = heightCanvas.getContext("2d");
  var srcData = hctx.getImageData(0, 0, w, h).data;

  function sampleH(x, y) {
    if (x < 0) x = 0;
    if (x >= w) x = w - 1;
    if (y < 0) y = 0;
    if (y >= h) y = h - 1;
    return srcData[(y * w + x) * 4] / 255;
  }

  var normalCanvas = document.createElement("canvas");
  normalCanvas.width = w;
  normalCanvas.height = h;
  var nctx = normalCanvas.getContext("2d");
  var outImg = nctx.createImageData(w, h);
  var out = outImg.data;

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var hL = sampleH(x - 1, y);
      var hR = sampleH(x + 1, y);
      var hD = sampleH(x, y - 1);
      var hU = sampleH(x, y + 1);
      var dx = (hL - hR) * strength;
      var dy = (hD - hU) * strength;
      var dz = 1.0;
      var len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      var idx = (y * w + x) * 4;
      out[idx] = ((dx / len) * 0.5 + 0.5) * 255;
      out[idx + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      out[idx + 2] = ((dz / len) * 0.5 + 0.5) * 255;
      out[idx + 3] = 255;
    }
  }
  nctx.putImageData(outImg, 0, 0);
  return normalCanvas;
}

function buildEmblemMaps() {
  var SS = C.perf.emblemSupersample;
  var cx = 1200 / 2,
    cy = 368 * 0.5;
  var w = 1200 * SS,
    h = 368 * SS;

  function makeLayer(mode) {
    var canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext("2d");
    ctx.scale(w / 1200, h / 368);

    if (mode === "height") {
      ctx.fillStyle = "rgb(96,96,96)";
      ctx.fillRect(0, 0, 1200, 368);
    } else if (mode === "roughness") {
      ctx.fillStyle = "rgb(120,120,120)";
      ctx.fillRect(0, 0, 1200, 368);
    } else {
      ctx.clearRect(0, 0, 1200, 368);
    }

    drawEmblemWing(ctx, cx - 112, cy - 5, -1, mode);
    drawEmblemWing(ctx, cx + 112, cy - 5, 1, mode);
    drawEmblemDisc(ctx, cx, cy, mode);
    drawEmblemVolutes(ctx, cx, cy, 83, mode);
    var plaqueDims = drawEmblemPlaque(ctx, cx, cy, mode);
    drawEmblemWordmark(ctx, cx, cy, mode, plaqueDims.plaqueW);

    return canvas;
  }

  var albedoCanvas = makeLayer("albedo");
  var heightCanvas = makeLayer("height");
  var roughCanvas = makeLayer("roughness");
  var normalCanvas = heightCanvasToNormalCanvas(heightCanvas, 9.5);

  var albedoTexture = new THREE.CanvasTexture(albedoCanvas);
  var normalTexture = new THREE.CanvasTexture(normalCanvas);
  var roughTexture = new THREE.CanvasTexture(roughCanvas);
  [albedoTexture, normalTexture, roughTexture].forEach(function (t) {
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    if (renderer && renderer.capabilities) {
      t.anisotropy = Math.min(
        renderer.capabilities.getMaxAnisotropy(),
        C.perf.textureAnisotropy,
      );
    }
  });
  albedoTexture.needsUpdate = true;
  normalTexture.needsUpdate = true;
  roughTexture.needsUpdate = true;

  return {
    albedo: albedoTexture,
    normal: normalTexture,
    roughness: roughTexture,
    width: 1200,
    height: 368,
  };
}

var emblemMesh = null;
var emblemBaseY = 0;
var emblemMat = null;

(function buildWingedEmblem() {
  var maps = buildEmblemMaps();
  var emblemAspect = maps.width / maps.height;
  var emblemHeight = 2.5;
  var emblemWidth = emblemHeight * emblemAspect;

  emblemMat = new THREE.MeshStandardMaterial({
    map: maps.albedo,
    normalMap: maps.normal,
    normalScale: new THREE.Vector2(1, 1),
    roughnessMap: maps.roughness,
    roughness: 0.42,
    metalness: 0.78,
    emissive: 0xffcf8a,
    emissiveIntensity: 0.12,
    transparent: true,
    alphaTest: 0.3,
    side: THREE.DoubleSide,
    depthWrite: true,
  });

  var emblemY = 3.8;
  var emblemZ = 1.2;
  emblemBaseY = emblemY;

  emblemMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(emblemWidth, emblemHeight),
    emblemMat,
  );
  emblemMesh.position.set(0, emblemY, emblemZ);
  emblemMesh.castShadow = true;
  emblemMesh.receiveShadow = true;
  scene.add(emblemMesh);

  var emblemGlow = new THREE.PointLight(GOLD, 0.55, 5);
  emblemGlow.position.set(0, emblemY, emblemZ + 0.7);
  scene.add(emblemGlow);
})();

(function refreshEmblemWhenFontReady() {
  var fontSpec = '104px "Aladin"';
  if (document.fonts && document.fonts.load) {
    var timeoutPromise = new Promise(function (resolve) {
      setTimeout(resolve, 3000);
    });
    var fontLoadPromise = document.fonts.load(fontSpec).then(function () {
      return document.fonts.ready;
    });

    Promise.race([fontLoadPromise, timeoutPromise])
      .then(function () {
        if (!emblemMat) return;
        var oldAlbedo = emblemMat.map;
        var oldNormal = emblemMat.normalMap;
        var oldRough = emblemMat.roughnessMap;
        var freshMaps = buildEmblemMaps();
        emblemMat.map = freshMaps.albedo;
        emblemMat.normalMap = freshMaps.normal;
        emblemMat.roughnessMap = freshMaps.roughness;
        emblemMat.needsUpdate = true;
        if (oldAlbedo) oldAlbedo.dispose();
        if (oldNormal) oldNormal.dispose();
        if (oldRough) oldRough.dispose();
      })
      .catch(function (err) {
        console.warn(
          "Font load failed for emblem, executing fallback texture refresh:",
          err,
        );
        if (!emblemMat) return;
        var freshMaps = buildEmblemMaps();
        emblemMat.map = freshMaps.albedo;
        emblemMat.needsUpdate = true;
      });
  }
})();

var brazierL = new THREE.PointLight(CARNELIAN, 1.3, 10);
brazierL.position.set(-5.6, forecourtStandY + 0.7, 2.2);
scene.add(brazierL);
var brazierR = new THREE.PointLight(CARNELIAN, 1.3, 10);
brazierR.position.set(5.6, forecourtStandY + 0.7, 2.2);
scene.add(brazierR);

function makeSignTextures(label) {
  var SS = C.perf.signSupersample;
  var w = 512 * SS,
    h = 128 * SS;
  var basePx = 58 * SS;
  var maxTextWidth = w - 56 * SS;

  function fitFont(ctx) {
    ctx.font = basePx + 'px "Aladin", "Cinzel", serif';
    var measured = ctx.measureText(label).width;
    var scale = measured > maxTextWidth ? maxTextWidth / measured : 1;
    var px = Math.max(22 * SS, Math.floor(basePx * scale));
    ctx.font = px + 'px "Aladin", "Cinzel", serif';
    return px;
  }

  var c1 = document.createElement("canvas");
  c1.width = w;
  c1.height = h;
  var x1 = c1.getContext("2d");
  x1.clearRect(0, 0, w, h);
  x1.textAlign = "center";
  x1.textBaseline = "middle";
  fitFont(x1);

  x1.save();
  x1.shadowColor = "rgba(0,0,0,0.9)";
  x1.shadowBlur = 5 * SS;
  x1.shadowOffsetX = 3 * SS;
  x1.shadowOffsetY = 3 * SS;
  x1.fillStyle = "rgba(0,0,0,0.001)";
  x1.fillText(label, w / 2, h / 2);
  x1.restore();

  x1.fillStyle = "rgb(96,86,68)";
  x1.fillText(label, w / 2, h / 2);

  x1.save();
  x1.globalAlpha = 0.55;
  x1.fillStyle = "rgb(224,201,150)";
  x1.fillText(label, w / 2 - 1.4 * SS, h / 2 - 1.6 * SS);
  x1.restore();

  var texBase = new THREE.CanvasTexture(c1);
  texBase.generateMipmaps = true;
  texBase.minFilter = THREE.LinearMipmapLinearFilter;
  texBase.magFilter = THREE.LinearFilter;

  var c2 = document.createElement("canvas");
  c2.width = w;
  c2.height = h;
  var x2 = c2.getContext("2d");
  x2.clearRect(0, 0, w, h);
  x2.textAlign = "center";
  x2.textBaseline = "middle";
  fitFont(x2);
  x2.shadowColor = "rgba(255,178,64,0.95)";
  x2.shadowBlur = 20 * SS;
  x2.fillStyle = "#ffd48a";
  x2.fillText(label, w / 2, h / 2);
  var texGlow = new THREE.CanvasTexture(c2);
  texGlow.generateMipmaps = true;
  texGlow.minFilter = THREE.LinearMipmapLinearFilter;
  texGlow.magFilter = THREE.LinearFilter;

  return { base: texBase, glow: texGlow };
}

var gateSignRefreshers = [];

// ---- 06.gatesigns.js ----
function refreshCarvedSignsWhenFontReady() {
  var fontSpec = '58px "Aladin"';
  if (document.fonts && document.fonts.load) {
    var timeoutPromise = new Promise(function (resolve) {
      setTimeout(resolve, 3000);
    });
    var fontLoadPromise = document.fonts.load(fontSpec).then(function () {
      return document.fonts.ready;
    });

    Promise.race([fontLoadPromise, timeoutPromise])
      .then(function () {
        gateSignRefreshers.forEach(function (fn) {
          fn();
        });
      })
      .catch(function (err) {
        console.warn(
          "Font load failed for gate signs, executing fallback refresh:",
          err,
        );
        gateSignRefreshers.forEach(function (fn) {
          fn();
        });
      });
  }
}
var gateColors = [GOLD, 0x2bb8b0, 0xe8ddc7];
var gateTracks = ["systems", "creative", "startup"];
var gateLabels = ["SYSTEMS_", "CREATIVE_TECH_", "STARTUP_"];
var gateGroups = [];
var gateHitMeshes = [];
var gateScaleCur = [1, 1, 1],
  gateScaleTarget = [1, 1, 1];
var gatePortalModels = [null, null, null];
var activeEnteredGate = null;

[-4.5, 0, 4.5].forEach(function (gx, gi) {
  var g = new THREE.Group();
  g.position.set(gx, forecourtStandY, 3.6);

  var jamb = function (lx) {
    var p = buildSimplePillar(0.22, 2.5);
    p.position.set(lx, 0, 0);
    g.add(p);
  };
  jamb(-0.95);
  jamb(0.95);

  var lintel = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.4, 0.9), basaltMat);
  lintel.position.set(0, 2.62, 0);
  lintel.castShadow = true;
  lintel.receiveShadow = true;
  g.add(lintel);

  var lintelTrim = wireMesh(new THREE.BoxGeometry(2.5, 0.4, 0.9), GOLD, 0.85);
  lintelTrim.position.copy(lintel.position);
  g.add(lintelTrim);

  buildPortalGlass(
    1.72,
    2.42,
    new THREE.Vector3(0, 1.2, -0.05),
    g,
    gateGlassMaterial,
  );

  var portalModel = window.Gravitas.PortalModels
    ? window.Gravitas.PortalModels.build(gateTracks[gi])
    : null;
  if (portalModel) {
    portalModel.scale.setScalar(0.72);
    portalModel.position.set(0, 1.32, 0.22);
    g.add(portalModel);

    gatePortalModels[gi] = {
      model: portalModel,
      hoverOn: false,
      changedAt: Date.now(),
    };
  }

  var plaqueY = lintel.position.y + 0.2 + 0.24;
  var plaque = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.48, 0.5),
    mosaicTileMat,
  );
  plaque.position.set(0, plaqueY, 0);
  plaque.castShadow = true;
  plaque.receiveShadow = true;
  g.add(plaque);

  var plaqueTrim = wireMesh(new THREE.BoxGeometry(2.5, 0.48, 0.5), GOLD, 0.5);
  plaqueTrim.position.copy(plaque.position);
  g.add(plaqueTrim);

  var crenelY = plaqueY + 0.24 + 0.12;
  var crenelMat = new THREE.MeshStandardMaterial({
    color: 0xd1a14c,
    roughness: 0.16,
    metalness: 0.96,
    emissive: 0x3a2708,
    emissiveIntensity: 0.4,
  });
  for (var cn = 0; cn < 5; cn++) {
    var crenelGeo = new THREE.BoxGeometry(0.24, 0.24, 0.5);
    var crenel = new THREE.Mesh(crenelGeo, crenelMat);
    crenel.position.set(-1.0 + cn * 0.5, crenelY, 0);
    crenel.castShadow = false;
    g.add(crenel);
    var crenelEdge = wireMesh(crenelGeo, 0x3a2708, 0.7);
    crenelEdge.position.copy(crenel.position);
    g.add(crenelEdge);
  }

  var signFrame = new THREE.Mesh(
    new THREE.BoxGeometry(2.86, 0.72, 0.12),
    goldMat,
  );
  signFrame.position.set(0, plaqueY, 0.09);
  signFrame.castShadow = true;
  signFrame.receiveShadow = true;
  g.add(signFrame);

  var signBackingMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: gunmetalTex,
    roughness: 0.22,
    metalness: 0.95,
  });
  var signBacking = new THREE.Mesh(
    new THREE.PlaneGeometry(2.42, 0.5),
    signBackingMat,
  );
  signBacking.position.set(0, plaqueY, 0.255);
  g.add(signBacking);

  var signBackingTrim = wireMesh(
    new THREE.BoxGeometry(2.42, 0.5, 0.01),
    GOLD,
    0.85,
  );
  signBackingTrim.position.set(0, plaqueY, 0.26);
  g.add(signBackingTrim);

  var rivetGeo = new THREE.SphereGeometry(0.035, 8, 8);
  [
    [-1.16, plaqueY + 0.2],
    [1.16, plaqueY + 0.2],
    [-1.16, plaqueY - 0.2],
    [1.16, plaqueY - 0.2],
  ].forEach(function (rp) {
    var rivet = new THREE.Mesh(rivetGeo, goldMat);
    rivet.position.set(rp[0], rp[1], 0.27);
    rivet.castShadow = false;
    g.add(rivet);
  });

  var maxAniso = Math.min(
    renderer.capabilities.getMaxAnisotropy(),
    C.perf.textureAnisotropy,
  );

  var signTex = makeSignTextures(gateLabels[gi]);
  signTex.base.anisotropy = maxAniso;
  signTex.glow.anisotropy = maxAniso;
  var signBaseMat = new THREE.MeshBasicMaterial({
    map: signTex.base,
    transparent: true,
    depthWrite: false,
  });
  var signBase = new THREE.Mesh(
    new THREE.PlaneGeometry(2.3, 0.42),
    signBaseMat,
  );
  signBase.position.set(0, plaqueY, 0.26);
  g.add(signBase);

  var signGlowMat = new THREE.MeshBasicMaterial({
    map: signTex.glow,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0,
  });
  var signGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.3, 0.42),
    signGlowMat,
  );
  signGlow.position.set(0, plaqueY, 0.265);
  g.add(signGlow);

  gateSignRefreshers.push(function () {
    var freshTex = makeSignTextures(gateLabels[gi]);
    freshTex.base.anisotropy = maxAniso;
    freshTex.glow.anisotropy = maxAniso;
    signBaseMat.map = freshTex.base;
    signBaseMat.needsUpdate = true;
    signGlowMat.map = freshTex.glow;
    signGlowMat.needsUpdate = true;
  });

  var ornGeo = new THREE.TorusGeometry(0.2, 0.04, 6, 12);
  [-1.25, 1.25].forEach(function (ox) {
    var ringY = 1.5;
    var ringZ = 0.42;

    var orn = new THREE.Mesh(ornGeo, goldMat);
    orn.position.set(ox, ringY, ringZ);
    orn.castShadow = false;
    g.add(orn);

    var gateAnchorPos = new THREE.Vector3(ox, lintel.position.y - 0.18, ringZ);
    var ringTopPos = new THREE.Vector3(ox, ringY + 0.18, ringZ);
    attachChain(gateAnchorPos, ringTopPos, g);

    placeFoliageCluster(new THREE.Vector3(ox, ringY - 0.15, 0.48), g);
  });

  // Single glow per gate (absorbs former torch + signBacking intensities)
  var glow = new THREE.PointLight(gateColors[gi], 1.55, 6.5);
  glow.position.set(0, 1.2, 0.3);
  g.add(glow);
  g.userData.glow = glow;
  g.userData.baseIntensity = 1.55;
  g.userData.track = gateTracks[gi];
  g.userData.signGlowMat = signGlowMat;

  var hitBox = new THREE.Mesh(
    new THREE.BoxGeometry(2.7, 3.9, 1.3),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitBox.position.set(0, 1.2, 0.25);
  hitBox.userData.track = gateTracks[gi];
  g.add(hitBox);
  gateHitMeshes.push(hitBox);

  scene.add(g);
  gateGroups.push(g);
});

refreshCarvedSignsWhenFontReady();

// ---- 07.structure.js ----
function buildSimplePillar(radius, height) {
  var group = new THREE.Group();
  var shaft = new THREE.Mesh(
    flutedColumnGeometry(radius, radius * 0.85, height, 4, 8, 6, radius * 0.14),
    basaltMat,
  );
  shaft.position.y = height / 2;
  shaft.castShadow = true;
  shaft.receiveShadow = true;
  group.add(shaft);

  var capital = new THREE.Mesh(
    new THREE.BoxGeometry(radius * 2.6, 0.12, radius * 2.6),
    goldMat,
  );
  capital.position.y = height + 0.06;
  capital.castShadow = true;
  group.add(capital);

  return group;
}

// ZIGGURAT WITH ENGAGED PILLARS
var zigZ = -6.5;
var tierDefs = [
  { size: 14.0, height: 1.1, y: -2.0, cols: 8 },
  { size: 10.4, height: 1.2, y: -0.75, cols: 6 },
  { size: 7.4, height: 1.35, y: 0.65, cols: 4 },
  { size: 4.8, height: 1.5, y: 2.15, cols: 4 },
  { size: 2.8, height: 1.65, y: 3.85, cols: 2 },
];

var ziggurat = new THREE.Group();

tierDefs.forEach(function (t) {
  var tier = new THREE.Mesh(
    new THREE.BoxGeometry(t.size, t.height, t.size),
    basaltMat,
  );
  tier.position.set(0, t.y, zigZ);
  tier.castShadow = true;
  tier.receiveShadow = true;
  ziggurat.add(tier);

  var trim = wireMesh(
    new THREE.BoxGeometry(t.size, t.height, t.size),
    GOLD,
    0.34,
  );
  trim.position.copy(tier.position);
  ziggurat.add(trim);

  var corniceY = t.y + t.height / 2 + 0.06;
  var cornice = new THREE.Mesh(
    new THREE.BoxGeometry(t.size + 0.32, 0.14, t.size + 0.32),
    goldMat,
  );
  cornice.position.set(0, corniceY, zigZ);
  cornice.castShadow = true;
  cornice.receiveShadow = true;
  ziggurat.add(cornice);

  var corniceInlay = new THREE.Mesh(
    new THREE.BoxGeometry(t.size + 0.36, 0.05, t.size + 0.36),
    lapisMat,
  );
  corniceInlay.position.set(0, corniceY + 0.07, zigZ);
  ziggurat.add(corniceInlay);

  addTierAccentLines(
    t.size + 0.38,
    t.size + 0.38,
    corniceY + 0.07,
    zigZ,
    ziggurat,
  );

  var corniceTrim = wireMesh(
    new THREE.BoxGeometry(t.size + 0.32, 0.14, t.size + 0.32),
    GOLD,
    0.5,
  );
  corniceTrim.position.copy(cornice.position);
  ziggurat.add(corniceTrim);

  var entW = Math.min(1.2, t.size * 0.22);
  var entH = t.height * 0.65;
  var faceZ = zigZ + t.size / 2;
  var frontZ = faceZ + 0.06;
  var voidZ = faceZ + 0.02;

  buildPortalGlass(
    entW * 1.06,
    entH * 1.06,
    new THREE.Vector3(0, t.y - t.height / 2 + entH / 2 + 0.05, voidZ),
    ziggurat,
  );

  var jambPillarR = Math.min(0.11, entW * 0.11);
  var jambPillarH = entH * 0.98;
  [-1, 1].forEach(function (side) {
    var jambPillar = buildSimplePillar(jambPillarR, jambPillarH);
    jambPillar.position.set(
      side * (entW / 2 + jambPillarR * 1.8),
      t.y - t.height / 2,
      frontZ,
    );
    ziggurat.add(jambPillar);
  });

  var entFrame = wireMesh(
    new THREE.BoxGeometry(entW + 0.1, entH + 0.08, 0.38),
    GOLD,
    0.8,
  );
  entFrame.position.set(0, t.y - t.height / 2 + entH / 2 + 0.05, frontZ);
  ziggurat.add(entFrame);

  if (t.cols > 1) {
    var colRadius = 0.12;
    var colH = t.height * 0.88;
    var colZ = zigZ + t.size / 2 + colRadius * 0.3;
    var span = t.size - 1.2;
    var startX = -span / 2;
    var stepX = span / (t.cols - 1);

    for (var ci = 0; ci < t.cols; ci++) {
      var cx = startX + ci * stepX;
      if (Math.abs(cx) < entW / 2 + 0.15) continue;

      var engagedCol = new THREE.Mesh(
        flutedColumnGeometry(
          colRadius,
          colRadius * 0.85,
          colH,
          4,
          6,
          6,
          colRadius * 0.14,
        ),
        basaltMat,
      );
      engagedCol.position.set(cx, t.y - t.height / 2 + colH / 2, colZ);
      engagedCol.castShadow = true;
      engagedCol.receiveShadow = true;
      ziggurat.add(engagedCol);

      var cap = new THREE.Mesh(
        new THREE.BoxGeometry(colRadius * 2.8, 0.12, colRadius * 2.8),
        goldMat,
      );
      cap.position.set(cx, t.y - t.height / 2 + colH + 0.06, colZ);
      cap.castShadow = true;
      ziggurat.add(cap);
    }
  }

  var clusterCount = Math.max(2, Math.floor(t.size / 2.2));
  for (var fc = 0; fc < clusterCount; fc++) {
    var folX =
      -t.size / 2 + 0.6 + fc * ((t.size - 1.2) / Math.max(1, clusterCount - 1));
    placeFoliageCluster(
      new THREE.Vector3(folX, corniceY - 0.08, zigZ + t.size / 2 + 0.18),
      ziggurat,
    );
  }
});
scene.add(ziggurat);

// SECRET NICHES — middle-tier L/R bays (Konami reveal)
// Sealed: flush basalt wall (blends). Open: empty square, white glow from inside on hover.
var sealedPanelGroups = [];
var secretRevealed = false;
var secretNicheGroups = [];

(function buildMiddleTierSecretNiches() {
  var mid = tierDefs[2];
  var midFaceZ = zigZ + mid.size / 2;
  var portalY = mid.y;
  var bayXs = [-2.067, 2.067];
  var panelW = 1.85;
  var panelH = mid.height * 0.92;
  var panelD = 0.2;
  var openW = panelW * 0.72;
  var openH = panelH * 0.72;

  function buildSealedPanel(bayX) {
    var panel = new THREE.Group();
    // Flush with the tier face — reads as continuous wall until reveal
    panel.position.set(bayX, portalY, midFaceZ + panelD * 0.5 - 0.01);

    // Shared basalt (no clone) — reveal removes instantly, never fades opacity
    var slab = new THREE.Mesh(
      new THREE.BoxGeometry(panelW, panelH, panelD),
      basaltMat,
    );
    slab.castShadow = false;
    slab.receiveShadow = false;
    panel.add(slab);

    var crackCanvas = document.createElement("canvas");
    crackCanvas.width = 64;
    crackCanvas.height = 64;
    var cctx = crackCanvas.getContext("2d");
    cctx.strokeStyle = "rgba(15,10,6,0.95)";
    cctx.lineWidth = 2;
    cctx.beginPath();
    cctx.moveTo(32, 4);
    cctx.lineTo(28, 28);
    cctx.lineTo(36, 44);
    cctx.lineTo(24, 60);
    cctx.moveTo(28, 28);
    cctx.lineTo(12, 40);
    cctx.moveTo(36, 44);
    cctx.lineTo(52, 38);
    cctx.stroke();
    var crackMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(crackCanvas),
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    var crack = new THREE.Mesh(
      new THREE.PlaneGeometry(panelW * 0.9, panelH * 0.9),
      crackMat,
    );
    crack.position.z = panelD * 0.52;
    panel.add(crack);

    panel.userData.slab = slab;
    panel.userData.crack = crack;
    panel.userData.crackMat = crackMat;
    ziggurat.add(panel);
    sealedPanelGroups.push(panel);
    return panel;
  }

  function buildSecretNiche(bayX, track, label) {
    gateTracks.push(track);
    gateLabels.push(label);
    gateColors.push(0xffffff);
    gateScaleCur.push(1);
    gateScaleTarget.push(1);
    gatePortalModels.push(null);

    var g = new THREE.Group();
    g.position.set(bayX, portalY, midFaceZ + 0.02);
    g.visible = false;
    g.userData.secret = true;
    g.userData.baseScale = 1;
    g.userData.track = track;

    // Recessed dark bay (only visible after seal breaks)
    var recess = new THREE.Mesh(
      new THREE.BoxGeometry(openW * 1.05, openH * 1.05, 0.45),
      new THREE.MeshBasicMaterial({ color: 0x030201 }),
    );
    recess.position.z = -0.2;
    g.add(recess);

    var frameMat = new THREE.MeshBasicMaterial({ color: 0xc9a768 });
    var depth = 0.08;
    var t = 0.06;
    var top = new THREE.Mesh(
      new THREE.BoxGeometry(openW + t * 2, t, depth),
      frameMat,
    );
    top.position.set(0, openH / 2 + t / 2, 0);
    g.add(top);
    var bot = new THREE.Mesh(
      new THREE.BoxGeometry(openW + t * 2, t, depth),
      frameMat,
    );
    bot.position.set(0, -openH / 2 - t / 2, 0);
    g.add(bot);
    var left = new THREE.Mesh(
      new THREE.BoxGeometry(t, openH, depth),
      frameMat,
    );
    left.position.set(-openW / 2 - t / 2, 0, 0);
    g.add(left);
    var right = new THREE.Mesh(
      new THREE.BoxGeometry(t, openH, depth),
      frameMat,
    );
    right.position.set(openW / 2 + t / 2, 0, 0);
    g.add(right);

    var voidPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(openW, openH),
      new THREE.MeshBasicMaterial({ color: 0x010100 }),
    );
    voidPlane.position.z = -0.02;
    g.add(voidPlane);

    // White light from INSIDE the opening on hover
    var hoverGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    var hoverGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(openW * 0.95, openH * 0.95),
      hoverGlowMat,
    );
    hoverGlow.position.z = -0.08;
    g.add(hoverGlow);
    g.userData.hoverGlowMat = hoverGlowMat;

    var hoverGlowOuterMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    var hoverGlowOuter = new THREE.Mesh(
      new THREE.PlaneGeometry(openW * 1.15, openH * 1.15),
      hoverGlowOuterMat,
    );
    hoverGlowOuter.position.z = -0.04;
    g.add(hoverGlowOuter);
    g.userData.hoverGlowOuterMat = hoverGlowOuterMat;

    var labelCanvas = document.createElement("canvas");
    labelCanvas.width = 384;
    labelCanvas.height = 64;
    var lctx = labelCanvas.getContext("2d");
    lctx.clearRect(0, 0, 384, 64);
    lctx.fillStyle = "rgba(240, 230, 210, 0.95)";
    lctx.font = '700 28px "JetBrains Mono", monospace';
    lctx.textAlign = "center";
    lctx.textBaseline = "middle";
    lctx.fillText(label, 192, 32);
    var labelMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(labelCanvas),
      transparent: true,
      depthWrite: false,
    });
    var labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.85, 0.34),
      labelMat,
    );
    labelMesh.position.set(0, openH / 2 + 0.22, 0.05);
    g.add(labelMesh);

    var hitBox = new THREE.Mesh(
      new THREE.BoxGeometry(openW * 1.15, openH * 1.15, 0.6),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    hitBox.position.set(0, 0, 0.1);
    hitBox.userData.track = track;
    g.add(hitBox);
    gateHitMeshes.push(hitBox);

    scene.add(g);
    gateGroups.push(g);
    secretNicheGroups.push(g);
    return g;
  }

  buildSealedPanel(bayXs[0]);
  buildSealedPanel(bayXs[1]);
  buildSecretNiche(bayXs[0], "essays", "PERSONAL ESSAYS");
  buildSecretNiche(bayXs[1], "favorites", "FAVORITE THINGS");
})();

function shatterSealedPanel(panel, onDone) {
  // Instant remove — no rAF fade / material mode switches (those hitch hard)
  if (panel && panel.parent) panel.parent.remove(panel);
  if (onDone) onDone();
}

function revealSecretGates() {
  if (secretRevealed) return;
  secretRevealed = true;

  sealedPanelGroups.forEach(function (panel) {
    shatterSealedPanel(panel);
  });
  sealedPanelGroups.length = 0;

  // Defer one frame so panel removal and niche show don't share a long frame
  requestAnimationFrame(function () {
    secretNicheGroups.forEach(function (g) {
      g.visible = true;
    });
  });
}

window.Gravitas = window.Gravitas || {};
window.Gravitas.EasterEggs = window.Gravitas.EasterEggs || {};
window.Gravitas.EasterEggs.revealSecretGates = revealSecretGates;

// CROWN TEMPLE
(function buildCrownTemple() {
  var topTier = tierDefs[tierDefs.length - 1];
  var baseY = topTier.y + topTier.height / 2 + 0.14;
  var w = 2.4,
    d = 1.9,
    templeH = 1.6;

  var plinth = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.6, 0.24, d + 0.6),
    basaltMat,
  );
  plinth.position.set(0, baseY + 0.12, zigZ);
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  ziggurat.add(plinth);

  var templeCore = new THREE.Mesh(
    new THREE.BoxGeometry(w, templeH, d),
    basaltMat,
  );
  templeCore.position.set(0, baseY + 0.24 + templeH / 2, zigZ);
  templeCore.castShadow = true;
  templeCore.receiveShadow = true;
  ziggurat.add(templeCore);

  var templeTrim = wireMesh(new THREE.BoxGeometry(w, templeH, d), GOLD, 0.45);
  templeTrim.position.copy(templeCore.position);
  ziggurat.add(templeTrim);

  var pRad = 0.09;
  var pXs = [-w / 2, -w / 6, w / 6, w / 2];
  pXs.forEach(function (px) {
    var colF = new THREE.Mesh(
      flutedColumnGeometry(pRad, pRad * 0.85, templeH, 4, 6, 6, pRad * 0.14),
      goldMat,
    );
    colF.position.set(
      px,
      baseY + 0.24 + templeH / 2,
      zigZ + d / 2 + pRad * 0.2,
    );
    colF.castShadow = true;
    ziggurat.add(colF);

    var colB = new THREE.Mesh(
      flutedColumnGeometry(pRad, pRad * 0.85, templeH, 4, 6, 6, pRad * 0.14),
      goldMat,
    );
    colB.position.set(
      px,
      baseY + 0.24 + templeH / 2,
      zigZ - d / 2 - pRad * 0.2,
    );
    colB.castShadow = true;
    ziggurat.add(colB);
  });

  buildPortalGlass(
    0.8,
    1.1,
    new THREE.Vector3(0, baseY + 0.24 + 0.55, zigZ + d / 2 + 0.03),
    ziggurat,
  );

  var portalGlow = new THREE.PointLight(0x2bb8b0, 0.8, 2.5);
  portalGlow.position.set(0, baseY + 0.24 + 0.55, zigZ + d / 2 + 0.2);
  ziggurat.add(portalGlow);

  var roofY = baseY + 0.24 + templeH + 0.18;
  var roof = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.8, 0.36, d + 0.8),
    basaltMat,
  );
  roof.position.set(0, roofY, zigZ);
  roof.castShadow = true;
  roof.receiveShadow = true;
  ziggurat.add(roof);

  var roofCornice = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.92, 0.12, d + 0.92),
    goldMat,
  );
  roofCornice.position.set(0, roofY + 0.18, zigZ);
  ziggurat.add(roofCornice);

  var roofInlay = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.82, 0.08, d + 0.82),
    lapisMat,
  );
  roofInlay.position.set(0, roofY, zigZ);
  ziggurat.add(roofInlay);

  var roofTrim = wireMesh(
    new THREE.BoxGeometry(w + 0.8, 0.36, d + 0.8),
    GOLD,
    0.6,
  );
  roofTrim.position.copy(roof.position);
  ziggurat.add(roofTrim);

  placeFoliageCluster(
    new THREE.Vector3(-w / 2, roofY - 0.1, zigZ + d / 2 + 0.4),
    ziggurat,
  );
  placeFoliageCluster(
    new THREE.Vector3(w / 2, roofY - 0.1, zigZ + d / 2 + 0.4),
    ziggurat,
  );
})();

function addTierWaterfalls(catchTier, sourceTier) {
  var sourceTopY = sourceTier.y + sourceTier.height / 2 + 0.05;
  var catchTopY = catchTier.y + catchTier.height / 2 + 0.24;
  var waterfallZ = zigZ + sourceTier.size / 2 + 0.1;
  var height = sourceTopY - catchTopY;
  if (height <= 0.05) return;
  var centerY = catchTopY + height / 2;

  var sideOffset = Math.max(0.7, sourceTier.size * 0.34);
  var streamW = Math.max(0.32, sourceTier.size * 0.09);
  var waterfallSpecs = [
    { x: -sideOffset, w: streamW, z: waterfallZ },
    { x: sideOffset, w: streamW, z: waterfallZ - 0.02 },
  ];

  waterfallSpecs.forEach(function (spec) {
    buildWaterfall(
      spec.w,
      height,
      new THREE.Vector3(spec.x, centerY, spec.z),
      ziggurat,
    );
  });
}

for (var wfi = 0; wfi < tierDefs.length - 1; wfi++) {
  addTierWaterfalls(tierDefs[wfi], tierDefs[wfi + 1]);
}

var shadowGround = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.ShadowMaterial({ opacity: 0.4 }),
);
shadowGround.rotation.x = -Math.PI / 2;
shadowGround.position.y = -2.02;
shadowGround.receiveShadow = true;
scene.add(shadowGround);

(function createCentralLightShaft() {
  var height = 18.0,
    radiusTop = 0.8,
    radiusBottom = 3.5;
  var cylinderGeo = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    16,
    1,
    true,
  );

  var shaftMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        varying vec2 vUv; varying vec3 vNormal; varying vec3 vViewPosition;
        void main() {
          vUv = uv; vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz; gl_Position = projectionMatrix * mvPosition;
        }
      `,
    fragmentShader: `
        varying vec2 vUv; varying vec3 vNormal; varying vec3 vViewPosition;
        void main() {
          float topFade = smoothstep(1.0, 0.7, vUv.y);
          float bottomFade = smoothstep(0.0, 0.25, vUv.y);
          float verticalMask = topFade * bottomFade;
          vec3 normal = normalize(vNormal); vec3 viewDir = normalize(vViewPosition);
          float rim = 1.0 - abs(dot(viewDir, normal)); rim = pow(rim, 2.0);
          vec3 beamColor = vec3(0.82, 0.94, 0.98);
          float intensity = verticalMask * rim * 0.15;
          gl_FragColor = vec4(beamColor, intensity);
        }
      `,
    blending: THREE.AdditiveBlending,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  var lightShaft = new THREE.Mesh(cylinderGeo, shaftMaterial);
  lightShaft.position.set(0, 3.2, zigZ);
  scene.add(lightShaft);
})();

// WATER SHADER
var poolWaterUniforms = {
  uTime: { value: 0.0 },
  uWaterColor: { value: new THREE.Vector3(0.18, 0.72, 0.76) },
  uHighlightColor: { value: new THREE.Vector3(0.75, 0.96, 1.0) },
};

var poolWaterVertexShader = `
    varying vec2 vUv;
    varying vec3 vViewPosition;

    uniform float uTime;

    void main() {
      vUv = uv;
      vec3 pos = position;
      
      float wave1 = sin(pos.x * 1.5 + uTime * 2.0) * 0.02;
      float wave2 = cos(pos.y * 1.8 + uTime * 1.5) * 0.015;
      pos.z += wave1 + wave2;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

var poolWaterFragmentShader = `
    uniform float uTime;
    uniform vec3 uWaterColor;
    uniform vec3 uHighlightColor;

    varying vec2 vUv;
    varying vec3 vViewPosition;

    void main() {
      float w1 = sin(vUv.x * 24.0 + uTime * 3.0);
      float w2 = cos(vUv.y * 24.0 - uTime * 2.5);
      float sparkle = pow(clamp(w1 * w2, 0.0, 1.0), 4.0);

      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(viewDir.z), 2.0);

      vec3 finalColor = mix(uWaterColor, uHighlightColor, sparkle * 0.6 + fresnel * 0.25);
      float alpha = clamp(0.65 + fresnel * 0.2, 0.6, 0.85);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

var poolWaterMaterial = new THREE.ShaderMaterial({
  uniforms: poolWaterUniforms,
  vertexShader: poolWaterVertexShader,
  fragmentShader: poolWaterFragmentShader,
  transparent: true,
  depthWrite: false,
  side: THREE.FrontSide,
});

function addPool(size, y, z) {
  var group = new THREE.Group();
  var poolW = size - 0.08;
  var poolD = size * 0.38 - 0.08;
  var waterY = y + 0.018;
  var segs = C.perf.poolGridSegs;

  var poolMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(poolW, poolD, segs, segs),
    poolWaterMaterial,
  );
  poolMesh.rotation.x = -Math.PI / 2;
  poolMesh.position.set(0, waterY, z);
  group.add(poolMesh);

  buildPoolEdge(new THREE.Vector3(0, 0, z), size, size * 0.38, waterY, group);

  scene.add(group);
  return group;
}

for (var ti = 0; ti < tierDefs.length - 1; ti++) {
  var lower = tierDefs[ti],
    upper = tierDefs[ti + 1];
  var lowerTopY = lower.y + lower.height / 2;
  var z = zigZ + upper.size / 2 + 0.03;
  addPool(upper.size * 0.92, lowerTopY, z + 0.35);
}

var baseTier = tierDefs[0];
var baseZ = zigZ + baseTier.size / 2 + 0.03;
addPool(baseTier.size * 0.62, forecourtY + 0.2, baseZ + 0.7);

// MOTES
var moteCount = IS_MOBILE ? C.hero.motes.count.mobile : C.hero.motes.count.desktop;
var moteGeo = new THREE.BufferGeometry();
var motePos = new Float32Array(moteCount * 3);
for (var mi = 0; mi < moteCount; mi++) {
  motePos[mi * 3] = (Math.random() - 0.5) * 16;
  motePos[mi * 3 + 1] = -2 + Math.random() * 9;
  motePos[mi * 3 + 2] = -8 + Math.random() * 16;
}
moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
var moteCanvas = document.createElement("canvas");
moteCanvas.width = moteCanvas.height = 16;
var moteCtx = moteCanvas.getContext("2d");
var moteGrad = moteCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
moteGrad.addColorStop(0, "rgba(255,224,180,0.9)");
moteGrad.addColorStop(1, "rgba(255,224,180,0)");
moteCtx.fillStyle = moteGrad;
moteCtx.fillRect(0, 0, 16, 16);

var motes = new THREE.Points(
  moteGeo,
  new THREE.PointsMaterial({
    map: new THREE.CanvasTexture(moteCanvas),
    size: C.hero.motes.size,
    transparent: true,
    opacity: C.hero.motes.opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: C.hero.motes.color,
  }),
);
scene.add(motes);

// CAMERA & PARALLAX STATE

// ---- 08.camera.js ----
var camWide = {
  pos: new THREE.Vector3(
    C.hero.camera.wide.pos.x,
    C.hero.camera.wide.pos.y,
    C.hero.camera.wide.pos.z,
  ),
  look: new THREE.Vector3(
    C.hero.camera.wide.look.x,
    C.hero.camera.wide.look.y,
    C.hero.camera.wide.look.z,
  ),
  fov: C.hero.camera.wide.fov,
};
var camGates = {
  pos: new THREE.Vector3(
    C.hero.camera.gates.pos.x,
    C.hero.camera.gates.pos.y,
    C.hero.camera.gates.pos.z,
  ),
  look: new THREE.Vector3(
    C.hero.camera.gates.look.x,
    C.hero.camera.gates.look.y,
    C.hero.camera.gates.look.z,
  ),
  fov: C.hero.camera.gates.fov,
};

// On a narrow/portrait viewport, camGates.fov (a fixed VERTICAL FOV)
// produces a much narrower HORIZONTAL FOV than on a wide desktop
// screen — narrow enough that the two side gates fall outside the
// frame entirely, leaving only the center one visible. This solves
// for the vertical FOV needed to guarantee a minimum horizontal FOV
// regardless of aspect ratio, so all three gates always fit.
var GATES_MIN_HFOV_DEG = C.hero.camera.gates.minHfovDeg;
var GATES_MAX_FOV = C.hero.camera.gates.maxFov; // cap so extreme aspect ratios don't fisheye

function getAdaptiveGatesCamera() {
  var aspect = camera.aspect || bayEl.clientWidth / (bayEl.clientHeight || 1);
  var baseVFovRad = (camGates.fov * Math.PI) / 180;
  var baseHFovDeg =
    (2 * Math.atan(Math.tan(baseVFovRad / 2) * aspect) * 180) / Math.PI;

  var fov = camGates.fov;
  if (baseHFovDeg < GATES_MIN_HFOV_DEG) {
    var neededHFovRad = (GATES_MIN_HFOV_DEG * Math.PI) / 180;
    var neededVFovRad = 2 * Math.atan(Math.tan(neededHFovRad / 2) / aspect);
    fov = Math.min((neededVFovRad * 180) / Math.PI, GATES_MAX_FOV);
  }

  return { pos: camGates.pos, look: camGates.look, fov: fov };
}
var camCurPos = camWide.pos.clone(),
  camCurLook = camWide.look.clone();
var camCurFov = camWide.fov;
var camFrom = null,
  camTo = null,
  camAnimStart = null,
  camAnimDur = C.hero.camera.defaultTransitionMs;

var mouseTargetX = 0,
  mouseTargetY = 0;
var mouseCurX = 0,
  mouseCurY = 0;
var PARALLAX_MAX_X = C.hero.parallax.maxX;
var PARALLAX_MAX_Y = C.hero.parallax.maxY;
var PARALLAX_DAMPING = C.hero.parallax.damping;
var isPortalFlyThrough = false;

var targetCamPos = new THREE.Vector3();
var targetCamLook = new THREE.Vector3();

window.addEventListener("mousemove", function (e) {
  mouseTargetX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseTargetY = -(e.clientY / window.innerHeight) * 2 + 1;
});

function easeSmooth(t) {
  if (t >= 1) return 1;
  if (t <= 0) return 0;
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function goCamera(target, duration) {
  camFrom = {
    pos: camCurPos.clone(),
    look: camCurLook.clone(),
    fov: camCurFov,
  };
  camTo = target;
  camAnimDur = duration || C.hero.camera.defaultTransitionMs;
  camAnimStart = performance.now();
  if (typeof requestShadowBake === "function") requestShadowBake();
}

camera.position.copy(camCurPos);
camera.up.set(0, 1, 0);
camera.lookAt(camCurLook);
camera.fov = camCurFov;
camera.updateProjectionMatrix();

var hoverNudgeCur = 0,
  hoverNudgeTarget = 0,
  hoveredGateX = 0;

function tickCamera() {
  var fovChanged = false;

  if (camAnimStart !== null) {
    var t = (performance.now() - camAnimStart) / camAnimDur;
    if (t >= 1) t = 1;
    var e = easeSmooth(t);
    camCurPos.lerpVectors(camFrom.pos, camTo.pos, e);
    camCurLook.lerpVectors(camFrom.look, camTo.look, e);
    camCurFov = camFrom.fov + (camTo.fov - camFrom.fov) * e;
    fovChanged = true;
    if (t >= 1) camAnimStart = null;
  }

  if (!isPortalFlyThrough) {
    hoverNudgeCur +=
      (hoverNudgeTarget - hoverNudgeCur) * C.hero.hoverNudge.damping;
    var nudgeX = hoveredGateX * C.hero.hoverNudge.xScale * hoverNudgeCur;
    var nudgeZ = C.hero.hoverNudge.zOffset * hoverNudgeCur;
    var breathe =
      camAnimStart === null
        ? Math.sin(Date.now() * C.hero.breathe.speed) * C.hero.breathe.amount
        : 0;

    mouseCurX += (mouseTargetX - mouseCurX) * PARALLAX_DAMPING;
    mouseCurY += (mouseTargetY - mouseCurY) * PARALLAX_DAMPING;

    var parallaxX = mouseCurX * PARALLAX_MAX_X;
    var parallaxY = mouseCurY * PARALLAX_MAX_Y;

    camera.position.set(
      camCurPos.x + nudgeX + parallaxX,
      camCurPos.y + breathe + parallaxY,
      camCurPos.z + nudgeZ,
    );
    camera.lookAt(
      camCurLook.x +
        nudgeX * C.hero.hoverNudge.lookXFactor +
        parallaxX * C.hero.hoverNudge.parallaxLookFactor,
      camCurLook.y + parallaxY * C.hero.hoverNudge.parallaxLookFactor,
      camCurLook.z,
    );
  } else {
    camera.position.copy(camCurPos);
    camera.lookAt(camCurLook);
  }

  if (fovChanged || Math.abs(camera.fov - camCurFov) > 0.001) {
    camera.fov = camCurFov;
    camera.updateProjectionMatrix();
  }
}

// ---- 09.gates.js ----
// GATE INTERACTION — hover, pick, portal fly-through
var gatesInteractive = false;
var pickedTrack = null;
var isRunning = true;
var animFrameId = null;
var lastFrameTime = Date.now();

var gateRaycaster = new THREE.Raycaster();
var gatePointerNDC = new THREE.Vector2();
var gateFlyTimers = [];
var gateWorldPos = new THREE.Vector3();
var lastPickNDC = new THREE.Vector2(Infinity, Infinity);
var PICK_NDC_EPS = 0.004;

function clearGateFlyTimers() {
  for (var i = 0; i < gateFlyTimers.length; i++) {
    clearTimeout(gateFlyTimers[i]);
  }
  gateFlyTimers = [];
}

function scheduleGateFly(fn, ms) {
  gateFlyTimers.push(setTimeout(fn, ms));
}

function setGateHover(track, on) {
  var next = null;
  if (on === false) {
    next = null;
  } else if (track) {
    next = track;
  }

  pickedTrack = next;

  for (var i = 0; i < gateGroups.length; i++) {
    var isOn = gateTracks[i] === pickedTrack;
    var gHover = gateGroups[i];
    if (gHover && gHover.userData.secret) {
      gateScaleTarget[i] = 1.0;
    } else {
      gateScaleTarget[i] = isOn ? 1.085 : 1.0;
      if (gatePortalModels[i]) {
        gatePortalModels[i].hoverOn = isOn;
        gatePortalModels[i].changedAt = Date.now();
      }
    }
  }

  if (pickedTrack) {
    var gi = gateTracks.indexOf(pickedTrack);
    var g = gi >= 0 ? gateGroups[gi] : null;
    hoveredGateX = g ? g.position.x / 4.5 : 0;
    hoverNudgeTarget = 1;
    renderer.domElement.classList.add("gate-hovered");
  } else {
    hoveredGateX = 0;
    hoverNudgeTarget = 0;
    renderer.domElement.classList.remove("gate-hovered");
  }
}

function checkGatePick(force) {
  if (!gatesInteractive || isPortalFlyThrough) return;

  gatePointerNDC.set(mouseTargetX, mouseTargetY);
  if (
    !force &&
    Math.abs(gatePointerNDC.x - lastPickNDC.x) < PICK_NDC_EPS &&
    Math.abs(gatePointerNDC.y - lastPickNDC.y) < PICK_NDC_EPS
  ) {
    return;
  }
  lastPickNDC.copy(gatePointerNDC);

  gateRaycaster.setFromCamera(gatePointerNDC, camera);

  var hits = gateRaycaster.intersectObjects(gateHitMeshes, false);
  var track = hits.length ? hits[0].object.userData.track : null;

  if (track !== pickedTrack) {
    setGateHover(track, !!track);
  }
}

renderer.domElement.addEventListener(
  "pointermove",
  function () {
    checkGatePick(false);
  },
  { passive: true },
);

function tickGates() {
  var t = Date.now() * 0.001;

  for (var i = 0; i < gateGroups.length; i++) {
    var g = gateGroups[i];
    var isOn = gateTracks[i] === pickedTrack;

    // Secret niches: static square + white light from inside on hover
    if (g.userData.secret) {
      g.scale.setScalar(1);
      if (!g.visible) continue;
      var hoverGlow = g.userData.hoverGlowMat;
      var hoverOuter = g.userData.hoverGlowOuterMat;
      var glowTarget = isOn ? 0.95 : 0;
      var outerTarget = isOn ? 0.45 : 0;
      if (hoverGlow) {
        hoverGlow.opacity += (glowTarget - hoverGlow.opacity) * 0.2;
      }
      if (hoverOuter) {
        hoverOuter.opacity += (outerTarget - hoverOuter.opacity) * 0.18;
      }
      continue;
    }

    gateScaleCur[i] += (gateScaleTarget[i] - gateScaleCur[i]) * 0.14;
    var s = gateScaleCur[i];
    var baseScale = g.userData.baseScale || 1;
    g.scale.setScalar(baseScale * s);

    var glow = g.userData.glow;
    if (glow) {
      var base = g.userData.baseIntensity || 0.9;
      var boost = isOn ? 1.85 : 1.0;
      glow.intensity =
        base * boost + Math.sin(t * 3.2 + i * 1.7) * (isOn ? 0.18 : 0.06);
    }

    var signMat = g.userData.signGlowMat;
    if (signMat) {
      var targetOp = isOn ? 0.92 : 0.0;
      signMat.opacity += (targetOp - signMat.opacity) * 0.12;
    }
  }
}

function tickPortalModels(dtMs) {
  for (var i = 0; i < gatePortalModels.length; i++) {
    var entry = gatePortalModels[i];
    if (!entry || !entry.model || !entry.model.userData) continue;
    var ud = entry.model.userData;
    var tickFn = ud.tick;
    if (typeof tickFn !== "function") continue;

    var progress =
      typeof ud.assembleProgress === "number"
        ? ud.assembleProgress
        : ud.hoverProgress;
    // Hovered: always tick. Idle: only while collapsing back to rest.
    if (!entry.hoverOn && !(typeof progress === "number" && progress > 0.01)) {
      continue;
    }

    tickFn.call(ud, dtMs, !!entry.hoverOn);
  }
}

function flyIntoGate(track, done) {
  clearGateFlyTimers();

  var idx = gateTracks.indexOf(track);
  if (idx < 0) idx = 0;
  var g = gateGroups[idx];
  if (!g) {
    if (typeof done === "function") done();
    return;
  }

  activeEnteredGate = track;
  isPortalFlyThrough = true;
  gatesInteractive = false;
  setGateHover(track, true);

  g.getWorldPosition(gateWorldPos);
  var gx = gateWorldPos.x;
  var gy = gateWorldPos.y + C.hero.camera.flyIn.eyeYOffset;
  var gz = gateWorldPos.z;
  var approach = C.hero.camera.flyIn.approach;
  var plunge = C.hero.camera.flyIn.plunge;

  goCamera(
    {
      pos: new THREE.Vector3(
        gx * approach.posXScale,
        gy + approach.posYOffset,
        gz + approach.posZOffset,
      ),
      look: new THREE.Vector3(gx, gy, gz + approach.lookZOffset),
      fov: approach.fov,
    },
    approach.durationMs,
  );

  scheduleGateFly(function () {
    goCamera(
      {
        pos: new THREE.Vector3(gx, gy, gz + plunge.posZOffset),
        look: new THREE.Vector3(gx, gy, gz + plunge.lookZOffset),
        fov: plunge.fov,
      },
      plunge.durationMs,
    );
  }, plunge.delayMs);

  scheduleGateFly(function () {
    if (typeof done === "function") done();
  }, C.hero.camera.flyIn.doneDelayMs);
}

function flyOutOfGate(done) {
  clearGateFlyTimers();

  isPortalFlyThrough = true;
  activeEnteredGate = null;

  goCamera(getAdaptiveGatesCamera(), C.hero.camera.flyOut.durationMs);

  scheduleGateFly(function () {
    isPortalFlyThrough = false;
    if (typeof done === "function") done();
  }, C.hero.camera.flyOut.doneDelayMs);
}

/** Instantly restore the gates framing (history Back skips the fly-out). */
function snapToGatesView(opts) {
  opts = opts || {};
  clearGateFlyTimers();
  isPortalFlyThrough = false;
  activeEnteredGate = null;

  var target = getAdaptiveGatesCamera();
  camCurPos.copy(target.pos);
  camCurLook.copy(target.look);
  camCurFov = target.fov;
  camFrom = {
    pos: camCurPos.clone(),
    look: camCurLook.clone(),
    fov: camCurFov,
  };
  camTo = {
    pos: camCurPos.clone(),
    look: camCurLook.clone(),
    fov: camCurFov,
  };
  camAnimStart = null;

  camera.position.copy(camCurPos);
  camera.up.set(0, 1, 0);
  camera.lookAt(camCurLook);
  camera.fov = camCurFov;
  camera.updateProjectionMatrix();

  if (typeof opts.interactive === "boolean") {
    gatesInteractive = opts.interactive;
    if (!opts.interactive && pickedTrack) {
      setGateHover(pickedTrack, false);
      pickedTrack = null;
      renderer.domElement.classList.remove("gate-hovered");
    }
  }
}

/** Instantly restore the wide hero framing. */
function snapToWideView() {
  clearGateFlyTimers();
  isPortalFlyThrough = false;
  activeEnteredGate = null;
  gatesInteractive = false;
  if (pickedTrack) {
    setGateHover(pickedTrack, false);
    pickedTrack = null;
    renderer.domElement.classList.remove("gate-hovered");
  }

  camCurPos.copy(camWide.pos);
  camCurLook.copy(camWide.look);
  camCurFov = camWide.fov;
  camFrom = {
    pos: camCurPos.clone(),
    look: camCurLook.clone(),
    fov: camCurFov,
  };
  camTo = {
    pos: camCurPos.clone(),
    look: camCurLook.clone(),
    fov: camCurFov,
  };
  camAnimStart = null;

  camera.position.copy(camCurPos);
  camera.up.set(0, 1, 0);
  camera.lookAt(camCurLook);
  camera.fov = camCurFov;
  camera.updateProjectionMatrix();
}

renderer.domElement.addEventListener("click", function () {
  if (!gatesInteractive || isPortalFlyThrough || !pickedTrack) return;
  if (window.Gravitas.Hero && typeof window.Gravitas.Hero.onGateClick === "function") {
    window.Gravitas.Hero.onGateClick(pickedTrack);
  }
});

// ---- 10.loop.js ----
function animateBay() {
  if (!isRunning) return;
  animFrameId = requestAnimationFrame(animateBay);
  var now = Date.now();
  var dt = Math.min(now - lastFrameTime, 64);
  lastFrameTime = now;
  var timeSec = now * 0.001;

  tickPortalModels(dt);

  poolWaterUniforms.uTime.value = timeSec;
  waterfallUniforms.uTime.value = timeSec;

  brazierL.intensity = 1.3 + Math.sin(now * 0.006) * 0.25;
  brazierR.intensity = 1.3 + Math.sin(now * 0.006 + 1.7) * 0.25;
  templeAccentLight.intensity = 1.2 + Math.sin(now * 0.001) * 0.18;

  if (emblemMesh) {
    emblemMesh.position.y = emblemBaseY + Math.sin(timeSec * 0.55) * 0.045;
    emblemMesh.rotation.z = Math.sin(timeSec * 0.4) * 0.012;
    emblemMesh.rotation.x = Math.sin(timeSec * 0.33 + 1.1) * 0.008;
  }

  tickFoliage(timeSec);
  tickCamera();
  tickGates();

  renderer.render(scene, camera);
  if (typeof settleShadowMap === "function") settleShadowMap();
}

function pause() {
  isRunning = false;
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  if (heroLogo) heroLogo.pause();
}

function resume() {
  if (isRunning) return;
  isRunning = true;
  if (typeof requestShadowBake === "function") requestShadowBake();
  if (heroLogo) heroLogo.resume();
  animateBay();
}

animateBay();

function resizeBay() {
  var w = bayEl.clientWidth,
    h = bayEl.clientHeight;
  if (!w || !h) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

window.addEventListener("resize", function () {
  resizeBay();
  if (heroLogo) heroLogo.resize();
  if (bootLogo) bootLogo.resize();

  // Re-fit the gates framing on resize/orientation-change while
  // currently viewing them — otherwise rotating a phone from
  // portrait to landscape (or back) would leave the FOV computed
  // for the old aspect ratio until the next full gate transition.
  if (gatesInteractive) {
    var adaptive = getAdaptiveGatesCamera();
    camera.fov = adaptive.fov;
    camera.updateProjectionMatrix();
    camCurFov = adaptive.fov;
  }
});

window.Gravitas = window.Gravitas || {};
window.Gravitas.Hero = {
  toGates: function () {
    goCamera(getAdaptiveGatesCamera());
  },
  toWide: function () {
    goCamera(camWide);
  },
  flyIntoGate: flyIntoGate,
  flyOutOfGate: flyOutOfGate,
  snapToGates: snapToGatesView,
  snapToWide: snapToWideView,
  setHover: setGateHover,
  setInteractive: function (on) {
    gatesInteractive = on;
    if (!on && pickedTrack) {
      setGateHover(pickedTrack, false);
      pickedTrack = null;
      renderer.domElement.classList.remove("gate-hovered");
    }
  },
  onGateClick: null,
  pause: pause,
  resume: resume,
  resize: resizeBay,
  destroyBootLogo: function () {
    if (bootLogo) {
      bootLogo.destroy();
      bootLogo = null;
    }
  },
};
})();

