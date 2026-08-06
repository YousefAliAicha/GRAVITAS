/**
 * Sprite rain — shared utility for SEALS / ORANGE / FATRAT easter eggs.
 * Procedural canvas pixel-art sheets (no external image deps).
 */
(function () {
  window.Gravitas = window.Gravitas || {};

  var ACTIVE = null;
  var MAX_SPRITES = 48;
  var RAIN_MS = 4800;

  function makeSheet(drawFrame, frameCount, size) {
    size = size || 32;
    frameCount = frameCount || 2;
    var canvas = document.createElement("canvas");
    canvas.width = size * frameCount;
    canvas.height = size;
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    for (var f = 0; f < frameCount; f++) {
      ctx.save();
      ctx.translate(f * size, 0);
      drawFrame(ctx, size, f);
      ctx.restore();
    }
    return { canvas: canvas, frameCount: frameCount, size: size };
  }

  function px(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  // ---- Art: seals (Baikal / spotted / ringed vibe, plump) ----
  function drawSeal(ctx, s, frame) {
    var bob = frame % 2 === 0 ? 0 : 1;
    px(ctx, 8, 10 + bob, 16, 12, "#6b7c86");
    px(ctx, 10, 8 + bob, 12, 6, "#8a9aa3");
    px(ctx, 6, 14 + bob, 4, 4, "#5a6a72");
    px(ctx, 22, 14 + bob, 4, 4, "#5a6a72");
    px(ctx, 12, 18 + bob, 3, 5, "#4a585f");
    px(ctx, 17, 18 + bob, 3, 5, "#4a585f");
    px(ctx, 11, 11 + bob, 2, 2, "#1a1a1a");
    px(ctx, 14, 13 + bob, 3, 2, "#2a2a2a");
    // spots / rings
    px(ctx, 16, 12 + bob, 2, 2, "#4e5c64");
    px(ctx, 19, 15 + bob, 2, 2, "#4e5c64");
  }

  // ---- Art: orange tabby cats ----
  function drawCat(ctx, s, frame) {
    var lean = frame % 2 === 0 ? 0 : 1;
    px(ctx, 10, 12, 14, 10, "#e0892e");
    px(ctx, 10, 8, 4, 5, "#e0892e");
    px(ctx, 20, 8, 4, 5, "#e0892e");
    px(ctx, 11, 9, 2, 2, "#f0b060");
    px(ctx, 21, 9, 2, 2, "#f0b060");
    px(ctx, 12, 14, 2, 2, "#1a1a1a");
    px(ctx, 18, 14, 2, 2, "#1a1a1a");
    px(ctx, 14, 17, 4, 2, "#c46820");
    px(ctx, 14, 11, 2, 6, "#c46820");
    px(ctx, 18, 11, 2, 6, "#c46820");
    px(ctx, 22 + lean, 16, 6, 3, "#e0892e");
    px(ctx, 8, 20, 3, 4, "#d07a28");
    px(ctx, 19, 20, 3, 4, "#d07a28");
  }

  // ---- Art: dogs (golden + black) ----
  function drawDog(ctx, s, frame, dark) {
    var body = dark ? "#1c1c1c" : "#d4a84b";
    var belly = dark ? "#2e2e2e" : "#e8c878";
    var ear = dark ? "#0a0a0a" : "#b88830";
    var bob = frame % 2 === 0 ? 0 : 1;
    px(ctx, 8, 12 + bob, 16, 10, body);
    px(ctx, 6, 10 + bob, 8, 8, body);
    px(ctx, 6, 8 + bob, 3, 4, ear);
    px(ctx, 11, 8 + bob, 3, 4, ear);
    px(ctx, 8, 12 + bob, 2, 2, "#1a1a1a");
    px(ctx, 10, 14 + bob, 3, 2, belly);
    px(ctx, 20, 14 + bob, 6, 3, body);
    px(ctx, 10, 20 + bob, 3, 5, body);
    px(ctx, 17, 20 + bob, 3, 5, body);
  }

  var PRESETS = {
    seals: function () {
      return makeSheet(drawSeal, 2, 32);
    },
    orangeCats: function () {
      return makeSheet(drawCat, 2, 32);
    },
    dogs: function () {
      var size = 32;
      var frameCount = 4;
      var canvas = document.createElement("canvas");
      canvas.width = size * frameCount;
      canvas.height = size;
      var ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      drawDog(ctx, size, 0, false);
      ctx.save();
      ctx.translate(size, 0);
      drawDog(ctx, size, 1, false);
      ctx.restore();
      ctx.save();
      ctx.translate(size * 2, 0);
      drawDog(ctx, size, 0, true);
      ctx.restore();
      ctx.save();
      ctx.translate(size * 3, 0);
      drawDog(ctx, size, 1, true);
      ctx.restore();
      return { canvas: canvas, frameCount: frameCount, size: size };
    },
  };

  function stopRain() {
    if (!ACTIVE) return;
    cancelAnimationFrame(ACTIVE.raf);
    if (ACTIVE.root && ACTIVE.root.parentNode) {
      ACTIVE.root.parentNode.removeChild(ACTIVE.root);
    }
    ACTIVE = null;
  }

  function startRain(presetKey) {
    var factory = PRESETS[presetKey];
    if (!factory) return;
    stopRain();

    var sheet = factory();
    var sheetUrl = sheet.canvas.toDataURL();
    var root = document.createElement("div");
    root.setAttribute("aria-hidden", "true");
    root.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:90;overflow:hidden;";
    document.body.appendChild(root);

    var sprites = [];
    var started = performance.now();
    var spawnUntil = started + RAIN_MS * 0.65;
    var endAt = started + RAIN_MS;

    function spawnOne() {
      if (sprites.length >= MAX_SPRITES) return;
      var el = document.createElement("div");
      var scale = 1.4 + Math.random() * 1.6;
      var frame = Math.floor(Math.random() * sheet.frameCount);
      el.style.cssText =
        "position:absolute;top:-48px;width:" +
        sheet.size * scale +
        "px;height:" +
        sheet.size * scale +
        "px;" +
        "background:url(" +
        sheetUrl +
        ") no-repeat;" +
        "background-size:" +
        sheet.frameCount * 100 +
        "% 100%;" +
        "background-position:" +
        frame * -sheet.size * scale +
        "px 0;" +
        "image-rendering:pixelated;will-change:transform;opacity:0.92;";
      root.appendChild(el);
      sprites.push({
        el: el,
        x: Math.random() * window.innerWidth,
        y: -40 - Math.random() * 120,
        vy: 110 + Math.random() * 160,
        vx: (Math.random() - 0.5) * 40,
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 120,
        sway: 0.6 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2,
        frame: frame,
        frameT: 0,
      });
    }

    for (var i = 0; i < 10; i++) spawnOne();

    var last = started;
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (now < spawnUntil && Math.random() < 0.45) spawnOne();

      for (var i = sprites.length - 1; i >= 0; i--) {
        var s = sprites[i];
        s.frameT += dt;
        if (s.frameT > 0.18) {
          s.frameT = 0;
          s.frame = (s.frame + 1) % sheet.frameCount;
          var sc = parseFloat(s.el.style.width);
          s.el.style.backgroundPosition = s.frame * -sc + "px 0";
        }
        s.y += s.vy * dt;
        s.x += s.vx * dt + Math.sin(now * 0.002 * s.sway + s.phase) * 18 * dt;
        s.rot += s.vr * dt;
        s.el.style.transform =
          "translate(" + s.x + "px," + s.y + "px) rotate(" + s.rot + "deg)";
        if (s.y > window.innerHeight + 60) {
          root.removeChild(s.el);
          sprites.splice(i, 1);
        }
      }

      if (now < endAt || sprites.length) {
        ACTIVE.raf = requestAnimationFrame(frame);
      } else {
        stopRain();
      }
    }

    ACTIVE = { root: root, raf: requestAnimationFrame(frame) };
  }

  window.Gravitas.SpriteRain = {
    start: startRain,
    stop: stopRain,
    presets: PRESETS,
  };
})();
