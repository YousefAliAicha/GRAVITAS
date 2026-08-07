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

  root.querySelectorAll("[data-mobile-nav]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var page = btn.getAttribute("data-mobile-nav");
      if (!page) return;
      if (window.Gravitas.Router) {
        window.Gravitas.Router.navigate({ surface: "app", page: page });
        return;
      }
      if (window.Gravitas.GoToApp) {
        window.Gravitas.GoToApp("systems");
      }
      if (window.Gravitas.SelectTrack) {
        window.Gravitas.SelectTrack(page);
      }
    });
  });
})();
