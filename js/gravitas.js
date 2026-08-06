window.Gravitas = window.Gravitas || {};

/** True for phone/tablet UX — not for narrow desktop split-screen windows. */
window.Gravitas.isMobileExperience = function () {
  var q =
    (window.Gravitas.Constants &&
      window.Gravitas.Constants.mobile &&
      window.Gravitas.Constants.mobile.query) ||
    "(max-width: 768px) and (hover: none)";
  return typeof window.matchMedia === "function" && window.matchMedia(q).matches;
};
