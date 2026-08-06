(function () {
  var TYPE_DURATION_MS = window.Gravitas.Constants.doc.typeDurationMs;
  var activeAnimId = null;
  var activeSectionId = null;

  function prefersReducedMotion() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function getLines(section) {
    return section.querySelectorAll(".doc-type-line");
  }

  function getRevealBlocks(section) {
    return section.querySelectorAll(".doc-reveal-block");
  }

  function resetSection(section) {
    if (!section) return;
    getLines(section).forEach(function (line) {
      var stored = line.getAttribute("data-text");
      if (stored !== null) line.textContent = "";
      line.classList.remove("is-typing", "is-complete");
    });
    getRevealBlocks(section).forEach(function (block) {
      block.classList.remove("is-visible");
    });
    section.classList.remove("doc-typing-active", "doc-typing-done");
  }

  function showInstant(section) {
    getLines(section).forEach(function (line) {
      var text = line.getAttribute("data-text");
      if (text !== null) line.textContent = text;
      line.classList.add("is-complete");
    });
    getRevealBlocks(section).forEach(function (block) {
      block.classList.add("is-visible");
    });
    section.classList.add("doc-typing-done");
  }

  function playSection(sectionId) {
    var section = document.getElementById(sectionId);
    if (!section) return;

    if (activeAnimId) {
      cancelAnimationFrame(activeAnimId);
      activeAnimId = null;
    }
    // Keep the previous doc readable — never leave it wiped blank.
    if (activeSectionId && activeSectionId !== sectionId) {
      var prev = document.getElementById(activeSectionId);
      if (prev) showInstant(prev);
    }
    activeSectionId = sectionId;

    // Revisit: show finished content immediately (no blank flash).
    if (section.classList.contains("doc-typing-done")) {
      showInstant(section);
      return;
    }

    resetSection(section);

    if (prefersReducedMotion()) {
      showInstant(section);
      return;
    }

    var lines = Array.prototype.slice.call(getLines(section));
    if (!lines.length) {
      showInstant(section);
      return;
    }

    var payloads = lines.map(function (line) {
      return {
        el: line,
        text: (line.getAttribute("data-text") || line.textContent || "").trim(),
        lastVisible: -1,
        lastState: "",
      };
    });

    var totalChars = payloads.reduce(function (sum, p) {
      return sum + p.text.length;
    }, 0);

    if (totalChars === 0) {
      showInstant(section);
      return;
    }

    section.classList.add("doc-typing-active");
    payloads.forEach(function (p) {
      p.el.textContent = "";
    });

    var revealBlocks = getRevealBlocks(section);
    var startTime = null;
    var lastCharsShown = -1;

    function setLineState(p, state) {
      if (p.lastState === state) return;
      p.lastState = state;
      p.el.classList.toggle("is-typing", state === "typing");
      p.el.classList.toggle("is-complete", state === "complete");
    }

    function renderAtProgress(progress) {
      var charsToShow = Math.min(
        totalChars,
        Math.max(0, Math.floor(progress * totalChars)),
      );
      if (charsToShow === lastCharsShown) return;
      lastCharsShown = charsToShow;

      var consumed = 0;
      var activeIdx = -1;

      payloads.forEach(function (p, idx) {
        var lineLen = p.text.length;

        if (charsToShow <= consumed) {
          if (p.lastVisible !== 0) {
            p.el.textContent = "";
            p.lastVisible = 0;
          }
          if (activeIdx === -1 && charsToShow === consumed) {
            activeIdx = idx;
            setLineState(p, "typing");
          } else {
            setLineState(p, "");
          }
          return;
        }

        var visible = Math.min(lineLen, charsToShow - consumed);
        if (visible !== p.lastVisible) {
          p.el.textContent = p.text.slice(0, visible);
          p.lastVisible = visible;
        }

        if (visible < lineLen) {
          activeIdx = idx;
          setLineState(p, "typing");
        } else {
          setLineState(p, "complete");
        }

        consumed += lineLen;
      });

      if (activeIdx === -1 && progress < 1 && payloads.length) {
        setLineState(payloads[payloads.length - 1], "typing");
      }
    }

    function finish() {
      if (activeAnimId) cancelAnimationFrame(activeAnimId);
      activeAnimId = null;
      payloads.forEach(function (p) {
        p.el.textContent = p.text;
        p.el.classList.remove("is-typing");
        p.el.classList.add("is-complete");
      });
      revealBlocks.forEach(function (block) {
        block.classList.add("is-visible");
      });
      section.classList.remove("doc-typing-active");
      section.classList.add("doc-typing-done");
    }

    function frame(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(1, elapsed / TYPE_DURATION_MS);
      renderAtProgress(progress);

      if (progress < 1) {
        activeAnimId = requestAnimationFrame(frame);
      } else {
        finish();
      }
    }

    activeAnimId = requestAnimationFrame(frame);
  }

  window.Gravitas = window.Gravitas || {};
  window.Gravitas.DocTypewriter = {
    play: playSection,
    reset: resetSection,
  };
})();
