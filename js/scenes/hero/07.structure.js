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
