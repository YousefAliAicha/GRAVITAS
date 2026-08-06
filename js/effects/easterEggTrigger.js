/**
 * Easter-egg trigger listener.
 * When a key advances an in-progress konami sequence, preventDefault so
 * landing ↑↓←→ controls do not fire on the same keystroke.
 * Prefer letter sequences in easter-eggs.config.js (arrows fight the pager).
 * If the config file is missing, this module no-ops.
 */
(function () {
  var cfg = window.GravitasEasterEggs;
  if (!cfg || !cfg.konamiSequence || !cfg.wordTriggers) return;

  window.Gravitas = window.Gravitas || {};
  window.Gravitas.EasterEggs = window.Gravitas.EasterEggs || {};

  var WINDOW_MS = 1500;
  var buffer = [];
  var lastT = 0;
  var firedWords = {};
  var konamiArmed = true;
  var seq = cfg.konamiSequence;

  function resetBuffer() {
    buffer = [];
  }

  function isPrefix(buf) {
    if (!buf.length || buf.length > seq.length) return false;
    for (var i = 0; i < buf.length; i++) {
      if (buf[i] !== seq[i]) return false;
    }
    return true;
  }

  function sequenceMatch() {
    if (buffer.length < seq.length) return false;
    for (var i = 0; i < seq.length; i++) {
      if (buffer[buffer.length - seq.length + i] !== seq[i]) return false;
    }
    return true;
  }

  function typedLetters() {
    var out = "";
    for (var i = 0; i < buffer.length; i++) {
      if (buffer[i].length === 1) out += buffer[i];
    }
    return out;
  }

  function onKonami() {
    if (!konamiArmed) return;
    konamiArmed = false;
    if (window.Gravitas.EasterEggs.revealSecretGates) {
      window.Gravitas.EasterEggs.revealSecretGates();
    }
  }

  function onWord(effectKey) {
    if (firedWords[effectKey]) return;
    firedWords[effectKey] = true;
    setTimeout(function () {
      firedWords[effectKey] = false;
    }, 5000);
    if (window.Gravitas.SpriteRain) {
      window.Gravitas.SpriteRain.start(effectKey);
    }
  }

  window.addEventListener(
    "keydown",
    function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }

      var now = performance.now();
      if (now - lastT > WINDOW_MS) resetBuffer();
      lastT = now;

      var key = e.key;
      var norm;
      if (key.length === 1) {
        norm = key.toUpperCase();
      } else if (
        key === "ArrowLeft" ||
        key === "ArrowRight" ||
        key === "ArrowUp" ||
        key === "ArrowDown"
      ) {
        norm = key;
      } else {
        return;
      }

      var trial = buffer.concat([norm]);
      var continues = konamiArmed && isPrefix(trial);
      var restarts = konamiArmed && !continues && seq[0] === norm;

      if (continues || restarts) {
        // Block pager when this keystroke is part of the secret sequence
        e.preventDefault();
      }

      if (restarts) buffer = [];
      else if (konamiArmed && !continues && !restarts) {
        // Broken konami progress — keep buffer for word triggers, but if
        // the next key can't continue, leave word letters intact.
      }

      buffer.push(norm);
      if (buffer.length > 24) buffer = buffer.slice(-24);

      // If we restarted, buffer is just [norm] after push below... wait we
      // cleared then push — good. If continues failed mid-sequence without
      // restart, drop konami alignment by trimming to restart if possible:
      if (konamiArmed && !isPrefix(buffer) && !sequenceMatch()) {
        if (seq[0] === norm) buffer = [norm];
      }

      if (konamiArmed && sequenceMatch()) {
        e.preventDefault();
        resetBuffer();
        onKonami();
        return;
      }

      var letters = typedLetters();
      var words = cfg.wordTriggers;
      for (var word in words) {
        if (!Object.prototype.hasOwnProperty.call(words, word)) continue;
        if (letters.indexOf(word.toUpperCase()) !== -1) {
          onWord(words[word]);
          resetBuffer();
          return;
        }
      }
    },
    { capture: true, passive: false },
  );
})();
