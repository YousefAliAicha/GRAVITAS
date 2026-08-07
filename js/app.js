(function () {
  var shell = document.getElementById("shell");
  var navItems = document.querySelectorAll(".nav-item");
  var bayTitle = document.getElementById("bay-title");
  var stripEyebrow = document.getElementById("strip-eyebrow");
  var projectList = document.getElementById("project-list");
  var recTag = document.getElementById("bay-tag-tr");
  var brandRow = document.getElementById("brand-row");

  var currentActiveTrack = "systems";
  var allNavDestinations = [
    "systems",
    "creative",
    "startup",
    "archive",
    "about",
    "contact",
  ];

  function formatStatus(raw) {
    return String(raw || "")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, function (c) {
        return c.toUpperCase();
      });
  }

  function buildProjectRow(p, showTrack) {
    var row = document.createElement("div");
    row.className = "project-row";
    row.dataset.projectName = p.name;
    row.tabIndex = 0;
    row.setAttribute("role", "listitem");
    row.setAttribute(
      "aria-label",
      "View project details for " + p.name + " (" + p.status + ")",
    );

    var trackTag = showTrack
      ? '<span class="p-track">' + p.trackLabel + "</span>"
      : "";
    var proofTag = p.demo
      ? '<span class="p-proof p-proof--live">Live</span>'
      : p.video
        ? '<span class="p-proof p-proof--video">Video</span>'
        : p.repo
          ? '<span class="p-proof">Repo</span>'
          : "";
    row.innerHTML =
      '<span class="p-info">' +
      '<span class="p-name">' +
      p.name +
      "</span>" +
      '<span class="p-desc">' +
      p.desc +
      "</span></span>" +
      '<span class="p-meta">' +
      trackTag +
      proofTag +
      '<span class="p-status">' +
      formatStatus(p.status) +
      '</span><span class="p-open" aria-hidden="true">Open</span>' +
      '<span class="p-dot"></span></span>';

    function handleHoverStart() {
      if (window.Gravitas.ScanBay && window.Gravitas.ScanBay.hoverProject) {
        window.Gravitas.ScanBay.hoverProject(p.name);
      }
    }

    function handleHoverEnd() {
      if (detailOpen) return;
      if (window.Gravitas.ScanBay && window.Gravitas.ScanBay.hoverProject) {
        window.Gravitas.ScanBay.hoverProject(null);
      }
    }

    row.addEventListener("mouseenter", handleHoverStart);
    row.addEventListener("mouseleave", handleHoverEnd);
    row.addEventListener("focus", handleHoverStart);
    row.addEventListener("blur", handleHoverEnd);

    row.addEventListener("click", function (e) {
      e.stopPropagation();
      openProjectDetail(p, row);
    });

    row.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        openProjectDetail(p, row);
      }
    });

    return row;
  }

  function renderProjects(trackKey) {
    var t = TRACKS[trackKey];
    projectList.innerHTML = "";
    var fragment = document.createDocumentFragment();
    t.projects.forEach(function (p) {
      fragment.appendChild(buildProjectRow(p, false));
    });
    projectList.appendChild(fragment);
  }

  function renderArchive() {
    projectList.innerHTML = "";
    var fragment = document.createDocumentFragment();
    ARCHIVE_PROJECTS.forEach(function (p) {
      fragment.appendChild(buildProjectRow(p, true));
    });
    projectList.appendChild(fragment);
  }

  var projectDetail = document.getElementById("project-detail");
  var detailBack = document.getElementById("detail-back");
  var detailTrack = document.getElementById("detail-track");
  var detailName = document.getElementById("detail-name");
  var detailStatus = document.getElementById("detail-status");
  var detailTools = document.getElementById("detail-tools");
  var detailDesc = document.getElementById("detail-desc");
  var detailDemo = document.getElementById("detail-demo");
  var detailMore = document.getElementById("detail-more");
  var detailScroll = document.getElementById("detail-scroll");
  var detailTvMount = document.getElementById("detail-tv-mount");

  var scanBayEl = document.getElementById("scan-bay");
  var scanBayHomeParent = scanBayEl ? scanBayEl.parentNode : null;
  var scanBayHomeNextSibling = scanBayEl ? scanBayEl.nextSibling : null;

  function mountScanBayInTv() {
    if (!scanBayEl || !detailTvMount) return;
    detailTvMount.appendChild(scanBayEl);
    requestAnimationFrame(function () {
      if (window.Gravitas.ScanBay && window.Gravitas.ScanBay.resizeBay) {
        window.Gravitas.ScanBay.resizeBay();
      }
      if (window.Gravitas.ScanBay && window.Gravitas.ScanBay.enterFocusMode) {
        window.Gravitas.ScanBay.enterFocusMode();
      }
    });
  }

  function unmountScanBayFromTv() {
    if (!scanBayEl || !scanBayHomeParent) return;
    if (scanBayEl.parentNode !== scanBayHomeParent) {
      scanBayHomeParent.insertBefore(scanBayEl, scanBayHomeNextSibling);
    }
    if (window.Gravitas.ScanBay && window.Gravitas.ScanBay.exitFocusMode) {
      window.Gravitas.ScanBay.exitFocusMode();
    }
    requestAnimationFrame(function () {
      if (window.Gravitas.ScanBay && window.Gravitas.ScanBay.resizeBay) {
        window.Gravitas.ScanBay.resizeBay();
      }
    });
  }

  var detailOpen = false;
  var detailBusy = false;
  var lastFocusedElement = null;
  var viewStage = document.getElementById("view-stage");

  function setStageCovered(covered) {
    if (!viewStage) return;
    viewStage.classList.toggle("is-detail-open", !!covered);
  }

  function populateDetail(p) {
    detailTrack.textContent =
      (
        p.trackLabel ||
        (TRACK_META[p.track] && TRACK_META[p.track].label) ||
        p.track ||
        ""
      ).toUpperCase() + " · PROJECT LOG";
    detailName.textContent = p.name;
    detailStatus.textContent = formatStatus(p.status);

    detailTools.innerHTML = "";
    (p.tools || []).forEach(function (tool) {
      var pill = document.createElement("span");
      pill.className = "detail-tool-pill";
      pill.textContent = tool;
      detailTools.appendChild(pill);
    });

    detailDesc.textContent = p.desc;
    detailMore.textContent =
      p.details || "No additional engineering notes yet — check back soon.";

    detailDemo.innerHTML = "";
    var links = [];
    if (p.demo) {
      links.push({ label: "Live demo", url: p.demo, primary: true });
    }
    if (p.video) {
      links.push({ label: "Watch demo", url: p.video, primary: !p.demo });
    }
    if (p.repo) {
      links.push({ label: "Repository", url: p.repo, primary: false });
    }
    (p.related || []).forEach(function (rel) {
      if (rel && rel.url) {
        links.push({
          label: rel.label || "Related",
          url: rel.url,
          primary: false,
        });
      }
    });

    if (links.length) {
      var linkRow = document.createElement("div");
      linkRow.className = "detail-proof-links";
      links.forEach(function (item) {
        var a = document.createElement("a");
        a.className =
          "detail-proof-link" + (item.primary ? " is-primary" : "");
        a.href = item.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = item.label;
        linkRow.appendChild(a);
      });
      detailDemo.appendChild(linkRow);
    } else {
      var placeholder = document.createElement("span");
      placeholder.className = "detail-demo-placeholder";
      placeholder.textContent = "Demo / repo links coming soon.";
      detailDemo.appendChild(placeholder);
    }
  }

  var detailPushedHistory = false;

  function openProjectDetail(p, triggerEl, opts) {
    if (
      triggerEl &&
      typeof triggerEl === "object" &&
      !triggerEl.nodeType &&
      (triggerEl.fromRouter || triggerEl.replace || triggerEl.skipApply)
    ) {
      opts = triggerEl;
      triggerEl = null;
    }
    opts = opts || {};
    if (!projectDetail || detailBusy) return;
    if (detailOpen && detailName && detailName.textContent === p.name) {
      if (!opts.fromRouter && window.Gravitas.Router) {
        window.Gravitas.Router.navigate(
          {
            surface: "app",
            page: currentActiveTrack === "archive" ? "archive" : p.track,
            project: p.name,
          },
          { skipApply: true, replace: true },
        );
      }
      return;
    }
    lastFocusedElement = triggerEl || document.activeElement;

    populateDetail(p);

    detailScroll.scrollTop = 0;
    projectDetail.setAttribute("aria-hidden", "false");
    detailOpen = true;
    detailBusy = true;
    detailPushedHistory = false;

    if (!opts.fromRouter && window.Gravitas.Router) {
      window.Gravitas.Router.navigate(
        {
          surface: "app",
          page: currentActiveTrack === "archive" ? "archive" : p.track,
          project: p.name,
        },
        { skipApply: true },
      );
      detailPushedHistory = true;
    }

    // Hide list/bay slot so canvas remount never flashes through
    setStageCovered(true);

    var targetName = p.name;
    var motionEls = [detailBack, detailScroll].filter(Boolean);

    if (!window.gsap) {
      projectDetail.classList.add("is-open");
      projectDetail.style.display = "flex";
      projectDetail.style.opacity = "1";
      mountScanBayInTv();
      if (window.Gravitas.ScanBay && window.Gravitas.ScanBay.hoverProject) {
        window.Gravitas.ScanBay.hoverProject(targetName);
      }
      detailBusy = false;
      if (detailBack) detailBack.focus();
      return;
    }

    gsap.killTweensOf([projectDetail].concat(motionEls));

    // 1) Opaque fullscreen cover appears immediately (no list peek)
    gsap.set(projectDetail, {
      display: "flex",
      autoAlpha: 1,
      y: 0,
      yPercent: 0,
      scale: 1,
    });
    projectDetail.classList.add("is-open");

    // 2) Content rises in — this is the visible transition
    gsap.set(motionEls, { autoAlpha: 0, y: 40 });

    mountScanBayInTv();

    gsap.to(motionEls, {
      autoAlpha: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.07,
      ease: "power3.out",
      onComplete: function () {
        detailBusy = false;
        if (window.Gravitas.ScanBay && window.Gravitas.ScanBay.hoverProject) {
          window.Gravitas.ScanBay.hoverProject(targetName);
        }
        if (window.Gravitas.ScanBay && window.Gravitas.ScanBay.resizeBay) {
          window.Gravitas.ScanBay.resizeBay();
        }
        if (detailBack) detailBack.focus();
      },
    });
  }

  function closeProjectDetail(opts) {
    opts = opts || {};
    if (!projectDetail || !detailOpen || detailBusy) return;

    if (
      opts.useHistoryBack &&
      !opts.fromRouter &&
      detailPushedHistory &&
      history.state &&
      history.state.gravitas &&
      history.state.project
    ) {
      detailPushedHistory = false;
      history.back();
      return;
    }

    detailOpen = false;
    detailBusy = true;
    detailPushedHistory = false;
    projectDetail.setAttribute("aria-hidden", "true");

    if (
      !opts.fromRouter &&
      !opts.silent &&
      !opts.skipHistory &&
      window.Gravitas.Router
    ) {
      window.Gravitas.Router.navigate(
        { surface: "app", page: currentActiveTrack || "systems" },
        { skipApply: true, replace: true },
      );
    }

    if (window.Gravitas.ScanBay && window.Gravitas.ScanBay.hoverProject) {
      window.Gravitas.ScanBay.hoverProject(null);
    }

    var restoreFocus = function () {
      if (
        lastFocusedElement &&
        typeof lastFocusedElement.focus === "function"
      ) {
        lastFocusedElement.focus();
      }
    };

    var motionEls = [detailBack, detailScroll].filter(Boolean);

    var finishClose = function () {
      unmountScanBayFromTv();
      setStageCovered(false);
      projectDetail.classList.remove("is-open");
      detailBusy = false;
      restoreFocus();
    };

    if (!window.gsap) {
      projectDetail.style.display = "none";
      projectDetail.style.opacity = "";
      finishClose();
      return;
    }

    gsap.killTweensOf([projectDetail].concat(motionEls));
    gsap.to(motionEls, {
      autoAlpha: 0,
      y: 24,
      duration: 0.22,
      ease: "power2.in",
      stagger: 0.04,
    });
    gsap.to(projectDetail, {
      autoAlpha: 0,
      duration: 0.28,
      delay: 0.12,
      ease: "power2.in",
      onComplete: function () {
        gsap.set(projectDetail, {
          display: "none",
          y: 0,
          yPercent: 0,
          autoAlpha: 1,
        });
        gsap.set(motionEls, { clearProps: "opacity,visibility,transform" });
        finishClose();
      },
    });
  }

  if (detailBack) {
    detailBack.addEventListener("click", function (e) {
      e.stopPropagation();
      closeProjectDetail({ useHistoryBack: true });
    });
  }

  // MOUSE WHEEL & TOUCH RETURN IN PROJECT DETAIL
  if (detailScroll) {
    detailScroll.addEventListener(
      "wheel",
      function (e) {
        if (!detailOpen) return;
        if (e.deltaY < -10 && detailScroll.scrollTop <= 0) {
          e.preventDefault();
          closeProjectDetail({ useHistoryBack: true });
        }
      },
      { passive: false },
    );

    var detailTouchStartY = null;
    detailScroll.addEventListener(
      "touchstart",
      function (e) {
        detailTouchStartY = e.touches[0].clientY;
      },
      { passive: true },
    );

    detailScroll.addEventListener(
      "touchmove",
      function (e) {
        if (detailTouchStartY === null || !detailOpen) return;
        var dy = detailTouchStartY - e.touches[0].clientY;
        if (dy < -45 && detailScroll.scrollTop <= 0) {
          detailTouchStartY = null;
          closeProjectDetail({ useHistoryBack: true });
        }
      },
      { passive: true },
    );
  }

  // STEP-BY-STEP KEYBOARD NAVIGATION IN APP PANEL
  document.addEventListener("keydown", function (e) {
    if (window.Gravitas.PagerState && window.Gravitas.PagerState() !== 1) return;

    // 1. IF PROJECT DETAIL TAKEOVER IS OPEN
    if (detailOpen) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeProjectDetail({ useHistoryBack: true });
        return;
      }

      if (e.key === "ArrowUp") {
        if (detailScroll && detailScroll.scrollTop <= 5) {
          e.preventDefault();
          closeProjectDetail({ useHistoryBack: true });
        } else if (detailScroll) {
          e.preventDefault();
          detailScroll.scrollBy({ top: -80, behavior: "smooth" });
        }
        return;
      }

      if (e.key === "ArrowDown") {
        if (detailScroll) {
          e.preventDefault();
          detailScroll.scrollBy({ top: 80, behavior: "smooth" });
        }
        return;
      }

      if (e.key === "Tab" && projectDetail) {
        var focusables = projectDetail.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      return;
    }

    var registerScroll = document.getElementById("register-scroll");
    var atStageTop = !registerScroll || registerScroll.scrollTop <= 5;

    // 2. SCROLL DOWN/UP IN DOSSIER VIEWS (ABOUT / CONTACT)
    if (
      registerScroll &&
      registerScroll.classList.contains("scroll-unlocked") &&
      !atStageTop
    ) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        registerScroll.scrollBy({ top: 80, behavior: "smooth" });
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        registerScroll.scrollBy({ top: -80, behavior: "smooth" });
        return;
      }
    }

    // 3. LEFT / RIGHT ARROWS -> CYCLE ALL 6 DESTINATIONS (SYSTEMS, CREATIVE, STARTUP, ARCHIVE, ABOUT, CONTACT)
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      var currentIdx = allNavDestinations.indexOf(currentActiveTrack);
      if (currentIdx === -1) currentIdx = 0;

      var nextIdx =
        e.key === "ArrowLeft"
          ? (currentIdx - 1 + allNavDestinations.length) %
            allNavDestinations.length
          : (currentIdx + 1) % allNavDestinations.length;

      e.preventDefault();
      var targetKey = allNavDestinations[nextIdx];
      selectTrack(targetKey);
      return;
    }

    // 4. STEP-BY-STEP DOWN / UP ARROW PROJECT SELECTION LOGIC
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && atStageTop) {
      var rows = Array.from(document.querySelectorAll(".project-row"));
      if (!rows.length) return;

      var focusedIndex = rows.indexOf(document.activeElement);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (focusedIndex === -1) {
          rows[0].focus(); // Focus 1st project
        } else if (focusedIndex < rows.length - 1) {
          rows[focusedIndex + 1].focus(); // Focus next project down
        }
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (focusedIndex > 0) {
          rows[focusedIndex - 1].focus(); // Focus previous project up
        } else if (focusedIndex === 0) {
          // On 1st project -> Up arrow DESELECTS project!
          document.activeElement.blur();
          if (window.Gravitas.ScanBay && window.Gravitas.ScanBay.hoverProject) {
            window.Gravitas.ScanBay.hoverProject(null);
          }
        } else if (focusedIndex === -1) {
          // No project selected -> Up arrow GOES TO LANDING PORTAL PAGE!
          if (window.Gravitas.GoToLanding) {
            window.Gravitas.GoToLanding();
          }
        }
        return;
      }
    }
  });

  var SIDEBAR_EXPANDED_W = window.Gravitas.Constants.app.sidebar.expandedW;
  var SIDEBAR_COLLAPSED_W = window.Gravitas.Constants.app.sidebar.collapsedW;
  var SIDEBAR_FADE_SELECTOR =
    ".back-btn, .logo-title, #sidebar-blurb, .nav-item, .field-row, #sidebar-foot";
  var sidebarBusy = false;

  function setSidebarCollapsed(collapse) {
    var isCollapsed = shell.classList.contains("sidebar-collapsed");
    if (isCollapsed === collapse) return;

    if (!window.gsap) {
      shell.classList.toggle("sidebar-collapsed", collapse);
      return;
    }

    if (sidebarBusy) return;
    sidebarBusy = true;

    var fadeEls = document.querySelectorAll(SIDEBAR_FADE_SELECTOR);
    var current =
      parseFloat(getComputedStyle(shell).getPropertyValue("--sidebar-w")) ||
      (isCollapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W);
    var target = collapse ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W;
    var widthState = { w: current };
    var sb = window.Gravitas.Constants.app.sidebar;

    var tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: function () {
        sidebarBusy = false;
        shell.style.setProperty("--sidebar-w", target + "px");
        if (window.Gravitas.ScanBay && window.Gravitas.ScanBay.resizeBay) {
          window.Gravitas.ScanBay.resizeBay();
        }
        if (window.Gravitas.Hero && window.Gravitas.Hero.resize) {
          window.Gravitas.Hero.resize();
        }
      },
    });

    tl.to(
      fadeEls,
      { opacity: 0, duration: sb.fadeOutDuration, stagger: sb.fadeStagger },
      0,
    );
    var widthFrame = 0;
    tl.to(
      widthState,
      {
        w: target,
        duration: sb.widthDuration,
        onUpdate: function () {
          // Throttle layout thrash: update CSS var every other frame
          widthFrame++;
          if (widthFrame % 2 === 0 || widthState.w === target) {
            shell.style.setProperty("--sidebar-w", widthState.w + "px");
          }
        },
      },
      0,
    );
    tl.add(function () {
      shell.classList.toggle("sidebar-collapsed", collapse);
    }, sb.toggleAt);
    tl.to(fadeEls, { opacity: 1, duration: sb.fadeInDuration }, sb.fadeInAt);
  }

  var registerScroll = document.getElementById("register-scroll");
  var stageEl = document.getElementById("view-stage");
  var relockSettleTimer = null;
  var SETTLE_MS = window.Gravitas.Constants.app.settleMs;
  var IS_MOBILE =
    typeof window.Gravitas.isMobileExperience === "function"
      ? window.Gravitas.isMobileExperience()
      : typeof window.matchMedia === "function" &&
        window.matchMedia(
          "(max-width: " + window.Gravitas.Constants.mobile.maxWidthPx + "px) and (hover: none)",
        ).matches;

  function unlockRegister() {
    if (registerScroll) registerScroll.classList.add("scroll-unlocked");
  }

  function lockRegister() {
    if (!registerScroll || IS_MOBILE) return;
    registerScroll.scrollTop = 0;
    registerScroll.classList.remove("scroll-unlocked");
  }

  function closeSecretDocs() {
    ["view-essays", "view-favorites"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.remove("is-open");
      el.hidden = true;
      el.setAttribute("aria-hidden", "true");
    });
  }

  function openSecretDoc(id) {
    closeSecretDocs();
    var el = document.getElementById(id);
    if (!el) return;
    el.hidden = false;
    el.classList.add("is-open");
    el.setAttribute("aria-hidden", "false");
    el.scrollTop = 0;
    setTimeout(function () {
      if (window.Gravitas.DocTypewriter) {
        window.Gravitas.DocTypewriter.play(id);
      }
    }, window.Gravitas.Constants.app.docPlayDelayMs);
  }

  function scrollToView(id) {
    closeSecretDocs();

    var el = document.getElementById(id);
    if (!el || !registerScroll) return;

    var alreadyThere =
      id === "view-stage" &&
      !registerScroll.classList.contains("scroll-unlocked") &&
      registerScroll.scrollTop <= STAGE_TOP_THRESHOLD;
    if (alreadyThere) return;

    clearTimeout(relockSettleTimer);
    unlockRegister();
    void registerScroll.offsetHeight;
    registerScroll.scrollTo({ top: el.offsetTop, behavior: "smooth" });

    if (id === "view-about" || id === "view-contact") {
      setTimeout(function () {
        if (window.Gravitas.DocTypewriter) {
          window.Gravitas.DocTypewriter.play(id);
        }
      }, window.Gravitas.Constants.app.docPlayDelayMs);
    }

    if (id === "view-stage" && !IS_MOBILE) {
      relockSettleTimer = setTimeout(function () {
        lockRegister();
      }, window.Gravitas.Constants.app.stageRelockDelayMs);
    }
  }

  var STAGE_TOP_THRESHOLD = window.Gravitas.Constants.app.stageTopThreshold;

  if (registerScroll && stageEl) {
    // Play About/Contact typewriter whenever those sections enter view
    // (button jump OR manual scroll). Without this, desktop scroll into an
    // unplayed doc leaves empty data-text paragraphs = blank page.
    if (typeof IntersectionObserver === "function") {
      var typedOnce = {};
      var docObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var id = entry.target.id;
            if (window.Gravitas.DocTypewriter) {
              window.Gravitas.DocTypewriter.play(id);
            }
            if (!typedOnce[id]) typedOnce[id] = true;
          });
        },
        {
          root: registerScroll,
          threshold: window.Gravitas.Constants.app.intersectionThreshold,
          rootMargin: "0px 0px -12% 0px",
        },
      );
      ["view-about", "view-contact"].forEach(function (id) {
        var section = document.getElementById(id);
        if (section) docObserver.observe(section);
      });
    }

    if (IS_MOBILE) {
      unlockRegister();
    } else {
      registerScroll.addEventListener(
        "scroll",
        function () {
          if (!registerScroll.classList.contains("scroll-unlocked")) return;

          clearTimeout(relockSettleTimer);
          relockSettleTimer = setTimeout(function () {
            if (registerScroll.scrollTop <= STAGE_TOP_THRESHOLD) {
              lockRegister();
            }
          }, SETTLE_MS);
        },
        { passive: true },
      );
    }
  }

  function selectTrack(key, opts) {
    opts = opts || {};
    currentActiveTrack = key;
    window.Gravitas = window.Gravitas || {};
    window.Gravitas.CurrentTrack = key;
    closeProjectDetail({ fromRouter: true, silent: true, skipHistory: true });
    if (key !== "essays" && key !== "favorites") {
      closeSecretDocs();
    }

    if (!opts.fromRouter && window.Gravitas.Router) {
      window.Gravitas.Router.navigate(
        { surface: "app", page: key },
        { skipApply: true },
      );
    }

    navItems.forEach(function (item) {
      var active = item.dataset.track === key;
      item.classList.toggle("is-active", active);
      item.classList.toggle("is-dulled", !active);
      item.setAttribute("aria-selected", active ? "true" : "false");
    });

    if (key === "archive") {
      bayTitle.innerHTML =
        "ARCHIVE" + '<span class="sub">FULL PROJECT LOG</span>';
      stripEyebrow.textContent = IS_MOBILE
        ? "All projects — tap to open"
        : "ARCHIVE · CLICK ANY PROJECT TO OPEN";
      recTag.textContent = "LOG";
      renderArchive();
    } else if (key === "about") {
      scrollToView("view-about");
      return;
    } else if (key === "contact") {
      scrollToView("view-contact");
      return;
    } else if (key === "essays") {
      openSecretDoc("view-essays");
      return;
    } else if (key === "favorites") {
      openSecretDoc("view-favorites");
      return;
    } else {
      if (window.Gravitas.ScanBay) {
        window.Gravitas.ScanBay.setActiveModel(key);
      }

      var t = TRACKS[key];
      bayTitle.innerHTML = t.label + '<span class="sub">' + t.sub + "</span>";
      stripEyebrow.textContent = IS_MOBILE
        ? "Flagship — tap to open"
        : "FLAGSHIP · CLICK TO OPEN DETAILS";
      recTag.textContent = "LIVE";
      renderProjects(key);
    }

    if (!IS_MOBILE) {
      setSidebarCollapsed(true);
    }
    scrollToView("view-stage");
  }

  navItems.forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.stopPropagation();
      selectTrack(item.dataset.track);
    });

    item.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        selectTrack(item.dataset.track);
      }
    });
  });

  window.Gravitas = window.Gravitas || {};
  window.Gravitas.SelectTrack = selectTrack;
  window.Gravitas.CloseSecretDocs = closeSecretDocs;
  window.Gravitas.OpenProjectDetail = openProjectDetail;
  window.Gravitas.CloseProjectDetail = closeProjectDetail;
  window.Gravitas.CloseProjectDetailSilent = function () {
    if (!detailOpen) return;
    closeProjectDetail({ fromRouter: true, silent: true, skipHistory: true });
  };

  if (brandRow && !IS_MOBILE) {
    brandRow.addEventListener("click", function (e) {
      if (e.target.closest("#back-to-gates")) return;
      e.stopPropagation();
      setSidebarCollapsed(!shell.classList.contains("sidebar-collapsed"));
    });

    brandRow.addEventListener("keydown", function (e) {
      if (e.target.closest("#back-to-gates")) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        setSidebarCollapsed(!shell.classList.contains("sidebar-collapsed"));
      }
    });
  }

  var footBtns = document.querySelectorAll("#sidebar-foot button");
  footBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var target = btn.dataset.scrollTo;
      var page =
        target === "view-about"
          ? "about"
          : target === "view-contact"
            ? "contact"
            : null;
      if (page && window.Gravitas.Router) {
        window.Gravitas.Router.navigate({ surface: "app", page: page });
        return;
      }
      closeProjectDetail({ fromRouter: true, skipHistory: true });
      if (target === "view-about") currentActiveTrack = "about";
      if (target === "view-contact") currentActiveTrack = "contact";
      if (target) scrollToView(target);
    });
  });
})();
