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
