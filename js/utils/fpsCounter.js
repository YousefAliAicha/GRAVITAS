(function () {
  var container = document.createElement("div");
  container.id = "fps-counter";
  container.style.cssText =
    "position:fixed;top:12px;left:12px;z-index:99999;" +
    "background:rgba(10,9,8,0.88);border:1px solid #d1a14c;" +
    "color:#2bb8b0;font-family:'JetBrains Mono',monospace;font-size:11px;" +
    "padding:6px 10px;pointer-events:none;box-shadow:0 0 12px rgba(0,0,0,0.7);" +
    "display:flex;gap:12px;align-items:center;letter-spacing:0.08em;";

  container.innerHTML =
    '<div>FPS: <span id="fps-val" style="color:#2bb8b0;font-weight:bold;">--</span></div>' +
    '<div>FRAME: <span id="ms-val" style="color:#e8ddc7;">--</span>ms</div>';

  document.body.appendChild(container);

  var fpsEl = document.getElementById("fps-val");
  var msEl = document.getElementById("ms-val");

  var frames = 0;
  var prevTime = performance.now();
  var lastFrameTime = performance.now();

  function tick() {
    var time = performance.now();
    frames++;

    var delta = time - lastFrameTime;
    lastFrameTime = time;

    if (time >= prevTime + 500) {
      var fps = Math.round((frames * 1000) / (time - prevTime));
      fpsEl.textContent = fps;
      fpsEl.style.color =
        fps >= 58 ? "#2bb8b0" : fps >= 30 ? "#d1a14c" : "#ff4444";
      msEl.textContent = delta.toFixed(1);

      frames = 0;
      prevTime = time;
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
