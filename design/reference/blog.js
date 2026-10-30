/* Ryan's Blog — page behaviour: progress bar, scroll-tracking contents, smooth anchors, copy buttons, theme toggle. */
(function () {
  "use strict";
  var h = document.documentElement;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (_) { return null; } }

  // Theme: the inline snippet in <head> sets data-theme before paint; this wires the button.
  function label() {
    var d = h.getAttribute("data-theme") === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      b.setAttribute("aria-label", d ? "Switch to light mode" : "Switch to dark mode");
    });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-theme-toggle]");
    if (!b) return;
    var t = h.getAttribute("data-theme") === "dark" ? "light" : "dark";
    h.setAttribute("data-theme", t);
    store("theme", t);
    label();
  });
  label();

  // Reading progress + scroll-tracking contents
  var bar = document.querySelector(".progress i");
  var pct = document.querySelector("[data-pct]");
  var links = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
  var heads = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
    .filter(function (el, i, arr) { return el && arr.indexOf(el) === i; });
  function tick() {
    var se = document.scrollingElement || h;
    var max = se.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, se.scrollTop / max) : 0;
    if (bar) bar.style.transform = "scaleX(" + p + ")";
    if (pct) pct.textContent = Math.round(p * 100) + "%";
    var cur = heads[0];
    heads.forEach(function (el) { if (el.getBoundingClientRect().top < 140) cur = el; });
    links.forEach(function (a) { a.classList.toggle("active", !!cur && a.getAttribute("href") === "#" + cur.id); });
  }
  window.addEventListener("scroll", tick, { passive: true });
  window.addEventListener("resize", tick);
  tick();

  // Close the mobile contents after choosing a section; copy buttons
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (a) { var d = a.closest("details"); if (d) d.open = false; return; }
    var b = e.target.closest("[data-copy]");
    if (!b) return;
    var pre = b.closest("figure").querySelector("pre");
    var txt = Array.prototype.map.call(pre.querySelectorAll(".ln"), function (l) { return l.textContent; }).join("\n");
    var t = b.querySelector("span") || b;
    var done = function () { var o = b.dataset.label || t.textContent; b.dataset.label = o; t.textContent = "Copied"; setTimeout(function () { t.textContent = o; }, 1400); };
    try { navigator.clipboard.writeText(txt).then(done, done); } catch (_) { done(); }
  });
})();
