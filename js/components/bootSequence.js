function initBootSequence() {
  var bootBar = document.getElementById("boot-bar");
  if (!bootBar) return;

  var segCount = 22;
  var fragment = document.createDocumentFragment();
  for (var i = 0; i < segCount; i++) {
    fragment.appendChild(document.createElement("span"));
  }
  bootBar.appendChild(fragment);

  var segs = bootBar.querySelectorAll("span");
  var lit = 0;
  var bootInterval = setInterval(function () {
    if (lit < segs.length) {
      segs[lit].classList.add("lit");
      lit++;
    } else {
      clearInterval(bootInterval);
      var bootScreen = document.getElementById("boot-screen");
      if (bootScreen) bootScreen.classList.add("hidden");
      var page = document.getElementById("page");
      if (page) page.classList.add("booted");

      setTimeout(function () {
        if (window.Gravitas.Hero && window.Gravitas.Hero.destroyBootLogo) {
          window.Gravitas.Hero.destroyBootLogo();
        }
      }, 550);
    }
  }, 42);
}
