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

  // =========================================================================
  // MATERIAL SYSTEM
  // =========================================================================
  var basaltMat = new THREE.MeshStandardMaterial({
    color: 0xb88b4a,
    roughness: 0.82,
    metalness: 0.05,
    map: brickTex,
    bumpMap: brickTex,
    bumpScale: 0.02,
  });

  var goldMat = new THREE.MeshStandardMaterial({
    color: 0xd1a14c,
    roughness: 0.32,
    metalness: 0.85,
  });

  var lapisMat = new THREE.MeshStandardMaterial({
    color: 0x105ba3,
    roughness: 0.28,
    metalness: 0.4,
  });

  var mosaicTileMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.45,
    metalness: 0.2,
    map: mosaicTex,
    bumpMap: mosaicTex,
    bumpScale: 0.015,
  });

  var lapisAccentMat = new THREE.MeshStandardMaterial({
    color: 0x105ba3,
    roughness: 0.3,
    metalness: 0.4,
    emissive: 0x082e5e,
    emissiveIntensity: 0.25,
  });

  var darkIronMat = new THREE.MeshStandardMaterial({
    color: 0x221d1a,
    roughness: 0.55,
    metalness: 0.82,
  });

  var blackGlassMaterial = new THREE.MeshStandardMaterial({
    color: 0x060709,
    roughness: 0.12,
    metalness: 0.25,
  });

  var gateGlassMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0d10,
    roughness: 0.08,
    metalness: 0.15,
    transparent: true,
    opacity: 0.58,
  });

  var waterlineMat = new THREE.MeshStandardMaterial({
    color: 0x3df0e6,
    roughness: 0.2,
    metalness: 0.6,
    emissive: 0x1a8c87,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.75,
  });

  var foliageMatA = new THREE.MeshStandardMaterial({
    color: 0x3f5d34,
    roughness: 0.85,
    metalness: 0.02,
    flatShading: true,
  });

  var foliageMatB = new THREE.MeshStandardMaterial({
    color: 0x5c7a3d,
    roughness: 0.8,
    metalness: 0.02,
    flatShading: true,
  });

  var foliageMatGold = new THREE.MeshStandardMaterial({
    color: 0x8a7337,
    roughness: 0.65,
    metalness: 0.25,
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
    roughness: 0.88,
    metalness: 0.05,
    map: sandGrainTex,
    bumpMap: sandGrainTex,
    bumpScale: 0.018,
  });
  