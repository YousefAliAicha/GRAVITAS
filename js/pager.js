(function () {
  var C = window.Gravitas.Constants;
  var IS_MOBILE =
    typeof window.Gravitas.isMobileExperience === "function"
      ? window.Gravitas.isMobileExperience()
      : typeof window.matchMedia === "function" &&
        window.matchMedia("(max-width: " + C.mobile.maxWidthPx + "px) and (hover: none)").matches;

  var pagerTrack = document.getElementById("pager-track");
  var portalOverlay = document.getElementById("portal-overlay");
  var statusText = document.getElementById("portal-status-text");
  var subText = document.getElementById("portal-sub-text");
  var mobileLanding = document.getElementById("mobile-landing");

  var pagerState = 0; // 0 = Landing, 1 = App
  var heroZoom = "wide";
  var busy = false;
  var zoomCooldown = false;
  var ZOOM_COOLDOWN_MS = C.pager.zoomCooldownMs;

  var gateTracks = ["systems", "creative", "startup"];
  var selectedGateIndex = 0;

  function hideMobileLanding() {
    if (mobileLanding) mobileLanding.classList.add("is-hidden");
  }

  function showMobileLanding() {
    if (IS_MOBILE && mobileLanding) {
      mobileLanding.classList.remove("is-hidden");
    }
  }

  function updateGateHighlight(index) {
    selectedGateIndex = (index + gateTracks.length) % gateTracks.length;
    var targetTrack = gateTracks[selectedGateIndex];
    if (window.Gravitas.Hero && window.Gravitas.Hero.setHover) {
      window.Gravitas.Hero.setHover(targetTrack, true);
    }
  }

  function goToApp(selectedTrack, opts) {
    opts = opts || {};
    if (busy || pagerState === 1) {
      if (pagerState === 1 && !opts.skipSelect && window.Gravitas.SelectTrack) {
        window.Gravitas.SelectTrack(selectedTrack, {
          fromRouter: !!opts.fromRouter,
        });
      }
      return;
    }
    busy = true;

    hideMobileLanding();

    function finishEnter(deferIdle) {
      pagerState = 1;
      pagerTrack.classList.add("in-app");
      if (window.Gravitas.Hero) window.Gravitas.Hero.pause();
      if (window.Gravitas.ScanBay) window.Gravitas.ScanBay.resume();
      if (!opts.skipSelect && window.Gravitas.SelectTrack) {
        window.Gravitas.SelectTrack(selectedTrack, {
          fromRouter: !!opts.fromRouter,
        });
      }
      if (!opts.fromRouter && window.Gravitas.Router) {
        window.Gravitas.Router.navigate(
          { surface: "app", page: selectedTrack },
          { skipApply: true },
        );
      }
      if (!deferIdle) {
        busy = false;
        if (window.Gravitas.ScanBay && window.Gravitas.ScanBay.resizeBay) {
          window.Gravitas.ScanBay.resizeBay();
        }
        if (window.Gravitas.Hero && window.Gravitas.Hero.resize) {
          window.Gravitas.Hero.resize();
        }
      }
    }

    if (opts.instant) {
      if (portalOverlay) {
        portalOverlay.classList.remove("active", "active-reverse");
        portalOverlay.setAttribute("aria-hidden", "true");
      }
      finishEnter(false);
      return;
    }

    if (statusText)
      statusText.textContent = "TEMPORAL VECTOR · ENGAGED";
    if (subText) subText.textContent = "SLIPSTREAM COORDINATES LOCKING";

    if (portalOverlay) {
      portalOverlay.classList.remove("active-reverse");
      portalOverlay.setAttribute("aria-hidden", "false");
      // Restart CSS animations cleanly
      void portalOverlay.offsetWidth;
      portalOverlay.classList.add("active");
    }

    if (window.Gravitas.Hero && window.Gravitas.Hero.flyIntoGate) {
      window.Gravitas.Hero.flyIntoGate(selectedTrack, function () {
        finishEnter(true);
        setTimeout(function () {
          if (portalOverlay) {
            portalOverlay.classList.remove("active");
            portalOverlay.setAttribute("aria-hidden", "true");
          }
          busy = false;
          if (window.Gravitas.ScanBay && window.Gravitas.ScanBay.resizeBay) {
            window.Gravitas.ScanBay.resizeBay();
          }
          if (window.Gravitas.Hero && window.Gravitas.Hero.resize) {
            window.Gravitas.Hero.resize();
          }
        }, C.pager.portalClearMs);
      });
    } else {
      if (portalOverlay) portalOverlay.classList.remove("active");
      if (portalOverlay) portalOverlay.setAttribute("aria-hidden", "true");
      finishEnter(false);
    }
  }

  function goToLanding(opts) {
    opts = opts || {};
    if (busy || pagerState === 0) return;
    busy = true;

    if (window.Gravitas.CloseSecretDocs) {
      window.Gravitas.CloseSecretDocs();
    }
    if (window.Gravitas.CloseProjectDetailSilent) {
      window.Gravitas.CloseProjectDetailSilent();
    }

    function finishLeave() {
      pagerState = 0;
      pagerTrack.classList.remove("in-app");
      if (window.Gravitas.ScanBay) window.Gravitas.ScanBay.pause();
      showMobileLanding();
      if (!opts.fromRouter && window.Gravitas.Router) {
        window.Gravitas.Router.navigate(
          { surface: "landing" },
          { skipApply: true },
        );
      }
      busy = false;
      if (window.Gravitas.ScanBay && window.Gravitas.ScanBay.resizeBay) {
        window.Gravitas.ScanBay.resizeBay();
      }
      if (window.Gravitas.Hero && window.Gravitas.Hero.resize) {
        window.Gravitas.Hero.resize();
      }
      if (heroZoom === "gates" && window.Gravitas.Hero) {
        window.Gravitas.Hero.setInteractive(true);
        updateGateHighlight(selectedGateIndex);
      }
    }

    if (opts.instant) {
      if (portalOverlay) {
        portalOverlay.classList.remove("active", "active-reverse");
        portalOverlay.setAttribute("aria-hidden", "true");
      }
      if (window.Gravitas.Hero) window.Gravitas.Hero.resume();
      finishLeave();
      return;
    }

    if (statusText) statusText.textContent = "TEMPORAL RECALL · INITIATED";
    if (subText) subText.textContent = "REWINDING SLIPSTREAM";

    if (portalOverlay) {
      portalOverlay.classList.remove("active");
      portalOverlay.setAttribute("aria-hidden", "false");
      void portalOverlay.offsetWidth;
      portalOverlay.classList.add("active-reverse");
    }

    if (window.Gravitas.Hero) window.Gravitas.Hero.resume();

    if (window.Gravitas.Hero && window.Gravitas.Hero.flyOutOfGate) {
      window.Gravitas.Hero.flyOutOfGate(function () {
        finishLeave();
        setTimeout(function () {
          if (portalOverlay) {
            portalOverlay.classList.remove("active-reverse");
            portalOverlay.setAttribute("aria-hidden", "true");
          }
        }, C.pager.portalReverseClearMs);
      });
    } else {
      if (portalOverlay) portalOverlay.classList.remove("active-reverse");
      finishLeave();
    }
  }

  window.Gravitas = window.Gravitas || {};
  window.Gravitas.GoToApp = goToApp;
  window.Gravitas.GoToLanding = goToLanding;

  function zoomToGates() {
    if (heroZoom === "gates" || zoomCooldown || pagerState !== 0) return;
    heroZoom = "gates";
    zoomCooldown = true;
    setTimeout(function () {
      zoomCooldown = false;
    }, ZOOM_COOLDOWN_MS);
    document.body.classList.add("hero-gates");
    if (window.Gravitas.Hero) {
      window.Gravitas.Hero.toGates();
      window.Gravitas.Hero.setInteractive(true);
      updateGateHighlight(selectedGateIndex);
    }
  }

  function zoomToWide() {
    if (heroZoom === "wide" || zoomCooldown || pagerState !== 0) return;
    heroZoom = "wide";
    zoomCooldown = true;
    setTimeout(function () {
      zoomCooldown = false;
    }, ZOOM_COOLDOWN_MS);
    document.body.classList.remove("hero-gates");
    if (window.Gravitas.Hero) {
      window.Gravitas.Hero.toWide();
      window.Gravitas.Hero.setInteractive(false);
      window.Gravitas.Hero.setHover(null, false);
    }
  }

  window.addEventListener(
    "wheel",
    function (e) {
      if (pagerState !== 0) return;
      if (e.deltaY > C.pager.wheelDeltaThreshold && heroZoom === "wide") {
        zoomToGates();
      } else if (e.deltaY < -C.pager.wheelDeltaThreshold && heroZoom === "gates") {
        zoomToWide();
      }
    },
    { passive: true },
  );

  var touchStartY = null;
  window.addEventListener(
    "touchstart",
    function (e) {
      touchStartY = e.touches[0].clientY;
    },
    { passive: true },
  );

  window.addEventListener(
    "touchmove",
    function (e) {
      if (touchStartY === null || pagerState !== 0) return;
      var dy = touchStartY - e.touches[0].clientY;
      if (dy > C.pager.touchSwipePx && heroZoom === "wide") {
        zoomToGates();
        touchStartY = null;
      } else if (dy < -C.pager.touchSwipePx && heroZoom === "gates") {
        zoomToWide();
        touchStartY = null;
      }
    },
    { passive: true },
  );

  // LANDING PAGE KEYBOARD CONTROLS
  window.addEventListener("keydown", function (e) {
    if (e.defaultPrevented) return;
    if (pagerState !== 0) return;

    if (heroZoom === "wide") {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        zoomToGates();
      }
      return;
    }

    if (heroZoom === "gates") {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        updateGateHighlight(selectedGateIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        updateGateHighlight(selectedGateIndex + 1);
      } else if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goToApp(gateTracks[selectedGateIndex]);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        zoomToWide();
      }
    }
  });

  var scrollCue = document.getElementById("scroll-cue");
  var ascendCue = document.getElementById("ascend-cue");
  if (scrollCue) scrollCue.addEventListener("click", zoomToGates);
  if (ascendCue) ascendCue.addEventListener("click", zoomToWide);

  var backBtn = document.getElementById("back-to-gates");
  if (backBtn) {
    backBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (
        window.Gravitas.Router &&
        window.Gravitas.Router.canHistoryBack &&
        window.Gravitas.Router.canHistoryBack()
      ) {
        history.back();
        return;
      }
      goToLanding();
    });
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (window.Gravitas.Hero) window.Gravitas.Hero.pause();
      if (window.Gravitas.ScanBay) window.Gravitas.ScanBay.pause();
    } else {
      if (pagerState === 0 && window.Gravitas.Hero) window.Gravitas.Hero.resume();
      if (pagerState === 1 && window.Gravitas.ScanBay)
        window.Gravitas.ScanBay.resume();
    }
  });

  if (window.Gravitas.Hero) {
    window.Gravitas.Hero.onGateClick = goToApp;
  }

  window.Gravitas = window.Gravitas || {};
  window.Gravitas.PagerState = function () {
    return pagerState;
  };

  if (window.Gravitas.Router && window.Gravitas.Router.bootstrap) {
    window.Gravitas.Router.bootstrap();
  }
})();
