/**
 * Shareable path router for GitHub Pages (/GRAVITAS/...).
 * Local file:// or plain static servers (no /GRAVITAS base) use hash routes
 * so portal clicks never navigate away from index.html:
 *   index.html#/startup/
 *   index.html#/startup/splice-engine/
 *
 * On Pages with base /GRAVITAS:
 *   /GRAVITAS/startup/
 *   /GRAVITAS/startup/splice-engine/
 */
(function () {
  var DOCS = { about: 1, contact: 1, essays: 1, favorites: 1 };
  var TRACKS = { systems: 1, creative: 1, startup: 1, archive: 1 };
  var suppressing = false;
  var bootstrapped = false;
  var sessionPushed = false;

  function detectBase() {
    var path = location.pathname || "/";
    var m = path.match(/^(\/GRAVITAS)(?=\/|$)/i);
    if (m) return m[1];
    return "";
  }

  var BASE = detectBase();
  // Pretty path URLs need SPA fallback (Pages 404.html). Local/file has none.
  var USE_HASH = !BASE || location.protocol === "file:";

  function slugify(name) {
    return String(name || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function projectList() {
    return typeof PROJECT_LIST !== "undefined" ? PROJECT_LIST : [];
  }

  function findProjectBySlug(slug) {
    var want = slugify(slug);
    var list = projectList();
    for (var i = 0; i < list.length; i++) {
      if (slugify(list[i].name) === want) return list[i];
    }
    return null;
  }

  function findProjectByName(name) {
    var list = projectList();
    var key = String(name || "").toUpperCase();
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].name).toUpperCase() === key) return list[i];
    }
    return null;
  }

  function normalizeState(input) {
    var state = {
      surface: (input && input.surface) || "landing",
      page: (input && input.page) || null,
      project: (input && input.project) || null,
    };
    if (state.surface !== "app") {
      state.surface = "landing";
      state.page = null;
      state.project = null;
      return state;
    }
    if (state.project) {
      var p = findProjectByName(state.project);
      if (!p) {
        state.project = null;
      } else {
        state.project = p.name;
        if (!state.page || state.page === "archive") {
          if (state.page !== "archive") state.page = p.track;
        } else if (
          TRACKS[state.page] &&
          state.page !== "archive" &&
          state.page !== p.track
        ) {
          state.page = p.track;
        }
      }
    }
    if (state.page && !DOCS[state.page] && !TRACKS[state.page]) {
      state.page = "systems";
    }
    return state;
  }

  function routeSuffix(state) {
    state = normalizeState(state);
    if (state.surface !== "app") return "/";
    if (state.project) {
      var seg = state.page === "archive" ? "archive" : state.page;
      return "/" + seg + "/" + slugify(state.project) + "/";
    }
    return "/" + state.page + "/";
  }

  function documentPath() {
    // Keep the real document (…/index.html or /) so file:// never jumps to /
    return location.pathname || "/";
  }

  function buildPath(state) {
    var suffix = routeSuffix(state);
    if (USE_HASH) {
      return documentPath() + location.search + "#" + suffix;
    }
    return (BASE || "") + suffix;
  }

  function parsePath(pathname) {
    var path = pathname || "/";
    if (BASE && path.toLowerCase().indexOf(BASE.toLowerCase()) === 0) {
      path = path.slice(BASE.length);
    }
    var segs = path
      .split("/")
      .filter(Boolean)
      .map(function (s) {
        return s.toLowerCase();
      });
    // Drop index.html if present (file:// …/index.html)
    if (segs.length && /\.html?$/.test(segs[segs.length - 1])) {
      segs.pop();
    }
    // If path still has folder junk before a known route, ignore — hash handles local
    if (!segs.length) return { surface: "landing" };

    var a = segs[0];
    if (DOCS[a]) return { surface: "app", page: a };
    if (TRACKS[a]) {
      var state = { surface: "app", page: a };
      if (segs[1]) {
        var proj = findProjectBySlug(segs[1]);
        if (proj) {
          state.project = proj.name;
          if (a !== "archive") state.page = proj.track;
        }
      }
      return state;
    }
    return { surface: "landing", unknown: true };
  }

  function parseHash() {
    var raw = (location.hash || "").replace(/^#/, "");
    if (!raw || raw === "/") return { surface: "landing" };
    return parsePath(raw);
  }

  function locationState() {
    if (USE_HASH) return parseHash();
    return parsePath(location.pathname);
  }

  function currentPagerState() {
    return window.Gravitas && typeof window.Gravitas.PagerState === "function"
      ? window.Gravitas.PagerState()
      : 0;
  }

  function apply(state, opts) {
    opts = opts || {};
    state = normalizeState(state);
    suppressing = true;
    try {
      if (state.surface !== "app") {
        if (window.Gravitas.CloseProjectDetailSilent) {
          window.Gravitas.CloseProjectDetailSilent();
        } else if (window.Gravitas.CloseProjectDetail) {
          window.Gravitas.CloseProjectDetail();
        }
        if (window.Gravitas.GoToLanding) {
          var leavingApp = currentPagerState() === 1;
          window.Gravitas.GoToLanding({
            instant: !!opts.instant,
            fromRouter: true,
            force: true,
            restoreCamera: leavingApp,
          });
        }
        return;
      }

      var entryTrack = "systems";
      if (state.page && TRACKS[state.page]) {
        entryTrack = state.page;
      } else if (state.project) {
        var linked = findProjectByName(state.project);
        if (linked) entryTrack = linked.track;
      }
      if (DOCS[state.page]) entryTrack = "systems";

      if (currentPagerState() === 0 && window.Gravitas.GoToApp) {
        window.Gravitas.GoToApp(entryTrack, {
          instant: true,
          fromRouter: true,
          skipSelect: true,
        });
      }

      if (state.project) {
        var listPage = state.page === "archive" ? "archive" : entryTrack;
        if (window.Gravitas.SelectTrack) {
          window.Gravitas.SelectTrack(listPage, { fromRouter: true });
        }
        var proj = findProjectByName(state.project);
        if (proj && window.Gravitas.OpenProjectDetail) {
          window.Gravitas.OpenProjectDetail(proj, { fromRouter: true });
        }
      } else {
        if (window.Gravitas.CloseProjectDetailSilent) {
          window.Gravitas.CloseProjectDetailSilent();
        } else if (window.Gravitas.CloseProjectDetail) {
          window.Gravitas.CloseProjectDetail();
        }
        if (window.Gravitas.SelectTrack) {
          window.Gravitas.SelectTrack(state.page, { fromRouter: true });
        }
      }
    } finally {
      setTimeout(function () {
        suppressing = false;
      }, 0);
    }
  }

  function navigate(input, opts) {
    opts = opts || {};
    if (suppressing && !opts.force) return;
    var state = normalizeState(input);
    var url = buildPath(state);
    var histState = {
      gravitas: true,
      surface: state.surface,
      page: state.page,
      project: state.project,
    };
    if (opts.replace) {
      history.replaceState(histState, "", url);
    } else if (!opts.skipHistory) {
      history.pushState(histState, "", url);
      sessionPushed = true;
    }
    if (!opts.skipApply) apply(state, opts);
  }

  function syncFromLocation(opts) {
    opts = opts || {};
    var stored = null;
    try {
      stored = sessionStorage.getItem("gravitas-redirect");
      if (stored) sessionStorage.removeItem("gravitas-redirect");
    } catch (e) {}

    var state;
    if (stored) {
      state = parsePath(stored);
    } else {
      state = locationState();
    }
    if (state.unknown) {
      navigate({ surface: "landing" }, { replace: true, instant: true });
      return state;
    }
    navigate(state, {
      replace: true,
      instant: true,
      force: true,
    });
    return state;
  }

  function onUserNavigate(input) {
    if (suppressing) return;
    navigate(input, { push: true });
  }

  window.addEventListener("popstate", function (e) {
    var st = e.state && e.state.gravitas ? e.state : locationState();
    apply(normalizeState(st), { instant: true });
  });

  window.addEventListener("hashchange", function () {
    if (!USE_HASH || suppressing) return;
    apply(normalizeState(parseHash()), { instant: true });
  });

  function resumeHref() {
    if (BASE) return BASE + "/assets/Yousef-Ali-Aicha-Resume.pdf";
    // Relative to the document so file:// and local servers both work
    var dir = documentPath().replace(/[^/]+$/, "");
    return dir + "assets/Yousef-Ali-Aicha-Resume.pdf";
  }

  window.Gravitas = window.Gravitas || {};
  window.Gravitas.Router = {
    base: BASE,
    useHash: USE_HASH,
    slugify: slugify,
    buildPath: buildPath,
    parsePath: parsePath,
    navigate: navigate,
    go: onUserNavigate,
    syncFromLocation: syncFromLocation,
    canHistoryBack: function () {
      return sessionPushed;
    },
    isSuppressing: function () {
      return suppressing;
    },
    bootstrap: function () {
      if (bootstrapped) return;
      bootstrapped = true;
      syncFromLocation({ instant: true });
      var href = resumeHref();
      document.querySelectorAll("[data-resume-link]").forEach(function (el) {
        el.setAttribute("href", href);
      });
    },
  };
})();
