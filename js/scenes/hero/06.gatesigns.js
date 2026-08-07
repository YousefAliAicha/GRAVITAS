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
