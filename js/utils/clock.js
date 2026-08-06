(function () {
  var registeredClocks = [];
  var clockTimer = null;

  function updateClocks() {
    if (!registeredClocks.length) return;
    var d = new Date();
    var p = function (n) {
      return n < 10 ? "0" + n : "" + n;
    };
    var timeStr =
      p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());

    for (var i = 0; i < registeredClocks.length; i++) {
      registeredClocks[i].textContent = timeStr;
    }
  }

  window.initClock = function (elementId) {
    var el = document.getElementById(elementId);
    if (!el) return;
    if (registeredClocks.indexOf(el) === -1) {
      registeredClocks.push(el);
    }
    updateClocks();
    if (!clockTimer) {
      clockTimer = setInterval(updateClocks, 1000);
    }
  };
})();
