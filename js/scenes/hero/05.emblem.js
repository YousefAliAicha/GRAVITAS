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
