/**
 * GRAVITAS PORTAL WARP ENGINE — HALF-LIFE G-MAN STYLE TIME TRAVEL VORTEX
 */
(function () {
  var overlay = null;
  var canvas = null;
  var ctx = null;
  var flash = null;
  var animId = null;
  var startTime = 0;
  var isWarping = false;
  var portalCenterX = 0.5;
  var portalCenterY = 0.5;

  var particles = [];
  var PARTICLE_COUNT = 140;

  function init() {
    overlay = document.getElementById("portal-warp-overlay");
    canvas = document.getElementById("portal-warp-canvas");
    flash = document.getElementById("portal-flash");
    if (!canvas) return;
    ctx = canvas.getContext("2d");

    resize();
    window.addEventListener("resize", resize);

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random(),
        speed: 0.005 + Math.random() * 0.02,
        size: 1 + Math.random() * 2.5,
        color: Math.random() > 0.4 ? "#2bb8b0" : "#d1a14c",
      });
    }
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function render(now) {
    if (!isWarping) return;
    animId = requestAnimationFrame(render);

    var elapsed = now - startTime;
    var progress = Math.min(1.0, elapsed / 1300); // 1.3s total portal warp time

    var w = canvas.width;
    var h = canvas.height;
    var cx = w * portalCenterX;
    var cy = h * portalCenterY;

    ctx.clearRect(0, 0, w, h);

    // Dark temporal void backdrop with motion trails
    ctx.fillStyle = "rgba(10, 9, 8, 0.28)";
    ctx.fillRect(0, 0, w, h);

    var intensity = Math.sin(progress * Math.PI);

    // 1. Swirling Chromatic Portal Tunnel Rings
    var ringCount = 6;
    for (var r = 0; r < ringCount; r++) {
      var rProgress = (progress * 2.5 + r / ringCount) % 1.0;
      var radius = Math.pow(rProgress, 2.2) * Math.max(w, h) * 0.85;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(elapsed * 0.003 * (r % 2 === 0 ? 1 : -1));

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.lineWidth = 2 + rProgress * 12;
      ctx.strokeStyle =
        r % 2 === 0
          ? "rgba(43, 184, 176, " + (1 - rProgress) * intensity * 0.8 + ")"
          : "rgba(209, 161, 76, " + (1 - rProgress) * intensity * 0.8 + ")";
      ctx.shadowColor = "#2bb8b0";
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.restore();
    }

    // 2. Accelerating Space-Time Tunnel Particles
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var p = particles[i];
      p.dist += p.speed * (1 + progress * 6.5);
      if (p.dist > 1) {
        p.dist = 0.02;
        p.angle = Math.random() * Math.PI * 2;
      }

      var pRad = Math.pow(p.dist, 2.0) * Math.max(w, h) * 0.75;
      var px = cx + Math.cos(p.angle) * pRad;
      var py = cy + Math.sin(p.angle) * pRad;
      var prevX = cx + Math.cos(p.angle) * (pRad * 0.82);
      var prevY = cy + Math.sin(p.angle) * (pRad * 0.82);

      ctx.beginPath();
      ctx.moveTo(prevX, prevY);
      ctx.lineTo(px, py);
      ctx.lineWidth = p.size * (1 + p.dist * 2);
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = p.dist * intensity;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    // 3. Half-Life Temporal Scanline Glitch Lines
    ctx.fillStyle = "rgba(43, 184, 176, " + intensity * 0.15 + ")";
    for (var s = 0; s < h; s += 6) {
      if (Math.random() < 0.3) {
        ctx.fillRect(0, s, w, 2);
      }
    }

    // 4. Energy Peak Flash
    if (progress > 0.58 && progress < 0.88) {
      var flashT = (progress - 0.58) / 0.3;
      var flashOpacity = Math.sin(flashT * Math.PI);
      flash.style.opacity = flashOpacity.toFixed(3);
    } else {
      flash.style.opacity = "0";
    }
  }

  function startWarp(screenXRatio, screenYRatio, onPeak, onComplete) {
    if (!overlay) init();
    if (!overlay) return;

    portalCenterX = screenXRatio !== undefined ? screenXRatio : 0.5;
    portalCenterY = screenYRatio !== undefined ? screenYRatio : 0.5;

    isWarping = true;
    startTime = performance.now();
    overlay.classList.add("active");

    var peakFired = false;
    var checkTimer = setInterval(function () {
      var elapsed = performance.now() - startTime;

      if (elapsed >= 750 && !peakFired) {
        peakFired = true;
        if (onPeak) onPeak();
      }

      if (elapsed >= 1300) {
        clearInterval(checkTimer);
        isWarping = false;
        overlay.classList.remove("active");
        if (animId) cancelAnimationFrame(animId);
        if (onComplete) onComplete();
      }
    }, 16);

    requestAnimationFrame(render);
  }

  window.Gravitas = window.Gravitas || {};
  window.Gravitas.PortalWarp = {
    startWarp: startWarp,
  };
})();
