(function () {
  // ---- Dependency guard ----
  // If the Three.js CDN failed to load (network block, CDN outage), every
  // THREE.* call below would throw immediately with a cryptic
  // "THREE is not defined" error, leaving #scan-bay blank with no
  // explanation, AND leaving window.Gravitas.ScanBay undefined — meaning
  // any other code that calls e.g. window.Gravitas.ScanBay.hoverProject()
  // later would throw a second, unrelated-looking error. This catches it
  // at the source with a clear message and safe no-op stubs.
  if (typeof THREE === "undefined") {
    console.error(
      "GravitasScanBay: THREE.js failed to load — scan bay cannot initialize.",
    );
    var scanBayFallbackEl = document.getElementById("scan-bay");
    if (scanBayFallbackEl) {
      scanBayFallbackEl.innerHTML =
        '<div class="scene-load-error">3D scene unavailable — check your connection and refresh.</div>';
    }
    window.Gravitas = window.Gravitas || {};
    window.Gravitas.ScanBay = {
      setActiveModel: function () {},
      hoverProject: function () {},
      setHoverSpeed: function () {},
      setIdleSpeed: function () {},
      resizeBay: function () {},
      pause: function () {},
      resume: function () {},
      enterFocusMode: function () {},
      exitFocusMode: function () {},
      clearExtraHoverModels: function () {},
      getMemoryInfo: function () {
        return null;
      },
      dispose: function () {},
    };
    return;
  }

  function disposeHierarchy(node, disposeTextures) {
    if (!node) return;
    if (disposeTextures === undefined) disposeTextures = true;

    node.traverse(function (child) {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        var materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        materials.forEach(function (mat) {
          if (disposeTextures) {
            for (var key in mat) {
              if (
                mat[key] &&
                typeof mat[key] === "object" &&
                mat[key] !== null &&
                mat[key].isTexture
              ) {
                mat[key].dispose();
              }
            }
          }
          mat.dispose();
        });
      }
    });
  }

  var darkStoneMat = new THREE.MeshStandardMaterial({
    color: 0xa88452,
    roughness: 0.88,
    metalness: 0.04,
  });

  var goldMat = new THREE.MeshStandardMaterial({
    color: 0xb8843a,
    roughness: 0.55,
    metalness: 0.5,
  });

  var lapisMat = new THREE.MeshStandardMaterial({
    color: 0x105ba3,
    roughness: 0.32,
    metalness: 0.4,
    emissive: 0x082e5e,
    emissiveIntensity: 0.12,
  });

  function makeWoodGrainTexture() {
    var canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 256;
    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "#a88452";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < 90; i++) {
      var x = Math.random() * canvas.width;
      var w = 0.6 + Math.random() * 1.8;
      var shade = Math.random() < 0.5 ? "#8a6a3c" : "#c4a06e";
      ctx.globalAlpha = 0.1 + Math.random() * 0.18;
      ctx.fillStyle = shade;
      ctx.fillRect(x, 0, w, canvas.height);
    }
    ctx.globalAlpha = 1;

    var texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 2);
    return texture;
  }

  var woodGrainTexture = makeWoodGrainTexture();
  var columnMat = darkStoneMat.clone();
  columnMat.map = woodGrainTexture;

  var leafMat = new THREE.MeshStandardMaterial({
    color: 0x5a7d3a,
    roughness: 0.6,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  var poolWaterUniforms = {
    uTime: { value: 0.0 },
    uWaterColor: { value: new THREE.Vector3(0.04, 0.22, 0.28) },
    uHighlightColor: { value: new THREE.Vector3(0.25, 0.75, 0.78) },
  };

  var poolWaterVertexShader = `
    varying vec2 vUv;
    varying vec3 vViewPosition;
    uniform float uTime;
    void main() {
      vUv = uv;
      vec3 pos = position;
      float wave1 = sin(pos.x * 2.2 + uTime * 2.0) * 0.015;
      float wave2 = cos(pos.y * 2.2 + uTime * 1.6) * 0.012;
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
      float fresnel = pow(1.0 - abs(viewDir.z), 2.5);
      vec3 finalColor = mix(uWaterColor, uHighlightColor, sparkle * 0.45 + fresnel * 0.3);
      float alpha = clamp(0.8 + fresnel * 0.15, 0.75, 0.95);
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  var poolWaterMaterial = new THREE.ShaderMaterial({
    uniforms: poolWaterUniforms,
    vertexShader: poolWaterVertexShader,
    fragmentShader: poolWaterFragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  var brandLogo = mountStarLogo(document.getElementById("brand-logo"));
  if (brandLogo) brandLogo.pause();

  var bayEl = document.getElementById("scan-bay");
  if (!bayEl) return;

  var C = window.Gravitas.Constants;
  var IS_MOBILE =
    typeof window.Gravitas.isMobileExperience === "function"
      ? window.Gravitas.isMobileExperience()
      : typeof window.matchMedia === "function" &&
        window.matchMedia(
          "(max-width: " + C.mobile.maxWidthPx + "px) and (hover: none)",
        ).matches;

  // Mobile dossier uses a static header — skip WebGL entirely.
  if (IS_MOBILE) {
    bayEl.classList.add("scan-bay--static");
    window.Gravitas = window.Gravitas || {};
    window.Gravitas.ScanBay = {
      setActiveModel: function () {},
      hoverProject: function () {},
      setHoverSpeed: function () {},
      setIdleSpeed: function () {},
      resizeBay: function () {},
      pause: function () {},
      resume: function () {},
      enterFocusMode: function () {},
      exitFocusMode: function () {},
      clearExtraHoverModels: function () {},
      getMemoryInfo: function () {
        return null;
      },
      dispose: function () {},
    };
    return;
  }

  var scene = new THREE.Scene();
  var environmentGroup = new THREE.Group();
  scene.add(environmentGroup);

  var homeCam = C.scanBay.camera.home;
  var HOME_CAMERA_POS = homeCam.pos.desktop;
  var HOME_CAMERA_LOOK = homeCam.look.desktop;
  var HOME_CAMERA_FOV = homeCam.fov.desktop;

  var camera = new THREE.PerspectiveCamera(
    HOME_CAMERA_FOV,
    bayEl.clientWidth / (bayEl.clientHeight || 1),
    C.scanBay.camera.near,
    C.scanBay.camera.far,
  );
  camera.position.set(HOME_CAMERA_POS.x, HOME_CAMERA_POS.y, HOME_CAMERA_POS.z);
  camera.lookAt(HOME_CAMERA_LOOK.x, HOME_CAMERA_LOOK.y, HOME_CAMERA_LOOK.z);

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch (err) {
    console.error(
      "GravitasScanBay: WebGL renderer creation failed (WebGL unsupported or unavailable).",
      err,
    );
    bayEl.innerHTML =
      '<div class="scene-load-error">3D scene unavailable — your browser or device may not support WebGL.</div>';
    window.Gravitas = window.Gravitas || {};
    window.Gravitas.ScanBay = {
      setActiveModel: function () {},
      hoverProject: function () {},
      setHoverSpeed: function () {},
      setIdleSpeed: function () {},
      resizeBay: function () {},
      pause: function () {},
      resume: function () {},
      enterFocusMode: function () {},
      exitFocusMode: function () {},
      clearExtraHoverModels: function () {},
      getMemoryInfo: function () {
        return null;
      },
      dispose: function () {},
    };
    return;
  }

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,
      IS_MOBILE ? C.render.pixelRatioCap.mobile : C.render.pixelRatioCap.desktop,
    ),
  );
  renderer.setSize(bayEl.clientWidth, bayEl.clientHeight, false);
  renderer.setClearColor(C.scanBay.clearColor, C.scanBay.clearAlpha);
  renderer.shadowMap.enabled = false;
  bayEl.appendChild(renderer.domElement);

  // WebGL context can be lost mid-session (GPU driver reset, too many
  // contexts open, tab backgrounded on mobile) — without handling this,
  // the canvas just goes permanently black with no way to recover and no
  // indication anything went wrong.
  renderer.domElement.addEventListener(
    "webglcontextlost",
    function (e) {
      e.preventDefault();
      console.warn("GravitasScanBay: WebGL context lost, pausing render loop.");
      pause();
    },
    false,
  );

  renderer.domElement.addEventListener(
    "webglcontextrestored",
    function () {
      console.info("GravitasScanBay: WebGL context restored, resuming.");
      resume();
    },
    false,
  );

  scene.fog = new THREE.FogExp2(C.scanBay.fog.color, C.scanBay.fog.density);
  scene.add(new THREE.AmbientLight(0xc49a6a, 0.62));
  var coolFill = new THREE.PointLight(0x6fa0b0, 0.1, 20, 1.6);
  coolFill.position.set(0, 4.5, -3);
  scene.add(coolFill);

  var bayKeyLight = new THREE.DirectionalLight(0xffd9a0, 1.35);
  bayKeyLight.position.set(-14, 6, 10);
  scene.add(bayKeyLight);

  var pedestalSpotlight = new THREE.SpotLight(0xffe6a3, 1.9);
  pedestalSpotlight.position.set(0, 7.5, 0);
  pedestalSpotlight.target.position.set(0, 0.2, 0);
  pedestalSpotlight.angle = Math.PI / 3;
  pedestalSpotlight.penumbra = 0.55;
  pedestalSpotlight.decay = 1.15;
  pedestalSpotlight.distance = 18;
  scene.add(pedestalSpotlight);
  scene.add(pedestalSpotlight.target);

  var fillLightZs = IS_MOBILE ? [3.4, -8.5] : [3.4, -2.5, -8.5];
  var maxFillPairs = Math.max(
    1,
    Math.floor(C.perf.scanBayMaxFillLights / 2),
  );
  fillLightZs = fillLightZs.slice(0, maxFillPairs);
  fillLightZs.forEach(function (z, i) {
    var intensity = i === 0 ? 0.32 : 0.22;
    var templeFillLight = new THREE.PointLight(0xffcf8f, intensity, 14, 1.7);
    templeFillLight.position.set(3.2, 4.2, z);
    scene.add(templeFillLight);
    var templeFillLight2 = templeFillLight.clone();
    templeFillLight2.position.set(-3.2, 4.2, z);
    scene.add(templeFillLight2);
  });

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
          r -
          fluteDepth * 0.5 +
          Math.cos(theta * fluteCount) * fluteDepth * 0.5;
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
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.computeVertexNormals();
    return geo;
  }

  var caveGeo = new THREE.SphereGeometry(
    32,
    IS_MOBILE ? 16 : 24,
    IS_MOBILE ? 10 : 16,
  );
  var caveMat = new THREE.MeshStandardMaterial({
    color: 0x8a6a48,
    roughness: 0.98,
    side: THREE.BackSide,
    flatShading: true,
  });
  environmentGroup.add(new THREE.Mesh(caveGeo, caveMat));

  var skyGeo = new THREE.SphereGeometry(
    30,
    IS_MOBILE ? 16 : 24,
    IS_MOBILE ? 10 : 16,
  );
  var skyPositions = skyGeo.attributes.position;
  var skyColors = new Float32Array(skyPositions.count * 3);
  var horizonColor = new THREE.Color(0xf0b378);
  var zenithColor = new THREE.Color(0x9fc3d6);
  for (var vi = 0; vi < skyPositions.count; vi++) {
    var ny = skyPositions.getY(vi) / 30;
    var t = THREE.MathUtils.clamp(ny * 0.6 + 0.15, 0, 1);
    var mixed = horizonColor.clone().lerp(zenithColor, t);
    skyColors[vi * 3] = mixed.r;
    skyColors[vi * 3 + 1] = mixed.g;
    skyColors[vi * 3 + 2] = mixed.b;
  }
  skyGeo.setAttribute("color", new THREE.BufferAttribute(skyColors, 3));
  var skyMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.BackSide,
    fog: false,
  });
  environmentGroup.add(new THREE.Mesh(skyGeo, skyMat));

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

  var mountainRockMat = new THREE.MeshStandardMaterial({
    color: 0x8a6a3e,
    roughness: 0.94,
    metalness: 0.02,
    flatShading: true,
  });
  var mountainRockMatFar = new THREE.MeshStandardMaterial({
    color: 0x9a7848,
    roughness: 0.95,
    metalness: 0.02,
    flatShading: true,
  });
  var stalactiteMat = new THREE.MeshStandardMaterial({
    color: 0x8a6a42,
    roughness: 0.88,
    metalness: 0.04,
    flatShading: true,
  });

  var caveBackdrop = new THREE.Group();

  var caveWallSegments = [
    { x: -8.2, y: 1.6, z: 1.4, s: 2.7, ry: 0.28, far: false },
    { x: 8.2, y: 1.4, z: 0.6, s: 2.5, ry: -0.24, far: false },
    { x: -7.4, y: 1.3, z: -3.2, s: 2.3, ry: 0.16, far: true },
    { x: 7.4, y: 1.5, z: -3.8, s: 2.6, ry: -0.2, far: true },
    { x: -7.0, y: 1.2, z: -7.6, s: 2.4, ry: 0.22, far: true },
    { x: 7.0, y: 1.3, z: -8.0, s: 2.5, ry: -0.18, far: true },
  ];
  caveWallSegments.forEach(function (seg, idx) {
    var geo = jaggedRockGeometry(
      new THREE.IcosahedronGeometry(seg.s, 1),
      0.32,
      idx * 3.9 + 1.7,
    );
    var wall = new THREE.Mesh(
      geo,
      seg.far ? mountainRockMatFar : mountainRockMat,
    );
    wall.position.set(seg.x, seg.y, seg.z);
    wall.rotation.y = seg.ry;
    wall.scale.set(1, 1.5, 0.85);
    wall.receiveShadow = false;
    wall.castShadow = false;
    caveBackdrop.add(wall);
  });

  var peakCount = IS_MOBILE ? 5 : 9;
  for (var pI = 0; pI < peakCount; pI++) {
    var pt = pI / (peakCount - 1);
    var px = -13 + pt * 26 + Math.sin(pI * 2.1) * 1.6;
    var peakHeight = 6.5 + Math.sin(pI * 1.9) * 2.6 + Math.random() * 2.2;
    var peakBaseR = 2.4 + Math.random() * 1.6;
    var peakGeo = jaggedRockGeometry(
      new THREE.ConeGeometry(peakBaseR, peakHeight, 6, 2),
      0.3,
      pI * 1.7 + 4.4,
    );
    var peak = new THREE.Mesh(
      peakGeo,
      pI % 2 === 0 ? mountainRockMat : mountainRockMatFar,
    );
    peak.position.set(px, peakHeight * 0.32 - 1.9, -15.5 - (pI % 3) * 1.5);
    peak.rotation.y = (Math.random() - 0.5) * 0.5;
    peak.receiveShadow = false;
    caveBackdrop.add(peak);
  }

  var stalCount = IS_MOBILE ? 5 : 10;
  for (var sI = 0; sI < stalCount; sI++) {
    var sx = (Math.random() - 0.5) * 9.5;
    var sz = 2 - Math.random() * 15;
    var sLen = 1.4 + Math.random() * 2.4;
    var sR = 0.22 + Math.random() * 0.32;
    var stalGeo = jaggedRockGeometry(
      new THREE.ConeGeometry(sR, sLen, 5, 2),
      0.28,
      sI * 2.6 + 6.1,
    );
    var stal = new THREE.Mesh(stalGeo, stalactiteMat);
    stal.rotation.x = Math.PI;
    stal.position.set(sx, 6.4 + Math.random() * 1.6, sz);
    stal.receiveShadow = false;
    caveBackdrop.add(stal);
  }

  environmentGroup.add(caveBackdrop);

  var cloudMat = new THREE.MeshBasicMaterial({
    color: 0xc9b59a,
    fog: true,
    transparent: true,
    opacity: 0.72,
  });

  function buildCloud(puffCount, scale) {
    var cloud = new THREE.Group();
    for (var i = 0; i < puffCount; i++) {
      var puff = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.55 + Math.random() * 0.35, 0),
        cloudMat,
      );
      puff.position.set(
        (i - puffCount / 2) * 0.6 + (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.25,
        (Math.random() - 0.5) * 0.4,
      );
      cloud.add(puff);
    }
    cloud.scale.setScalar(scale);
    return cloud;
  }

  var cloudPlacements = IS_MOBILE
    ? [
        { x: -5.5, y: 4.6, z: -6, puffs: 3, scale: 1.4 },
        { x: 4.5, y: 5.4, z: -9, puffs: 2, scale: 1.1 },
      ]
    : [
        { x: -5.5, y: 4.6, z: -6, puffs: 4, scale: 1.4 },
        { x: 4.5, y: 5.4, z: -9, puffs: 3, scale: 1.1 },
        { x: -2, y: 5.9, z: -13, puffs: 4, scale: 1.6 },
        { x: 7, y: 4.2, z: -3, puffs: 3, scale: 1.0 },
        { x: -8, y: 4.8, z: -1, puffs: 3, scale: 1.2 },
      ];
  cloudPlacements.forEach(function (c) {
    var cloud = buildCloud(c.puffs, c.scale);
    cloud.position.set(c.x, c.y, c.z);
    environmentGroup.add(cloud);
  });

  var ziggurat = new THREE.Group();
  var platformSize = 3.6;
  var platformY = -1.65;

  var lapisBand = new THREE.Mesh(
    new THREE.BoxGeometry(platformSize, 0.03, platformSize),
    lapisMat,
  );
  lapisBand.position.y = platformY + 0.015;
  ziggurat.add(lapisBand);

  environmentGroup.add(ziggurat);

  var waterwayWidth = 1.15;
  var waterwayLength = 16.5;
  var waterwayZ = -4.25;

  var waterwayChannel = new THREE.Mesh(
    new THREE.PlaneGeometry(waterwayWidth, waterwayLength, 6, 24),
    poolWaterMaterial,
  );
  waterwayChannel.rotation.x = -Math.PI / 2;
  waterwayChannel.position.set(0, platformY - 0.03, waterwayZ);
  environmentGroup.add(waterwayChannel);

  [-1, 1].forEach(function (side) {
    var edge = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.08, waterwayLength),
      lapisMat,
    );
    edge.position.set((side * waterwayWidth) / 2, platformY, waterwayZ);
    environmentGroup.add(edge);
  });

  function buildPillar(radius, height, withVegetation) {
    var group = new THREE.Group();
    var baseHeight = 0.4;
    var base = new THREE.Mesh(
      new THREE.BoxGeometry(radius * 2.0, baseHeight, radius * 2.0),
      columnMat,
    );
    base.position.y = baseHeight / 2;
    group.add(base);

    var shaft = new THREE.Mesh(
      flutedColumnGeometry(
        radius,
        radius * 0.82,
        height,
        12,
        IS_MOBILE ? 10 : 20,
        10,
        radius * 0.34,
      ),
      columnMat,
    );
    shaft.position.y = baseHeight + height / 2;
    group.add(shaft);

    var shaftTopY = baseHeight + height;

    function addSeam(y, r) {
      var seam = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r, 0.03, 16),
        columnMat,
      );
      seam.position.y = y;
      group.add(seam);
    }

    var ring = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 1.15, radius * 1.05, 0.12, 16),
      goldMat,
    );
    ring.position.y = shaftTopY + 0.06;
    group.add(ring);
    addSeam(shaftTopY + 0.12, radius * 1.17);

    var neckHeight = 0.4;
    var neck = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 1.9, radius * 1.0, neckHeight, 12),
      goldMat,
    );
    neck.position.y = shaftTopY + 0.15 + neckHeight / 2;
    group.add(neck);
    addSeam(shaftTopY + 0.15, radius * 1.07);

    var roofY = shaftTopY + 0.15 + neckHeight;
    addSeam(roofY + 0.015, radius * 1.92);

    var roof = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 1.5, radius * 3.3, 0.32, 4),
      columnMat,
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.y = roofY + 0.03 + 0.16;
    group.add(roof);

    var finial = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.55, 10, 8),
      goldMat,
    );
    finial.position.y = roofY + 0.03 + 0.32 + radius * 0.5;
    group.add(finial);

    if (withVegetation) {
      addVegetationCluster(group, radius, shaftTopY);
    }

    return group;
  }

  function addVegetationCluster(group, radius, shaftTopY) {
    var cluster = new THREE.Group();
    var bladeCount = 4 + Math.floor(Math.random() * 3);
    for (var i = 0; i < bladeCount; i++) {
      var bladeLength = 0.5 + Math.random() * 0.4;
      var blade = new THREE.Mesh(
        new THREE.PlaneGeometry(0.12, bladeLength),
        leafMat,
      );
      var angle = (Math.random() - 0.5) * 1.1;
      blade.rotation.z = angle;
      blade.rotation.y = (Math.random() - 0.5) * 0.6;
      blade.position.set(
        Math.sin(angle) * bladeLength * 0.35,
        -bladeLength * 0.5,
        Math.cos(angle) * 0.05,
      );
      cluster.add(blade);
    }
    var side = Math.random() < 0.5 ? -1 : 1;
    cluster.position.set(side * radius * 1.3, shaftTopY - 0.1, radius * 0.6);
    cluster.rotation.y = side > 0 ? -0.4 : 0.4;
    group.add(cluster);
  }

  var COLUMN_X_OFFSET = 3.2;
  var columnZPositions = [1.6, -0.65, -2.9, -5.15, -7.4, -9.65, -11.9];

  var roadFrontZ = 4.4;
  var roadBackZ = -12.9;
  var roadLength = roadFrontZ - roadBackZ;
  var roadCenterZ = (roadFrontZ + roadBackZ) / 2;
  var roadWidth = 4.2;

  var road = new THREE.Mesh(
    new THREE.BoxGeometry(roadWidth, 0.1, roadLength),
    darkStoneMat,
  );
  road.position.set(0, -1.7, roadCenterZ);
  environmentGroup.add(road);

  for (var seamZ = roadFrontZ; seamZ > roadBackZ; seamZ -= 1.2) {
    var seam = new THREE.Mesh(
      new THREE.BoxGeometry(roadWidth, 0.02, 0.04),
      lapisMat,
    );
    seam.position.set(0, -1.64, seamZ);
    environmentGroup.add(seam);
  }

  [-1, 1].forEach(function (side) {
    var rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.02, roadLength),
      lapisMat,
    );
    rail.position.set((side * roadWidth) / 2, -1.64, roadCenterZ);
    environmentGroup.add(rail);
  });

  var STYLOBATE_HEIGHT = 0.34;
  var STYLOBATE_TOP_Y = -1.7 + STYLOBATE_HEIGHT;

  [-1, 1].forEach(function (side) {
    var stylobate = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, STYLOBATE_HEIGHT, roadLength),
      darkStoneMat,
    );
    stylobate.position.set(
      side * COLUMN_X_OFFSET,
      -1.7 + STYLOBATE_HEIGHT / 2,
      roadCenterZ,
    );
    environmentGroup.add(stylobate);

    var stylobateTrim = new THREE.Mesh(
      new THREE.BoxGeometry(1.34, 0.03, roadLength),
      lapisMat,
    );
    stylobateTrim.position.set(
      side * COLUMN_X_OFFSET,
      STYLOBATE_TOP_Y + 0.015,
      roadCenterZ,
    );
    environmentGroup.add(stylobateTrim);
  });

  columnZPositions.forEach(function (z, i) {
    var left = buildPillar(0.34, 3.9, i % 2 === 0);
    left.position.set(-COLUMN_X_OFFSET, STYLOBATE_TOP_Y, z);
    environmentGroup.add(left);

    var right = buildPillar(0.34, 3.9, i % 2 === 1);
    right.position.set(COLUMN_X_OFFSET, STYLOBATE_TOP_Y, z);
    environmentGroup.add(right);
  });

  var moteCount = IS_MOBILE
    ? C.scanBay.motes.count.mobile
    : C.scanBay.motes.count.desktop;
  var moteGeo = new THREE.BufferGeometry();
  var motePos = new Float32Array(moteCount * 3);
  for (var mi = 0; mi < moteCount; mi++) {
    motePos[mi * 3] = (Math.random() - 0.5) * 5.0;
    motePos[mi * 3 + 1] = -0.4 + Math.random() * 3.2;
    motePos[mi * 3 + 2] = (Math.random() - 0.5) * 5.0;
  }
  moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
  var moteUniforms = {
    uTime: { value: 0 },
    uSize: { value: C.scanBay.motes.size * 120 },
    uColor: { value: new THREE.Color(C.scanBay.motes.color) },
    uOpacity: { value: C.scanBay.motes.opacity },
  };
  var motes = new THREE.Points(
    moteGeo,
    new THREE.ShaderMaterial({
      uniforms: moteUniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader:
        "uniform float uTime; uniform float uSize;\n" +
        "void main(){\n" +
        "  vec3 p = position;\n" +
        "  float phase = position.x * 1.7 + position.z * 2.1;\n" +
        "  p.y = mod(position.y + uTime * 0.2 + phase * 0.02 + 0.4, 3.2) - 0.4;\n" +
        "  vec4 mv = modelViewMatrix * vec4(p, 1.0);\n" +
        "  gl_PointSize = uSize * (1.0 / max(0.5, -mv.z));\n" +
        "  gl_Position = projectionMatrix * mv;\n" +
        "}",
      fragmentShader:
        "uniform vec3 uColor; uniform float uOpacity;\n" +
        "void main(){\n" +
        "  vec2 c = gl_PointCoord - 0.5;\n" +
        "  float d = length(c);\n" +
        "  if (d > 0.5) discard;\n" +
        "  float a = smoothstep(0.5, 0.15, d) * uOpacity;\n" +
        "  gl_FragColor = vec4(uColor, a);\n" +
        "}",
    }),
  );
  environmentGroup.add(motes);

  var PM = window.Gravitas.PortalModels;

  // Scan bay always shows fully assembled models, larger and closer to camera.
  // Mobile uses a bigger on-screen size to compensate for the shorter bay.
  var BAY_MODEL_MAX_DIM = IS_MOBILE
    ? C.scanBay.modelMaxDim.mobile
    : C.scanBay.modelMaxDim.desktop;
  var hoverFitBox = new THREE.Box3();
  var hoverFitSize = new THREE.Vector3();
  var hoverFitCenter = new THREE.Vector3();

  function fitModelToBay(model, targetMaxDim) {
    if (!model) return;
    var target = targetMaxDim || BAY_MODEL_MAX_DIM;

    model.scale.set(1, 1, 1);
    model.position.set(0, 0, 0);
    model.rotation.set(0, 0, 0);
    model.updateMatrixWorld(true);

    hoverFitBox.setFromObject(model);
    if (hoverFitBox.isEmpty()) return;

    hoverFitBox.getSize(hoverFitSize);
    hoverFitBox.getCenter(hoverFitCenter);

    var maxDim = Math.max(
      hoverFitSize.x,
      hoverFitSize.y,
      hoverFitSize.z,
      0.001,
    );
    model.scale.setScalar(target / maxDim);

    model.updateMatrixWorld(true);
    hoverFitBox.setFromObject(model);
    hoverFitBox.getCenter(hoverFitCenter);
    model.position.set(
      -hoverFitCenter.x,
      -hoverFitBox.min.y + 0.05,
      -hoverFitCenter.z,
    );
  }

  function prepareModelForBay(model) {
    if (!model || !model.userData) return;
    var ud = model.userData;
    ud.forceAssembled = true;
    ud.bayMode = true;
    if (ud.assembleProgress !== undefined) ud.assembleProgress = 1.0;
    if (ud.hoverProgress !== undefined) ud.hoverProgress = 1.0;
    if (ud.parts) {
      ud.parts.forEach(function (p) {
        p.mesh.position.copy(p.asmPos);
        if (p.asmRot) p.mesh.rotation.copy(p.asmRot);
        else p.mesh.rotation.set(0, 0, 0);
        if (p.isCover) p.mesh.visible = false;
      });
    }
    if (ud.pingRing) ud.pingRing.visible = false;
  }

  var baseTrackModels = {
    systems: PM.build("systems", { bayMode: true }),
    creative: PM.build("creative", { bayMode: true }),
    startup: PM.build("startup", { bayMode: true }),
  };

  Object.keys(baseTrackModels).forEach(function (k) {
    baseTrackModels[k].visible = false;
    prepareModelForBay(baseTrackModels[k]);
    fitModelToBay(baseTrackModels[k], BAY_MODEL_MAX_DIM);
    scene.add(baseTrackModels[k]);
  });

  var currentTrackKey = "systems";
  var currentTrackModel = baseTrackModels.systems;
  currentTrackModel.visible = true;

  var extraHoverModels = {};
  var activeHoverModel = null;
  var hoverOn = false;
  var hoverChangedAt = Date.now();
  var isFocusMode = false;
  var BAY_SPIN = C.scanBay.spinRate;

  function clearExtraHoverModels() {
    Object.keys(extraHoverModels).forEach(function (k) {
      var m = extraHoverModels[k];
      if (m) {
        m.visible = false;
      }
    });
    activeHoverModel = null;
  }

  function setActiveModel(key) {
    clearExtraHoverModels();

    Object.keys(baseTrackModels).forEach(function (k) {
      if (baseTrackModels[k]) baseTrackModels[k].visible = false;
    });

    currentTrackKey = key;
    var modelKey = baseTrackModels[key] ? key : "systems";
    currentTrackModel = baseTrackModels[modelKey] || null;

    if (currentTrackModel && !isFocusMode) {
      currentTrackModel.visible = true;
      prepareModelForBay(currentTrackModel);
      fitModelToBay(currentTrackModel, BAY_MODEL_MAX_DIM);
    }
  }

  // INSTANT ZERO-LAG MODEL CACHING
  var extraHoverModelOrder = []; // most-recently-used keys, front = newest
  var MAX_CACHED_HOVER_MODELS = C.scanBay.maxCachedHoverModels;

  function hoverProject(projectName) {
    if (currentTrackModel) {
      currentTrackModel.visible = false;
    }

    if (!projectName) {
      if (activeHoverModel) {
        activeHoverModel.visible = false;
        activeHoverModel = null;
      }
      if (currentTrackModel && !isFocusMode) {
        currentTrackModel.visible = true;
      }
      hoverOn = false;
      hoverChangedAt = Date.now();
      return;
    }

    hoverOn = true;
    hoverChangedAt = Date.now();

    if (activeHoverModel) {
      activeHoverModel.visible = false;
    }

    var cleanKey = String(projectName).toUpperCase().trim();

    // Cache lookup: reuses existing 3D mesh instantly (0ms delay). Bounded
    // to MAX_CACHED_HOVER_MODELS — clearExtraHoverModels() only hides
    // models, it doesn't free them, so without eviction here every unique
    // project ever hovered in a session would sit in GPU memory forever.
    if (!extraHoverModels[cleanKey]) {
      var extraM = PM.buildProjectModel(cleanKey);
      prepareModelForBay(extraM);
      fitModelToBay(extraM, BAY_MODEL_MAX_DIM);
      scene.add(extraM);
      extraHoverModels[cleanKey] = extraM;

      if (extraHoverModelOrder.length >= MAX_CACHED_HOVER_MODELS) {
        var evictKey = extraHoverModelOrder.pop();
        var evictModel = extraHoverModels[evictKey];
        if (evictModel) {
          scene.remove(evictModel);
          disposeHierarchy(evictModel, true);
        }
        delete extraHoverModels[evictKey];
      }
    } else {
      var existingIdx = extraHoverModelOrder.indexOf(cleanKey);
      if (existingIdx !== -1) extraHoverModelOrder.splice(existingIdx, 1);
    }
    extraHoverModelOrder.unshift(cleanKey);

    activeHoverModel = extraHoverModels[cleanKey];
    activeHoverModel.visible = true;
    prepareModelForBay(activeHoverModel);
    fitModelToBay(activeHoverModel, BAY_MODEL_MAX_DIM);
  }

  var isRunning = false;
  var animFrameId = null;
  var lastFrameTime = Date.now();

  function checkAndResizeCanvas() {
    if (!bayEl || !renderer) return;
    // Measure #scan-bay only — never #view-stage (that includes the list
    // and makes camera.aspect too tall → vertical squash in the bay).
    var w = bayEl.clientWidth;
    var h = bayEl.clientHeight;
    if (!w || !h || w < 10 || h < 10) return;

    var pixelRatio = renderer.getPixelRatio();
    var bufW = Math.floor(w * pixelRatio);
    var bufH = Math.floor(h * pixelRatio);
    if (
      renderer.domElement.width === bufW &&
      renderer.domElement.height === bufH
    ) {
      return;
    }

    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
    // Keep CSS (width/height: 100%) as the display size authority.
    renderer.setSize(w, h, false);
  }

  function animateBay() {
    if (!isRunning) return;
    animFrameId = requestAnimationFrame(animateBay);

    var now = Date.now();
    var dt = Math.min(now - lastFrameTime, 64);
    lastFrameTime = now;
    var timeSec = now * 0.001;
    var elapsed = now - hoverChangedAt;

    // Content-strip height changes (archive vs flagship) resize the bay
    // without a window resize event — resync every frame.
    checkAndResizeCanvas();

    if (activeHoverModel) {
      activeHoverModel.rotation.y += BAY_SPIN;
      if (activeHoverModel.userData && activeHoverModel.userData.tick) {
        activeHoverModel.userData.tick(dt, true, elapsed);
      }
    } else if (currentTrackModel && !isFocusMode) {
      currentTrackModel.rotation.y += BAY_SPIN;

      if (currentTrackModel.userData && currentTrackModel.userData.tick) {
        currentTrackModel.userData.tick(dt, true, elapsed);
      }
    }

    poolWaterUniforms.uTime.value = timeSec;
    moteUniforms.uTime.value = timeSec;

    renderer.render(scene, camera);
  }

  function pause() {
    isRunning = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (brandLogo) brandLogo.pause();
  }

  function resume() {
    if (isRunning) return;
    isRunning = true;
    lastFrameTime = Date.now();
    if (brandLogo) brandLogo.resume();
    animateBay();
  }

  function resizeBay() {
    checkAndResizeCanvas();
  }

  var FOCUS_CAMERA_POS = C.scanBay.camera.focus.pos;
  var HOME_CLEAR_COLOR = C.scanBay.clearColor;
  var HOME_CLEAR_ALPHA = C.scanBay.clearAlpha;
  var focusBox = new THREE.Box3();
  var focusCenter = new THREE.Vector3();
  var focusSize = new THREE.Vector3();

  function frameModelInFocus(model) {
    if (!model) return false;
    focusBox.setFromObject(model);
    if (focusBox.isEmpty()) return false;

    focusBox.getCenter(focusCenter);
    focusBox.getSize(focusSize);

    var focusCfg = C.scanBay.camera.focus;
    var maxDim = Math.max(
      focusSize.x,
      focusSize.y,
      focusSize.z,
      focusCfg.minSize,
    );
    var vFov = (camera.fov * Math.PI) / 180;
    var hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);

    var distForHeight = focusSize.y / 2 / Math.tan(vFov / 2);
    var distForWidth = focusSize.x / 2 / Math.tan(hFov / 2);
    var distForDepth = maxDim;
    var distance =
      Math.max(
        distForHeight,
        distForWidth,
        distForDepth * focusCfg.depthFactor,
      ) * focusCfg.distancePad;

    camera.position.set(focusCenter.x, focusCenter.y, focusCenter.z + distance);
    camera.lookAt(focusCenter);
    return true;
  }

  function enterFocusMode() {
    isFocusMode = true;
    environmentGroup.visible = false;
    renderer.setClearColor(0x000000, 1);

    if (currentTrackModel) {
      currentTrackModel.visible = false;
    }

    var focusTarget = activeHoverModel || currentTrackModel;
    var framed = frameModelInFocus(focusTarget);
    if (!framed) {
      camera.position.set(
        FOCUS_CAMERA_POS.x,
        FOCUS_CAMERA_POS.y,
        FOCUS_CAMERA_POS.z,
      );
      camera.lookAt(0, C.scanBay.camera.focus.lookY, 0);
    }

    if (activeHoverModel) {
      prepareModelForBay(activeHoverModel);
    }
    if (currentTrackModel) {
      prepareModelForBay(currentTrackModel);
    }
  }

  function exitFocusMode() {
    isFocusMode = false;
    environmentGroup.visible = true;
    renderer.setClearColor(HOME_CLEAR_COLOR, HOME_CLEAR_ALPHA);

    if (currentTrackModel && !activeHoverModel) {
      currentTrackModel.visible = true;
    }

    camera.position.set(
      HOME_CAMERA_POS.x,
      HOME_CAMERA_POS.y,
      HOME_CAMERA_POS.z,
    );
    camera.fov = HOME_CAMERA_FOV;
    camera.lookAt(HOME_CAMERA_LOOK.x, HOME_CAMERA_LOOK.y, HOME_CAMERA_LOOK.z);
    camera.updateProjectionMatrix();

    if (activeHoverModel) {
      prepareModelForBay(activeHoverModel);
      fitModelToBay(activeHoverModel, BAY_MODEL_MAX_DIM);
    }
    if (currentTrackModel) {
      prepareModelForBay(currentTrackModel);
      fitModelToBay(currentTrackModel, BAY_MODEL_MAX_DIM);
    }
  }

  window.addEventListener("resize", function () {
    resizeBay();
    if (brandLogo) brandLogo.resize();
  });

  if (typeof ResizeObserver === "function" && bayEl) {
    var bayResizeObserver = new ResizeObserver(function () {
      resizeBay();
    });
    bayResizeObserver.observe(bayEl);
  }

  // Layout may still be settling when this module boots (hidden app panel).
  requestAnimationFrame(function () {
    resizeBay();
    requestAnimationFrame(resizeBay);
  });

  window.Gravitas = window.Gravitas || {};
  window.Gravitas.ScanBay = {
    setActiveModel: setActiveModel,
    hoverProject: hoverProject,
    setHoverSpeed: function () {},
    setIdleSpeed: function () {},
    resizeBay: resizeBay,
    pause: pause,
    resume: resume,
    enterFocusMode: enterFocusMode,
    exitFocusMode: exitFocusMode,
    clearExtraHoverModels: clearExtraHoverModels,
    getMemoryInfo: function () {
      return renderer ? renderer.info.memory : null;
    },
    dispose: function () {
      pause();
      if (bayResizeObserver) bayResizeObserver.disconnect();
      clearExtraHoverModels();
      Object.keys(baseTrackModels).forEach(function (k) {
        if (baseTrackModels[k]) {
          scene.remove(baseTrackModels[k]);
          disposeHierarchy(baseTrackModels[k], true);
        }
      });
      disposeHierarchy(environmentGroup, true);
      renderer.dispose();
    },
  };
})();
