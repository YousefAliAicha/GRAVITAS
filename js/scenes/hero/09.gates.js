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

renderer.domElement.addEventListener("click", function () {
  if (!gatesInteractive || isPortalFlyThrough || !pickedTrack) return;
  if (window.Gravitas.Hero && typeof window.Gravitas.Hero.onGateClick === "function") {
    window.Gravitas.Hero.onGateClick(pickedTrack);
  }
});
