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
