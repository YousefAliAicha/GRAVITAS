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
