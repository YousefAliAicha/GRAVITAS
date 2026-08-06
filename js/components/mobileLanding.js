(function () {
  var root = document.getElementById("mobile-landing");
  if (!root) return;

  var buttons = root.querySelectorAll(".mobile-gate-btn[data-track]");
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var track = btn.getAttribute("data-track");
      if (track && window.Gravitas.GoToApp) {
        window.Gravitas.GoToApp(track);
      }
    });
  });
})();
