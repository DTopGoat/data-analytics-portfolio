/* Live status for the weather pipeline. Reads pipeline_health.json, which the hourly
   GitHub Actions job publishes to GitHub Pages (the only external origin in the CSP). */
(function () {
  "use strict";
  var boxes = document.querySelectorAll("[data-pipeline-health]");
  if (!boxes.length || !window.fetch) return;

  function set(box, key, text) {
    var el = box.querySelector('[data-h="' + key + '"]');
    if (el) el.textContent = text;
  }
  function manila(iso) {
    return new Date(iso).toLocaleString("en-PH", {
      timeZone: "Asia/Manila", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
    }) + " Manila";
  }
  function ago(iso) {
    var mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + " min ago";
    return Math.floor(mins / 60) + " h " + (mins % 60) + " min ago";
  }

  boxes.forEach(function (box) {
    var src = box.getAttribute("data-pipeline-health");
    fetch(src + "?v=" + Math.floor(Date.now() / 300000), { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (h) {
        var ageMin = (Date.now() - new Date(h.last_run_utc).getTime()) / 60000;
        var state = h.status !== "healthy" ? "bad" : (ageMin > 150 ? "warn" : "ok");
        var label = state === "ok" ? "Healthy" : (state === "warn" ? "Stale: no run in the last 2.5 hours" : "Last run had failures");
        var t = h.tests || {};
        var total = (t.pass || 0) + (t.fail || 0) + (t.warn || 0) + (t.error || 0);
        var rows = (h.rows_loaded.weather || 0) + (h.rows_loaded.air_quality || 0);
        var c = h.layer_row_counts || {};
        set(box, "status", label);
        set(box, "last", manila(h.last_run_utc) + " (" + ago(h.last_run_utc) + ")");
        set(box, "rows", rows.toLocaleString("en-US"));
        set(box, "tests", (t.pass || 0) + " of " + total + " passed");
        set(box, "fresh", (h.freshness && h.freshness.status ? h.freshness.status : "n/a").toUpperCase());
        set(box, "layers", ((c.bronze_weather || 0) + (c.bronze_air_quality || 0)).toLocaleString("en-US") + " / " +
          ((c.silver_weather || 0) + (c.silver_air_quality || 0)).toLocaleString("en-US") + " / " +
          (c.gold_hourly || 0).toLocaleString("en-US"));
        box.classList.add("is-" + state);
        var run = box.querySelector('[data-h="run"]');
        if (run && h.github_run_url) { run.href = h.github_run_url; run.hidden = false; }
      })
      .catch(function () {
        set(box, "status", "Live status unavailable right now");
        box.classList.add("is-warn");
      });
  });
})();
